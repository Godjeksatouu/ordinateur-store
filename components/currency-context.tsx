"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

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
  const [currency, setCurrencyState] = useState<CurrencyCode>("DH");
  const [isClient, setIsClient] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Add a small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      setIsHydrated(true);
      try {
        const saved = window.localStorage.getItem("selectedCurrency");
        if (saved === "EUR" || saved === "USD" || saved === "XOF" || saved === "DH") {
          setCurrencyState(saved);
        }
      } catch (error) {
        console.warn("Failed to load currency from localStorage:", error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const setCurrency = React.useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    if (isClient && isHydrated) {
      try {
        window.localStorage.setItem("selectedCurrency", c);
      } catch (error) {
        console.warn("Failed to save currency to localStorage:", error);
      }
    }
  }, [isClient, isHydrated]);

  const value = useMemo<CurrencyContextValue>(() => {
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
    return { currency, setCurrency, convert, symbol, format };
  }, [currency, setCurrency]);

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

