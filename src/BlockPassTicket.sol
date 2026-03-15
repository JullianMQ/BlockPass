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

    uint256 public platformFeePercent = 5;
    uint256 public platformBalance;

    struct Event {
        uint256 id;
        address organizer;
        string name;
        string location;
        uint256 startDate;
        uint256 endDate;
        uint256 totalSeats;
        uint256 ticketPrice;
        uint256 ticketsSold;
        uint256 revenue;
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

    mapping(uint256 => mapping(uint256 => mapping(address => uint256))) public ticketsBoughtPerDay;

    event EventCreated(uint256 eventId, address organizer, string name);
    event TicketPurchased(address buyer, uint256 tokenId);
    event TicketUsed(uint256 tokenId);
    event RevenueWithdrawn(uint256 eventId, uint256 amount);
    event PlatformWithdraw(uint256 amount);

    constructor() ERC721("BlockPassTicket", "BPT") {}

    /*
    =================================
    CREATE EVENT
    =================================
    */

    function createEvent(
        string memory name,
        string memory location,
        uint256 startDate,
        uint256 endDate,
        uint256 totalSeats,
        uint256 ticketPrice
    ) external {

        require(endDate >= startDate, "Invalid dates");
        require(startDate > block.timestamp, "Event must be future");

        events[nextEventId] = Event(
            nextEventId,
            msg.sender,
            name,
            location,
            startDate,
            endDate,
            totalSeats,
            ticketPrice,
            0,
            0,
            true
        );

        emit EventCreated(nextEventId, msg.sender, name);

        nextEventId++;
    }

    /*
    =================================
    BUY TICKET
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
            ticketsBoughtPerDay[eventId][day][msg.sender] + quantity <= 2,
            "Max 2 tickets per day"
        );

        uint256 totalPrice = ev.ticketPrice * quantity;

        require(msg.value == totalPrice, "Incorrect payment");

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

        ticketsBoughtPerDay[eventId][day][msg.sender] += quantity;

        uint256 platformFee = (msg.value * platformFeePercent) / 100;
        uint256 organizerRevenue = msg.value - platformFee;

        platformBalance += platformFee;
        ev.revenue += organizerRevenue;
    }

    /*
    =================================
    FETCH EVENTS
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
    TOKEN METADATA
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
                            '{"trait_type":"Day","value":"', t.day.toString(), '"},',
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
    VERIFY TICKET
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
    MARK TICKET USED
    =================================
    */

    function markUsed(uint256 tokenId) external {

        Ticket storage t = tickets[tokenId];
        Event memory ev = events[t.eventId];

        require(msg.sender == ev.organizer, "Not event organizer");
        require(!t.used, "Already used");

        t.used = true;

        emit TicketUsed(tokenId);
    }

    /*
    =================================
    ORGANIZER WITHDRAW
    =================================
    */

    function withdrawEventRevenue(uint256 eventId) external {

        Event storage ev = events[eventId];

        require(msg.sender == ev.organizer, "Not event organizer");

        uint256 amount = ev.revenue;
        require(amount > 0, "No revenue");

        ev.revenue = 0;

        payable(msg.sender).transfer(amount);

        emit RevenueWithdrawn(eventId, amount);
    }

    /*
    =================================
    PLATFORM WITHDRAW
    =================================
    */

    function withdrawPlatformRevenue() external onlyOwner {

        uint256 amount = platformBalance;
        require(amount > 0, "No funds");

        platformBalance = 0;

        payable(owner()).transfer(amount);

        emit PlatformWithdraw(amount);
    }

    /*
    =================================
    DISABLE TRANSFERS
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
