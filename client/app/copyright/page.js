"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Loading from "@/components/Loading";

const pageText = {
  title: "Copyright Notice",
  p1: `© ${new Date().getFullYear()} S N Steel Fabrication. All rights
  reserved. The content on this website including text, images,
  graphics, logos, and code is the property of S N Steel Fabrication and
  is protected by copyright law.`,
  p2: "No part of this website may be copied, reproduced, republished, uploaded, posted, transmitted, or distributed in any way without our prior written permission.",
  p3: "Unauthorized use of any material from this website may violate copyright laws and could result in legal action.",
  p4: "For permissions or inquiries, please contact us at:",
};

export default function CopyrightPage() {
  const { isCheckingToken } = useAuth();

  const [language, setLanguage] = useState("en");
  const [translatedText, setTranslatedText] = useState(pageText);

  const translatePage = async (targetLanguage) => {
    if (targetLanguage === "en") {
      setTranslatedText(pageText);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/translate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: Object.values(pageText),
            targetLanguage,
          }),
        }
      );

      const data = await response.json();

      const translated = {};
      Object.keys(pageText).forEach((key, index) => {
        translated[key] = data.translatedText[index];
      });

      setTranslatedText(translated);
    } catch (error) {
      console.error("Translation failed", error);
    }
  };

  if (isCheckingToken) {
    return <Loading />;
  }

  return (
    <main className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border-t-4 border-slate-900 my-12">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6 ">
        {translatedText.title}
        
      </h1>

      <section className="text-gray-700 space-y-4">
        <p>{translatedText.p1}</p>
        <p>{translatedText.p2}</p>
        <p>{translatedText.p3}</p>
        <p>
          {translatedText.p4}{" "}
          <a
            href="mailto:support@snsteelfabrication.com"
            className="text-blue-600 underline"
          >
            support@snsteelfabrication.component
            </a>
        </p>
      </section>
    </main>
  );
}
