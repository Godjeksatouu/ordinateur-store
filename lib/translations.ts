export const translations = {
  ar: {
    // Navigation
    home: 'الصفحة الرئيسية',
    laptops: 'حاسوب',
    contact: 'اتصل بنا',
    cart: 'السلة',
    search: 'البحث...',
    
    // Product actions
    buyNow: 'شراء الآن',
    orderNow: 'اطلب الآن',
    viewDetails: 'عرض التفاصيل',
    
    // Product specs
    ram: 'الذاكرة',
    storage: 'التخزين',
    screen: 'الشاشة',
    graphics: 'كرت الشاشة',
    processor: 'المعالج',
    os: 'نظام التشغيل',
    
    // Common
    loading: 'جاري التحميل...',
    noProducts: 'لا توجد منتجات متاحة حالياً',
    currency: 'دج',
    
    // Homepage
    heroTitle: 'تجربة أحسن حاسوب تنتظرك',
    heroSubtitle: 'نقدم لك أفضل أجهزة الكمبيوتر المحمولة بأحدث التقنيات وأعلى معايير الجودة',
    featuredCollection: 'مجموعتنا المميزة',
    
    // Services
    fastDelivery: 'التوصيل السريع',
    fastDeliveryDesc: 'خدمة التوصيل السريع في جميع انحاء المدن',
    cashOnDelivery: 'خدمة الدفع عند الاستلام',
    cashOnDeliveryDesc: 'التسوق اون لاين من المتجر ودفع المال عند التوصيل.',
    smartWatch: 'اكتشف عالم جديد من الذكاء',
    smartWatchDesc: 'اجعل كل يوم أفضل مع ساعة ذكية مبتكرة!',
  },
  
  en: {
    // Navigation
    home: 'Home',
    laptops: 'Laptops',
    contact: 'Contact',
    cart: 'Cart',
    search: 'Search...',
    
    // Product actions
    buyNow: 'Buy Now',
    orderNow: 'Order Now',
    viewDetails: 'View Details',
    
    // Product specs
    ram: 'RAM',
    storage: 'Storage',
    screen: 'Screen',
    graphics: 'Graphics',
    processor: 'Processor',
    os: 'Operating System',
    
    // Common
    loading: 'Loading...',
    noProducts: 'No products available',
    currency: 'DZD',
    
    // Homepage
    heroTitle: 'Experience the Best Computer Awaits You',
    heroSubtitle: 'We offer you the best laptops with the latest technology and highest quality standards',
    featuredCollection: 'Our Featured Collection',
    
    // Services
    fastDelivery: 'Fast Delivery',
    fastDeliveryDesc: 'Fast delivery service in all cities',
    cashOnDelivery: 'Cash on Delivery Service',
    cashOnDeliveryDesc: 'Shop online from the store and pay cash on delivery.',
    smartWatch: 'Discover a New World of Intelligence',
    smartWatchDesc: 'Make every day better with an innovative smartwatch!',
  },
  
  fr: {
    // Navigation
    home: 'Accueil',
    laptops: 'Ordinateurs Portables',
    contact: 'Contact',
    cart: 'Panier',
    search: 'Rechercher...',
    
    // Product actions
    buyNow: 'Acheter Maintenant',
    orderNow: 'Commander Maintenant',
    viewDetails: 'Voir Détails',
    
    // Product specs
    ram: 'RAM',
    storage: 'Stockage',
    screen: 'Écran',
    graphics: 'Graphiques',
    processor: 'Processeur',
    os: 'Système d\'Exploitation',
    
    // Common
    loading: 'Chargement...',
    noProducts: 'Aucun produit disponible',
    currency: 'DZD',
    
    // Homepage
    heroTitle: 'Découvrez le Meilleur Ordinateur qui Vous Attend',
    heroSubtitle: 'Nous vous offrons les meilleurs ordinateurs portables avec les dernières technologies et les plus hauts standards de qualité',
    featuredCollection: 'Notre Collection Vedette',
    
    // Services
    fastDelivery: 'Livraison Rapide',
    fastDeliveryDesc: 'Service de livraison rapide dans toutes les villes',
    cashOnDelivery: 'Service de Paiement à la Livraison',
    cashOnDeliveryDesc: 'Achetez en ligne dans le magasin et payez en espèces à la livraison.',
    smartWatch: 'Découvrez un Nouveau Monde d\'Intelligence',
    smartWatchDesc: 'Rendez chaque jour meilleur avec une montre intelligente innovante!',
  },
  
  es: {
    // Navigation
    home: 'Inicio',
    laptops: 'Portátiles',
    contact: 'Contacto',
    cart: 'Carrito',
    search: 'Buscar...',
    
    // Product actions
    buyNow: 'Comprar Ahora',
    orderNow: 'Pedir Ahora',
    viewDetails: 'Ver Detalles',
    
    // Product specs
    ram: 'RAM',
    storage: 'Almacenamiento',
    screen: 'Pantalla',
    graphics: 'Gráficos',
    processor: 'Procesador',
    os: 'Sistema Operativo',
    
    // Common
    loading: 'Cargando...',
    noProducts: 'No hay productos disponibles',
    currency: 'DZD',
    
    // Homepage
    heroTitle: 'La Mejor Experiencia de Computadora Te Espera',
    heroSubtitle: 'Te ofrecemos las mejores laptops con la última tecnología y los más altos estándares de calidad',
    featuredCollection: 'Nuestra Colección Destacada',
    
    // Services
    fastDelivery: 'Entrega Rápida',
    fastDeliveryDesc: 'Servicio de entrega rápida en todas las ciudades',
    cashOnDelivery: 'Servicio de Pago Contra Entrega',
    cashOnDeliveryDesc: 'Compra en línea en la tienda y paga en efectivo al momento de la entrega.',
    smartWatch: 'Descubre un Nuevo Mundo de Inteligencia',
    smartWatchDesc: '¡Haz que cada día sea mejor con un reloj inteligente innovador!',
  }
};

export function getTranslation(locale: string, key: string): string {
  const lang = locale in translations ? locale as keyof typeof translations : 'ar';
  const t = translations[lang];
  return (t as any)[key] || translations.ar[key as keyof typeof translations.ar] || key;
}
