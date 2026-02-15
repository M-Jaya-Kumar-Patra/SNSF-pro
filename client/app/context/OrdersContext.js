// context/CartContext.js
"use client";
import { Club } from "lucide-react";
import { createContext, useContext, useState, useEffect } from "react";
import { useAlert } from "./AlertContext";
import { fetchDataFromApi, postData } from "@/utils/api";
import { useAuth } from "./AuthContext";

const OrdersContext = createContext();

const OrdersProvider = ({ children }) => {
  const alert = useAlert()
  const [ordersItems, setOrdersItems] = useState([]);
  const [OrdersData, setOrdersData] = useState([])
  const { isLogin, userData } = useAuth()



  useEffect(() => {
  if (isLogin) {
    getOrdersItems();
  }
}, [isLogin]);





  const addToOrders = (prd, userId, quantity) => {
    // setCartItems((prev) => [...prev, product]);
    if (userId === undefined || userId === null) {
      alert.alertBox({ type: "error", msg: "Please login first" })
      return false
    }
    
    
    const data = {
      productTitle: prd?.name,
      image: prd?.images[0],
      rating: prd?.rating,
      price: prd?.price,
      quantity: quantity,
      subTotal: parseInt(prd?.price * quantity),
      productId: prd?._id,
      countInStock: prd?.countInStock,
      userId: userId,
      brand: prd?.brand
    }
    
    postData(`/api/order/create`, data, true).then((res) => {
      if (!res.error) {
        alert.alertBox({ type: "success", msg: res?.message });
        getCartItems();
      } else {
        alert.alertBox({ type: "error", msg: res?.message });

      }
    })
  };


  const getOrdersItems = () => {

    const userId = localStorage.getItem("userId")

    console.log(userId)
    fetchDataFromApi(`/api/order/getByUser`).then((res) => {
      if (!res.error) {
        
        setOrdersData(res?.data)
        console.log("------OrdersData--------------------------------", res?.data)
      }
    })

  }


  return (
    <OrdersContext.Provider value={{ ordersItems, addToOrders, getOrdersItems, OrdersData,  }}>
      {children}
    </OrdersContext.Provider>
  );
};

// Export both provider and hook
export { OrdersProvider };

// Custom hook
export const useOrders = () => useContext(OrdersContext);
