'use client';
import { useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function Home() {
  const [counselorId, setCounselorId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [price, setPrice] = useState('');
  const [showPayPal, setShowPayPal] = useState(false); // State to toggle PayPal button visibility

  const handlecounselorIdChange = (e) => {
    setCounselorId(e.target.value);
  };

  const handleserviceIdChange = (e) => {
    setServiceId(e.target.value);
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure all fields are filled before showing the PayPal button
    if (counselorId && serviceId && price > 0) {
      setShowPayPal(true);
    } else {
      alert("Please fill in all fields and ensure the price is greater than 0.");
    }
  };

  const createOrder = async () => {
    // Backend API call to create an order, passing counselorId, serviceId, price
    const response = await fetch('http://localhost:3001/payments/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        counselorId: counselorId,
        serviceId: serviceId,
        price: parseFloat(price),
      }),
    });
    const data = await response.json();
    return data.id; // PayPal order ID
  };

  const onApprove = async (data, actions) => {
    // Backend API call to capture payment
    const captureResponse = await fetch(`http://localhost:3001/payments/capture-payment?orderId=${data.orderID}`, {
      method: 'POST',
    });
    const captureData = await captureResponse.json();
    console.log("Payment Captured", captureData);
  };

  return (
    <div>
      <h1>Book a Counseling Service</h1>

      {/* Form Fields */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Counselor Name:</label>
          <input 
            type="text" 
            value={counselorId} 
            onChange={handlecounselorIdChange} 
            placeholder="Enter counselor name" 
            required 
          />
        </div>

        <div>
          <label>Service Name:</label>
          <input 
            type="text" 
            value={serviceId} 
            onChange={handleserviceIdChange} 
            placeholder="Enter service name" 
            required 
          />
        </div>

        <div>
          <label>Price (in USD):</label>
          <input 
            type="number" 
            value={price} 
            onChange={handlePriceChange} 
            placeholder="Enter price" 
            required 
          />
        </div>

        {/* Submit Button */}
        <button type="submit">Submit</button>
      </form>

      {/* Display Price */}
      {price > 0 && showPayPal && (
        <div>
          <h2>Total Price: ${price}</h2>
        </div>
      )}

      {/* PayPal Button (appears after submission) */}
      {showPayPal && price > 0 && (
        <PayPalScriptProvider options={{ "client-id": "ASr2HRNIbdOHLQE9KtxVeZIISi3df3IG7RgIXfbG9WBrM7F6fUVIGZoXdblGHe7Z07jwGRL6pc-1ZKef" }}>
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
          />
        </PayPalScriptProvider>
      )}
    </div>
  );
}
