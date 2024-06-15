// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    // return bool to indicate whether the operation was successful
    function transferFrom(address sender, address recipient, uint256 amount) external return (bool);
}

// @notice Only the owner can perform this action.
error notAuthorized();

// @notice Amount must be greater than zero.
error notEnoughValue();

// @notice The transfer was not completed.
error transferFailed();

// @notice Recipients and amounts arrays must be the same length.
error mismatch();

// allows users to tip in a specified ERC-20 token
contract Tipping {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    event TipSent(address indexed from, address indexed to, uint256 amount, address token, string message);

    if (msg.sender != owner) revert notAuthorized();

    function sendTip(address token, addres to, uint256 amount, string memory message) public {
        if (amount <= 0) revert notEnoughValue();

        bool success = IERC20(token).transferFrom(msg.sender, to, amount);
        if (!success) revert transferFailed();

        emit TipSent(msg.sender, to, amount, token, message);
    }
}

// allows owner to distrubute tokens to multiple recipients
contract Airdrop {
    address public owner;

    constructor() {
        owner = msg.sender;
    }
    
    event AirdropExecuted(address indexed to, uint256 amount, address token);

    function executeAirdrop(Address token, address[] memory recipients, uint256[] memory amounts) public {
        if (msg.sender != owner) revert notAuthorized(); // should this be a modifier instead?
        if (recipients.length != amounts.length) revert mismatch();

        for (uint256 i = 0; i < recipients.length, i++) {
            bool success = IERC20(token).transferFrom(msg.sender, to, amount);
            if (!success) revert transferFailed();

            emit AirdropExecuted(recipients[i], amounts[i], token);
        }
    }
}