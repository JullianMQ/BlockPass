// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.3/contracts/token/ERC721/ERC721.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.3/contracts/access/Ownable.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.3/contracts/utils/Strings.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.3/contracts/utils/Base64.sol";

contract BlockPassTicket is ERC721, Ownable {

    using Strings for uint256;

    uint256 public nextTokenId = 1;
    uint256 public nextEventId = 1;

    struct Event {
        uint256 id;
        string name;
        string location;
        uint256 startDate;   // UNIX timestamp
        uint256 endDate;     // UNIX timestamp
        uint256 totalSeats;
        uint256 ticketPrice;
        uint256 ticketsSold;
        bool active;
    }

    struct Ticket {
        uint256 eventId;
        uint256 day;
        uint256 seatNumber;
        bool used;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;

    mapping(uint256 => mapping(uint256 => mapping(uint256 => bool))) public seatTaken;
    mapping(uint256 => mapping(address => uint256)) public ticketsBought;

    event EventCreated(uint256 eventId, string name);
    event TicketPurchased(address buyer, uint256 tokenId);
    event TicketUsed(uint256 tokenId);

    constructor() ERC721("BlockPassTicket", "BPT") {}

    /*
    =================================
    Create Event
    =================================
    */

    function createEvent(
        string memory name,
        string memory location,
        uint256 startDate,
        uint256 endDate,
        uint256 totalSeats,
        uint256 ticketPrice
    ) external onlyOwner {

        require(endDate >= startDate, "Invalid dates");
        require(startDate > block.timestamp, "Event must be in future");

        events[nextEventId] = Event(
            nextEventId,
            name,
            location,
            startDate,
            endDate,
            totalSeats,
            ticketPrice,
            0,
            true
        );

        emit EventCreated(nextEventId, name);

        nextEventId++;
    }

    /*
    =================================
    Buy Ticket
    =================================
    */

    function buyTicket(
        uint256 eventId,
        uint256 day,
        uint256[] memory seatNumbers
    ) external payable {

        Event storage ev = events[eventId];

        uint256 quantity = seatNumbers.length;

        require(ev.active, "Event inactive");
        require(quantity > 0 && quantity <= 2, "Max 2 per purchase");

        require(
            ticketsBought[eventId][msg.sender] + quantity <= 2,
            "Max 2 tickets per event"
        );

        require(
            msg.value == ev.ticketPrice * quantity,
            "Incorrect payment"
        );

        for(uint256 i = 0; i < quantity; i++) {

            uint256 seat = seatNumbers[i];

            require(seat > 0 && seat <= ev.totalSeats, "Invalid seat");
            require(!seatTaken[eventId][day][seat], "Seat taken");

            seatTaken[eventId][day][seat] = true;

            uint256 tokenId = nextTokenId;
            nextTokenId++;

            tickets[tokenId] = Ticket(
                eventId,
                day,
                seat,
                false
            );

            _safeMint(msg.sender, tokenId);

            ev.ticketsSold++;

            emit TicketPurchased(msg.sender, tokenId);
        }

        ticketsBought[eventId][msg.sender] += quantity;
    }

    /*
    =================================
    Fetch All Events (NEW)
    =================================
    */

    function getEvents() public view returns (Event[] memory) {

        Event[] memory allEvents = new Event[](nextEventId - 1);

        for(uint i = 1; i < nextEventId; i++) {
            allEvents[i-1] = events[i];
        }

        return allEvents;
    }

    /*
    =================================
    Tickets Sold (NEW)
    =================================
    */

    function ticketsSold(uint256 eventId)
        external
        view
        returns(uint256)
    {
        return events[eventId].ticketsSold;
    }

    /*
    =================================
    Seats Left (NEW)
    =================================
    */

    function seatsLeft(uint256 eventId)
        external
        view
        returns(uint256)
    {
        Event memory ev = events[eventId];
        return ev.totalSeats - ev.ticketsSold;
    }

    /*
    =================================
    Auto Metadata
    =================================
    */

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "Token does not exist");

        Ticket memory t = tickets[tokenId];
        Event memory ev = events[t.eventId];

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{',
                        '"name":"', ev.name, ' Ticket #', tokenId.toString(), '",',
                        '"description":"Blockchain verified event ticket",',
                        '"attributes":[',
                            '{"trait_type":"Event","value":"', ev.name, '"},',
                            '{"trait_type":"Location","value":"', ev.location, '"},',
                            '{"trait_type":"Seat","value":"', t.seatNumber.toString(), '"}',
                        ']',
                        '}'
                    )
                )
            )
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                json
            )
        );
    }

    /*
    =================================
    Verify Ticket
    =================================
    */

    function verifyTicket(uint256 tokenId)
        external
        view
        returns (
            address ownerAddr,
            uint256 eventId,
            uint256 day,
            uint256 seatNumber,
            bool used
        )
    {
        require(_exists(tokenId), "Ticket does not exist");

        Ticket memory t = tickets[tokenId];

        ownerAddr = ownerOf(tokenId);
        eventId = t.eventId;
        day = t.day;
        seatNumber = t.seatNumber;
        used = t.used;
    }

    /*
    =================================
    Mark Ticket Used
    =================================
    */

    function markUsed(uint256 tokenId)
        external
        onlyOwner
    {
        require(!tickets[tokenId].used, "Already used");

        tickets[tokenId].used = true;

        emit TicketUsed(tokenId);
    }

    /*
    =================================
    Withdraw
    =================================
    */

    function withdraw()
        external
        onlyOwner
    {
        payable(owner()).transfer(address(this).balance);
    }

    /*
    =================================
    Disable Transfers
    =================================
    */

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {

        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        if (from != address(0) && to != address(0)) {
            revert("Ticket transfers disabled");
        }
    }
}
