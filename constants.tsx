import { FoodCategory, Restaurant, MenuItem, DeliveryZone, OrderStatus } from './types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; description: string; step: number; color: string }> = {
  PLACED: {
    label: 'داواکاری نێردرا',
    description: 'داواکارییەکەت بە سەرکەوتوویی گەیشتە سیستەم',
    step: 1,
    color: 'bg-amber-500 text-amber-900 border-amber-200'
  },
  ACCEPTED: {
    label: 'ڕێستورانت قبوڵی کرد',
    description: 'ڕێستورانت داواکارییەکەی پەسەند کرد',
    step: 2,
    color: 'bg-blue-500 text-blue-900 border-blue-200'
  },
  PREPARING: {
    label: 'ئامادە دەکرێت',
    description: 'خواردنەکەت لە چێشتخانە ئامادە دەکرێت',
    step: 3,
    color: 'bg-orange-500 text-orange-900 border-orange-200'
  },
  READY: {
    label: 'ئامادەیە',
    description: 'خواردن ئامادەیە و سیستەم بەدوای شۆفێردا دەگەڕێت',
    step: 4,
    color: 'bg-emerald-500 text-emerald-900 border-emerald-200'
  },
  DRIVER_ACCEPTED: {
    label: 'Driver Accepted',
    description: 'شۆفێر داواکارییەکەی قبوڵ کرد و لە ئامادەباشیدایە',
    step: 4.5,
    color: 'bg-teal-500 text-teal-900 border-teal-200'
  },
  DRIVER_PICKED_UP: {
    label: 'Driver داواکارییەکەی وەرگرت',
    description: 'شۆفێر خواردنەکەی لە چێشتخانە وەرگرت',
    step: 5,
    color: 'bg-purple-500 text-purple-900 border-purple-200'
  },
  ON_THE_WAY: {
    label: 'لە ڕێگایە',
    description: 'شۆفێر لە ڕێگایە بەرەو ناونیشانەکەت',
    step: 6,
    color: 'bg-indigo-500 text-indigo-900 border-indigo-200'
  },
  DELIVERED: {
    label: 'گەیشت',
    description: 'داواکاری بە سەرکەوتوویی گەیەندرا',
    step: 7,
    color: 'bg-green-600 text-green-950 border-green-200'
  },
  CANCELLED: {
    label: 'هەڵوەشێنرایەوە',
    description: 'داواکارییەکە هەڵوەشێندراوەتەوە',
    step: 0,
    color: 'bg-rose-500 text-rose-900 border-rose-200'
  }
};

export const DEFAULT_FOOD_CATEGORIES: FoodCategory[] = [
  { id: 'pizza', name: 'پیتزا', icon: '🍕', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80' },
  { id: 'burger', name: 'برگر', icon: '🍔', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80' },
  { id: 'shawarma', name: 'شاورما', icon: '🌯', imageUrl: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=300&auto=format&fit=crop&q=80' },
  { id: 'fastfood', name: 'فاست فوود', icon: '🍟', imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300&auto=format&fit=crop&q=80' },
  { id: 'kebab', name: 'کباب', icon: '🍢', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&auto=format&fit=crop&q=80' },
  { id: 'traditional', name: 'خواردن', icon: '🍲', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80' },
  { id: 'drinks', name: 'خواردنەوە', icon: '🥤', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80' }
];

export const DEFAULT_DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'zone-1', name: 'زۆنی نزیک (٠–٣ کم)', minDistance: 0, maxDistance: 3, fee: 2000 },
  { id: 'zone-2', name: 'زۆنی مامناوەند (٣–٥ کم)', minDistance: 3, maxDistance: 5, fee: 3500 },
  { id: 'zone-3', name: 'زۆنی دوور (٥–١٠ کم)', minDistance: 5, maxDistance: 10, fee: 5000 },
  { id: 'zone-4', name: 'زۆنی زۆر دوور (١٠+ کم)', minDistance: 10, maxDistance: 25, fee: 7500 }
];

export const DEFAULT_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-boom-pizza',
    name: 'Boom Pizza & Burger',
    logo: 'https://images.unsplash.com/photo-1579758630668-188c22e827b0?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    ratingCount: 342,
    deliveryTime: '20-30 خولەک',
    category: 'پیتزا',
    description: 'باشترین و بەتامترین پیتزای ئیتاڵی و بەرگری تەڕ لە شار بە تامی تایبەتی بوم!',
    isOpen: true,
    address: 'سولەیمانی، شەقامی شەست مەتری، تەنیشت هۆتێل تایتانیک',
    distanceKm: 2.1,
    deliveryFee: 2000,
    isFeatured: true,
    isPopular: true,
    isSponsored: true,
    sponsoredBadge: 'سپۆنسەرکراو ⭐',
    subscriptionPlan: 'پلانی VIP مانگانە - ٥٠,٠٠٠ دینار',
    hasOffer: true,
    offerText: 'داشکاندنی ٢٠٪ بۆ پیتزای خێزانی',
    ownerId: 'rest_user_1',
    location: { lat: 35.5669, lng: 45.4162 }
  },
  {
    id: 'rest-istanbul-shawarma',
    name: 'شاوەرمای ئەستەمبوڵ',
    logo: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    ratingCount: 289,
    deliveryTime: '15-25 خولەک',
    category: 'شاورما',
    description: 'شاوەرمای گۆشت و مریشکی تورکی بە سۆسی تایبەت و نانی گەرم',
    isOpen: true,
    address: 'سولەیمانی، سەرچنار، شەقامی گشتی',
    distanceKm: 3.4,
    deliveryFee: 3500,
    isFeatured: true,
    isPopular: true,
    hasOffer: false,
    ownerId: 'rest_user_2',
    location: { lat: 35.5781, lng: 45.3892 }
  },
  {
    id: 'rest-shwan-kebab',
    name: 'کەبابی شوان',
    logo: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    ratingCount: 512,
    deliveryTime: '25-40 خولەک',
    category: 'کباب',
    description: 'کەبابی کوردی لەسەر خەڵوز لە گۆشتی نەرم و تازەی بەرخ',
    isOpen: true,
    address: 'سولەیمانی، تووی مەلیك، بەرامبەر باخچەی گشتی',
    distanceKm: 4.2,
    deliveryFee: 3500,
    isFeatured: false,
    isPopular: true,
    hasOffer: true,
    offerText: 'سەلەتە و ماستاو بە دیاری',
    ownerId: 'rest_user_3',
    location: { lat: 35.5532, lng: 45.4389 }
  },
  {
    id: 'rest-burger-factory',
    name: 'فاست فوود بەرگەر بار',
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    ratingCount: 195,
    deliveryTime: '20-35 خولەک',
    category: 'برگر',
    description: 'سماشبەرگەر بە پەنیر و پەتاتەی توون بە شێوازی ئەمریکی',
    isOpen: true,
    address: 'سولەیمانی، بەختیاری، پشت ماجدی مۆڵ',
    distanceKm: 1.8,
    deliveryFee: 2000,
    isFeatured: false,
    isPopular: false,
    hasOffer: true,
    offerText: 'بەرگەری دووەم بە نیوەی نرخ',
    ownerId: 'rest_user_4',
    location: { lat: 35.5491, lng: 45.4215 }
  },
  {
    id: 'rest-mamosta-sandwich',
    name: 'ساندویچی مامۆستا',
    logo: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80',
    rating: 4.5,
    ratingCount: 160,
    deliveryTime: '15-20 خولەک',
    category: 'فاست فوود',
    description: 'ساندویچی فەلافل، سکالۆب، جەبەن و پەپەرۆنی بە نانی تازە',
    isOpen: true,
    address: 'سولەیمانی، توی مەلیک، نزیک مەڵبەندی تەندروستی',
    distanceKm: 2.8,
    deliveryFee: 2000,
    isFeatured: false,
    isPopular: true,
    hasOffer: false,
    ownerId: 'rest_user_5',
    location: { lat: 35.5615, lng: 45.4312 }
  },
  {
    id: 'rest-chya-drinks',
    name: 'شەربەت و کوکتێلی چیا',
    logo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    ratingCount: 140,
    deliveryTime: '10-20 خولەک',
    category: 'خواردنەوە',
    description: 'شەربەتی میوەی سروشتی ١٠٠٪، میڵک شەیک و کوکتێلی فرێش',
    isOpen: true,
    address: 'سولەیمانی، سالار، شەقامی کاوە',
    distanceKm: 3.1,
    deliveryFee: 3500,
    isFeatured: false,
    isPopular: false,
    hasOffer: false,
    ownerId: 'rest_user_6',
    location: { lat: 35.5582, lng: 45.4418 }
  }
];

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  // Boom Pizza
  {
    id: 'menu-bp-1',
    restaurantId: 'rest-boom-pizza',
    name: 'پیتزا پێپەرۆنی تایبەت',
    description: 'سۆسی پیتزای ئیتاڵی، پەنیری مۆزارێلای زۆر، پەپەرۆنی گوڵکراو بە بەهاراتی تایبەت',
    price: 8500,
    originalPrice: 10500,
    hasDiscount: true,
    discountPercent: 20,
    discountBadge: '٢٠٪ داشکان 🔥',
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80',
    category: 'پیتزا',
    isAvailable: true,
    options: [
      {
        name: 'قەبارە',
        choices: [
          { title: 'مامناوەند (M)', extraPrice: 0 },
          { title: 'گەورە (L)', extraPrice: 3500 }
        ]
      },
      {
        name: 'پەنیر',
        choices: [
          { title: 'پەنیری زیادە', extraPrice: 1500 },
          { title: 'پەنیری چێدەر', extraPrice: 1000 }
        ]
      }
    ]
  },
  {
    id: 'menu-bp-2',
    restaurantId: 'rest-boom-pizza',
    name: 'پیتزا چیکن باربیکیو',
    description: 'سنگی مریشکی برژاو، سۆسی باربیکیوی دوکەڵاوی، پەنیری مۆزارێلا، پیازی مۆر و قارچك',
    price: 9000,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80',
    category: 'پیتزا',
    isAvailable: true,
    options: [
      {
        name: 'قەبارە',
        choices: [
          { title: 'مامناوەند (M)', extraPrice: 0 },
          { title: 'گەورە (L)', extraPrice: 4000 }
        ]
      }
    ]
  },
  {
    id: 'menu-bp-3',
    restaurantId: 'rest-boom-pizza',
    name: 'بەرگەر بوم مۆنستەر',
    description: 'دوو قاتی گۆشتی تازەی ئەنگوس، دوو قاتی پەنیری چێدەری تواوە، بێکۆن و سۆسی بوم',
    price: 7500,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    category: 'برگر',
    isAvailable: true
  },
  {
    id: 'menu-bp-4',
    restaurantId: 'rest-boom-pizza',
    name: 'پەتاتەی کریسپی بە پەنیر',
    description: 'پەتاتەی سوورکراوەی زێڕین بە پەنیری چێدەری گەرم و پیازی سەوز',
    price: 3500,
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80',
    category: 'فاست فوود',
    isAvailable: true
  },
  {
    id: 'menu-bp-5',
    restaurantId: 'rest-boom-pizza',
    name: 'کۆلا بەفرین',
    description: 'پەپسی / کۆکاکۆلای سارد بە بەفر',
    price: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
    category: 'خواردنەوە',
    isAvailable: true
  },

  // Istanbul Shawarma
  {
    id: 'menu-is-1',
    restaurantId: 'rest-istanbul-shawarma',
    name: 'لەفەی شاوەرمای گۆشت',
    description: 'گۆشتی بەرخی وردکراو بە سۆسی تاهین و نانی ساج و بیبەری تورشی',
    price: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&auto=format&fit=crop&q=80',
    category: 'شاورما',
    isAvailable: true
  },
  {
    id: 'menu-is-2',
    restaurantId: 'rest-istanbul-shawarma',
    name: 'دەوری شاوەرمای مریشک بە پەتاتە',
    description: 'دەوری گەورەی شاوەرمای مریشک لەگەڵ پەتاتە، سۆسی سیر و ترشیاتی تایبەت',
    price: 6500,
    imageUrl: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=500&auto=format&fit=crop&q=80',
    category: 'شاورما',
    isAvailable: true
  },

  // Shwan Kebab
  {
    id: 'menu-sk-1',
    restaurantId: 'rest-shwan-kebab',
    name: 'دەفری کەبابی کوردی تایبەت',
    description: '٤ شیش کەبابی بەرخی خەڵوزکراو، نانی تیری، تەماتەی برژاو و سەوزەی تەڕ',
    price: 11000,
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80',
    category: 'کباب',
    isAvailable: true
  },
  {
    id: 'menu-sk-2',
    restaurantId: 'rest-shwan-kebab',
    name: 'شیش تیکەی مریشکی برژاو',
    description: 'تیکەی مریشکی زەردەکراو بە لیمۆ و زەیتی زەیتوون و خەڵوز',
    price: 8000,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
    category: 'کباب',
    isAvailable: true
  }
];

export const DEMO_DRIVERS = [
  {
    id: 'drv-rawand',
    name: 'ڕەوەند ئازاد',
    phone: '+964 750 444 1122',
    vehicleType: 'ماتۆڕسکیل',
    isOnline: true,
    isActive: true,
    totalDeliveries: 148,
    todayEarnings: 32000,
    rating: 4.9,
    currentLocation: { lat: 35.5650, lng: 45.4120 }
  },
  {
    id: 'drv-karzan',
    name: 'کارزان محەمەد',
    phone: '+964 770 123 4567',
    vehicleType: 'ئۆتۆمبێل',
    isOnline: true,
    isActive: true,
    totalDeliveries: 92,
    todayEarnings: 21500,
    rating: 4.8,
    currentLocation: { lat: 35.5700, lng: 45.4200 }
  }
];

// Legacy exports for compatibility
export const ADMIN_PASSWORD = '1998a';
export const TELEGRAM_BOT_TOKEN = '';
export const ADD_TO_CART_SOUND_URL = '';
export const DEFAULT_PRODUCTS: any[] = [];
export const DEFAULT_CATEGORIES: any[] = [
  { id: 'all', name: 'هەموو' },
  { id: 'pizza', name: 'پیتزا' },
  { id: 'burger', name: 'بەرگەر' }
];

