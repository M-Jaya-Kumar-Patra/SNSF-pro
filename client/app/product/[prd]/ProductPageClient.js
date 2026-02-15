"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchDataFromApi, postData} from "@/utils/api";
import { Button } from "@mui/material";
import Similar from "./Similar";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { MdFavorite, MdFavoriteBorder, MdStars } from "react-icons/md";
import Image from "next/image";
import { useWishlist } from "@/app/context/WishlistContext";
import ProductSpecs from "@/components/ProductSpecs";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { RxCross2 } from "react-icons/rx";
import { Navigation, Pagination, A11y, Zoom } from "swiper/modules";
import WhatsappIcon from "@/components/WhatsappIcon";
import { IoCall } from "react-icons/io5";

import Skeleton from "@mui/material/Skeleton";

import "swiper/css/navigation";
import "swiper/css/pagination";

import { PiShareFat } from "react-icons/pi";
import Suggestions from "@/components/Suggestions";
import { trackProductEvent } from "@/lib/tracking";
import { usePrd } from "@/app/context/ProductContext";
import { MdStar } from "react-icons/md";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { useCart } from "@/app/context/CartContext";


import "swiper/css/zoom";
import Reviews from "./Reviews";
import Pincode from "./Pincode";

const ProductPageClient = ({ prdId }) => {
  const [productImages, setProductImages] = useState([]);
  const [openedProduct, setOpenedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState();
  const [quantity, setQuantity] = useState(1);

  const { addToWishlist, removeFromWishlist, wishlistData } = useWishlist();
  const { userData, setUserData, isLogin, isCheckingToken } = useAuth();
  const { showLarge, setShowLarge } = usePrd();

  const [hideArrows, setHideArrows] = useState(null);

  const router = useRouter();

  const { cartData, addToCart, buyNowItem, setBuyNowItem } = useCart();


  useEffect(() => {
    fetchDataFromApi(`/api/product/${prdId}`, false).then((res) => {
      setOpenedProduct(res?.product);
      setProductImages(res?.product?.images || []);
      setSelectedImage(res?.product?.images?.[0] || null);

      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    });
  }, [prdId]);

  useEffect(() => {
    if (!openedProduct?._id) return;

    let start = Date.now();

    return () => {
      const duration = Math.floor((Date.now() - start) / 1000); // in seconds
      trackProductEvent(
        openedProduct._id,
        "view",
        duration,
        userData?._id || null,
      );
    };
  }, [openedProduct, userData?._id]);

  useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Escape" && showLarge) {
      window.history.back();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [showLarge]);


  useEffect(() => {
    if (!openedProduct?._id) return;
    if (typeof window === "undefined") return;

    try {
      const viewedKey = "recentlyViewed";
      let viewed = JSON.parse(localStorage.getItem(viewedKey)) || [];

      viewed = viewed.filter((id) => id !== openedProduct._id);
      viewed.unshift(openedProduct._id);
      viewed = viewed.slice(0, 20);

      localStorage.setItem(viewedKey, JSON.stringify(viewed));
    } catch (e) {
      console.warn("Recently viewed storage failed", e);
    }
  }, [openedProduct]);
  useEffect(() => {
    const handlePopState = () => {
      setShowLarge(null);
      setHideArrows(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openLargeView = (src) => {
    setShowLarge(src);
    setHideArrows(true);

      if (!window.history.state?.largeView) {
        window.history.pushState({ largeView: true }, "");
      }
  };

  const getOptimizedCloudinaryUrl = (url) => {
    if (!url?.includes("res.cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/w_800,h_800,c_fit,f_auto,q_90/");
  };

  const addToCartFun = async (prd, userId, quantity) => {
  try {
    const added = await addToCart(prd, userId, quantity);

    if (added?.success) {
      setUserData((prev) => ({
        ...prev,
        shopping_cart: [
          ...(prev?.shopping_cart || []),
          String(prd._id),
        ],
      }));
    }
  } catch (err) {
    console.error("Error adding to cart", err);
  }
};


const isInCart = cartData?.some(
  (item) => item?.productId?._id === openedProduct?._id
);

  if (isCheckingToken || !openedProduct) {
    return (
      <div className="flex flex-col w-full min-h-screen sm:py-4 items-center bg-slate-100">
        <div className="w-full sm:w-[1020px] min-h-screen p-4 sm:flex justify-between bg-white">
          {/* Left Skeleton: Image */}
          <div className="w-full flex gap-2 sm:w-[420px] p-1">
            <div className="hidden sm:flex flex-col gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width={64}
                  height={74}
                />
              ))}
            </div>
            <Skeleton variant="rectangular" width="100%" height={310} />
          </div>

          {/* Right Skeleton: Details */}
          <div className="sm:w-[600px] sm:p-5 sm:pl-6">
            <Skeleton
              variant="text"
              width="80%"
              height={40}
              className="sm:!mb-3"
            />
            <Skeleton
              variant="text"
              width="60%"
              height={25}
              className="!mb-4 sm:!mb-8"
            />
            <div className="flex gap-[8px]">
              <Skeleton
                variant="rectangular"
                width="50%"
                height={35}
                className="!mb-8"
              />
              <Skeleton
                variant="rectangular"
                width="50%"
                height={35}
                className="!mb-8"
              />
            </div>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={200}
              className="!mb-8"
            />
          </div>
        </div>
      </div>
    );
  }

  const initialIndex = Math.max(
    0,
    productImages.findIndex((img) => img === showLarge),
  );

  // ✅ Actual JSX rendering
  return (
    <div className="flex flex-col w-full min-h-screen items-center bg-slate-100">
      <div className="w-full sm:w-[1020px] mb-2 sm:my-3 pt-2 sm:p-2 mx-auto lg:flex justify-between bg-white">
        {/* Left: Image Section */}
        <div className="image sm:sticky lg:top-[110px] w-full sm:w-[400px] sm:h-[310px] sm:p-[2px] sm:border sm:border-slate-400 sm:m-3 mr-4 flex gap-[2px] flex-col sm:flex-row">
          {/* Mobile Carousel */}
          <div className="block md:hidden w-full relative">
            <Swiper
              cssMode={true}
              spaceBetween={10}
              slidesPerView={1}
              className="w-full h-auto"
            >
              {productImages?.map((src, idx) => (
                <SwiperSlide key={idx}>
                  <Image
                    src={
                      getOptimizedCloudinaryUrl(src) ||
                      "/images/placeholder.jpg"
                    }
                    alt={`Slide ${idx + 1}`}
                    className="w-full h-[300px] object-contain"
                    width={500}
                    height={300}
                    onClick={() => {
                      openLargeView(src); // You still want to show original in modal
                      setHideArrows(true);
                    }}
                    loading="lazy"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Wishlist Button for mobile */}
            <div
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 border-opacity-50 shadow-md hover:shadow-inner absolute top-3 right-3 cursor-pointer z-[90]"
              onClick={(e) => {
                if (!isLogin) {
                  router.push("/login");
                } else {
                  const isAlreadyInWishlist = userData?.wishlist?.some(
                    (item) => item === String(openedProduct?._id),
                  );
                  if (isAlreadyInWishlist) {
                    const wishItem = wishlistData?.find(
                      (itemInWishData) =>
                        itemInWishData.productId === openedProduct?._id,
                    );
                    const itemId = wishItem?._id;
                    if (itemId)
                      removeFromWishlist(e, itemId, openedProduct?._id);
                  } else {
                    addToWishlist(e, openedProduct, userData?._id);
                  }
                }
              }}
            >
              {isLogin &&
              userData?.wishlist?.some(
                (item) => item === String(openedProduct?._id),
              ) ? (
                <MdFavorite className="!text-rose-600 text-[22px] z-10" />
              ) : (
                <MdFavoriteBorder className="text-slate-600 text-[22px]" />
              )}
            </div>

            {/* Share Button for mobile (below Wishlist) */}
            <div
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 border-opacity-50 shadow-md hover:shadow-inner absolute top-12 right-3 cursor-pointer z-[90]"
              onClick={async () => {
                const shareData = {
                  title: openedProduct?.name,
                  text: `Check out this product: ${openedProduct?.name}\n`,
                  url: window.location.href,
                };

                if (navigator.share) {
                  try {
                    await navigator.share(shareData);
                  } catch (err) {
                    console.error("Error sharing:", err);
                  }
                } else {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    alert("Product URL copied to clipboard!");
                  } catch (err) {
                    alert("Share not supported and failed to copy URL.");
                  }
                }
              }}
              title="Share product"
            >
              <PiShareFat className="text-slate-600 text-[21px]" />
            </div>
          </div>

          {/* Fullscreen Modal for Mobile Large View */}
          {showLarge && (
            <div
              className="flex lg:hidden fixed inset-0 bg-slate-100  z-[999]  flex-col items-center justify-center px-4"
              style={{ touchAction: "pinch-zoom", overflow: "auto" }}
            >
              <div className="w-full flex justify-end">
                <button
                  onClick={() => {
                    setShowLarge(null);
                    setHideArrows(false);

                    if (typeof window !== "undefined") {
                      window.history.back();
                    }
                  }}
                  className="!text-black text-3xl p-2"
                >
                  <RxCross2 />
                </button>
              </div>

              <div className="w-full max-w-[500px] h-[80vh] flex justify-center items-center">
                <Swiper
                  modules={[Navigation, Pagination, A11y, Zoom]}
                  zoom={{ maxRatio: 3, toggle: true }}
                  spaceBetween={10}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  navigation
                  className="w-full h-full"
                  initialSlide={initialIndex}
                >
                  {productImages.map((img, idx) => (
                    <SwiperSlide key={idx}>
                      <div className="swiper-zoom-container">
                        <img
                          src={
                            getOptimizedCloudinaryUrl(img) ||
                            "/images/placeholder.jpg"
                          }
                          alt={`Slide ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          )}

          {/* Desktop Thumbnail + Main Image */}
          <div className="hidden md:flex gap-2 h-auto">
            <div className="w-[75px] overflow-y-auto h-full p-[2px] border scrollbar-hide">
              <ul className="space-y-1">
                {productImages?.map((src, idx) => (
                  <li
                    key={idx}
                    className={`border rounded cursor-pointer ${
                      selectedImage === src ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedImage(src)}
                  >
                    <Image
                      src={
                        getOptimizedCloudinaryUrl(src) ||
                        "/images/placeholder.jpg"
                      }
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-[128px] h-[64px] object-contain"
                      width={100}
                      height={100}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full relative">
              <div className="w-full sm:w-[319px] bg-gray-100 sm:h-full flex justify-center items-center relative">
                <Image
                  className="h-full w-full object-contain border cursor-zoom-in"
                  src={getOptimizedCloudinaryUrl(
                    selectedImage ||
                      productImages?.[0] ||
                      "/images/placeholder.jpg",
                  )}
                  alt="Selected Product"
                  unoptimized
                  width={300}
                  height={300}
                 onClick={() => openLargeView(selectedImage)}
                />

                {/* Wishlist Button */}
                <div
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 border-opacity-50 shadow-md hover:shadow-inner absolute top-4 right-3 cursor-pointer z-[500]"
                  onClick={(e) => {
                    if (!isLogin) {
                      router.push("/login");
                    } else {
                      const isAlreadyInWishlist = userData?.wishlist?.some(
                        (item) => item === String(openedProduct?._id),
                      );
                      if (isAlreadyInWishlist) {
                        const wishItem = wishlistData?.find(
                          (itemInWishData) =>
                            itemInWishData.productId === openedProduct?._id,
                        );
                        const itemId = wishItem?._id;
                        if (itemId)
                          removeFromWishlist(e, itemId, openedProduct?._id);
                      } else {
                        addToWishlist(e, openedProduct, userData?._id);
                      }
                    }
                  }}
                >
                  {isLogin &&
                  userData?.wishlist?.some(
                    (item) => item === String(openedProduct?._id),
                  ) ? (
                    <MdFavorite className="!text-rose-600 text-[22px] z-10" />
                  ) : (
                    <MdFavoriteBorder className="text-slate-600 text-[22px]" />
                  )}
                </div>

                {/* Share Button (below Wishlist) */}
                <div
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 border-opacity-50 shadow-md hover:shadow-inner absolute top-14 right-3 cursor-pointer z-[500]"
                  onClick={async () => {
                    const shareData = {
                      title: openedProduct?.name,
                      text: `Check out this product: ${openedProduct?.name}\n`,
                      url: window.location.href,
                    };

                    if (navigator.share) {
                      try {
                        await navigator.share(shareData);
                      } catch (err) {
                        console.error("Error sharing:", err);
                      }
                    } else {
                      try {
                        await navigator.clipboard.writeText(
                          window.location.href,
                        );
                        alert("Product URL copied to clipboard!");
                      } catch (err) {
                        alert("Share not supported and failed to copy URL.");
                      }
                    }
                  }}
                  title="Share product"
                >
                  <PiShareFat className="text-slate-600 text-[21px]" />
                </div>
              </div>

              {/* Buttons */}
            </div>
          </div>

          {/* Fullscreen Modal for Large Image View */}
          {showLarge && (
            <div className="hidden sm:flex fixed  inset-0 bg-slate-100  z-[999]  flex-col items-center justify-center px-4">
              <div className="w-full flex justify-end">
                <button
                  onClick={() => {
                    setShowLarge(null);

                    setHideArrows(false);

                    if (typeof window !== "undefined") {
                      window.history.back();
                    }
                  }}
                  className="text-black text-3xl p-2"
                >
                  <RxCross2 />
                </button>
              </div>

              <div className="w-full max-w-[800px] h-[80vh] flex justify-center items-center">
                <Swiper
                  modules={[Navigation, Pagination, A11y]}
                  spaceBetween={10}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  navigation
                  className="w-full h-full"
                  initialSlide={initialIndex}
                >
                  {productImages.map((img, idx) => (
                    <SwiperSlide key={idx}>
                      <Image
                        src={
                          getOptimizedCloudinaryUrl(img) ||
                          "/images/placeholder.jpg"
                        }
                        alt={`Slide ${idx + 1}`}
                        width={800}
                        height={800}
                        className="object-contain w-full h-full"
                        unoptimized
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="details sm:w-[600px] px-3 sm:p-4 sm:pt-6">
          <h2 className="text-[18px] sm:text-[20px] font-medium mt-2 am:mt-0 mb-1 sm:mb-3 text-gray-800">
            {openedProduct?.name}
          </h2>

          <h2 className="text-[14px] sm:text-[16px] font-medium mb-2 sm:mb-3 text-gray-500">
            {openedProduct?.brand}
          </h2>

                {/* Rating */}
{openedProduct?.rating && (
  <div
    className={`flex justify-center items-center gap-[2px] text-white text-sm font-semibold px-[6px] w-[50px] h-[23px] rounded ${
      openedProduct?.rating > 4.5
        ? "bg-green-600"
        : openedProduct?.rating > 3.5
        ? "bg-green-500"
        : openedProduct?.rating > 2.5
        ? "bg-amber-500"
        : openedProduct?.rating < 1.5
        ? "bg-orange-500"
        : "bg-red-500"
    }`}
  >
    {parseFloat(openedProduct?.rating).toFixed(1)} <MdStars />
  </div>
)}

          {/* Price Section */}
<div className="flex items-center gap-3 mt-4">
  <div className="text-[22px] font-semibold text-black flex items-center">
    <FaIndianRupeeSign className="mr-1" />
    {openedProduct?.price}
  </div>

  {openedProduct?.oldPrice && (
    <div className="line-through text-gray-500 text-[16px]">
      ₹{openedProduct?.oldPrice}
    </div>
  )}

  {openedProduct?.discount && (
    <div className="text-green-700 text-[16px] font-medium">
      {openedProduct?.discount}% off
    </div>
  )}
</div>


          {!hideArrows && (
            <>
              <div className="flex gap-3 mt-6">
  

<Button
  variant="outlined"
  className="!border-black !text-black w-1/2"
  onClick={() => {
    if (!isLogin) {
      router.push("/login");
    } else {
      if (isInCart) {
        router.push("/cart");
      } else {
        addToCartFun(openedProduct, userData?._id, quantity);
      }
    }
  }}
>
  {isInCart ? "Go to Cart" : "Add to Cart"}
</Button>

  <Button
    variant="contained"
    className="!bg-rose-600 hover:!bg-rose-700 text-white w-1/2"
    onClick={() => {
      setBuyNowItem({ ...openedProduct, quantity });
      router.push("/checkOut");
    }}
  >
    Buy Now
  </Button>
</div>

            </>
          )}

          {/* Description */}
          {openedProduct?.description && (
            <div className="flex gap-4 mt-4">
              <h1 className="text-gray-500 font-semibold">Description</h1>
              <p className="text-black">{openedProduct?.description}</p>
            </div>
          )}


{!showLarge && 
           <Pincode productId={prdId} />}

          {/* Product Specs */}
          <ProductSpecs specs={openedProduct?.specifications} />

         


          <Reviews productId={prdId} />



    

        </div>
      </div>

      {/* similar products */}
      {!showLarge && (
        <div className=" w-full mx-10">
          <Suggestions
            productId={openedProduct?._id}
            catId={openedProduct.catId}
            subCatId={openedProduct.subCatId}
            thirdSubCatId={openedProduct.thirdSubCatId}
            brand={openedProduct.brand}
          />
        </div>
      )}
    </div>
  );
};

export default ProductPageClient;
