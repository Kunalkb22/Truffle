// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EventTicketingSystem {
    address public eventOrganizer;
    string public eventName;
    uint public ticketPrice; // Price in Wei
    uint public availableTickets;
    uint public totalTickets;
    uint public priceReductionTimestamp;
    uint public oldTicketPrice;

    struct TicketHolder {
        uint ticketCount;
        bool exists;
    }

    mapping(address => TicketHolder) public ticketHolders;
    mapping(address => uint) public purchaseHistory;
    mapping(address => bool) public eligibleForRefund;
    address[] public buyers; // To track all buyers

    event EventCreated(string eventName, uint totalTickets);
    event TicketPurchased(address buyer, uint numberOfTickets, uint refundEligibility);
    event TicketTransferred(address from, address to, uint numberOfTickets);
    event RefundProcessed(address recipient, uint refundAmount);
    event TicketSentViaEmail(address recipient, string email);
    event FundsWithdrawn(uint amount);

    constructor(string memory _eventName, uint _ticketPriceInEther, uint _totalTickets) {
        eventOrganizer = msg.sender;
        eventName = _eventName;
        ticketPrice = _ticketPriceInEther * 1 ether; // Convert Ether to Wei
        availableTickets = _totalTickets;
        totalTickets = _totalTickets;
    }

    modifier onlyOrganizer() {
        require(msg.sender == eventOrganizer, "Only the event organizer can perform this action.");
        _;
    }

    modifier checkTicketsAvailable(uint quantity) {
        require(availableTickets >= quantity, "Not enough tickets available.");
        _;
    }

    modifier checkPayment(uint quantity) {
        require(msg.value == quantity * ticketPrice, "Incorrect payment amount.");
        _;
    }

    function createEvent() public onlyOrganizer {
        availableTickets = totalTickets;
        emit EventCreated(eventName, totalTickets);
    }

    function purchaseTickets(uint quantity) public payable checkTicketsAvailable(quantity) checkPayment(quantity) {
        // Add buyer to the list if not already present
        if (!ticketHolders[msg.sender].exists) {
            buyers.push(msg.sender);
            ticketHolders[msg.sender].exists = true;
        }

        ticketHolders[msg.sender].ticketCount += quantity;
        availableTickets -= quantity;
        purchaseHistory[msg.sender] += msg.value;

        // Emit purchase event with refund eligibility if price changes
        uint refundEligibility = eligibleForRefund[msg.sender] ? ticketPrice - oldTicketPrice : 0;
        emit TicketPurchased(msg.sender, quantity, refundEligibility);
    }

    function transferTicket(address to, uint quantity) public {
        require(ticketHolders[msg.sender].ticketCount >= quantity, "You have no tickets to transfer.");
        require(to != address(0), "Invalid recipient address.");

        ticketHolders[msg.sender].ticketCount -= quantity;
        ticketHolders[to].ticketCount += quantity;

        emit TicketTransferred(msg.sender, to, quantity);
    }

    function viewTransactionHistory(address buyer) public view returns (uint) {
        return purchaseHistory[buyer];
    }

    function sendTicketsViaEmail(address recipient, string memory email) public {
        require(ticketHolders[recipient].ticketCount > 0, "No tickets to send.");
        emit TicketSentViaEmail(recipient, email);
    }

    function reduceTicketPrice(uint newPriceInEther) public onlyOrganizer {
        require(newPriceInEther * 1 ether < ticketPrice, "New price must be lower.");

        oldTicketPrice = ticketPrice; // Store old price for refund calculations
        ticketPrice = newPriceInEther * 1 ether;
        priceReductionTimestamp = block.timestamp;

        markRefundEligible();
    }

    function markRefundEligible() internal {
        for (uint i = 0; i < buyers.length; i++) {
            eligibleForRefund[buyers[i]] = true;
        }
    }

    function refund() public {
        require(eligibleForRefund[msg.sender], "You are not eligible for a refund.");
        require(ticketHolders[msg.sender].ticketCount > 0, "You have no tickets to refund.");

        uint refundAmount = ticketHolders[msg.sender].ticketCount * (oldTicketPrice - ticketPrice);
        payable(msg.sender).transfer(refundAmount);

        eligibleForRefund[msg.sender] = false;
        emit RefundProcessed(msg.sender, refundAmount);
    }

    function withdrawFunds() public onlyOrganizer {
        uint balance = address(this).balance;
        require(balance > 0, "No funds to withdraw.");
        payable(eventOrganizer).transfer(balance);
        emit FundsWithdrawn(balance);
    }

    // Fallback function to accept Ether
    receive() external payable {}
}

