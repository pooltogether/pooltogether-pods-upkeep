// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";

import "@pooltogether/pooltogether-generic-registry/contracts/AddressRegistry.sol";

import "./interfaces/IPod.sol";
import "./interfaces/KeeperCompatibleInterface.sol";

/// @notice Contract implements Chainlink's Upkeep system interface, automating the upkeep of a registry of Pod contracts
/// @dev This can only handle 8 Pods safely due to the gas saving data structure PodLoadUpkeepBlockNumber
contract PodsUpkeep is KeeperCompatibleInterface, Ownable {

    using SafeMathUpgradeable for uint256;
    
    /// @notice Address of the registry of pods contract which require upkeep
    AddressRegistry public podsRegistry;

    /// @notice Data structure which stores the last upkeep block per Pod by index
    struct PodLastUpkeepBlockNumber{
        uint32[8] lastPodUpkeep;
    }

    PodLastUpkeepBlockNumber internal lastUpkeepBlockNumbers;

    /// @notice Global upkeep interval expressed in blocks at which pods.batch() will be called
    uint256 public upkeepBlockInterval;    

    /// @notice Emitted when the upkeep block interval is updated
    event UpkeepBlockIntervalUpdated(uint upkeepBlockInterval);
        
    /// @notice Contract Constructor. No initializer. 
    constructor(AddressRegistry _podsRegistry, address _owner, uint256 _upkeepBlockInterval) Ownable() {
        
        podsRegistry = _podsRegistry;
        transferOwnership(_owner);
        upkeepBlockInterval = _upkeepBlockInterval;
        emit UpkeepBlockIntervalUpdated(_upkeepBlockInterval);
    }

    /// @notice Checks if Pods require upkeep. Call in a static manner every block by the Chainlink Upkeep network.
    /// @param checkData Not used in this implementation.
    /// @return upkeepNeeded as true if performUpkeep() needs to be called, false otherwise. performData returned empty. 
    function checkUpkeep(bytes calldata checkData) override external view returns (bool upkeepNeeded, bytes memory performData) {
        
        address[] memory pods = podsRegistry.getAddresses();
        for(uint256 i = 0; i < pods.length; i++){ // can get out of gas here -- do we want to implement a batchLimit ?
            if(checkUpkeepRequired(i)){
                return (true, "");
            }
        }
        return (false, "");    
    }

    /// @notice Performs upkeep on the pods contract and updates lastUpkeepBlockNumbers
    /// @param performData Not used in this implementation.
    function performUpkeep(bytes calldata performData) override external {
    
        address[] memory pods = podsRegistry.getAddresses();
        
        for(uint256 i = 0; i < pods.length; i++){
            
            bool required = checkUpkeepRequired(i);
            
            if(required) {
                require(IPod(pods[i]).batch(), "PodsUpkeep: batch() failed");
                lastUpkeepBlockNumbers.lastPodUpkeep[i] = uint32(block.number);
            }
        }
    }

    /// @notice Checks if the float conditions indicate that upkeep is required
    /// @param index The index of the pod for lastUpkeepBlockNumbers lookup 
    function checkUpkeepRequired(uint256 index) internal view returns (bool) {

        uint32[8] memory lastPodUpkeep = lastUpkeepBlockNumbers.lastPodUpkeep;
        
        if(block.number >= lastPodUpkeep[index] + upkeepBlockInterval){
            return true;
        }
        return false;
    }
    
    /// @notice Updates the upkeepBlockInterval. Can only be called by the contract owner
    /// @param _upkeepBlockInterval The new upkeepBlockInterval (in blocks)
    function updateBlockUpkeepInterval(uint256 _upkeepBlockInterval) external onlyOwner {
        upkeepBlockInterval = _upkeepBlockInterval;
        emit UpkeepBlockIntervalUpdated(_upkeepBlockInterval);
    }
}