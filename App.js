import React, { useState } from "react";
import "./App.css";

const App = () => {
  const [ticketPrice] = useState(50);
  const [totalTickets] = useState(500);
  const [remainingTickets, setRemainingTickets] = useState(500);
  const [status, setStatus] = useState("Available");
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseSummary, setPurchaseSummary] = useState(null);

  const handlePurchase = (quantity) => {
    const qty = parseInt(quantity, 10);
    if (qty > 0 && qty <= remainingTickets) {
      const totalCost = qty * ticketPrice;
      setPurchaseSummary({ qty, totalCost });
      setShowModal(true); 
    } else {
      alert("Invalid quantity or insufficient tickets!");
    }
  };

  const handleRefund = (quantity) => {
    const qty = parseInt(quantity, 10);
    if (qty > 0 && qty <= totalTickets - remainingTickets) {
      setRemainingTickets(remainingTickets + qty);
      setStatus(remainingTickets + qty === totalTickets ? "Available" : "Available");
      alert(`Successfully refunded ${qty} tickets.`);
    } else {
      alert("Invalid quantity or no tickets to refund!");
    }
  };
  

  const confirmPurchase = () => {
    setRemainingTickets(remainingTickets - purchaseSummary.qty);
    setStatus(remainingTickets - purchaseSummary.qty === 0 ? "Sold Out" : "Available");
    setShowModal(false); 
    setShowSuccessModal(true); 
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
          placeholder="Enter quantity"
          id="purchaseQuantity"
        />
        <button
          onClick={() =>
            handlePurchase(document.getElementById("purchaseQuantity").value)
          }
        >
          Purchase
        </button>
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
        <p>You can request a refund up to 5 days before the event.</p>
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
