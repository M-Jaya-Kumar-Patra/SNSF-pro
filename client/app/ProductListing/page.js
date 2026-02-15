"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchDataFromApi, postData } from "@/utils/api";
import { useAuth } from "@/app/context/AuthContext";
import { useWishlist } from "@/app/context/WishlistContext";
import Image from "next/image";
import Button from "@mui/material/Button";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import WhatsappIcon from "@/components/WhatsappIcon";
import { IoCall } from "react-icons/io5";
import Loading from "@/components/Loading";
import Skeleton from "@mui/material/Skeleton";
import { trackVisitor } from "@/lib/tracking";
import { useCart } from "@/app/context/CartContext";





const ProductListing = () => {
  const searchParams = useSearchParams();
  const catId = searchParams.get("catId");
  const subCatId = searchParams.get("subCatId");
  const thirdSubCatId = searchParams.get("thirdSubCatId");
  const router = useRouter();
  const { addToCart, cartData, setBuyNowItem } = useCart();

  

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const {
    userData,
    isLogin,
    isCheckingToken,
  } = useAuth();
  const {
    addToWishlist,
    removeFromWishlist,
    wishlistData,
  } = useWishlist();

  

  useEffect(() => {
    window.scrollTo(0,0)
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        let url = null;
        if (catId) {
          url = `/api/product/gapsByCatId/${catId}`;
        } else if (subCatId) {
          url = `/api/product/gapsBySubCatId/${subCatId}`;
        } else if (thirdSubCatId) {
          url = `/api/product/gapsByThirdCatId/${thirdSubCatId}`;
        }
        if (!url) {
          setProducts([]);
          return;
        }
        const res = await fetchDataFromApi(url, false);
            

        setProducts(res?.data || []);
      } catch (err) {
        console.error("Failed to load products:", err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [catId, subCatId, thirdSubCatId]);


  const getOptimizedCloudinaryUrl = (url) => {
    if (!url?.includes("res.cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/w_800,h_800,c_fit,f_auto,q_90/");
  };

const isInCart = (prdId) =>
  cartData?.some(
    (item) => item?.productId?._id === prdId
  );

  const onClickHandler = (e, prdid, prd)=>{
    if (!isLogin) return router.push("/login");
                        const isInWishlist = userData?.wishlist?.includes(String(prdid));
                        const wishItem = wishlistData?.find((item) => item.productId === prdid);
                        const itemId = wishItem?._id;
                        if (isInWishlist && itemId) {
                          removeFromWishlist(e, itemId, prdid);
                        } else {
                          addToWishlist(e, prd, userData._id);
                        }
  }

  if (isCheckingToken || loadingProducts) return <Loading />;

  return (
    <div className="w-full bg-slate-100 min-h-screen flex justify-center">
      <div className="container w-full sm:w-[90%]  sm:my-4 mx-auto">
        <div className="bg-white min-h-screen p-2 sm:p-3 shadow-lg text-black">
          
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mb-5 place-items-center relative z-0 overflow-visible">
           

            {(  isCheckingToken || loadingProducts)
  ? Array.from({ length: 8 }).map((_, idx) => (
      <div key={idx} className="w-full min-h-[260px] shadow-md flex flex-col items-start justify-between p-3 bg-white ">
        <Skeleton variant="rectangular" width="100%" height={260}  className="rounded-md !bg-slate-300/50"/>
        <Skeleton variant="text" width="90%" height={25} sx={{ mt: 2 }} className=" !bg-slate-300/50" />
        <Skeleton variant="text" width="60%" height={20} className=" !bg-slate-300/50" />
      </div>
    ))
  : products.length > 0 && products.slice().reverse().map((prd, index) => (
                <div key={prd?._id || index} className="relative group w-full">
                <div className="w-full min-h-[260px] shadow-md flex flex-col items-center justify-between p-3 bg-white hover:shadow-xl transition duration-300">
                  <div className="w-full flex flex-col items-center">
                    {prd?.images?.[0] && (
                      <div
                        className="w-full aspect-[4/3] relative overflow-hidden cursor-pointer rounded-md"
                        onClick={() => router.push(`/product/${prd?._id}`)}
                      >
                        <Image
                          src={getOptimizedCloudinaryUrl(prd.images[0]) || "/images/placeholder.jpg"}
                          alt={prd.name || "Product"}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-md absolute top-4 right-3 cursor-pointer"
                      onClick={(e) =>
                        onClickHandler (e, prd._id, prd)
                      }
                    >
                      {isLogin && userData?.wishlist?.includes(String(prd._id)) ? (
                        <MdFavorite className="text-rose-600 text-[22px]" />
                      ) : (
                        <MdFavoriteBorder className="text-slate-600 text-[22px]" />
                      )}
                    </div>
                    <div className="w-full mt-3">
                      <h1 className="text-black text-[18px] font-medium truncate">{prd?.name}</h1>
                      <p className={(prd?.brand)?`text-gray-500 text-[16px] mt-1`:`text-white text-[16px] mt-1 cursor-default`}>{prd?.brand || "Not mentioned"}</p>
                      <div className="flex items-center gap-2 mt-1">
  <span className="text-slate-800 font-semibold text-[16px]">
    ₹{prd?.price}
  </span>

  {prd?.oldPrice && (
    <span className="text-slate-500 text-sm line-through">
      ₹{prd?.oldPrice}
    </span>
  )}
</div>

                    </div>
                  </div>
                </div>

                <div className="absolute left-0 top-full w-full z-50 pointer-events-none opacity-0 sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto transition-opacity duration-300">
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

            {products.length === 0 && (
              <div className="text-center col-span-full min-h-screen mt-10 text-gray-500">
                No products found for this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;