import React, { useState, useEffect } from "react";
import Web3 from "web3";
import EventTicketingSystem from "./contracts/EventTicketingSystem.json"; // Import the ABI file
import "./App.css";

const App = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [availableTickets, setAvailableTickets] = useState(0);
  const [purchaseQuantity, setPurchaseQuantity] = useState("");
  const [refundQuantity, setRefundQuantity] = useState("");
  const [status, setStatus] = useState("");

  // Initialize Web3 and load contract
  useEffect(() => {
    const init = async () => {
      try {
        // Connect to Ganache
        const web3 = new Web3("http://127.0.0.1:7545");
        setWeb3(web3);

        // Get accounts
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        // Get the deployed contract instance
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = EventTicketingSystem.networks[networkId];
        const contractInstance = new web3.eth.Contract(
          EventTicketingSystem.abi,
          deployedNetwork && deployedNetwork.address
        );
        setContract(contractInstance);

        // Fetch initial data from the contract
        const price = await contractInstance.methods.ticketPrice().call();
        const total = await contractInstance.methods.totalTickets().call();
        const available = await contractInstance.methods.availableTickets().call();

        setTicketPrice(web3.utils.fromWei(price, "ether"));
        setTotalTickets(total);
        setAvailableTickets(available);
        setStatus(available > 0 ? "Available" : "Sold Out");
      } catch (error) {
        console.error("Error connecting to contract or blockchain:", error);
      }
    };

    init();
  }, []);

  // Handle ticket purchase
  const handlePurchase = async () => {
    const quantity = parseInt(purchaseQuantity, 10);
    if (quantity > 0 && quantity <= availableTickets) {
      try {
        const totalCost = web3.utils.toWei((quantity * ticketPrice).toString(), "ether");
        await contract.methods.purchaseTickets(quantity).send({
          from: account,
          value: totalCost,
        });
        const available = await contract.methods.availableTickets().call();
        setAvailableTickets(available);
        setStatus(available > 0 ? "Available" : "Sold Out");
        alert(`Successfully purchased ${quantity} ticket(s)!`);
      } catch (error) {
        console.error("Error purchasing tickets:", error);
        alert("Transaction failed! Please try again.");
      }
    } else {
      alert("Invalid quantity or insufficient tickets available.");
    }
  };

  // Handle ticket refund
  const handleRefund = async () => {
    const quantity = parseInt(refundQuantity, 10);
    try {
      await contract.methods.refund(quantity).send({ from: account });
      const available = await contract.methods.availableTickets().call();
      setAvailableTickets(available);
      setStatus(available > 0 ? "Available" : "Sold Out");
      alert(`Successfully refunded ${quantity} ticket(s)!`);
    } catch (error) {
      console.error("Error refunding tickets:", error);
      alert("Refund failed! Please try again.");
    }
  };

  return (
    <div className="app">
      <h1>Event Ticketing System</h1>
      <div className="info-section">
        <p>Connected Account: {account}</p>
        <p>Ticket Price: {ticketPrice} ETH</p>
        <p>Total Tickets: {totalTickets}</p>
        <p>Available Tickets: {availableTickets}</p>
        <p>Status: {status}</p>
      </div>
      <div className="form-section">
        <h2>Purchase Tickets</h2>
        <input
          type="number"
          placeholder="Quantity"
          value={purchaseQuantity}
          onChange={(e) => setPurchaseQuantity(e.target.value)}
        />
        <button onClick={handlePurchase}>Purchase</button>
      </div>
      <div className="form-section">
        <h2>Refund Tickets</h2>
        <input
          type="number"
          placeholder="Quantity"
          value={refundQuantity}
          onChange={(e) => setRefundQuantity(e.target.value)}
        />
        <button onClick={handleRefund}>Refund</button>
      </div>
    </div>
  );
};

export default App;

