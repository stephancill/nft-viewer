//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Directory {
    mapping(address => string) public listURIs;

    bool public isOpen;

    constructor(bool _isOpen) {
        isOpen = _isOpen;
    }

    function setListForAddress(address _address, string memory _listURI) public {
        require(_address == msg.sender || isOpen, "Contract is not open");
        listURIs[_address] = _listURI;
    }
}