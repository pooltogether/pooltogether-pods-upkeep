// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;


import "./interfaces/KeeperCompatibleInterface.sol";
import "./interfaces/PeriodicPrizeStrategyInterface.sol";
import "./interfaces/PrizePoolRegistryInterface.sol";
import "./interfaces/PrizePoolInterface.sol";
import "./utils/SafeAwardable.sol";


///@notice Contract implements Chainlink's Upkeep system interface, automating the upkeep of PrizePools in the associated registry. 
contract PrizeStrategyUpkeep is KeeperCompatibleInterface {

    using SafeAwardable for address;

    address public prizePoolRegistry;

    uint public upkeepBatchSize;
    
    constructor(address _prizePoolRegistry, uint256 _upkeepBatchSize) public {
        prizePoolRegistry = _prizePoolRegistry;
        upkeepBatchSize = _upkeepBatchSize;
    }

    /// @notice Checks if PrizePools require upkeep. Call in a static manner every block by the Chainlink Upkeep network.
    /// @param checkData Not used in this implementation.
    /// @return upkeepNeeded as true if performUpkeep() needs to be called, false otherwise. performData returned empty. 
    function checkUpkeep(bytes calldata checkData) view override external returns (bool upkeepNeeded, bytes memory performData){ // check view

        address[] memory prizePools = PrizePoolRegistryInterface(prizePoolRegistry).getPrizePools();

        // check if canStartAward()
        for(uint256 pool = 0; pool < prizePools.length; pool++){
            address prizeStrategy = PrizePoolInterface(prizePools[pool]).prizeStrategy();
            if(prizeStrategy.canStartAward()){
                return (true, performData);
            } 
        }
        // check if canCompleteAward()
        for(uint256 pool = 0; pool < prizePools.length; pool++){
            address prizeStrategy = PrizePoolInterface(prizePools[pool]).prizeStrategy();
            if(prizeStrategy.canCompleteAward()){
                return (true, performData);
            } 
        }
        return (false, performData);
    }
   /// @notice Performs upkeep on the prize pools. 
    /// @param performData Not used in this implementation.
    function performUpkeep(bytes calldata performData) override external{

        address[] memory prizePools = PrizePoolRegistryInterface(prizePoolRegistry).getPrizePools();
     
        uint256 batchCounter = upkeepBatchSize; //counter for batch
        uint256 poolIndex = 0;
        
        while(batchCounter > 0 && poolIndex < prizePools.length){
            
            address prizeStrategy = PrizePoolInterface(prizePools[poolIndex]).prizeStrategy();
            
            if(prizeStrategy.canStartAward()){
                PeriodicPrizeStrategyInterface(prizeStrategy).startAward();
                batchCounter--;
            }
            else if(prizeStrategy.canCompleteAward()){
                PeriodicPrizeStrategyInterface(prizeStrategy).completeAward();
                batchCounter--;
            }
            poolIndex++;            
        }
  
    }

}


