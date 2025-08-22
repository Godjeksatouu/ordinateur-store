// Currency conversion utilities

export type Currency = 'DH' | 'EUR' | 'USD' | 'XOF';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  nameAr: string;
  nameFr: string;
}

// Exchange rates (DH as base currency)
export const EXCHANGE_RATES: Record<Currency, number> = {
  DH: 1,        // Base currency (Moroccan Dirham)
  EUR: 0.094,   // 1 DH = 0.094 EUR
  USD: 0.10,    // 1 DH = 0.10 USD
  XOF: 60.5,    // 1 DH = 60.5 XOF (West African CFA franc)
};

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  DH: {
    code: 'DH',
    symbol: 'DH',
    name: 'Moroccan Dirham',
    nameAr: 'درهم مغربي',
    nameFr: 'Dirham Marocain'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    nameAr: 'يورو',
    nameFr: 'Euro'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    nameAr: 'دولار أمريكي',
    nameFr: 'Dollar Américain'
  },
  XOF: {
    code: 'XOF',
    symbol: 'CFA',
    name: 'West African CFA Franc',
    nameAr: 'فرنك أفريقي',
    nameFr: 'Franc CFA'
  }
};

export class CurrencyConverter {
  // Convert from DH to target currency
  static convertFromDH(amount: number, targetCurrency: Currency): number {
    const rate = EXCHANGE_RATES[targetCurrency];
    return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
  }

  // Convert from any currency to DH
  static convertToDH(amount: number, fromCurrency: Currency): number {
    const rate = EXCHANGE_RATES[fromCurrency];
    return Math.round((amount / rate) * 100) / 100;
  }

  // Convert between any two currencies
  static convert(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
    if (fromCurrency === toCurrency) return amount;
    
    // Convert to DH first, then to target currency
    const dhAmount = this.convertToDH(amount, fromCurrency);
    return this.convertFromDH(dhAmount, toCurrency);
  }

  // Format currency with proper symbol and locale
  static format(amount: number, currency: Currency, locale: string = 'en'): string {
    const currencyInfo = CURRENCIES[currency];
    const formattedAmount = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

    // For Arabic locale, put symbol after number
    if (locale === 'ar') {
      return `${formattedAmount} ${currencyInfo.symbol}`;
    }
    
    // For other locales, put symbol before number (except DH)
    if (currency === 'DH') {
      return `${formattedAmount} ${currencyInfo.symbol}`;
    } else {
      return `${currencyInfo.symbol}${formattedAmount}`;
    }
  }

  // Get currency name based on locale
  static getCurrencyName(currency: Currency, locale: string = 'en'): string {
    const currencyInfo = CURRENCIES[currency];
    switch (locale) {
      case 'ar':
        return currencyInfo.nameAr;
      case 'fr':
        return currencyInfo.nameFr;
      default:
        return currencyInfo.name;
    }
  }

  // Get all available currencies
  static getAllCurrencies(): CurrencyInfo[] {
    return Object.values(CURRENCIES);
  }
}

// Default currency
export const DEFAULT_CURRENCY: Currency = 'DH';
