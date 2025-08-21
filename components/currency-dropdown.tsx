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
      <select className={`bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}>
        <option value="DH">DH</option>
      </select>
    );
  }

  return (
    <select
      value={currency}
      onChange={onChange}
      className={
        "px-3 py-2 rounded-lg border-2 border-gray-200 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all " +
        className
      }
      aria-label="Currency selector"
    >
      <option value="EUR">EUR</option>
      <option value="USD">USD</option>
      <option value="XOF">XOF</option>
      <option value="DH">DH</option>
    </select>
  );
}

