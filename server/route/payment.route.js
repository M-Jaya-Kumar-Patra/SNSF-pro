import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import OrderModel from "../models/order.model.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// 🔹 CREATE RAZORPAY ORDER
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        error: true,
        message: "Invalid amount",
      });
    }

    const options = {
      amount: Number(amount) * 100, // convert to paisa
      currency: "INR",
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: true, message: "Order creation failed" });
  }
});


// 🔹 VERIFY PAYMENT + SAVE ORDER
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        error: true,
        message: "Invalid payment signature",
      });
    }

    // ✅ SAVE ORDER IN DATABASE
    const savedOrder = await OrderModel.create({
      ...orderData,
      paymentId: razorpay_payment_id,
      razorpay_order_id,
      payment_status: "Completed",
      order_Status: "Confirmed",
    });

    return res.status(200).json({
      error: false,
      message: "Payment verified and order created",
      order: savedOrder,
    });

  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({
      error: true,
      message: "Payment verification failed",
    });
  }
});

export default router;
