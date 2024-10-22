
const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const app = express();
const config = require('../config.js');
// Initialize Express app
require('dotenv').config();

// Middlewares
app.use(bodyParser.json());
app.use(cors());
// const config = require('../config.js');
// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, // Loaded from .env file
    key_secret: process.env.RAZORPAY_KEY_SECRET // Loaded from .env file
});
// Endpoint to create an order
app.post('/createOrder', async (req, res) => {
 console.log("hi");
 const { amount } = req.body;

 const options = {
 amount: amount * 100, // Convert to paise
 currency: "INR",
 receipt: `receipt_order_${Math.random().toString(36).substring(7)}`, // Random receipt number
 };

 try {
 const order = await razorpay.orders.create(options);
 console.log(order.id);
 res.json({
 id: order.id,
 currency: order.currency,
 amount: order.amount
 });
 } catch (error) {
 res.status(500).json({ message: 'Error creating Razorpay order', error });
 }
});

// Endpoint to verify payment
app.post('/verifyPayment', (req, res) => {
 const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

 const secret = 'OHdXH4rB5vKa2dGSjiIs78mU'; // Replace with your Razorpay Secret Key
 const body = razorpay_order_id + '|' + razorpay_payment_id;

 // Hash the body and compare it to the razorpay_signature
 const expectedSignature = crypto
 .createHmac('sha256', secret)
 .update(body.toString())
 .digest('hex');

 if (expectedSignature === razorpay_signature) {
 res.json({ status: 'success', message: 'Payment verified successfully' });
 
 } else {
 res.status(400).json({ status: 'failure', message: 'Payment verification failed' });
 }
});

// Start the server
const port = 5000;
app.listen(port, () => {
 console.log(`Server is running on port ${port}`);
});


