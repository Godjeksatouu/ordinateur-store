// Currency utilities for backend

const CURRENCY_SYMBOLS = {
  DH: 'DH',
  EUR: '€',
  USD: '$',
  XOF: 'CFA'
};

// Exchange rates (DH as base currency)
const EXCHANGE_RATES = {
  DH: 1,        // Base currency (Moroccan Dirham)
  EUR: 0.094,   // 1 DH = 0.094 EUR
  USD: 0.10,    // 1 DH = 0.10 USD
  XOF: 60.5,    // 1 DH = 60.5 XOF (West African CFA franc)
};

const CURRENCY_NAMES = {
  DH: {
    ar: 'درهم مغربي',
    fr: 'Dirham Marocain',
    en: 'Moroccan Dirham',
    es: 'Dirham Marroquí'
  },
  EUR: {
    ar: 'يورو',
    fr: 'Euro',
    en: 'Euro',
    es: 'Euro'
  },
  USD: {
    ar: 'دولار أمريكي',
    fr: 'Dollar Américain',
    en: 'US Dollar',
    es: 'Dólar Estadounidense'
  },
  XOF: {
    ar: 'فرنك أفريقي',
    fr: 'Franc CFA',
    en: 'West African CFA Franc',
    es: 'Franco CFA'
  }
};

// Format currency amount with proper symbol and locale
function formatCurrency(amount, currency = 'DH', locale = 'ar') {
  const symbol = CURRENCY_SYMBOLS[currency] || 'DH';
  const formattedAmount = new Intl.NumberFormat(locale === 'ar' ? 'ar-MA' : locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  // For Arabic locale, put symbol after number
  if (locale === 'ar') {
    return `${formattedAmount} ${symbol}`;
  }
  
  // For other locales, put symbol before number (except DH)
  if (currency === 'DH') {
    return `${formattedAmount} ${symbol}`;
  } else {
    return `${symbol}${formattedAmount}`;
  }
}

// Get currency name based on locale
function getCurrencyName(currency = 'DH', locale = 'ar') {
  const names = CURRENCY_NAMES[currency];
  if (!names) return currency;
  
  return names[locale] || names.en || currency;
}

// Get currency symbol
function getCurrencySymbol(currency = 'DH') {
  return CURRENCY_SYMBOLS[currency] || 'DH';
}

// Convert from DH to target currency
function convertFromDH(amount, targetCurrency = 'DH') {
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
}

// Convert from any currency to DH
function convertToDH(amount, fromCurrency = 'DH') {
  const rate = EXCHANGE_RATES[fromCurrency] || 1;
  return Math.round((amount / rate) * 100) / 100;
}

// Convert between any two currencies
function convertCurrency(amount, fromCurrency = 'DH', toCurrency = 'DH') {
  if (fromCurrency === toCurrency) return amount;

  // Convert to DH first, then to target currency
  const dhAmount = convertToDH(amount, fromCurrency);
  return convertFromDH(dhAmount, toCurrency);
}

export {
  formatCurrency,
  getCurrencyName,
  getCurrencySymbol,
  convertFromDH,
  convertToDH,
  convertCurrency,
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES,
  EXCHANGE_RATES
};
