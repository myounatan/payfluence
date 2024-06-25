// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

contract TokenReceiver is
    IERC721Receiver,
    IERC1155Receiver
{
    enum AssetType {
        NONE,
        NATIVE,
        ERC20,
        ERC721,
        ERC1155
    }

    uint256 totalNativeBalance = 0;

    struct AssetBalance {
        uint256 native;
        mapping(address token => uint256) erc20;
        mapping(address token => mapping(uint256 tokenId => bool)) erc721;
        mapping(address token => mapping(uint256 tokenId => uint256)) erc1155;
    }

    mapping(string id => AssetBalance) public contractBalance;

    // internal variables

    mapping(address token => AssetType assetType) internal assetTypeMap;

    // events

    event NativeReceived(string id, address from, uint256 amount);

    event ERC20Received(
        string id,
        address from,
        address token,
        uint256 amount
    );

    event ERC721Received(
        string id,
        address operator,
        address from,
        uint256 tokenId
    );

    event ERC1155Received(
        string id,
        address operator,
        address from,
        uint256 tokenIds,
        uint256 amounts
    );
    
    event ERC1155BatchReceived(
        string id,
        address operator,
        address from,
        uint256[] tokenIds,
        uint256[] amounts
    );

    // errors

    error AssetNotFound(string id, address token);
    error InvalidAssetType(AssetType assetType);
    error AssetTypeNotFoundForToken(address token);

    error TransferNativeFailed(string id, address to, uint256 amount);
    
    error NotEnoughFunds(string id, AssetType assetType, address token, uint256 tokenId, uint256 amount);

    // internal helpers


    function _getAssetType(address token) internal view returns (AssetType) {
        if (assetTypeMap[token] == AssetType.NONE)
            revert AssetTypeNotFoundForToken(token);

        return assetTypeMap[token];
    }

    function _detectAssetTypeFromInterfaceId(
        address token
    ) internal view returns (AssetType) {
        if (token == address(0)) {
            return AssetType.NATIVE;
        } else if (IERC1155(token).supportsInterface(0xd9b67a26)) {
            return AssetType.ERC1155;
        } else if (IERC721(token).supportsInterface(0x80ac58cd)) {
            return AssetType.ERC721;
        } else if (IERC20(token).totalSupply() > 0) {
            return AssetType.ERC20;
        }

        return AssetType.NONE;
    }

    // fund assets

    receive() external payable {}

    function _fundNative(
        string memory id,
        uint256 amount
    ) internal {
        contractBalance[id].native += amount;
        
        emit NativeReceived(id, msg.sender, amount);
    }

    function _fundERC20(
        string memory id,
        address from,
        address token,
        uint256 amount
    ) internal {
        contractBalance[id].erc20[token] += amount;
        
        emit ERC20Received(id, from, token, amount);
    }

    function _fundERC721(
        string memory id,
        address from,
        address token,
        uint256 tokenId
    ) internal {
        contractBalance[id].erc721[token][tokenId] = true;

        emit ERC721Received(id, from, token, tokenId);
    }

    function _fundERC1155(
        string memory id,
        address from,
        address token,
        uint256 tokenId,
        uint256 amount
    ) internal {
        contractBalance[id].erc1155[token][tokenId] += amount;

        emit ERC1155Received(id, from, token, tokenId, amount);
    }

    function _fundERC1155Batch(
        string memory id,
        address from,
        address token,
        uint256[] calldata tokenIds,
        uint256[] calldata amounts
    ) internal {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            contractBalance[id].erc1155[token][tokenIds[i]] += amounts[i];
        }

        emit ERC1155BatchReceived(id, from, token, tokenIds, amounts);
    }

    // transfer assets

    function _transferNative(
        string memory id,
        address payable to,
        uint256 amount
    ) internal {
        if (contractBalance[id].native < amount)
            revert NotEnoughFunds(id, AssetType.NATIVE, address(0), 0, amount);

        contractBalance[id].native -= amount;

        (bool success, ) = to.call{value: amount}("");
        if (!success) revert TransferNativeFailed(id, to, amount);
    }

    function _transferFromERC20(
        string memory id,
        address to,
        address token,
        uint256 amount
    ) internal {
        if (contractBalance[id].erc20[token] < amount)
            revert NotEnoughFunds(id, AssetType.ERC20, token, 0, amount);

        contractBalance[id].erc20[token] -= amount;

        IERC20(token).transferFrom(address(this), to, amount);
    }

    function _transferERC20(
        string memory id,
        address to,
        address token,
        uint256 amount
    ) internal {
        if (contractBalance[id].erc20[token] < amount)
            revert NotEnoughFunds(id, AssetType.ERC20, token, 0, amount);

        contractBalance[id].erc20[token] -= amount;

        IERC20(token).transfer(to, amount);
    }

    function _safeTransferERC721(
        string memory id,
        address to,
        address token,
        uint256 tokenId,
        bytes memory data
    ) internal {
        if (!contractBalance[id].erc721[token][tokenId])
            revert NotEnoughFunds(id, AssetType.ERC721, token, tokenId, 0);

        contractBalance[id].erc721[token][tokenId] = false;

        IERC721(token).safeTransferFrom(address(this), to, tokenId, data);
    }

    function _safeTransferERC1155(
        string memory id,
        address to,
        address token,
        uint256 tokenId,
        uint256 amount,
        bytes memory data
    ) internal {
        if (contractBalance[id].erc1155[token][tokenId] < amount)
            revert NotEnoughFunds(id, AssetType.ERC1155, token, tokenId, amount);

        contractBalance[id].erc1155[token][tokenId] -= amount;

        IERC1155(token).safeTransferFrom(
            address(this),
            to,
            tokenId,
            amount,
            data
        );
    }

    function _safeBatchTransferERC1155(
        string memory id,
        address to,
        address token,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        bytes memory data
    ) internal {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (contractBalance[id].erc1155[token][tokenIds[i]] < amounts[i])
                revert NotEnoughFunds(id, AssetType.ERC1155, token, tokenIds[i], amounts[i]);

            contractBalance[id].erc1155[token][tokenIds[i]] -= amounts[i];
        }

        IERC1155(token).safeBatchTransferFrom(
            address(this),
            to,
            tokenIds,
            amounts,
            data
        );
    }

    // _withdrawBatchAssets()

    // hooks

    function onERC721Received(
        address, // operator,
        address, // from,
        uint256, // tokenId,
        bytes calldata // data
    ) external virtual override returns (bytes4) {
        return 0x150b7a02;
    }

    function onERC1155Received(
        address, // operator,
        address, // from,
        uint256, // id,
        uint256, // value,
        bytes calldata // data
    ) external virtual override returns (bytes4) {
        return 0xf23a6e61;
    }

    function onERC1155BatchReceived(
        address, // operator,
        address, // from,
        uint256[] calldata, // ids,
        uint256[] calldata, // values,
        bytes calldata // data
    ) external virtual override returns (bytes4) {
        return 0xbc197c81;
    }

    function supportsInterface(bytes4 interfaceId) external view virtual override returns (bool) {
        return
            interfaceId == type(IERC1155Receiver).interfaceId ||
            interfaceId == type(IERC721Receiver).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}