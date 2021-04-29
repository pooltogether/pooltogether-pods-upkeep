// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";

import "@pooltogether/pooltogether-generic-registry/contracts/AddressRegistry.sol";

import "./interfaces/IPod.sol";
import "./interfaces/KeeperCompatibleInterface.sol";


///@notice Contract implements Chainlink's Upkeep system interface, automating the upkeep of a registry of Pod contracts
contract PodsUpkeep is KeeperCompatibleInterface, Ownable {

    using SafeMathUpgradeable for uint256;
    
    /// @notice Address of the registry of pods contract which require upkeep
    AddressRegistry public podsRegistry;

    /// @notice Data structure which stores the last update per Pod by index
    struct PodLastUpdatedBlockNumber{
        uint32[8] lastPodUpkeep;
    }

    /// @notice Interval at which pods.batch() will be called
    uint256 public upkeepBlockInterval;    

    PodLastUpdatedBlockNumber internal lastUpkeepBlockNumbers; // only internal allowed?

    /// @notice Minimum pod float fraction
    uint256 public targetFloatFraction;

    /// @notice Emitted when the upkeep block interval is updated
    event UpkeepBlockIntervalUpdated(uint upkeepBlockInterval);
        
    /// @notice Emitted when the float fraction is updated
    event TargetFloatFractionUpdated(uint targetFloatFraction);


    /// @notice Contract Constructor. No initializer. 
    constructor(AddressRegistry _podsRegistry, address _owner) Ownable() {
        
        podsRegistry = _podsRegistry;
        
        transferOwnership(_owner);
        // initialize values for block interval and float rate?
    }

    /// @notice Checks if Pods require upkeep. Call in a static manner every block by the Chainlink Upkeep network.
    /// @param checkData Not used in this implementation.
    /// @return upkeepNeeded as true if performUpkeep() needs to be called, false otherwise. performData returned empty. 
    function checkUpkeep(bytes calldata checkData) override external view returns (bool upkeepNeeded, bytes memory performData) {
        
        address[] memory pods = podsRegistry.getAddresses();
        for(uint256 i = 0; i < pods.length; i++){ // can get out of gas here -- do we want to implement a batchLimit ?
            if(checkUpkeepRequired(IPod(pods[i]), i)){
                return (true, "");
            }
        }
        return (false, "");    
    }

    /// @notice Performs upkeep on the pods contract
    /// @param performData Not used in this implementation.
    function performUpkeep(bytes calldata performData) override external {
    
        address[] memory pods = podsRegistry.getAddresses();
        for(uint256 i = 0; i < pods.length; i++){
            
            bool required = checkUpkeepRequired(IPod(pods[i]), i);
            
            if(required) {
                uint256 batchAmount = IPod(pods[i]).vaultTokenBalance();
                require(IPod(pods[i]).batch(), "PodsUpkeep: batch() failed");
            }
        }
    }

    /// @notice Checks if the float conditions indicate that upkeep is required
    /// @param pod The pod for which the check is carried out
    function checkUpkeepRequired(IPod pod, uint256 index) internal view returns (bool) {
        
        if(block.number >= lastUpkeepBlockNumbers.lastPodUpkeep[index] + upkeepBlockInterval){
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

    /// @notice Performs upkeep on the pods contract
    /// @param _targetFloatFraction The new targetFloatFraction
    /// @dev Should account for number of decimals of pod
    function updateTargetFloatFraction(uint256 _targetFloatFraction) external onlyOwner {
        targetFloatFraction = _targetFloatFraction;
        emit TargetFloatFractionUpdated(_targetFloatFraction); 
    }

}