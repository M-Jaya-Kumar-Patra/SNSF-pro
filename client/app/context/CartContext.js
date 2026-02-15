// context/CartContext.js
"use client";
import { Club } from "lucide-react";
import { createContext, useContext, useState, useEffect } from "react";
import { useAlert } from "./AlertContext";
import { fetchDataFromApi, postData } from "@/utils/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const alert = useAlert()
  const [cartItems, setCartItems] = useState([]);
  const [cartData, setCartData] = useState([])
  const { isLogin } = useAuth()
  const [buyNowItem, setBuyNowItem] = useState([]);



  useEffect(() => {
    getCartItems();
  }, []); // Only once on component mount





  const addToCart = async (prd, userId, quantity) => {
  try {
    const res = await postData(
      "/api/user/cart/add",
      {
        productId: prd._id,
        quantity,
      },
      true
    );

    if (res.success) {
      alert.alertBox({ type: "success", msg: res.message });
      getCartItems();
      return { success: true };
    } else {
      alert.alertBox({ type: "error", msg: res.message });
      return { success: false };
    }

  } catch (err) {
    console.error(err);
    return { success: false };
  }
};


 const getCartItems = async () => {
  try {
    const res = await fetchDataFromApi("/api/user/cart/get", true);

    if (res?.success && Array.isArray(res.data)) {
      setCartData(res.data);

      const ids = res.data.map((item) => item.productId);
      setCartItems(ids);
    } else {
      setCartData([]);
      setCartItems([]);
    }
  } catch (err) {
    console.error("Cart fetch error:", err);
    setCartData([]);
    setCartItems([]);
  }
};




  return (
    <CartContext.Provider value={{ cartItems, addToCart, getCartItems, cartData, buyNowItem, setBuyNowItem }}>
      {children}
    </CartContext.Provider>
  );
};

// Export both provider and hook
export { CartProvider };

// Custom hook
export const useCart = () => useContext(CartContext);
