"use client"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useOrders } from '@/app/context/OrdersContext'
import { useRouter, useParams } from 'next/navigation'
import { fetchDataFromApi, postData } from '@/utils/api'
import { Button, Rating } from '@mui/material'
import { useAlert } from '@/app/context/AlertContext'
import Image from 'next/image'

const OrdersPage = () => {
  const router = useRouter()
  const { userData, isLogin } = useAuth()
  const { getOrdersItems, OrdersData } = useOrders()

  const [openedOrder, setOpenedOrder] = useState(null)
  const [showRateReview, setShowRateReview] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const alert = useAlert()

  const params = useParams()
  const orderId = params.order
  
  
  useEffect(() => {
  if (!isLogin) return;
  getOrdersItems();
}, [isLogin]);
  


  
  useEffect(() => {
    if (!orderId) return
    
    fetchDataFromApi(`/api/order/${orderId}`)
    .then((res) => {
      if (res.success) {
        setOpenedOrder(res.data)
        console.log("openedOrder",res.data)
      } else {
        console.warn("Order fetch failed:", res.message)
      }
    })
    .catch((err) => {
      console.error("Fetch error:", err)
    })
  }, [orderId])

  const handleRateReviewModal = (product) => {
    setSelectedProduct(product)
    setShowRateReview(true)
  }
  
  const handleSubmitReview = (productId) => {
    if (!rating || review.length < 5) {
      alert("Please provide a valid rating and review.")
      return
    }
    
    console.log("ProooooooooooooooooooooooooooooooooductId", productId)
    
    console.log("Submitting review for product:", selectedProduct)
    console.log({ rating, review })
    
    // TODO: Send POST request to /api/review or similar endpoint
    const formData = {
      userName: userData?.name,
      review: review,
      rating: rating,
      productId: productId
    }
    
    postData(`/api/user/addReview`, formData).then((res) => {
      if (!res.error) {
        alert.alertBox({ type: "success", msg: "Review submitted successfully!" })
      } else {
        alert.alertBox({ type: "error", msg: "Please provide a rating and review." })
      }
    })

    // Reset modal
    setShowRateReview(false)
    setRating(0)
    setReview("")
    setSelectedProduct(null)
  }

  const handleDownloadInvoice = () => {
  if (!openedOrder) return;

  const doc = new jsPDF();

  const orderDate = new Date(openedOrder.createdAt).toLocaleDateString("en-IN");

  // ===============================
  // HEADER
  // ===============================
  doc.setFillColor(255, 255, 255); // dark navy
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.text("S N Steel Fabrication", 14, 18);

  doc.setFontSize(11);
  doc.text("TAX INVOICE", 160, 18);

  doc.setTextColor(0, 0, 0);

  // ===============================
  // ORDER INFO
  // ===============================
  doc.setFontSize(11);

  doc.text(`Invoice No: ${openedOrder.orderId}`, 14, 45);
  doc.text(`Invoice Date: ${orderDate}`, 14, 52);

  doc.text(
    `Payment Method: ${
      openedOrder.payment_method === "COD"
        ? "Cash on Delivery"
        : "Online Payment"
    }`,
    14,
    59
  );

  doc.text(`Payment Status: ${openedOrder.payment_status}`, 14, 66);

  // ===============================
  // BILL TO SECTION
  // ===============================
  doc.setFontSize(12);
  doc.text("Bill To:", 14, 80);

  doc.setFontSize(10);
  doc.text(`${openedOrder.delivery_address?.name}`, 14, 88);
  doc.text(`${openedOrder.delivery_address?.address}`, 14, 94);
  doc.text(
    `${openedOrder.delivery_address?.city}, ${openedOrder.delivery_address?.state} - ${openedOrder.delivery_address?.pin}`,
    14,
    100
  );
  doc.text(`Phone: ${openedOrder.delivery_address?.phone}`, 14, 106);

  // ===============================
  // PRODUCTS TABLE
  // ===============================
  const tableData = openedOrder.products.map((prd, index) => [
    index + 1,
    prd.productTitle,
    prd.quantity,
    `Rs. ${prd.price}`,
    `Rs. ${prd.quantity * prd.price}`

  ]);

  autoTable(doc, {
    startY: 120,
    head: [["#", "Product", "Qty", "Price", "Subtotal"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235], // blue
      textColor: 255,
      fontStyle: "bold"
    },
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "right", cellWidth: 30 },
      4: { halign: "right", cellWidth: 30 }
    }
  });

  // ===============================
  // TOTAL SECTION
  // ===============================
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text(`Total Amount: Rs. ${openedOrder.totalAmt}`, 140, finalY);


  doc.setFont(undefined, "normal");

  // ===============================
  // FOOTER
  // ===============================
  doc.setDrawColor(200);
  doc.line(14, 270, 196, 270);

  doc.setFontSize(9);
  doc.text(
    "Thank you for shopping with S N Steel Fabrication!",
    14,
    278
  );

  doc.text(
    "This is a system generated invoice.",
    14,
    284
  );

  // ===============================
  // SAVE FILE
  // ===============================
  doc.save(`Invoice-${openedOrder.orderId}.pdf`);
};



  
  return (
    <div className='w-full bg-slate-100 flex justify-center items-center'>
      <div className='w-[1020px] bg-white min-h-screen my-3 p-4'>

        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-gray-700 mb-4'>Order Details</h1>
          <div >
           
            <Button
  variant="contained"
  className="!bg-indigo-500 hover:!bg-indigo-600"
  onClick={handleDownloadInvoice}
>
  Download Invoice
</Button>


          </div>
        </div>

        <div className="w-full p-4 border rounded-md bg-white mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

  {/* Order ID */}
  <div className="flex flex-col items-center justify-center text-center">
    <span className="text-sm text-gray-500 font-semibold">Order ID</span>
    <span className="text-black text-base font-bold">{openedOrder?.orderId}</span>
  </div>

  {/* Order Status */}
  <div className="flex flex-col items-center justify-center text-center">
    <span className="text-sm text-gray-500 font-semibold">Order Status</span>
    <span className={`text-sm px-2 py-1 rounded-full font-bold 
      ${openedOrder?.order_Status === "Pending" && "bg-amber-100 text-amber-800"}
      ${openedOrder?.order_Status === "Confirmed" && "bg-blue-100 text-blue-800"}
      ${openedOrder?.order_Status === "Processing" && "bg-cyan-100 text-cyan-800"}
      ${openedOrder?.order_Status === "Delivered" && "bg-green-100 text-green-800"}
      ${openedOrder?.order_Status === "Canceled" && "bg-red-100 text-red-600"}
      ${openedOrder?.order_Status === "Returned" && "bg-orange-100 text-orange-800"}
      ${openedOrder?.order_Status === "Refunded" && "bg-lime-100 text-lime-800"}
    `}>
      {openedOrder?.order_Status}
    </span>
  </div>

  {/* Payment Status */}
  <div className="flex flex-col items-center justify-center text-center">
    <span className="text-sm text-gray-500 font-semibold">Payment Status</span>
    <span className={`text-sm px-2 py-1 rounded-full font-bold
      ${openedOrder?.payment_status === "Completed" && "bg-green-100 text-green-800"}
      ${openedOrder?.payment_status === "Canceled" && "bg-red-100 text-red-600"}
      ${openedOrder?.payment_status === "Refunded" && "bg-lime-100 text-lime-800"}
      ${openedOrder?.payment_status === "Pending" && "bg-amber-100 text-amber-800"}
    `}>
      {openedOrder?.payment_status}
    </span>
  </div>

  {/* Total Amount */}
  <div className="flex flex-col items-center justify-center text-center">
    <span className="text-sm text-gray-500 font-semibold">Total Amount</span>
    <span className="text-black text-lg font-bold">₹{openedOrder?.totalAmt}</span>
  </div>

  {/* Order Date */}
  <div className="flex flex-col items-center justify-center text-center col-span-1 md:col-span-1">
    <span className="text-sm text-gray-500 font-semibold">Order Date</span>
    <span className="text-black text-sm font-semibold">
  {openedOrder?.createdAt && (
    <>
      {new Date(openedOrder.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}{" "}
      {new Date(openedOrder.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
    </>
  )}
</span>

  </div>

  {/* Delivery Date */}
  <div className="flex flex-col items-center justify-center text-center col-span-1 md:col-span-1">
    <span className="text-sm text-gray-500 font-semibold">Delivery Date</span>
  <span className="text-black text-sm font-semibold">
  {openedOrder?.createdAt && (
    <>
      {new Date(
        new Date(openedOrder.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    </>
  )}
</span>

  </div>

  {/* Payment Method */}
<div className="flex flex-col items-center justify-center text-center">
  <span className="text-sm text-gray-500 font-semibold">Payment Method</span>
  <span className="text-black text-sm font-bold">
    {openedOrder?.payment_method === "COD" ? "Cash on Delivery" : "Online Payment"}
  </span>
</div>

{/* Payment ID */}
 
{openedOrder?.payment_method !== "COD" && openedOrder?.paymentId && (
  <div className="flex flex-col items-center justify-center text-center">
    <span className="text-sm text-gray-500 font-semibold">Payment ID</span>
    <span className="text-black text-xs font-semibold break-all">
      {openedOrder?.paymentId}
    </span>
  </div>
)}


  
</div>


        {/* Shipping / Delivery Address */}
        {/* Improved Delivery Address UI */}
        <div className="w-full p-3 border rounded-sm bg-white text-sm mb-4 text-gray-800">
          <h2 className="text-lg font-semibold border-b pb-2 mb-3 text-gray-700">Delivery Address</h2>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-6 gap-y-2">
            <div><span className="font-medium">Name:</span> {openedOrder?.delivery_address?.name || userData?.name}</div>
            <div><span className="font-medium">Phone:</span> {openedOrder?.delivery_address?.phone || 'N/A'}</div>
            <div><span className="font-medium">Email:</span> {openedOrder?.delivery_address?.email || userData?.email}</div>
            <div><span className="font-medium">Pin Code:</span> {openedOrder?.delivery_address?.pin || 'N/A'}</div>
            <div className="col-span-2"><span className="font-medium">Address:</span> {openedOrder?.delivery_address?.address || 'N/A'}</div>
            <div><span className="font-medium">City:</span> {openedOrder?.delivery_address?.city || 'N/A'}</div>
            <div><span className="font-medium">State:</span> {openedOrder?.delivery_address?.state || 'N/A'}</div>
            <div><span className="font-medium">Country:</span> {openedOrder?.delivery_address?.country || 'N/A'}</div>
          </div>
        </div>



        {/* Products List */}
        <div className='w-full p-3 border rounded-sm bg-white mb-4 flex flex-col justify-between'>
          {Array.isArray(openedOrder?.products) && openedOrder.products.length > 0 ? (
            openedOrder.products.map((prd, index) => (
              <div
                key={index}
                className='w-full border border-gray-300 h-fit text-black p-4 rounded mb-2 flex justify-between items-center'
              >
                <div className="flex gap-4 items-center cursor-pointer w-[60%]"
                  onClick={() => router.push(`/product/${prd?.productId}`)}>

                  <Image
                  width={100} height={100}
                    src={prd?.image || prd?.images?.[0] || '/images/placeholder.png'}
                    alt={prd?.productTitle}
                    className="w-24 h-24 object-contain rounded shadow"
                  />
                  <div className='w-full'
                    onClick={() => router.push(`/product/${prd?.productId}`)}>
                    <h3 className="text-lg font-semibold">{prd?.productTitle}</h3>
                    <p className="text-sm text-gray-500">{prd?.productBrand || "Brand Info"}</p>
                    <p className="text-sm text-gray-600">Qty: {prd?.quantity}</p>
                  </div>
                </div>

                {/* Rate & Review */}
                {openedOrder?.order_Status === "Delivered" ? (
                  <div className='flex flex-col w-[20%]  gap-3'>
                    <Button
                      variant='contained'
                      className='!bg-green-700'
                      onClick={() => handleRateReviewModal(prd)}
                    >
                      Rate & Review
                    </Button>

                    <Button
                      variant='outlined'
                      color='inherit'
                    >
                      Return
                    </Button>

                  </div>
                ) : (
                  <div className='text-center w-[20%]'>
                    <Button
                      variant='outlined'
                      color='inherit'
                      className='!bg-white !border !border-red-500 !text-red-500 hover:!bg-red-100 !rounded !px-3 !py-1'
                    >
                      Cancel
                    </Button>
                  </div>

                )}

                {/* Price */}
                <div className="text-right w-[20%]">
                  <p className="text-gray-500 text-sm">Price</p>
                  <p className="text-xl font-bold text-[#131e30]">
                    ₹{(prd?.price || 0) * (prd?.quantity || 1)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 mt-8 text-lg">No products found in this order.</div>
          )}
        </div>

        {/* Rate & Review Modal */}
        {showRateReview && (
          <div className='fixed inset-0 z-[999] bg-black bg-opacity-40 flex justify-center items-center'>
            <div className='bg-white w-[500px] rounded-lg p-6 text-black shadow-lg'>
              <h2 className='text-xl font-bold mb-2'>Rate & Review</h2>
              <p className='text-gray-600 mb-4'>Product: <strong>{selectedProduct?.productTitle}</strong></p>


              <div className='mb-4'>
                <label className='block font-medium mb-1'>Rating</label>
                <Rating
                  value={rating}
                  onChange={(e, value) => setRating(value)}
                  size="large"
                />
              </div>

              <div className='mb-4'>
                <label className='block font-medium mb-1'>Review</label>
                <textarea
                  className='w-full border rounded p-2 text-sm'
                  rows="4"
                  placeholder='Share your experience...'
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
              </div>

              <div className='flex justify-end gap-4'>
                <Button
                  variant='outlined'
                  onClick={() => {
                    setShowRateReview(false)
                    setRating(0)
                    setReview("")
                    setSelectedProduct(null)
                  }}
                >
                  Cancel
                </Button>
                <Button variant='contained' onClick={() => handleSubmitReview(selectedProduct?.productId)}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full bg-white p-6 rounded-sm  mb-6 border">

  <h2 className="text-xl font-bold mb-6 text-gray-800">
    Order Progress
  </h2>

  <div className="relative flex items-center justify-between">

    {/* Progress Line Background */}
    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />

    {/* Active Progress Line */}
    <div
      className={`absolute top-5 left-0 h-1 bg-green-600 rounded-full transition-all duration-500`}
      style={{
        width:
          openedOrder?.order_Status === "Confirmed"
            ? "0%"
            : openedOrder?.order_Status === "Processing"
            ? "50%"
            : openedOrder?.order_Status === "Delivered"
            ? "100%"
            : "0%",
      }}
    />

    {["Confirmed", "Processing", "Delivered"].map((step, index) => {
      const currentStepIndex =
        ["Confirmed", "Processing", "Delivered"].indexOf(
          openedOrder?.order_Status
        );

      const isActive = currentStepIndex >= index;

      return (
        <div key={index} className="relative flex flex-col items-center w-1/3 z-10">

          {/* Circle */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md transition-all duration-300
              ${
                isActive
                  ? "bg-green-600 scale-110"
                  : "bg-gray-300"
              }`}
          >
            {isActive ? "✓" : index + 1}
          </div>

          {/* Label */}
          <span
            className={`mt-3 text-sm font-semibold transition-all duration-300
              ${isActive ? "text-green-700" : "text-gray-400"}`}
          >
            {step}
          </span>

        </div>
      );
    })}
  </div>
</div>


      </div>
    </div>
  )
}

export default OrdersPage
