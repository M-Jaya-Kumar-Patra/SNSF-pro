import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        productTitle: String,
        productBrand: String,
        quantity: Number,
        price: Number,
        image: String,
        subTotal: Number,
      },
    ],

    totalAmt: {
      type: Number,
      required: true,
    },

    payment_method: {
      type: String,
      enum: ["Online", "COD"],
      default: "COD",
    },

    payment_status: {
      type: String,
      enum: ["Pending", "Completed", "Refunded", "Canceled"],
      default: "Pending",
    },

    order_Status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Canceled",
        "Returned",
      ],
      default: "Pending",
    },

    delivery_address: {
      type: Object,
      required: true,
    },

    paymentId: String,
    razorpay_order_id: String,

    deliveredAt: Date,
  },
  { timestamps: true }
);

const OrderModel =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

export default OrderModel;
