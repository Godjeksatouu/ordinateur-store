// Currency utilities for backend

const CURRENCY_SYMBOLS = {
  DH: 'DH',
  EUR: '€',
  USD: '$',
  XOF: 'CFA'
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

export {
  formatCurrency,
  getCurrencyName,
  getCurrencySymbol,
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES
};
