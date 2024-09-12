'use client';
import { useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function Home() {
  const [counselorId, setCounselorId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [price, setPrice] = useState('');
  const [merchantId, setMerchantId] = useState(''); // State for merchant ID
  const [showPayPal, setShowPayPal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');

  const handleCounselorIdChange = (e) => setCounselorId(e.target.value);
  const handleServiceIdChange = (e) => setServiceId(e.target.value);
  const handlePriceChange = (e) => setPrice(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (counselorId && serviceId && price > 0) {
      // Fetch the merchant ID from the backend
      try {
        const response = await fetch(`http://localhost:3001/payments/get-merchant-id?counselorId=${counselorId}`);
        const data = await response.json();
        console.log(data)
        
        if (data.merchantId) {
          setMerchantId(data.merchantId); // Set the merchant ID in state
          setShowPayPal(true);
        } else {
          alert("Counselor not found");
        }
      } catch (error) {
        alert('Error fetching counselor information');
      }
    } else {
      alert("Please fill in all fields and ensure the price is greater than 0.");
    }
  };

  const createOrder = async () => {
    try {
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
      console.log(data)
      const orderId = data.payment?.id;
      console.log("orderid ", orderId)
      return orderId; // Return PayPal order ID to PayPal buttons
    } catch (error) {
      alert('Error creating PayPal order');
    }
    
  };

  const onApprove = async (data, actions) => {
    try {
      const captureResponse = await fetch(`http://localhost:3001/payments/capture-payment?orderId=${data.orderID}`, {
        method: 'POST',
      });
      const captureData = await captureResponse.json();
      setPaymentStatus('Payment Captured');
      console.log("Payment Captured", captureData);
    } catch (error) {
      alert('Error capturing payment');
    }
  };

  // const onCancel = (data) => {
  //   setPaymentStatus('Payment Canceled');
  //   console.log("Payment Canceled", data);
  //   alert("Payment canceled");
  // };

  const onCancel = async (data) => {
    setPaymentStatus('Payment Canceled');
    console.log("Payment Canceled", data);

    try {
        // Assuming you have the orderId in the 'data' object
        // const orderId = data.orderId; 

        // Make API call to your backend
        const response = await fetch(`http://localhost:3001/payments/cancel-payment?orderId=${data.orderID}`, { 
            method: 'PATCH' 
        });

        if (response.ok) {
            const result = await response.json();
            console.log(result.message); // Log success message from backend
            alert("Payment canceled successfully");
        } else {
            console.error('Error canceling order:', response.statusText);
            alert("There was an error canceling your payment. Please try again.");
        }
    } catch (error) {
        console.error('Error canceling order:', error);
        alert("There was an error canceling your payment. Please try again.");
    }
};

  const onError = (err) => {
    console.log("Error occurred", err);
    setPaymentStatus('Error');
    if (err.details && err.details.some(detail => detail.issue === 'INSTRUMENT_DECLINED')) {
      alert('Payment failed - insufficient funds');
    } else {
      alert('An error occurred during payment');
    }
  };

  return (
    <div>
      <h1>Book a Counseling Service</h1>

      {/* Form Fields */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Counselor ID:</label>
          <input 
            type="text" 
            value={counselorId} 
            onChange={handleCounselorIdChange} 
            placeholder="Enter counselor ID" 
            required 
          />
        </div>

        <div>
          <label>Service ID:</label>
          <input 
            type="text" 
            value={serviceId} 
            onChange={handleServiceIdChange} 
            placeholder="Enter service ID" 
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

        <button type="submit">Submit</button>
      </form>

      {price > 0 && showPayPal && (
        <div>
          <h2>Total Price: ${price}</h2>
        </div>
      )}

      {showPayPal && price > 0 && (
        <PayPalScriptProvider options={{ 
          "client-id": "AUqnmVYHz2F1H4qPlXunDvIPE7hOfQrObZGSsa2VfnYjNE85loUGA7DB1dqodsYhJTPWvkj85bxyIdn7", 
          "merchant-id": merchantId // Use the merchantId from backend
        }}>
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onCancel={onCancel}
            onError={onError}
          />
        </PayPalScriptProvider>
      )}

      {paymentStatus && (
        <div>
          <h3>Payment Status: {paymentStatus}</h3>
        </div>
      )}
    </div>
  );
}
