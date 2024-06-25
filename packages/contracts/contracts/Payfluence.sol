// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./TokenReceiver.sol";

contract Payfluence is
  Ownable2Step,
  ReentrancyGuard,
  EIP712,
  TokenReceiver
{
  error InvalidSigner();
  error AirdropAlreadyClaimed();
  error TransferFailed();
  error OnlyAirdropOwner();
  error OnlyTokenOwner();

  address private adminAddress;

  mapping(string airdropId => address owner) public airdropOwners;
  mapping(string airdropId => mapping(address recipient => uint256 amountClaimed)) public airdropClaimedAmounts;

  struct AirdropMessage {
    string airdropId;
    address token;
    address owner;
    address recipient;
    uint256 amountClaimable;
    // string ownerSignature;
  }
  
  bytes32 private constant AIRDROP_MESSAGE_TYPE = keccak256("AirdropMessage(string airdropId,address token,address owner,address recipient,uint256 amountClaimable)");

  modifier onlyAirdropOwner(string memory airdropId) {
    if (airdropOwners[airdropId] != address(0) && msg.sender != airdropOwners[airdropId]) {
      revert OnlyAirdropOwner();
    }
    _;
  }

  modifier onlyTokenOwner(address owner) {
    if (msg.sender != owner) {
      revert OnlyTokenOwner();
    }
    _;
  }

  constructor(address _adminAddress)
    Ownable(msg.sender)
    EIP712("Payfluence", "1")
  {
    adminAddress = _adminAddress;
  }

  function setAdminAddress(address _adminAddress) public onlyOwner {
    adminAddress = _adminAddress;
  }


  function getChainId() external view returns (uint256) {
    return block.chainid;
  }

  // AIRDROP

  function _verify(
    bytes memory signature,
    address signer,
    AirdropMessage memory airdropMessage
  ) internal view {
    bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
      AIRDROP_MESSAGE_TYPE,
      keccak256(bytes(airdropMessage.airdropId)),
      airdropMessage.token,
      airdropMessage.owner,
      airdropMessage.recipient,
      airdropMessage.amountClaimable
    )));
    
    address recoveredSigner = ECDSA.recover(digest, signature);

    if (recoveredSigner != signer) {
      revert InvalidSigner();
    }
  }

  function verify(
      bytes memory signature,
      address signer,
      AirdropMessage memory airdropMessage
  ) public view {
    _verify(signature, signer, airdropMessage);
  }

  function claimAirdrop(
    AirdropMessage memory airdropMessage,
    bytes memory signature
  ) public nonReentrant {
    _verify(signature, adminAddress, airdropMessage);

    if (airdropClaimedAmounts[airdropMessage.airdropId][airdropMessage.recipient] >= airdropMessage.amountClaimable) {
      revert AirdropAlreadyClaimed();
    }

    airdropClaimedAmounts[airdropMessage.airdropId][airdropMessage.recipient] = airdropMessage.amountClaimable;

    _transferERC20(airdropMessage.airdropId, airdropMessage.recipient, airdropMessage.token, airdropMessage.amountClaimable);
  }

  // FUNDING
  
  function fundNative() public payable {
    // nothing to do
  }

  function fundERC20(
    string memory _airdropId,
    address _owner,
    address _token,
    uint256 _amount
  ) public nonReentrant onlyAirdropOwner(_airdropId) onlyTokenOwner(_owner) {
    // initialize airdrop owner if not set
    if (airdropOwners[_airdropId] == address(0)) {
      airdropOwners[_airdropId] = _owner;
    }

    IERC20(_token).transferFrom(_owner, address(this), _amount);
    _fundERC20(_airdropId, _owner, _token, _amount);
  }

  function withdrawERC20(
    string memory _airdropId,
    address _to,
    address _token,
    uint256 _amount
  ) public nonReentrant onlyAirdropOwner(_airdropId) {
    _transferERC20(_airdropId, _to, _token, _amount);
  }

  // ADMIN

  function adminTransferAirdropOwnership(string memory _airdropId, address _newOwner) public onlyOwner {
    airdropOwners[_airdropId] = _newOwner;
  }

  function adminWithdrawNative(address _to) public onlyOwner {
    uint256 amount = address(this).balance;

    (bool success, ) = _to.call{value: amount}("");
    if (!success) revert TransferFailed();
  }

  function adminWithdrawERC20(
    address _to,
    string memory _airdropId,
    address _token,
    uint256 _amount
  ) public onlyOwner {
    _transferERC20(_airdropId, _to, _token, _amount);
  }
}