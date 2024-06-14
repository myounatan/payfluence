// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

import "./TokenReceiver.sol";

contract EchoeCampaignsV1 is
    Ownable2Step,
    Pausable,
    TokenReceiver
{
    // constants

    uint256 constant LIABILITY_TIMER = 30 days;

    // public variables

    address public backendAdmin; // platform admin wallet

    // OrgPermissions public orgPermissions;

    struct Campaign {
        address creator;
        uint256 startTime;
        uint256 endTime;
        uint256 lastUpdatedAt;
        uint256 lastPayoutAt;
        bool published;
    }

    mapping(string id => Campaign c) public campaigns;

    // total balances sent to participant in campaign
    mapping(string id => mapping(address participant => AssetBalance)) public participantBalance;

    // last metrics recorded associated with a post on a specific platform
    // the interpretation of the values is up to the calling code
    // ex. postMetrics[1]["123"][1] = 1000, could mean 1000 likes (metric id 1) on a tweet (tweet id "123"), on Twitter (platform id 1)
    mapping(uint256 platform => mapping(bytes32 postId => mapping(uint256 metricId => uint256 value))) public postMetrics;

    struct RewardAssetsParams {
        address[] tokens;
        AssetType[] assetTypes;
        uint256[] amounts;
        uint256[] tokenIds;
    }

    struct RewardMetricsParams {
        uint256 platform;
        bytes32 postId;
        uint256[] metricIds;
        uint256[] values;
    }

    struct RewardParams {
        address payable participant;
        RewardAssetsParams assetsParams;
        RewardMetricsParams metricsParams;
    }

    // events

    event CampaignCreated(
        string indexed id,
        address indexed creator,
        uint256 startTime,
        uint256 endTime,
        bool indexedpublished
    );

    event PublishedUpdated(string indexed id, bool indexed published);

    event TimeRangeUpdated(
        string indexed id,
        uint256 indexed startTime,
        uint256 indexed endTime
    );

    event LastUpdatedAtUpdated(
        string indexed id,
        uint256 indexed lastUpdatedAt
    );
    
    event LastPayoutAtUpdated(string indexed id, uint256 indexed lastPayoutAt);

    event WithdrawAsset(
        string indexed id,
        address indexed to,
        address indexed token,
        AssetType assetType,
        uint256 amount,
        uint256 tokenId,
        bool liabilityEnvoked
    );

    event RewardParticipant(
        string indexed id,
        address indexed participant,
        address[] tokens,
        AssetType[] assetTypes,
        uint256 amount,
        uint256 tokenId,
        uint256 platform,
        bytes32 postId,
        uint256[] metricIds,
        uint256[] values
    );

    // errors

    error ZeroAddress();
    error ZeroAmount();

    error NotCreator(address sender);
    error NotManager(address sender);
    error NotManagerOrCreator(address sender);

    error CampaignNotFound(string id);
    error CampaignExistsAlready(string id);

    error NotCampaignOwner(string id, address creator);
    error CampaignNotPublished(string id);
    error CampaignNotActive(string id);

    error AssetTypeCannotBeNone();

    error LiabilityTimeNotExpired();

    // internal modifiers

    function _zeroAddress(address addr) internal pure {
        if (addr == address(0)) revert ZeroAddress();
    }

    function _zeroAmount(uint256 amount) internal pure {
        if (amount <= 0) revert ZeroAmount();
    }

    function _onlyCreator(string memory id) internal view {
        if (msg.sender != campaigns[id].creator) revert NotCreator(msg.sender);
    }

    function _onlyBackendAdmin() internal view {
        if (msg.sender != backendAdmin) revert NotManager(msg.sender);
    }

    function _backendAdminOrCreator(string memory id) internal view {
        if (
            msg.sender != backendAdmin && msg.sender != campaigns[id].creator
        ) {
            revert NotManagerOrCreator(msg.sender);
        }
    }

    function _campaignExists(string memory id) internal view {
        if (campaigns[id].creator == address(0)) revert CampaignNotFound(id);
    }

    function _campaignOwner(string memory id, address creator) internal view {
        if (creator != campaigns[id].creator) revert NotCampaignOwner(id, creator);
    }

    function _campaignDoesNotExists(string memory id) internal view {
        if (campaigns[id].creator != address(0)) revert CampaignExistsAlready(id);
    }

    function _campaignPublished(string memory id) internal view {
        if (!campaigns[id].published) revert CampaignNotPublished(id);
    }

    function _campaignActive(string memory id) internal view {
        if (
            block.timestamp < campaigns[id].startTime ||
            block.timestamp > campaigns[id].endTime
        ) {
            revert CampaignNotActive(id);
        }
    }

    function _assetTypeCannotBeNone(AssetType assetType) internal pure {
        if (assetType == AssetType.NONE) revert AssetTypeCannotBeNone();
    }

    // constructor

    constructor() Ownable(msg.sender) {
        backendAdmin = msg.sender;
    }

    // internal helpers

    function _setPublished(string memory id, bool published) internal {
        campaigns[id].published = published;
        emit PublishedUpdated(id, published);
    }

    function _setTimeRange(
        string memory id,
        uint256 startTime,
        uint256 endTime
    ) internal {
        campaigns[id].startTime = startTime;
        campaigns[id].endTime = endTime;
        emit TimeRangeUpdated(id, startTime, endTime);
    }

    function _setLastUpdatedAt(
        string memory id,
        uint256 lastUpdatedAt
    ) internal {
        campaigns[id].lastUpdatedAt = lastUpdatedAt;
        emit LastUpdatedAtUpdated(id, lastUpdatedAt);
    }

    function _setLastPayoutAt(string memory id, uint256 lastPayoutAt) internal {
        campaigns[id].lastPayoutAt = lastPayoutAt;
        emit LastPayoutAtUpdated(id, lastPayoutAt);
    }

    function _withdrawAsset(
        string memory id,
        address payable to,
        address token,
        AssetType assetType,
        uint256 amount,
        uint256 tokenId,
        bytes memory data,
        bool liabilityEnvoked
    ) internal {
        if (assetType == AssetType.NONE) revert AssetTypeCannotBeNone();

        if (assetType == AssetType.NATIVE) {
            _transferNative(id, to, amount);
        } else if (assetType == AssetType.ERC20) {
            _transferERC20(id, to, token, amount);
        } else if (assetType == AssetType.ERC721) {
            _safeTransferERC721(id, to, token, tokenId, data);
        } else if (assetType == AssetType.ERC1155) {
            _safeTransferERC1155(id, to, token, tokenId, amount, data);
        }

        emit WithdrawAsset(
            id,
            to,
            token,
            assetType,
            amount,
            tokenId,
            liabilityEnvoked
        );
    }

    // manager only methods

    function createCampaign(
        string memory id,
        uint256 startTime,
        uint256 endTime
    ) external {
        _onlyBackendAdmin();
        _campaignExists(id);

        Campaign memory c = Campaign({
            creator: msg.sender,
            startTime: startTime,
            endTime: endTime,
            lastUpdatedAt: block.timestamp,
            lastPayoutAt: 0,
            published: false
        });

        campaigns[id] = c;

        emit CampaignCreated(id, msg.sender, startTime, endTime, false);
    }

    function rewardParticipant(
        string memory id,
        RewardParams memory params
    ) external {
        _onlyBackendAdmin();
        _campaignExists(id);
        _campaignPublished(id);
        _campaignActive(id);

        address payable to = params.participant;
        RewardAssetsParams memory assetsParams = params.assetsParams;
        RewardMetricsParams memory metricsParams = params.metricsParams;

        for (uint256 i = 0; i < assetsParams.assetTypes.length; i++) {
            AssetType assetType = assetsParams.assetTypes[i];

            _assetTypeCannotBeNone(assetType);

            uint256 amount = assetsParams.amounts[i];
            uint256 tokenId = assetsParams.tokenIds[i];
            address token = assetsParams.tokens[i];

            if (assetType == AssetType.NATIVE) {
                _transferNative(id, to, amount);
                participantBalance[id][to].native += amount;

            } else if (assetType == AssetType.ERC20) {
                _transferERC20(id, to, token, amount);
                participantBalance[id][to].erc20[token] += amount;

            } else if (assetType == AssetType.ERC721) {
                _safeTransferERC721(id, to, token, tokenId, "");
                participantBalance[id][to].erc721[token][tokenId] = true;

            } else if (assetType == AssetType.ERC1155) {
                _safeTransferERC1155(id, to, token, tokenId, amount, "");
                participantBalance[id][to].erc1155[token][tokenId] += amount;
            }
        }

        for (uint256 i = 0; i < metricsParams.metricIds.length; i++) {
            postMetrics[metricsParams.platform][metricsParams.postId][metricsParams.metricIds[i]] = metricsParams.values[i];
        }

        // emit RewardParticipant(id, to, tokens, assetTypes, params.amount, params.tokenId, platform, params.postId, params.metricIds, params.values);

        _setLastPayoutAt(id, block.timestamp);
    }

    function rewardParticipantBatch(
        string memory id,
        RewardParams[] memory params
    ) external {
        _onlyBackendAdmin();
        _campaignExists(id);
        _campaignPublished(id);
        _campaignActive(id);

        for (uint256 i = 0; i < params.length; i++) {
            RewardParams memory p = params[i];

            address payable to = p.participant;
            RewardAssetsParams memory assetsParams = p.assetsParams;
            RewardMetricsParams memory metricsParams = p.metricsParams;

            for (uint256 j = 0; j < assetsParams.assetTypes.length; j++) {
                AssetType assetType = assetsParams.assetTypes[j];

                _assetTypeCannotBeNone(assetType);

                uint256 amount = assetsParams.amounts[j];
                uint256 tokenId = assetsParams.tokenIds[j];
                address token = assetsParams.tokens[j];

                if (assetType == AssetType.NATIVE) {
                    _transferNative(id, to, amount);
                    participantBalance[id][to].native += amount;

                } else if (assetType == AssetType.ERC20) {
                    _transferERC20(id, to, token, amount);
                    participantBalance[id][to].erc20[token] += amount;

                } else if (assetType == AssetType.ERC721) {
                    _safeTransferERC721(id, to, token, tokenId, "");
                    participantBalance[id][to].erc721[token][tokenId] = true;

                } else if (assetType == AssetType.ERC1155) {
                    _safeTransferERC1155(id, to, token, tokenId, amount, "");
                    participantBalance[id][to].erc1155[token][tokenId] += amount;
                }
            }
        
            for (uint256 j = 0; j < metricsParams.metricIds.length; j++) {
                postMetrics[metricsParams.platform][metricsParams.postId][metricsParams.metricIds[j]] = metricsParams.values[j];
            }

            // emit RewardParticipant(id, to, tokens, assetTypes, params.amount, params.tokenId, platform, params.postId, params.metricIds, params.values);
        }

        _setLastPayoutAt(id, block.timestamp);
    }


    function setBackendAdmin(address manager) external {
        _onlyBackendAdmin();

        backendAdmin = manager;
    }

    function adminSetPublished(string memory id, bool published) external {
        _onlyBackendAdmin();
        _campaignExists(id);

        _setPublished(id, published);
    }

    function adminWithdraw(
        string memory id,
        address payable to,
        address token,
        AssetType assetType,
        uint256 amount,
        uint256 tokenId,
        bytes memory data
    ) external {
        _onlyBackendAdmin();
        _campaignExists(id);

        // adheres to the liability timer, in this order:
        // if the lastUpdatedAt is greater than the lastPayoutAt, then the lastUpdatedAt is used, otherwise use the lastPayoutAt
        uint256 lastAt = campaigns[id].lastUpdatedAt > campaigns[id].lastPayoutAt ? campaigns[id].lastUpdatedAt : campaigns[id].lastPayoutAt;
        if (block.timestamp - lastAt < LIABILITY_TIMER) {
            revert LiabilityTimeNotExpired();
        }

        _withdrawAsset(
            id,
            to,
            token,
            assetType,
            amount,
            tokenId,
            data,
            true
        );
    }

    // campaign creator only methods

    function setPublished(string memory id, bool published) external {
        _onlyCreator(id);
        _campaignExists(id);

        _setPublished(id, published);
        _setLastUpdatedAt(id, block.timestamp);
    }

    function setTimeRange(
        string memory id,
        uint256 startTime,
        uint256 endTime
    ) external {
        _onlyCreator(id);
        _campaignExists(id);

        _setTimeRange(id, startTime, endTime);
        _setLastUpdatedAt(id, block.timestamp);
    }

    function withdrawAsset(
        string memory id,
        address payable to,
        address token,
        AssetType assetType,
        uint256 amount,
        uint256 tokenId,
        bytes memory data
    ) external {
        _onlyCreator(id);
        _campaignExists(id);

        _withdrawAsset(
            id,
            to,
            token,
            assetType,
            amount,
            tokenId,
            data,
            false
        );
    }

    function publishAndSetTimeRange(
        string memory id,
        uint256 startTime,
        uint256 endTime
    ) external {
        _onlyCreator(id);
        _campaignExists(id);

        _setPublished(id, true);
        _setTimeRange(id, startTime, endTime);
        _setLastUpdatedAt(id, block.timestamp);
    }

    function archiveAndWithdrawAllAssets(
        string memory id,
        address payable to,
        address[] memory tokens,
        AssetType[] memory assetTypes,
        uint256[] memory amounts,
        uint256[] memory tokenIds
    ) external {
        _onlyCreator(id);
        _campaignExists(id);

        for (uint256 i = 0; i < tokens.length; i++) {
            _withdrawAsset(
                id,
                to,
                tokens[i],
                assetTypes[i],
                amounts[i],
                tokenIds[i],
                "",
                false
            );
        }

        _setPublished(id, false);
        _setLastUpdatedAt(id, block.timestamp);
    }

    // public getters

    function getPostMetrics(
        uint256 platform,
        bytes32[] memory postIds,
        uint256[] memory metricIds
    ) external view returns (uint256[] memory) {
        uint256[] memory values = new uint256[](metricIds.length);

        for (uint256 i = 0; i < metricIds.length; i++) {
            values[i] = postMetrics[platform][postIds[i]][metricIds[i]];
        }

        return values;
    }

    function getPostMetricsBatch(
        uint256 platform,
        bytes32[] memory postIds,
        uint256[] memory metricIds
    ) external view returns (uint256[] memory) {
        uint256[] memory values = new uint256[](metricIds.length * postIds.length);

        for (uint256 i = 0; i < postIds.length; i++) {
            for (uint256 j = 0; j < metricIds.length; j++) {
                values[i * metricIds.length + j] = postMetrics[platform][postIds[i]][metricIds[j]];
            }
        }

        return values;
    }

    // hooks

    function onERC721Received(
        address, // operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external virtual override returns (bytes4) {
        address tokenAddress = msg.sender;
        string memory campaignId = abi.decode(data, (string));
        
        _campaignOwner(campaignId, from);
        
        _fundERC721(campaignId, from, tokenAddress, tokenId);

        return 0x150b7a02;
    }

    function onERC1155Received(
        address, // operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external virtual override returns (bytes4) {
        address tokenAddress = msg.sender;
        string memory campaignId = abi.decode(data, (string));

        _campaignOwner(campaignId, from);
        
        _fundERC1155(campaignId, from, tokenAddress, id, value);

        return 0xf23a6e61;
    }

    function onERC1155BatchReceived(
        address, // operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external virtual override returns (bytes4) {
        address tokenAddress = msg.sender;
        string memory campaignId = abi.decode(data, (string));

        _campaignOwner(campaignId, from);
        
        _fundERC1155Batch(campaignId, from, tokenAddress, ids, values);
        
        return 0xbc197c81;
    }

    function supportsInterface(bytes4 interfaceId) external view virtual override returns (bool) {
        return
            interfaceId == type(IERC1155Receiver).interfaceId ||
            interfaceId == type(IERC721Receiver).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
