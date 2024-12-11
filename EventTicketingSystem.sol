// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EventTicketingSystem {
    address public eventOrganizer;
    uint public ticketPrice;
    uint public availableTickets;
    uint public totalTickets;
    uint public priceReductionTimestamp;

    struct TicketHolder {
        uint ticketCount;
        bool exists;
    }

    mapping(address => TicketHolder) public ticketHolders;
    mapping(address => uint) public purchaseHistory;
    mapping(address => bool) public eligibleForRefund;

    event EventCreated(string eventName, uint totalTickets);
    event TicketPurchased(address buyer, uint numberOfTickets);
    event TicketTransferred(address from, address to, uint numberOfTickets);
    event RefundProcessed(address recipient, uint refundAmount);
    event TicketSentViaEmail(address recipient, string email);

    constructor(uint _ticketPrice, uint _totalTickets) {
        eventOrganizer = msg.sender;
        ticketPrice = _ticketPrice;
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

    function createEvent(string memory eventName) public onlyOrganizer {
        availableTickets = totalTickets;
        emit EventCreated(eventName, totalTickets);
    }

    function purchaseTickets(uint quantity) public payable checkTicketsAvailable(quantity) checkPayment(quantity) {
        ticketHolders[msg.sender].ticketCount += quantity;
        availableTickets -= quantity;
        purchaseHistory[msg.sender] += msg.value;
        emit TicketPurchased(msg.sender, quantity);
    }

    function transferTicket(address to, uint quantity) public {
        require(ticketHolders[msg.sender].ticketCount >= quantity, "You have no tickets to transfer.");

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

    // Organizer can reduce the price before the event
    function reduceTicketPrice(uint newPrice) public onlyOrganizer {
        require(newPrice < ticketPrice, "New price must be lower.");
        ticketPrice = newPrice;
        priceReductionTimestamp = block.timestamp;
        markRefundEligible();
    }

    // Check for refund eligibility when price is reduced
    function markRefundEligible() internal {
        // Functionality not fully implemented as iteration over mappings in Solidity is not straightforward
    }

    // Process refund if ticket price reduced
    function refund() public {
        require(eligibleForRefund[msg.sender], "You are not eligible for a refund.");
        uint refundAmount = purchaseHistory[msg.sender] - ticketPrice;
        payable(msg.sender).transfer(refundAmount);
        eligibleForRefund[msg.sender] = false;

        emit RefundProcessed(msg.sender, refundAmount);
    }

    // Allow the organizer to withdraw remaining funds after the event
    function withdrawFunds() public onlyOrganizer {
        uint balance = address(this).balance;
        require(balance > 0, "No funds to withdraw.");
        payable(eventOrganizer).transfer(balance);
    }

    // Fallback function to accept Ether
    receive() external payable {}
}
