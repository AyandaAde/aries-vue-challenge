"use client";
import { CodingChallenge } from "@/components/CodingChallenge";
import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function Home() {
  const date = new Date();
  const year = date.getFullYear();

  const sampleData = [
    {
      strike_price: 100,
      type: "Call",
      bid: 10.05,
      ask: 12.04,
      long_short: "long",
      expiration_date: "2025-12-17T00:00:00Z",
    },
    {
      strike_price: 102.5,
      type: "Call",
      bid: 12.1,
      ask: 14,
      long_short: "long",
      expiration_date: "2025-12-17T00:00:00Z",
    },
    {
      strike_price: 103,
      type: "Put",
      bid: 14,
      ask: 15.5,
      long_short: "short",
      expiration_date: "2025-12-17T00:00:00Z",
    },
    {
      strike_price: 105,
      type: "Put",
      bid: 16,
      ask: 18,
      long_short: "long",
      expiration_date: "2025-12-17T00:00:00Z",
    },
  ];

  return (
    <main className="min-h-screen mb-0 pb-0 items-center justify-between bg-neutral-50">
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col  mb-0 pb-0  gap-4 items-center justify-center px-4"
        >
          <CodingChallenge optionsData={sampleData} />
        </motion.div>
      </AuroraBackground>
      <p className="pb-10">Copyright © {year} Aries Financial</p>
    </main>
  );
}
