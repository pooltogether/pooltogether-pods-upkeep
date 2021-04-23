// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

interface ContractsRegistry{
    function getContracts() view external returns(address[] memory);
}