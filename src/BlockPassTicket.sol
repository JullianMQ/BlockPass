// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.1/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.1/contracts/access/Ownable.sol";

contract BlockPassTicket is ERC721, Ownable {

    uint256 public nextTokenId;

    struct Ticket {
        uint256 seatNumber;
        bool used;
    }

    // tokenId → ticket data
    mapping(uint256 => Ticket) public tickets;

    // prevents duplicate seats
    mapping(uint256 => bool) public seatTaken;

    constructor() ERC721("BlockPassTicket", "BPT") Ownable(msg.sender) {}

    /*
    Mint a ticket
    Only organizer can mint
    */

    function mintTicket(address buyer, uint256 seatNumber) public onlyOwner {

        require(!seatTaken[seatNumber], "Seat already taken");

        uint256 tokenId = nextTokenId;

        _safeMint(buyer, tokenId);

        tickets[tokenId] = Ticket({
            seatNumber: seatNumber,
            used: false
        });

        seatTaken[seatNumber] = true;

        nextTokenId++;
    }

    /*
    Verify ticket
    Returns ticket info
    */

    function verifyTicket(uint256 tokenId)
        public
        view
        returns (
            address owner,
            uint256 seatNumber,
            bool used
        )
    {
        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");

        owner = ownerOf(tokenId);
        seatNumber = tickets[tokenId].seatNumber;
        used = tickets[tokenId].used;
    }

    /*
    Check if a wallet owns a valid ticket
    Useful for frontend verification
    */

    function checkMyTicket(uint256 tokenId) public view returns (bool) {

        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");
        require(!tickets[tokenId].used, "Ticket already used");

        return true;
    }

    /*
    Mark ticket as used
    Only organizer can validate entry
    */

    function markUsed(uint256 tokenId) public onlyOwner {

        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");
        require(!tickets[tokenId].used, "Ticket already used");

        tickets[tokenId].used = true;
    }

    /*
    Disable all transfers to prevent resale
    */

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {

        address from = _ownerOf(tokenId);

        if (from != address(0) && to != address(0)) {
            revert("Ticket transfers disabled");
        }

        return super._update(to, tokenId, auth);
    }
}