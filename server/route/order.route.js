import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  createOrderController,
  getOrdersByUserController,
  getSingleOrderController,
  updateOrderStatusController,
} from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.post("/create", auth, createOrderController);
orderRouter.get("/getByUser", auth, getOrdersByUserController);
orderRouter.get("/:id", auth, getSingleOrderController);
orderRouter.put("/update-status/:id", auth, updateOrderStatusController);

export default orderRouter;
