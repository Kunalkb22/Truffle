import React, { useState, useEffect } from "react";
import Web3 from "web3.js";
import EventTicketingSystem from './EventTicketingSystem.json'; // Ensure the ABI is imported correctly
import "./App.css";

const contractAddress = '0x0ca5C2E17C66aB981e7C50bFEb73bfA28D0Deb55'; // Replace with your deployed contract address
const contract = new web3.eth.Contract(contractABI.abi, contractAddress);
const [ticketPrice, setTicketPrice] = useState(50);
const App = () => {
  
  



const App = () => {
  const [ticketPrice] = useState(50); // Price in USD
  const [totalTickets] = useState(500);
  const [remainingTickets, setRemainingTickets] = useState(500);
  const [status, setStatus] = useState("Available");
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseSummary, setPurchaseSummary] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState("");
  const [refundQuantity, setRefundQuantity] = useState("");

  // Initialize Web3
  const [web3] = useState(new Web3('http://localhost:7545'));

  // Ensure we are using the correct ABI structure
  const [contract] = useState(new web3.eth.Contract(contractABI.abi, contractAddress));
  // ... other state variables
}

  // Load remaining tickets from the smart contract
  useEffect(() => {
    const loadRemainingTickets = async () => {
      try {
        const remaining = await contract.methods.remainingTickets().call();
        setRemainingTickets(remaining);
        setStatus(remaining === 0 ? "Sold Out" : "Available");
      } catch (error) {
        console.error("Error loading remaining tickets:", error);
      }
    };
    loadRemainingTickets();
  }, []);

  // const handlePurchase = async () => {
  //   const qty = parseInt(purchaseQuantity, 10);

  //   if (qty > 0 && qty <= remainingTickets) {
  //     const totalCost = qty * ticketPrice;

  //     const accounts = await web3.eth.getAccounts();

  //     try {
  //       // Convert USD price to Ether using Web3 (Assuming 1 USD = 0.00065 ETH)
  //       const totalCostInEther = web3.utils.toWei((totalCost * 0.00065).toString(), "ether");

  //       await contract.methods.purchase(qty).send({
  //         from: accounts[0],
  //         value: totalCostInEther,
  //       });

  //       setPurchaseSummary({ qty, totalCost });
  //       setShowModal(true);
  //     } catch (error) {
  //       console.error("Purchase failed", error);
  //       alert("Transaction failed! Please try again.");
  //     }
  //   } else {
  //     alert("Invalid quantity or insufficient tickets!");
  //   }
  // };

  const handlePurchase = async (quantity) => {
    const qty = parseInt(quantity, 10);
    if (qty > 0 && qty <= remainingTickets) {
      try {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.purchaseTickets(qty).send({
          from: accounts[0],
          value: web3.utils.toWei((qty * ticketPrice).toString(), 'ether')
        });
        const newRemainingTickets = await contract.methods.availableTickets().call();
        setRemainingTickets(parseInt(newRemainingTickets));
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Error purchasing tickets:', error);
        alert('Error purchasing tickets. Please try again.');
      }
    } else {
      alert('Invalid quantity or insufficient tickets!');
    }
  };
  
  useEffect(() => {
    const fetchContractData = async () => {
      const availableTickets = await contract.methods.availableTickets().call();
      const price = await contract.methods.ticketPrice().call();
      setRemainingTickets(parseInt(availableTickets));
      setTicketPrice(web3.utils.fromWei(price, 'ether'));
    };
    fetchContractData();
  }, []);
  



  // const handleRefund = async () => {
  //   const qty = parseInt(refundQuantity, 10);
  //   if (qty > 0 && qty <= totalTickets - remainingTickets) {
  //     const accounts = await web3.eth.getAccounts();
  //     try {
  //       await contract.methods.refund(qty).send({
  //         from: accounts[0],
  //       });

  //       setRemainingTickets(remainingTickets + qty);
  //       setStatus(
  //         remainingTickets + qty === totalTickets ? "Available" : "Available"
  //       );
  //       alert(`Successfully refunded ${qty} tickets.`);
  //       setRefundQuantity(""); // Reset input after refund
  //     } catch (error) {
  //       console.error("Refund failed", error);
  //       alert("Refund failed! Please try again.");
  //     }
  //   } else {
  //     alert("Invalid quantity or no tickets to refund!");
  //   }
  // };

  const handleRefund = async (quantity) => {
    const qty = parseInt(quantity, 10);
    if (qty > 0 && qty <= totalTickets - remainingTickets) {
      try {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.refund().send({ from: accounts[0] });
        const newRemainingTickets = await contract.methods.availableTickets().call();
        setRemainingTickets(parseInt(newRemainingTickets));
        alert(`Successfully refunded ${qty} tickets.`);
      } catch (error) {
        console.error('Error refunding tickets:', error);
        alert('Error refunding tickets. Please try again.');
      }
    } else {
      alert('Invalid quantity or no tickets to refund!');
    }
  };
  

  const confirmPurchase = () => {
    setRemainingTickets(remainingTickets - purchaseSummary.qty);
    setStatus(
      remainingTickets - purchaseSummary.qty === 0 ? "Sold Out" : "Available"
    );
    setShowModal(false);
    setShowSuccessModal(true);
    setPurchaseQuantity(""); // Reset input after purchase
  };

  return (
    <div className="app">
      <h1>Event Ticketing System</h1>
      <div className="info-section">
        <h3>Event Information</h3>
        <p>Ticket Price: ${ticketPrice}.00</p>
        <p>Total Tickets: {totalTickets}</p>
        <p>Tickets Remaining: {remainingTickets}</p>
        <p>Event Status: {status}</p>
      </div>
      <div className="form-section">
        <h2>Purchase Tickets</h2>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Enter quantity"
          value={purchaseQuantity}
          onChange={(e) => setPurchaseQuantity(e.target.value)}
        />
        <button onClick={handlePurchase}>Purchase</button>
      </div>
      <div className="form-section">
        <h2>Refund Tickets</h2>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Enter quantity"
          value={refundQuantity}
          onChange={(e) => setRefundQuantity(e.target.value)}
        />
        <button onClick={handleRefund}>Refund</button>
      </div>
      <div className="form-section">
        <h2>Organizer Actions</h2>
        <div className="button-container">
          <button onClick={() => setStatus("Event Closed")}>Close Event</button>
          <button onClick={() => alert("Funds withdrawn successfully!")}>
            Withdraw Funds
          </button>
        </div>
      </div>
      <div className="info-section">
        <h2>Refund Policy</h2>
        <p>
          You can request a refund up to 5 days before the event and contact the
          event.
        </p>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Purchase Summary</h2>
            <p>Tickets Purchased: {purchaseSummary.qty}</p>
            <p>Total Price: ${purchaseSummary.totalCost}.00</p>
            <div className="modal-actions">
              <button onClick={confirmPurchase}>Confirm</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal">
          <div className="modal-content success-modal">
            <div className="success-icon">✔️</div>
            <h2>Purchase Successful!</h2>
            <p>Your tickets have been successfully purchased.</p>
            <button onClick={() => setShowSuccessModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;


