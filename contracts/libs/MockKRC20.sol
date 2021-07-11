pragma solidity 0.6.12;

import "./KRC20.sol";

contract MockKRC20 is KRC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 supply
    ) public KRC20(name, symbol) {
        _mint(msg.sender, supply);

    }
}