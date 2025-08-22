"use client";

import React, { createContext, useContext, useState } from "react";

export type CurrencyCode = "DH" | "EUR" | "USD" | "XOF";

const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  DH: "DH",
  EUR: "€",
  USD: "$",
  XOF: "XOF",
};

// Updated exchange rates (per 1 DH) - more accurate rates
const RATE_PER_DH: Record<CurrencyCode, number> = {
  DH: 1,
  EUR: 0.094,   // 1 DH = 0.094 EUR
  USD: 0.10,    // 1 DH = 0.10 USD
  XOF: 60.5,    // 1 DH = 60.5 XOF (West African CFA franc)
};

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  convert: (amountInDH: number) => number;
  symbol: string;
  format: (amountInDH: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>("DH");

  const convert = (amountInDH: number) => {
    const rate = RATE_PER_DH[currency] ?? 1;
    return amountInDH * rate;
  };

  const symbol = CURRENCY_SYMBOL[currency] ?? "";

  const format = (amountInDH: number) => {
    const converted = convert(amountInDH);
    // Keep grouping similar to toLocaleString default
    const rounded = Math.round((converted + Number.EPSILON) * 100) / 100;
    return `${rounded.toLocaleString()} ${symbol}`;
  };

  const value: CurrencyContextValue = {
    currency,
    setCurrency,
    convert,
    symbol,
    format
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Fallback for SSR or when provider is not available
    return {
      currency: "DH" as CurrencyCode,
      setCurrency: () => {},
      convert: (amountInDH: number) => amountInDH,
      symbol: "DH",
      format: (amountInDH: number) => `${amountInDH.toLocaleString()} DH`
    };
  }
  return ctx;
}

