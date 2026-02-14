"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { postData } from "@/utils/api";
import Button from "@mui/material/Button";
import Loading from "@/components/Loading";

const DealershipPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    businessType: "",
    investmentRange: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await postData("/api/dealership", formData);

      alert("Thank you! Our team will contact you soon.");
      setFormData({
        name: "",
        phone: "",
        city: "",
        businessType: "",
        investmentRange: "",
      });

      // optional redirect
      // router.push("/");
    } catch (error) {
      console.error("Dealership form error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full min-h-screen bg-slate-100 flex justify-center">
      <div className="container w-full sm:w-[80%] mx-auto my-6">
        <div className="bg-white shadow-lg rounded-md p-4 sm:p-6 text-black">

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Become an Authorized Dealer
            </h1>
            <p className="text-gray-600 mt-2">
              Partner with us and grow your steel furniture business
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-center">
            <div className="p-3 bg-slate-50 rounded-md shadow-sm">
              ✔ Attractive Margin
            </div>
            <div className="p-3 bg-slate-50 rounded-md shadow-sm">
              ✔ Direct Factory Pricing
            </div>
            <div className="p-3 bg-slate-50 rounded-md shadow-sm">
              ✔ Full Product Support
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-black"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-black"
            />

            <input
              type="text"
              name="city"
              placeholder="City / District"
              value={formData.city}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-black"
            />

            <input
              type="text"
              name="businessType"
              placeholder="Existing Business (if any)"
              value={formData.businessType}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-black"
            />

            <select
              name="investmentRange"
              value={formData.investmentRange}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-black sm:col-span-2"
            >
              <option value="">Investment Range</option>
              <option value="Below 2 Lakhs">Below ₹2 Lakhs</option>
              <option value="2–5 Lakhs">₹2–5 Lakhs</option>
              <option value="5–10 Lakhs">₹5–10 Lakhs</option>
              <option value="Above 10 Lakhs">Above ₹10 Lakhs</option>
            </select>

            <Button
              type="submit"
              variant="contained"
              className="!bg-black hover:!bg-gray-800 !capitalize sm:col-span-2 py-2"
            >
              Apply for Dealership
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm mt-6">
            📍 New Burupada, Hinjilicut, Ganjam <br />
            📞 9776501230 | 🌐 www.snsteelfabrication.com
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealershipPage;
