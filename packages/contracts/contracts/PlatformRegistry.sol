// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract PlatformRegistry is Ownable2Step {

    // paltform registry
    mapping(uint256 platform => string name) public platforms;

    // platform metrics registry
    mapping(uint256 platform => mapping(uint256 metric => string name)) public metrics;

    error PlatformNotRegistered(uint256 platformId);
    error MetricNotRegistered(uint256 platformId, uint256 metricId);

    constructor() Ownable(msg.sender) {
        // default platforms and metrics

        platforms[0] = "farcaster";
        metrics[0][0] = "like";
        metrics[0][1] = "recast";

        platforms[1] = "twitter";
        metrics[1][0] = "like";
        metrics[1][1] = "retweet";
        metrics[1][2] = "impression";
        metrics[1][3] = "quote";
        metrics[1][4] = "reply";
        metrics[1][5] = "bookmark";
    }

    function _checkPlatform(uint256 platformId) internal view {
        if (bytes(platforms[platformId]).length == 0) {
            revert PlatformNotRegistered(platformId);
        }
    }

    function _checkMetric(uint256 platformId, uint256 metricId) internal view {
        if (bytes(metrics[platformId][metricId]).length == 0) {
            revert MetricNotRegistered(platformId, metricId);
        }
    }

    function registerPlatform(uint256 platformId, string memory platformName) public {
        _checkOwner();

        platforms[platformId] = platformName;
    }

    function registerMetric(uint256 platformId, uint256 metricId, string memory metricName) public {
        _checkOwner();

        metrics[platformId][metricId] = metricName;
    }
}