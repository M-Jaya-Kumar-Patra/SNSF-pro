"use client";

import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import { usePrd } from "@/app/context/ProductContext";
import { fetchDataFromApi, postData } from "@/utils/api";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useWishlist } from "../context/WishlistContext";
import { MdFavorite } from "react-icons/md";
import { MdFavoriteBorder } from "react-icons/md";
import Image from "next/image";
import Skeleton from "@mui/material/Skeleton";
import { trackVisitor } from "@/lib/tracking";

import WhatsappIcon from "@/components/WhatsappIcon";
import { IoCall } from "react-icons/io5";
import { useCart } from "@/app/context/CartContext";



const ProductListing = () => {
  const { prdData, productsData, setProductsData, getProductsData } = usePrd();
  const {
    userData,
    isLogin,
    setIsLogin,
    setUserData,
    loading,
    setLoading,
    login,
    logout,
    isCheckingToken,
  } = useAuth();
  const router = useRouter();
    const [data, setData] = useState([]);
  const { addToCart, cartData, setBuyNowItem } = useCart();


  useEffect(() => {
    setLoading(false);
    getProductsData();
  }, [isLogin, userData, getProductsData]);
  useEffect(() => {
    trackVisitor("bestSellersList");
  }, []);


  
    const loadCustomerFavorites = async () => {
      try {
        const res = await fetchDataFromApi(
          "/api/home-sections?sectionName=bestsellers",
          false
        );
  
        console.log("OOOOOOOOOOOOOOOOOOOOOOOO", res)
  
        if (!res.error) setData(res?.data || []);
      } catch (err) {
        console.log("Best sellers fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
  

     useEffect(() => {
        loadCustomerFavorites();
      }, []);
    

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const { addToWishlist, removeFromWishlist, wishlistData } = useWishlist();

  const getOptimizedCloudinaryUrl = (url) => {
    if (!url?.includes("res.cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/w_800,h_800,c_fit,f_auto,q_90/");
  };
const isInCart = (prdId) =>
  cartData?.some(
    (item) => item?.productId?._id === prdId
  );


  return (
    <div className="w-full bg-slate-100 ">
      <div className="flex w-full min-h-screen justify-center bg-slate-100">
        <div className="container w-full sm:w-[90%]  sm:my-4 mx-auto ">
          <div className="flex-grow h-full bg-white p-2  sm:p-3 shadow-lg text-black">
            <div className="w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mb-5 place-items-center relative z-0 overflow-visible">
              {isCheckingToken || loading || !data
                ? Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-full min-h-[260px] shadow-md flex flex-col items-start justify-between p-3 bg-white "
                    >
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={260}
                        className=" !bg-slate-300/50"
                      />
                      <Skeleton
                        variant="text"
                        width="90%"
                        height={25}
                        sx={{ mt: 2 }}
                        className=" !bg-slate-300/50"
                      />
                      <Skeleton
                        variant="text"
                        width="60%"
                        height={20}
                        className=" !bg-slate-300/50"
                      />
                    </div>
                  ))
                : data
                    ?.filter((prd) => prd?.enabled)
                    .map((prd, index) => (
                      <div
                        key={prd?.product?._id || index}
                        className="relative group w-full"
                      >
                        <div className="w-full min-h-[260px] shadow-md flex flex-col items-center justify-between p-3 bg-white hover:shadow-[rgba(0,0,0,0.3)] sm:hover:shadow-xl transition duration-300">
                          <div className="w-full flex flex-col items-center">
                            {prd?.product?.images?.length > 0 && prd?.product?.images[0] && (
                              <div
                                className="w-full aspect-[4/3] relative overflow-hidden cursor-pointer rounded-md"
                                onClick={() =>
                                  router.push(`/product/${prd?.product?._id}`)
                                }
                              >
                                <Image
                                  src={getOptimizedCloudinaryUrl(prd?.product?.images[0]) || "/images/placeholder.jpg"}
                                  alt={prd?.name || "Product"}
                                  fill
                                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                                />
                              </div>
                            )}

                            <div
                              className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 border-opacity-50 shadow-md hover:shadow-inner absolute top-4 right-3 cursor-pointer"
                              onClick={(e) => {
                                if (!isLogin) {
                                  router.push("/login");
                                } else {
                                  const isAlreadyInWishlist =
                                    userData?.wishlist?.some(
                                      (item) => item === String(prd?.product?._id)
                                    );

                                  if (isAlreadyInWishlist) {
                                    const wishItem = wishlistData?.find(
                                      (itemInWishData) =>
                                        itemInWishData.productId === prd?.product?._id
                                    );
                                    const itemId = wishItem?._id;

                                    if (itemId) {
                                      removeFromWishlist(e, itemId, prd?.product?._id);
                                    }
                                  } else {
                                    addToWishlist(e, prd?.product, userData._id);
                                  }
                                }
                              }}
                            >
                              {isLogin &&
                              userData?.wishlist?.some(
                                (item) => item === String(prd?.product._id)
                              ) ? (
                                <MdFavorite className="!text-rose-600 text-[22px]" />
                              ) : (
                                <MdFavoriteBorder className="text-slate-600 text-[22px]" />
                              )}
                            </div>

                            <div className="w-full ">
                              <h1 className="text-black sm:text-[18px] text-[18px] mt-3 font-medium font-sans truncate">
                                {prd?.product?.name}
                              </h1>
                            </div>

                            <div className="w-full justify-between items-center">
                              <div className="w-full flex flex-col items-start">
                                <h1
                                  className={
                                    prd?.product?.brand
                                      ? "text-gray-500 text-[16px] mt-1"
                                      : "text-white text-[16px] mt-1 cursor-default truncate"
                                  }
                                >
                                  {prd?.product?.brand || "--- Not mentioned ---"}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
  <span className="text-slate-800 font-semibold text-[16px]">
    ₹{prd?.product?.price}
  </span>

  {prd?.product?.oldPrice && (
    <span className="text-slate-500 text-sm line-through">
      ₹{prd?.product?.oldPrice}
    </span>
  )}
</div>

                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className="absolute left-0 top-full w-full z-50  pointer-events-none opacity-0 sm:group-hover:opacity-100 
          sm:group-hover:pointer-events-auto transition-opacity duration-300 sm:group-hover:shadow-[rgba(0,0,0,0.3)] sm:group-hover:shadow-xl"
                        >
                          <div className="bg-white shadow-lg p-3 flex flex-col gap-3 border-t">

    {/* PRICE */}
  

    {/* BUTTONS */}
    <div className="flex gap-2">
      <Button
        variant="outlined"
        fullWidth
        sx={{
          borderColor: "#0f172a",
          color: "#0f172a",
          fontWeight: 500,
          "&:hover": {
            borderColor: "#1e293b",
            backgroundColor: "#f8fafc",
          },
        }}
        onClick={async () => {
          if (!isLogin) return router.push("/login");

          if (isInCart(prd._id)) {
            router.push("/cart");
          } else {
            await addToCart(prd, userData?._id, 1);
          }
        }}
      >
        {isInCart(prd._id) ? "Go to Cart" : "Add to Cart"}
      </Button>

      <Button
        variant="contained"
        fullWidth
        sx={{
          backgroundColor: "#e11d48",
          fontWeight: 500,
          "&:hover": {
            backgroundColor: "#be123c",
          },
        }}
        onClick={() => {
          setBuyNowItem({ ...prd, quantity: 1 });
          router.push("/checkOut");
        }}
      >
        Buy Now
      </Button>
    </div>
  </div>
                          </div>
                      </div>
                    ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
