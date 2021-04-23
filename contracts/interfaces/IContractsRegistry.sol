// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

interface ContractsRegistry{
    function getContracts() external view returns(address[] memory);
}