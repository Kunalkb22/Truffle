const EventTicketingSystem = artifacts.require("EventTicketingSystem");

module.exports = function (deployer) {
    const ticketPrice = 1; // Replace with your desired ticket price
    const totalTickets = 50; // Replace with your desired total tickets
    deployer.deploy(EventTicketingSystem, ticketPrice, totalTickets);
};
