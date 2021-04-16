// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/KeeperCompatibleInterface.sol";
import "./interfaces/PeriodicPrizeStrategyInterface.sol";
import "./interfaces/PrizePoolInterface.sol";
import "./utils/MappedSinglyLinkedList.sol";



///@notice A registry to hold Prize Pool addresses.  Underlying data structure is a singly linked list. 
contract PrizePoolRegistry is Ownable {

    using MappedSinglyLinkedList for MappedSinglyLinkedList.Mapping;

    event PrizePoolAdded(address indexed prizePool);
    event PrizePoolRemoved(address indexed prizePool);

    MappedSinglyLinkedList.Mapping internal prizePoolList;

    constructor() Ownable(){
        prizePoolList.initialize();
    }


    /// @notice Returns an array of all prizePools in the linked list
    ///@return Array of prize pool addresses
    function getPrizePools() view external returns(address[] memory){
        return prizePoolList.addressArray();
    } 

    /// @notice Adds addresses to the linked list. Will revert if the address is already in the list.  Can only be called by the Registry owner.
    /// @param _prizePools Array of prizePool addresses
    function addPrizePools(address[] calldata _prizePools) public onlyOwner {
        for(uint256 prizePool = 0; prizePool < _prizePools.length; prizePool++ ){ 
            prizePoolList.addAddress(_prizePools[prizePool]);
            emit PrizePoolAdded(_prizePools[prizePool]);
        }
    }

    /// @notice Removes an address from the linked list. Can only be called by the Registry owner.
    /// @param _previousPrizePool The address positionally localed before the address that will be deleted. This may be the SENTINEL address if the list contains one prize pool address
    /// @param _prizePool The address to remove from the linked list. 
    function removePrizePool(address _previousPrizePool, address _prizePool) public onlyOwner{
        prizePoolList.removeAddress(_previousPrizePool, _prizePool); 
        emit PrizePoolRemoved(_prizePool);
    } 
}