// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SimpleStorage {

    uint public number;

    function setNumber(uint _number) public {
        number = _number;
    }

    function getNumber() public view returns (uint) {
        return number;
    }
}