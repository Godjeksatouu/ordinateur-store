// Facebook Pixel tracking utilities

declare global {
  interface Window {
    fbq: any;
  }
}

export const FacebookPixel = {
  // Track page view
  pageView: () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  },

  // Track purchase event
  purchase: (value: number, currency: string, orderData?: any) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: value,
        currency: currency,
        content_type: 'product',
        ...orderData
      });
    }
  },

  // Track add to cart event
  addToCart: (value: number, currency: string, productData?: any) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        value: value,
        currency: currency,
        content_type: 'product',
        ...productData
      });
    }
  },

  // Track view content event
  viewContent: (value: number, currency: string, contentData?: any) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        value: value,
        currency: currency,
        content_type: 'product',
        ...contentData
      });
    }
  },

  // Track initiate checkout event
  initiateCheckout: (value: number, currency: string, checkoutData?: any) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        value: value,
        currency: currency,
        content_type: 'product',
        ...checkoutData
      });
    }
  }
};
