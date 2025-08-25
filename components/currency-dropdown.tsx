"use client";

import React, { useState, useEffect } from "react";
import { useCurrency, CurrencyCode } from "./currency-context";

export function CurrencyDropdown({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    setMounted(true);
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as CurrencyCode;
    setCurrency(newCurrency);
  };

  if (!mounted) {
    return (
      <select className={`h-11 bg-white border border-gray-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-[80px] ${className}`}>
        <option value="DH">DH</option>
      </select>
    );
  }

  return (
    <select
      value={currency}
      onChange={onChange}
      className={
        "h-11 px-3 rounded-xl border border-gray-200 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all min-w-[80px] " +
        className
      }
      aria-label="Select currency"
    >
      <option value="DH">DH</option>
      <option value="EUR">EUR</option>
      <option value="USD">USD</option>
      <option value="XOF">XOF</option>
    </select>
  );
}

