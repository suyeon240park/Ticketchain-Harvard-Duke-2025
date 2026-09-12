// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    mapping(uint256 => uint256) public resalePrices;
    mapping(uint256 => bool) public usedTickets;

    event TicketMinted(address indexed owner, uint256 tokenId, string tokenURI);
    event TicketResold(uint256 tokenId, address indexed newOwner, uint256 price);
    event TicketValidated(uint256 tokenId);

    constructor(string memory name, string memory symbol, address initialOwner)
        ERC721(name, symbol)
        Ownable(initialOwner)
    {}

    function mintTicket(
        address to,
        string memory tokenURI,
        uint256 maxResalePrice
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        resalePrices[tokenId] = maxResalePrice;

        emit TicketMinted(to, tokenId, tokenURI);
        return tokenId;
    }

    function resellTicket(uint256 tokenId, address newOwner, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the ticket owner");
        require(price <= resalePrices[tokenId], "Exceeds max resale price");
        require(!usedTickets[tokenId], "Used tickets cannot be resold");

        safeTransferFrom(msg.sender, newOwner, tokenId);
        emit TicketResold(tokenId, newOwner, price);
    }

    /// @notice Marks a ticket as consumed at event entry.
    /// @dev Only the organizer/contract owner may validate tickets. Validation is one-time.
    function validateTicket(uint256 tokenId) external onlyOwner {
        // ownerOf also verifies that the token exists.
        ownerOf(tokenId);
        require(!usedTickets[tokenId], "Ticket already used");

        usedTickets[tokenId] = true;
        emit TicketValidated(tokenId);
    }
}
