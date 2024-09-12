'use client';
import { useState } from 'react';
import { PayPalButtons, PayPalScriptProvider, } from "@paypal/react-paypal-js";

export default function Home() {
  const [counselorId, setCounselorId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [price, setPrice] = useState('');
  const [merchantId, setMerchantId] = useState(''); // State for merchant ID
  const [showPayPal, setShowPayPal] = useState(false);

  const handlecounselorIdChange = (e) => {
    setCounselorId(e.target.value);
  };

  const handleserviceIdChange = (e) => {
    setServiceId(e.target.value);
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (counselorId && serviceId && price > 0) {
      // Fetch the merchant ID from the backend
      const response = await fetch(`http://localhost:3001/payments/get-merchant-id?counselorId=${counselorId}`);
      const data = await response.json();
      console.log(merchantId);

      if (data.merchantId) {
        setMerchantId(data.merchantId); // Set the merchant ID in state
        setShowPayPal(true);
      } else {
        alert("Counselor not found");
      }
    } else {
      alert("Please fill in all fields and ensure the price is greater than 0.");
    }
  };

  const createOrder = async () => {
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
    const captureResponse = await fetch(`http://localhost:3001/payments/capture-payment?orderId=${data.orderID}`, {
      method: 'POST',
    });
    const captureData = await captureResponse.json();
    console.log("Payment Captured", captureData);
  };

  const onCancel = (data) => {
    console.log("payment canceld", data)
    alert("payment canceld")
  }

  const onError = (err) => {
    console.log("error occured", err);
    if (err.details && err.details.some(detail => detail.issue === 'INSTRUMENT_DECLINED')) {
      alert('payment failed - insufficient funds')
    } else {
      alert('error occured')
    }
  }
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
          "merchant-id": merchantId  // Use the merchantId from backend
        }}>
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onCancel={onCancel}
            onError={onError}
          />
        </PayPalScriptProvider>
      )}
    </div>
  );
}
