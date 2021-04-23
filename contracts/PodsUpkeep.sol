// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";

import "./interfaces/IPod.sol";
import "./interfaces/KeeperCompatibleInterface.sol";
import "./interfaces/IContractsRegistry.sol"; // replace with import from @pooltogether/generic-registry


///@notice Contract implements Chainlink's Upkeep system interface, automating the upkeep of the Pods contract
contract PodsUpkeep is KeeperCompatibleInterface, Ownable {

    using SafeMathUpgradeable for uint256;
    
    /// @notice Address of the registry of pods contract which require upkeep
    ContractsRegistry public podsRegistry; // or should this live in the PodFloatStrategy repo?

    /// @notice Interval at which pods.batch() will be called
    uint256 public upkeepBlockInterval;    

    /// @notice Block number when batch was last called successfully
    uint256 public lastUpkeepBlockNumber;

    /// @notice Minimum pod float fraction
    uint256 public targetFloatFraction;

    /// @notice Emitted when the upkeep block interval is updated
    event UpkeepBlockIntervalUpdated(uint upkeepBlockInterval);
        
    /// @notice Emitted when the float fraction is updated
    event TargetFloatFractionUpdated(uint targetFloatFraction);


    /// @notice Contract Constructor. No initializer. 
    constructor(ContractsRegistry _podsRegistry, address _owner) Ownable() {
        
        podsRegistry = _podsRegistry;
        
        transferOwnership(_owner);
    }

    /// @notice Checks if Pods require upkeep. Call in a static manner every block by the Chainlink Upkeep network.
    /// @param checkData Not used in this implementation.
    /// @return upkeepNeeded as true if performUpkeep() needs to be called, false otherwise. performData returned empty. 
    function checkUpkeep(bytes calldata checkData) override external returns (bool upkeepNeeded, bytes memory performData) {
        
        address[] memory pods = podsRegistry.getContracts();
        for(uint256 i = 0; i < pods.length; i++){
            if(checkUpkeepRequired(IPod(pods[i]))){
                return (true, "");
            }
        }
        return (false, "");    
    }

    /// @notice Performs upkeep on the pods contract
    /// @param performData Not used in this implementation.
    function performUpkeep(bytes calldata performData) override external {
    
        address[] memory pods = podsRegistry.getContracts();
        for(uint256 i = 0; i < pods.length; i++){
            (bool required, uint256 batchAmount) = amountAboveFloat(IPod(pods[i])); 
            require(IPod(pods[i]).batch(batchAmount), "PodsUpkeep: batch() failed");
        }
    }

    /// @notice Checks if the float conditions indicate that upkeep is required
    /// @param pod The pod for which the check is carried out
    function checkUpkeepRequired(IPod pod) internal returns (bool) {
    
        (bool aboveFloat, uint256 amount) = amountAboveFloat(pod);

        if(block.number >= lastUpkeepBlockNumber + upkeepBlockInterval && aboveFloat){
            return true;
        }
        return false;
    }

    /// @notice Checks the amount 
    /// @param _pod The pod for which the check is carried out
    function amountAboveFloat(IPod _pod) public returns (bool aboveFloat, uint256 amount) {
        
        uint256 vaultTokenBalance = _pod.vaultTokenBalance(); 
        uint256 targetFloat = vaultTokenBalance.mul(targetFloatFraction); // are these going to be appropriate decimals

        if(vaultTokenBalance > targetFloat){
            // _pod.batch(vaultTokenBalance - targetFloat);
            amount = vaultTokenBalance;
            return (true, amount);
        }
        return (false, 0);
    }

    /// @notice Updates the upkeepBlockInterval. Can only be called by the contract owner
    /// @param _upkeepBlockInterval The new upkeepBlockInterval (in blocks)
    function updateBlockUpkeepInterval(uint256 _upkeepBlockInterval) external onlyOwner {
        upkeepBlockInterval = _upkeepBlockInterval;
        emit UpkeepBlockIntervalUpdated(_upkeepBlockInterval);
    }

    /// @notice Performs upkeep on the pods contract
    /// @param _targetFloatFraction The new targetFloatFraction
    function updateTargetFloatFractionInterval(uint256 _targetFloatFraction) external onlyOwner {
        targetFloatFraction = _targetFloatFraction;
        emit TargetFloatFractionUpdated(_targetFloatFraction); 
    }

}