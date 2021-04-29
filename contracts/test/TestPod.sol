// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import "../interfaces/IPod.sol";

contract MockPod is IPod {

    function batch() external override returns (bool){
        return true;
    }
    

    function vaultTokenBalance() external view override returns (uint256){
        return 1000;
    }

}