import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";

// 🔹 CREATE ORDER (For COD)
export const createOrderController = async (req, res) => {
  try {
    const orderData = req.body;

    const newOrder = await OrderModel.create(orderData);

    // 🔥 Increase product sales count
    for (const item of orderData.products) {
      await ProductModel.findByIdAndUpdate(item.productId, {
        $inc: { sales: item.quantity },
      });
    }

    return res.status(201).json({
      success: true,
      error: false,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// 🔹 GET ALL ORDERS OF USER
export const getOrdersByUserController = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await OrderModel.find({ userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      error: false,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// 🔹 GET SINGLE ORDER
export const getSingleOrderController = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await OrderModel.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// 🔹 UPDATE ORDER STATUS (Admin)
export const updateOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_Status } = req.body;

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { order_Status },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      error: false,
      message: "Order status updated",
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};
