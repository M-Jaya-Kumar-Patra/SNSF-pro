"use client";

import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { useAuth } from "@/app/context/AuthContext";

const Pincode = () => {
  const { isCheckingToken } = useAuth();

  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  if (isCheckingToken) {
    return (
      <div className="text-center py-6 text-gray-500">
        Checking session...
      </div>
    );
  }

  const checkAvailability = () => {
    if (!pincode || pincode.length !== 6) {
      setStatus("invalid");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const availablePincodes = [761146, 761102, 760008];
      const isAvailable = availablePincodes.includes(Number(pincode));
      setStatus(isAvailable ? "available" : "unavailable");
      setLoading(false);
    }, 600);
  };

  return (
    <div className="w-full bg-white rounded-lg   p-4 mt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Check Delivery Availability
      </h3>

      <div className="flex flex-col sm:flex-row gap-3">
        <TextField
          label="Enter 6-digit Pincode"
          variant="outlined"
          fullWidth
          size="small"
          value={pincode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setPincode(value);
            setStatus(null);
          }}
          inputProps={{ maxLength: 6 }}
        />

        <Button
          variant="contained"
          disabled={loading}
          onClick={checkAvailability}
          className="!bg-slate-900 hover:!bg-slate-800 !min-w-[120px]"
        >
          {loading ? "Checking..." : "Check"}
        </Button>
      </div>

      {/* Status Message */}
      {status && (
        <div
          className={`mt-4 flex items-center gap-2 text-sm font-medium ${
            status === "available"
              ? "text-green-600"
              : status === "unavailable"
              ? "text-red-600"
              : "text-amber-600"
          }`}
        >
          {status === "available" && (
            <>
              <CheckCircle fontSize="small" />
              Delivery is available at this pincode.
            </>
          )}

          {status === "unavailable" && (
            <>
              <Cancel fontSize="small" />
              Sorry, delivery is not available here.
            </>
          )}

          {status === "invalid" && (
            <>
              <Cancel fontSize="small" />
              Please enter a valid 6-digit pincode.
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Pincode;
