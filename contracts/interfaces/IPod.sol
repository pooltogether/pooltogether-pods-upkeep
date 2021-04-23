// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;


interface IPod {     
    /// @notice Allows someone to batch deposit funds into the underlying prize pool.  This should be called periodically.
    /// @dev This function should deposit the float into the prize pool, and claim any POOL tokens and distribute to users (possibly via adaptation of Token Faucet)
    function batch(uint256 batchAmount) external returns (bool);
    

    function vaultTokenBalance() external view returns (uint256);

}