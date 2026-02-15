"use client";

import React, { useEffect } from "react";
import { useCart } from "../context/CartContext";
import { deleteItem, postData } from "@/utils/api";
import { useAlert } from "../context/AlertContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { RxCross2 } from "react-icons/rx";

const Cart = () => {
  const { cartData, getCartItems, setBuyNowItem } = useCart();
  const alert = useAlert();
  const router = useRouter();
  const { setUserData, userData, isLogin } = useAuth();

  useEffect(() => {
    if (!isLogin) {
      router.push("/login");
    } else {
      getCartItems();
    }
  }, [isLogin]);

  const removeItemFromCart = (e, _id, productId) => {
    e.preventDefault();
    deleteItem(`/api/cart/delete-cart-item`, { _id, productId }).then(
      (res) => {
        if (!res.error) {
          alert.alertBox({ type: "success", msg: res.message });
          getCartItems();
          setUserData({
            ...userData,
            shopping_cart: userData.shopping_cart.filter(
              (id) => id !== productId
            ),
          });
        } else {
          alert.alertBox({ type: "error", msg: res.message });
        }
      }
    );
  };

  const handleQuantityChange = async (_id, qty) => {
    if (qty < 1) return;
    try {
      const res = await postData(
        "/api/user/cart/update-qty",
        { _id, qty },
        true
      );
      if (res.success) {
        getCartItems();
      } else {
        alert.alertBox({ type: "error", msg: res.message });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalAmount = cartData?.reduce(
    (acc, item) =>
      acc + item.quantity * (item?.productId?.price || 0),
    0
  );

  return (
    <div className="w-full min-h-screen bg-slate-100 py-6 px-3">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* 🛒 LEFT: Cart Items */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">
            Shopping Cart
          </h2>

          {cartData?.length === 0 && (
            <div className="text-center text-slate-500 py-10">
              Your cart is empty.
            </div>
          )}

          {cartData?.map((item) => (
            <div
              key={item?._id}
              className="flex flex-col sm:flex-row gap-4 border border-slate-200 rounded-xl p-4 mb-4 hover:shadow-md transition-all"
            >
              {/* Image */}
              <div
                className="w-full sm:w-[160px] h-[160px] bg-slate-50 rounded-lg flex items-center justify-center cursor-pointer"
                onClick={() =>
                  router.push(`/product/${item?.productId?._id}`)
                }
              >
                <Image
                  width={140}
                  height={140}
                  src={
                    item?.productId?.images?.[0] ||
                    "/images/placeholder.jpg"
                  }
                  alt={item?.productId?.name}
                  className="object-contain max-h-full"
                />
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {item?.productId?.name}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {item?.productId?.brand}
                    </p>
                  </div>

                  <RxCross2
                    className="text-slate-400 text-xl hover:text-red-500 cursor-pointer transition"
                    onClick={(e) =>
                      removeItemFromCart(
                        e,
                        item?._id,
                        item?.productId?._id
                      )
                    }
                  />
                </div>

                {/* Quantity & Price */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
                  <ButtonGroup variant="outlined" size="small">
                    <Button
                      onClick={() =>
                        handleQuantityChange(
                          item._id,
                          item.quantity - 1
                        )
                      }
                    >
                      <RemoveIcon />
                    </Button>
                    <Button disabled>{item.quantity}</Button>
                    <Button
                      onClick={() =>
                        handleQuantityChange(
                          item._id,
                          item.quantity + 1
                        )
                      }
                    >
                      <AddIcon />
                    </Button>
                  </ButtonGroup>

                  <div className="text-lg font-bold text-slate-800">
                    ₹
                    {item.quantity *
                      (item?.productId?.price || 0)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 💳 RIGHT: Billing Summary */}
        <div className="w-full lg:w-[380px] bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:sticky lg:top-6 h-fit">
          <h3 className="text-xl font-semibold text-slate-800 mb-6">
            Billing Details
          </h3>

          <div className="space-y-3">
            {cartData?.map((item) => (
              <div
                key={item._id}
                className="flex justify-between text-sm border-b border-slate-100 pb-2"
              >
                <span>
                  {item?.productId?.name} × {item.quantity}
                </span>
                <span>
                  ₹
                  {item.quantity *
                    (item?.productId?.price || 0)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-bold text-lg mt-6">
            <span>Total</span>
            <span className="text-indigo-600">
              ₹{totalAmount}
            </span>
          </div>

          <Button
            disabled={cartData?.length === 0}
            fullWidth
            sx={{
              mt: 4,
              backgroundColor: "#4f46e5",
              padding: "12px",
              fontWeight: 600,
              borderRadius: "8px",
              "&:hover": { backgroundColor: "#4338ca" },
            }}
            variant="contained"
            onClick={() => {
              setBuyNowItem(cartData);
              router.push("/checkOut");
            }}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
