//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Directory {
    mapping(address => string) public listURIs;

    function setList(string memory _listURI) public {
        listURIs[msg.sender] = _listURI;
    }
}