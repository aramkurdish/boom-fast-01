import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserRole,
  UserProfile,
  AppAccount,
  Restaurant,
  MenuItem,
  CartItem,
  Order,
  OrderStatus,
  DeliveryZone,
  DriverProfile,
  AppNotification,
  CustomerTab,
  RestaurantTab,
  DriverTab,
  AdminTab,
  Advertisement
} from '../types';
import {
  DEFAULT_RESTAURANTS,
  DEFAULT_MENU_ITEMS,
  DEFAULT_DELIVERY_ZONES,
  DEMO_DRIVERS
} from '../constants';
import { db } from '../firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { soundService } from '../services/soundService';
import { calculateDistanceKm, estimateDeliveryMinutes } from '../utils/geo';

interface AppContextType {
  // Role & Auth
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;

  // Tabs for each role
  customerTab: CustomerTab;
  setCustomerTab: (tab: CustomerTab) => void;
  restaurantTab: RestaurantTab;
  setRestaurantTab: (tab: RestaurantTab) => void;
  driverTab: DriverTab;
  setDriverTab: (tab: DriverTab) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;

  // Restaurants & Menu
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;
  addRestaurant: (r: Omit<Restaurant, 'id'>) => void;
  updateRestaurant: (id: string, updates: Partial<Restaurant>) => void;
  toggleRestaurantStatus: (id: string) => void;
  deleteRestaurant: (id: string) => void;
  moveRestaurantOrder: (restaurantId: string, direction: 'UP' | 'DOWN') => void;
  moveRestaurantToTop: (restaurantId: string) => void;
  toggleRestaurantSponsored: (restaurantId: string) => void;
  setRestaurantRank: (restaurantId: string, newRank: number) => void;
  setRestaurantsOrder: (orderedRestaurants: Restaurant[]) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  applyRestaurantOffer: (restaurantId: string, offer: { hasOffer: boolean; offerText: string; discountPercent?: number; offerBadge?: string }) => void;
  applyMenuItemDiscount: (itemId: string, discount: { hasDiscount: boolean; price: number; originalPrice?: number; discountPercent?: number; discountBadge?: string }) => void;
  applyBulkCategoryDiscount: (restaurantId: string, category: string, discountPercent: number) => void;
  clearRestaurantDiscounts: (restaurantId: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartTotal: number;

  // Orders & Tracking
  orders: Order[];
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  placeOrder: (details: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    addressDetails?: string;
    deliveryNotes?: string;
    customerLocation?: { lat: number; lng: number };
  }) => string;
  updateOrderStatus: (orderId: string, status: OrderStatus, driverStep?: Order['driverStep']) => void;

  // Drivers
  drivers: DriverProfile[];
  currentDriver: DriverProfile;
  toggleDriverOnline: (driverId: string) => void;
  acceptOrderAsDriver: (orderId: string, driverId: string) => { success: boolean; error?: string };
  rejectOrderAsDriver: (orderId: string, driverId: string) => void;
  assignDriverToReadyOrder: (orderId: string) => void;
  advanceDriverDeliveryStep: (orderId: string) => void;
  addDriver: (d: Omit<DriverProfile, 'id'>) => void;
  toggleDriverActive: (id: string) => void;
  playTestSound: (type: 'restaurant' | 'driver' | 'success') => void;

  // Delivery Zones & Per-KM GPS Rates
  deliveryZones: DeliveryZone[];
  deliveryPricePerKm: number;
  deliveryMinFee: number;
  setDeliveryPricePerKm: (price: number) => void;
  setDeliveryMinFee: (min: number) => void;
  getRestaurantDistance: (restaurant: Restaurant, fromLocation?: { lat: number; lng: number }) => number;
  calculateDeliveryFee: (distanceKm: number) => number;
  updateDeliveryZone: (id: string, updates: Partial<DeliveryZone>) => void;
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id'>) => void;

  // Location
  userLocation: { address: string; lat: number; lng: number; isSet?: boolean };
  setUserLocation: (loc: { address: string; lat: number; lng: number; isSet?: boolean }) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  unreadNotificationsCount: number;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;

  // Modals
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isRoleSwitcherOpen: boolean;
  setIsRoleSwitcherOpen: (open: boolean) => void;

  // Advertisements (Super Admin managed, Customer viewed)
  ads: Advertisement[];
  addAd: (ad: Omit<Advertisement, 'id' | 'createdAt'>) => void;
  updateAd: (id: string, updates: Partial<Advertisement>) => void;
  deleteAd: (id: string) => void;
  toggleAdActive: (id: string) => void;
  activePopupAd: Advertisement | null;
  dismissPopupAd: (dontShowToday?: boolean) => void;
  showAdPreview: (ad: Advertisement) => void;

  // Account Management & Authentication
  accounts: AppAccount[];
  registerCustomer: (name: string, phone: string, password: string) => { success: boolean; error?: string };
  loginWithCredentials: (phone: string, password: string) => { success: boolean; error?: string; role?: UserRole };
  createRestaurantAccount: (data: {
    restaurantName: string;
    managerName: string;
    phone: string;
    password: string;
    category?: string;
    address?: string;
  }) => { success: boolean; error?: string };
  createDriverAccount: (data: {
    driverName: string;
    phone: string;
    password: string;
    vehicleType: string;
  }) => { success: boolean; error?: string };
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_ACCOUNTS: AppAccount[] = [
  {
    id: 'acc_admin_1',
    name: 'ئارام بەرزنجی (سەرپەرشتیار)',
    phone: '07509998877',
    password: 'admin',
    role: 'SUPER_ADMIN',
    createdAt: '2026-01-01'
  },
  {
    id: 'acc_rest_1',
    name: 'بەڕێوەبەری Boom Pizza',
    managerName: 'بەڕێوەبەری بوم',
    restaurantName: 'Boom Pizza & Burger',
    restaurantId: 'rest-boom-pizza',
    phone: '07502223344',
    password: 'pizza',
    role: 'RESTAURANT',
    createdAt: '2026-01-01'
  },
  {
    id: 'acc_drv_1',
    name: 'ڕەوەند ئازاد',
    phone: '07504441122',
    password: 'driver',
    vehicleType: 'ماتۆڕسکیل',
    driverId: 'drv-rawand',
    role: 'DRIVER',
    createdAt: '2026-01-01'
  },
  {
    id: 'acc_cust_1',
    name: 'شەهید مەحمود',
    phone: '07501112233',
    password: '123',
    role: 'CUSTOMER',
    createdAt: '2026-01-01'
  }
];

const DEMO_USERS: Record<UserRole, UserProfile> = {
  CUSTOMER: {
    id: 'user_cust_1',
    name: 'شەهید مەحمود',
    phone: '+964 750 111 2233',
    role: 'CUSTOMER',
    createdAt: '2026-01-01'
  },
  RESTAURANT: {
    id: 'rest_user_1',
    name: 'بەڕێوەبەری Boom Pizza',
    phone: '+964 750 222 3344',
    role: 'RESTAURANT',
    restaurantId: 'rest-boom-pizza',
    createdAt: '2026-01-01'
  },
  DRIVER: {
    id: 'drv-rawand',
    name: 'ڕەوەند ئازاد (شۆفێر)',
    phone: '+964 750 444 1122',
    role: 'DRIVER',
    driverId: 'drv-rawand',
    createdAt: '2026-01-01'
  },
  SUPER_ADMIN: {
    id: 'super_admin_1',
    name: 'ئارام بەرزنجی (سەرپەرشتیار)',
    phone: '+964 750 999 8877',
    role: 'SUPER_ADMIN',
    createdAt: '2026-01-01'
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('CUSTOMER');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS.CUSTOMER);

  // Tabs
  const [customerTab, setCustomerTab] = useState<CustomerTab>('HOME');
  const [restaurantTab, setRestaurantTab] = useState<RestaurantTab>('DASHBOARD');
  const [driverTab, setDriverTab] = useState<DriverTab>('HOME');
  const [adminTab, setAdminTab] = useState<AdminTab>('OVERVIEW');

  // Entities
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem('talabat_restaurants');
    return saved ? JSON.parse(saved) : DEFAULT_RESTAURANTS;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('talabat_menu_items');
    return saved ? JSON.parse(saved) : DEFAULT_MENU_ITEMS;
  });

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(() => {
    const saved = localStorage.getItem('talabat_delivery_zones');
    return saved ? JSON.parse(saved) : DEFAULT_DELIVERY_ZONES;
  });

  // GPS per-kilometer price (Default 300 IQD/km: 10 km = 3,000 IQD as requested by user)
  const [deliveryPricePerKm, setDeliveryPricePerKmState] = useState<number>(() => {
    const saved = localStorage.getItem('talabat_delivery_price_per_km');
    return saved ? Number(saved) : 300;
  });

  // Minimum base delivery fee
  const [deliveryMinFee, setDeliveryMinFeeState] = useState<number>(() => {
    const saved = localStorage.getItem('talabat_delivery_min_fee');
    return saved ? Number(saved) : 1000;
  });

  const setDeliveryPricePerKm = (price: number) => {
    const val = Math.max(50, Number(price) || 300);
    setDeliveryPricePerKmState(val);
    localStorage.setItem('talabat_delivery_price_per_km', val.toString());
  };

  const setDeliveryMinFee = (min: number) => {
    const val = Math.max(0, Number(min) || 1000);
    setDeliveryMinFeeState(val);
    localStorage.setItem('talabat_delivery_min_fee', val.toString());
  };

  const [drivers, setDrivers] = useState<DriverProfile[]>(() => {
    const saved = localStorage.getItem('talabat_drivers');
    return saved ? JSON.parse(saved) : DEMO_DRIVERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('talabat_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((o: any) => ({
            ...o,
            customerAddress: o.customerAddress || o.address || 'سولەیمانی'
          }));
        }
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'ord-1001',
        orderNumber: 1001,
        customerId: 'user_cust_1',
        customerName: 'شەهید مەحمود',
        customerPhone: '+964 750 111 2233',
        restaurantId: 'rest-boom-pizza',
        restaurantName: 'Boom Pizza & Burger',
        restaurantAddress: 'سولەیمانی، شەست مەتری',
        driverId: 'drv-rawand',
        driverName: 'ڕەوەند ئازاد',
        driverPhone: '+964 750 444 1122',
        items: [
          { name: 'پیتزا پێپەرۆنی تایبەت', quantity: 1, price: 8500, notes: 'پەنیر زۆر بێت' },
          { name: 'پەتاتەی کریسپی بە پەنیر', quantity: 1, price: 3500 },
          { name: 'کۆلا بەفرین', quantity: 2, price: 1000 }
        ],
        subtotal: 14000,
        deliveryFee: 2000,
        total: 16000,
        customerAddress: 'سولەیمانی، ڕزگاری، تەنیشت مزگەوتی گەورە، خانوو ژمارە ٤٢',
        deliveryNotes: 'زەنگی دەرگا لێمەدە، پەیوەندی بکە',
        status: 'ON_THE_WAY',
        paymentMethod: 'CASH_ON_DELIVERY',
        driverStep: 'HEADING_TO_CUSTOMER',
        createdAt: Date.now() - 15 * 60 * 1000
      },
      {
        id: 'ord-1002',
        orderNumber: 1002,
        customerId: 'user_cust_2',
        customerName: 'سۆران کەریم',
        customerPhone: '+964 770 555 6677',
        restaurantId: 'rest-boom-pizza',
        restaurantName: 'Boom Pizza & Burger',
        restaurantAddress: 'سولەیمانی، شەست مەتری',
        items: [
          { name: 'بەرگەر بوم مۆنستەر', quantity: 2, price: 7500 }
        ],
        subtotal: 15000,
        deliveryFee: 2000,
        total: 17000,
        customerAddress: 'سولەیمانی، ئیبراهیم ئەحمەد',
        status: 'READY',
        paymentMethod: 'CASH_ON_DELIVERY',
        createdAt: Date.now() - 5 * 60 * 1000
      }
    ];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('talabat_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'بەخێربێیت بۆ سیستەمی Talabat بوم!',
      message: 'دەتوانیت خواردنی دڵخوازت لە باشترین ڕێستورانتەکان داوا بکەیت.',
      timestamp: Date.now() - 60 * 60 * 1000,
      isRead: false
    }
  ]);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(orders[0]?.id || null);
  const [userLocation, setUserLocationState] = useState<{ address: string; lat: number; lng: number; isSet?: boolean }>(() => {
    const saved = localStorage.getItem('boomfast_user_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      address: 'شوێنەکەت دیاری بکە 📍',
      lat: 36.6025,
      lng: 44.4035,
      isSet: false
    };
  });

  const setUserLocation = (loc: { address: string; lat: number; lng: number; isSet?: boolean }) => {
    const updated = { ...loc, isSet: true };
    setUserLocationState(updated);
    try {
      localStorage.setItem('boomfast_user_location', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Auto-prompt location picker when customer enters and has not set their location yet
  useEffect(() => {
    if (currentRole === 'CUSTOMER' && !userLocation.isSet) {
      const timer = setTimeout(() => {
        setIsLocationModalOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentRole, userLocation.isSet]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  // Accounts state (persisted)
  const [accounts, setAccounts] = useState<AppAccount[]>(() => {
    const saved = localStorage.getItem('talabat_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  // Advertisements state (persisted)
  const [ads, setAds] = useState<Advertisement[]>(() => {
    const saved = localStorage.getItem('boomfast_ads');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'ad-sample-1',
        title: 'خێراترین گەیاندن لەگەڵ Boom Fast',
        subtitle: 'داشکاندن و خزمەتگوزاری نوێ',
        description: 'داواکارییەکانت لە باشترین چێشتخانەکانی خەلیفان و سۆران بە خێراترین کات و کەمترین تێچووی گەیاندن دەگەنە بەردەم ماڵەکەت!',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
        actionText: 'داواکردنی خواردن',
        actionType: 'NONE',
        isActive: true,
        showOnEntry: true,
        showBanner: true,
        badgeText: 'ڕیکلامی تایبەت',
        createdAt: new Date().toISOString()
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('boomfast_ads', JSON.stringify(ads));
    } catch (e) {
      // ignore
    }
  }, [ads]);

  const [activePopupAd, setActivePopupAd] = useState<Advertisement | null>(null);

  // Auto-show popup advertisement on entrance if customer enters
  useEffect(() => {
    if (currentRole === 'CUSTOMER') {
      const dismissedUntil = localStorage.getItem('boomfast_ad_dismissed_until');
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        return;
      }
      const candidate = ads.find(a => a.isActive && a.showOnEntry);
      if (candidate) {
        const timer = setTimeout(() => {
          setActivePopupAd(candidate);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [currentRole, ads]);

  const dismissPopupAd = (dontShowToday?: boolean) => {
    setActivePopupAd(null);
    if (dontShowToday) {
      localStorage.setItem('boomfast_ad_dismissed_until', String(Date.now() + 24 * 60 * 60 * 1000));
    }
  };

  const showAdPreview = (ad: Advertisement) => {
    setActivePopupAd(ad);
  };

  const addAd = (adData: Omit<Advertisement, 'id' | 'createdAt'>) => {
    const newAd: Advertisement = {
      ...adData,
      id: 'ad-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setAds(prev => [newAd, ...prev]);
  };

  const updateAd = (id: string, updates: Partial<Advertisement>) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAd = (id: string) => {
    setAds(prev => prev.filter(a => a.id !== id));
  };

  const toggleAdActive = (id: string) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  useEffect(() => {
    localStorage.setItem('talabat_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Current active driver profile
  const currentDriver = drivers.find(d => d.id === currentUser.driverId) || drivers[0];

  // Phone normalizer
  const normalizePhone = (p: string) => {
    const digits = p.replace(/\D/g, '');
    if (digits.startsWith('964')) return '0' + digits.slice(3);
    if (digits.startsWith('0')) return digits;
    return '0' + digits;
  };

  // Tracking sets for sound alerts
  const knownPlacedOrdersRef = useRef<Set<string>>(new Set());
  const alertedCandidateOrdersRef = useRef<Set<string>>(new Set());

  // Unlock audio on initial interaction
  useEffect(() => {
    const handleGesture = () => {
      soundService.enableAudio();
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };
    window.addEventListener('click', handleGesture);
    window.addEventListener('touchstart', handleGesture);
    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };
  }, []);

  // Firestore Snapshot sync (with local fallback)
  useEffect(() => {
    try {
      const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
        if (!snap.empty) {
          const list: Order[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Order));
          list.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

          // Check for incoming PLACED orders to ring restaurant bell
          list.forEach(order => {
            if (order.status === 'PLACED' && !knownPlacedOrdersRef.current.has(order.id)) {
              knownPlacedOrdersRef.current.add(order.id);
              if (currentRole === 'RESTAURANT') {
                soundService.playRestaurantOrderChime();
              }
            }

            // Check for READY assignment to ring candidate driver
            if (
              order.status === 'READY' &&
              order.currentCandidateDriverId &&
              !alertedCandidateOrdersRef.current.has(`${order.id}-${order.currentCandidateDriverId}`)
            ) {
              alertedCandidateOrdersRef.current.add(`${order.id}-${order.currentCandidateDriverId}`);
              if (currentRole === 'DRIVER' && currentDriver?.id === order.currentCandidateDriverId) {
                soundService.playDriverDispatchRingtone();
              }
            }
          });

          setOrders(list);
        }
      }, (err) => {
        console.warn('Firestore orders sync fallback to local cache:', err);
      });

      return () => unsubOrders();
    } catch (e) {
      console.warn('Firestore init note:', e);
    }
  }, [currentRole, currentDriver?.id]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('talabat_restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem('talabat_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('talabat_delivery_zones', JSON.stringify(deliveryZones));
  }, [deliveryZones]);

  useEffect(() => {
    localStorage.setItem('talabat_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('talabat_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('talabat_cart', JSON.stringify(cart));
  }, [cart]);

  // Helper to get GPS distance between user and restaurant
  const getRestaurantDistance = (restaurant: Restaurant, fromLocation?: { lat: number; lng: number }): number => {
    const origin = fromLocation || userLocation;
    return calculateDistanceKm(origin, restaurant.location, restaurant.distanceKm || 2.5);
  };

  // Delivery fee calculation based on GPS distance (Kilometers)
  // Formula: distanceKm * deliveryPricePerKm (e.g. 10 km * 300 IQD = 3,000 IQD)
  const calculateDeliveryFee = (distanceKm: number): number => {
    const safeKm = Math.max(0.1, Number(distanceKm) || 2.5);
    const raw = Math.max(deliveryMinFee, safeKm * deliveryPricePerKm);
    // Round to nearest 250 IQD for practical cash transactions
    return Math.round(raw / 250) * 250;
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currentRestaurant = restaurants.find(r => r.id === cart[0]?.restaurantId);
  const currentRestaurantDistance = currentRestaurant
    ? calculateDistanceKm(userLocation, currentRestaurant.location, currentRestaurant.distanceKm || 2.5)
    : 2.5;
  const cartDeliveryFee = cart.length > 0
    ? calculateDeliveryFee(currentRestaurantDistance)
    : 0;
  const cartTotal = cartSubtotal + cartDeliveryFee;

  // Role switching
  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentUser(DEMO_USERS[role]);
    if (role === 'CUSTOMER') setCustomerTab('HOME');
    if (role === 'RESTAURANT') setRestaurantTab('DASHBOARD');
    if (role === 'DRIVER') setDriverTab('HOME');
    if (role === 'SUPER_ADMIN') setAdminTab('OVERVIEW');
  };

  // Customer Self-Registration: ONLY Customer role is allowed (automatic)
  const registerCustomer = (name: string, phone: string, password: string) => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();

    if (!cleanName || !cleanPhone || !cleanPass) {
      return { success: false, error: 'تکایە هەموو خانەکان بە دروستی پڕبکەرەوە.' };
    }

    const norm = normalizePhone(cleanPhone);
    const existing = accounts.find(a => normalizePhone(a.phone) === norm);
    if (existing) {
      return { success: false, error: 'ئەم ژمارە مۆبایلە پێشتر تۆمار کراوە. تکایە بچۆ ژوورەوە.' };
    }

    const newAcc: AppAccount = {
      id: `acc_cust_${Date.now()}`,
      name: cleanName,
      phone: cleanPhone,
      password: cleanPass,
      role: 'CUSTOMER', // STRICTLY AUTOMATIC: CUSTOMER NEVER CHOOSES A ROLE
      createdAt: new Date().toISOString()
    };

    setAccounts(prev => [newAcc, ...prev]);

    const userProfile: UserProfile = {
      id: newAcc.id,
      name: newAcc.name,
      phone: newAcc.phone,
      role: 'CUSTOMER',
      createdAt: newAcc.createdAt
    };

    setCurrentUser(userProfile);
    setCurrentRole('CUSTOMER');
    setCustomerTab('HOME');
    setIsAuthModalOpen(false);

    addNotification('بەخێربێیت! 🎉', `هەژمارەکەت بە سەرکەوتوویی دروستکرا. بەخێربێیت ${cleanName}`);

    return { success: true };
  };

  // Credential Login: authenticates phone + password and automatically activates their genuine role
  const loginWithCredentials = (phone: string, password: string) => {
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();

    if (!cleanPhone || !cleanPass) {
      return { success: false, error: 'تکایە ژمارەی مۆبایل و وشەی نهێنی بنووسە.' };
    }

    const norm = normalizePhone(cleanPhone);
    const account = accounts.find(a => normalizePhone(a.phone) === norm);

    if (!account) {
      return { success: false, error: 'هیچ هەژمارێک بەم ژمارە مۆبایلە نەدۆزرایەوە.' };
    }

    if (account.password && account.password !== cleanPass) {
      return { success: false, error: 'وشەی نهێنی هەڵەیە.' };
    }

    // Role is strictly derived from the account in the database/storage
    const userProfile: UserProfile = {
      id: account.id,
      name: account.name,
      phone: account.phone,
      role: account.role,
      restaurantId: account.restaurantId,
      driverId: account.driverId,
      createdAt: account.createdAt
    };

    setCurrentUser(userProfile);
    setCurrentRole(account.role);

    if (account.role === 'CUSTOMER') setCustomerTab('HOME');
    if (account.role === 'RESTAURANT') setRestaurantTab('DASHBOARD');
    if (account.role === 'DRIVER') setDriverTab('HOME');
    if (account.role === 'SUPER_ADMIN') setAdminTab('OVERVIEW');

    setIsAuthModalOpen(false);
    return { success: true, role: account.role };
  };

  // Super Admin: Create Restaurant Account
  const createRestaurantAccount = (data: {
    restaurantName: string;
    managerName: string;
    phone: string;
    password: string;
    category?: string;
    address?: string;
  }) => {
    const rName = data.restaurantName.trim();
    const mName = data.managerName.trim();
    const phone = data.phone.trim();
    const pass = data.password.trim();

    if (!rName || !mName || !phone || !pass) {
      return { success: false, error: 'تکایە سەرجەم خانەکان (ناوی ڕێستورانت، بەڕێوەبەر، مۆبایل، وشەی نهێنی) پڕبکەرەوە.' };
    }

    const norm = normalizePhone(phone);
    if (accounts.some(a => normalizePhone(a.phone) === norm)) {
      return { success: false, error: 'ئەم ژمارە مۆبایلە پێشتر بۆ ئەکاونتێک بەکارهاتووە.' };
    }

    const restId = 'rest-' + Date.now();
    const newRest: Restaurant = {
      id: restId,
      name: rName,
      category: data.category || 'پیتزا',
      address: data.address || 'سولەیمانی',
      description: `ڕێستورانتی ${rName} - باشترین تام و خزمەتگوزاری خێرا`,
      deliveryTime: '25-35 خولەک',
      rating: 5.0,
      ratingCount: 1,
      isOpen: true,
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      distanceKm: 2.5
    };

    const newAcc: AppAccount = {
      id: 'acc_rest_' + Date.now(),
      name: mName,
      managerName: mName,
      restaurantName: rName,
      restaurantId: restId,
      phone,
      password: pass,
      role: 'RESTAURANT', // STRICTLY AUTOMATIC
      createdAt: new Date().toISOString()
    };

    setRestaurants(prev => [newRest, ...prev]);
    setAccounts(prev => [newAcc, ...prev]);

    addNotification('ڕێستورانتی نوێ زیادکرا', `ڕێستورانتی ${rName} بە سەرکەوتوویی لەلایەن سەرپەرشتیارەوە زیادکرا.`);

    return { success: true };
  };

  // Super Admin: Create Driver Account
  const createDriverAccount = (data: {
    driverName: string;
    phone: string;
    password: string;
    vehicleType: string;
  }) => {
    const dName = data.driverName.trim();
    const phone = data.phone.trim();
    const pass = data.password.trim();
    const vType = data.vehicleType || 'ماتۆڕسکیل';

    if (!dName || !phone || !pass) {
      return { success: false, error: 'تکایە ناوی شۆفێر، ژمارەی مۆبایل و وشەی نهێنی بە دروستی بنووسە.' };
    }

    const norm = normalizePhone(phone);
    if (accounts.some(a => normalizePhone(a.phone) === norm)) {
      return { success: false, error: 'ئەم ژمارە مۆبایلە پێشتر تۆمار کراوە.' };
    }

    const drvId = 'drv-' + Date.now();
    const newDrv: DriverProfile = {
      id: drvId,
      name: dName,
      phone,
      vehicleType: vType,
      isOnline: true,
      isActive: true,
      totalDeliveries: 0,
      todayEarnings: 0,
      rating: 5.0
    };

    const newAcc: AppAccount = {
      id: 'acc_drv_' + Date.now(),
      name: dName,
      driverId: drvId,
      phone,
      password: pass,
      vehicleType: vType,
      role: 'DRIVER', // STRICTLY AUTOMATIC
      createdAt: new Date().toISOString()
    };

    setDrivers(prev => [newDrv, ...prev]);
    setAccounts(prev => [newAcc, ...prev]);

    addNotification('شۆفێری نوێ زیادکرا', `شۆفێر ${dName} (${vType}) بە سەرکەوتوویی لەلایەن سەرپەرشتیارەوە زیادکرا.`);

    return { success: true };
  };

  // Logout
  const logout = () => {
    setCurrentRole('CUSTOMER');
    setCurrentUser(DEMO_USERS.CUSTOMER);
    setCustomerTab('HOME');
  };

  // Cart operations
  const addToCart = (item: CartItem) => {
    setCart(prev => {
      // If adding from another restaurant, reset cart with new item or confirm
      if (prev.length > 0 && prev[0].restaurantId !== item.restaurantId) {
        return [item];
      }
      const existingIndex = prev.findIndex(i => i.menuItemId === item.menuItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(i => i.id === itemId ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0);
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Dispatch in-app notification
  const addNotification = (title: string, message: string, orderId?: string, targetRole?: UserRole) => {
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now(),
      title,
      message,
      orderId,
      targetRole,
      timestamp: Date.now(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Place Order
  const placeOrder = (details: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    addressDetails?: string;
    deliveryNotes?: string;
    customerLocation?: { lat: number; lng: number };
  }): string => {
    const rest = restaurants.find(r => r.id === cart[0]?.restaurantId) || restaurants[0];
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const newId = 'ord-' + orderNum;

    const custLoc = details.customerLocation || userLocation;
    const orderDistanceKm = calculateDistanceKm(custLoc, rest.location, rest.distanceKm || 2.5);
    const orderDeliveryFee = calculateDeliveryFee(orderDistanceKm);
    const orderTotal = cartSubtotal + orderDeliveryFee;

    const newOrder: Order = {
      id: newId,
      orderNumber: orderNum,
      customerId: currentUser.id,
      customerName: details.customerName,
      customerPhone: details.customerPhone,
      restaurantId: rest.id,
      restaurantName: rest.name,
      restaurantAddress: rest.address,
      items: cart.map(c => ({
        name: c.name,
        quantity: c.quantity,
        price: c.price,
        notes: c.notes,
        extras: c.selectedExtras
      })),
      subtotal: cartSubtotal,
      deliveryFee: orderDeliveryFee,
      total: orderTotal,
      customerAddress: details.customerAddress || userLocation?.address || 'سولەیمانی',
      addressDetails: details.addressDetails,
      deliveryNotes: details.deliveryNotes,
      customerLocation: custLoc,
      restaurantLocation: rest.location,
      distanceKm: orderDistanceKm,
      status: 'PLACED',
      paymentMethod: 'CASH_ON_DELIVERY',
      createdAt: Date.now()
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setActiveOrderId(newId);

    // Save to Firestore if available
    try {
      setDoc(doc(db, 'orders', newId), newOrder).catch(err => {
        console.warn('Firestore order write catch:', err);
      });
    } catch (e) {
      console.warn('Firestore err:', e);
    }

    // Add Notification targeted to Restaurant
    addNotification(
      'داواکاری نوێ گەیشت! 🍕',
      `داواکاری نوێ #${orderNum} بە سەرکەوتوویی لە ${rest.name} نێردرا.`,
      newId,
      'RESTAURANT'
    );

    // Play restaurant bell sound immediately
    if (currentRole === 'RESTAURANT') {
      soundService.playRestaurantOrderChime();
    }

    return newId;
  };

  // Assign nearest available driver to a READY order
  const assignDriverToReadyOrder = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    // If driver already accepted/locked, do nothing
    if (targetOrder.driverId) return;

    const rest = restaurants.find(r => r.id === targetOrder.restaurantId);
    const restLoc = targetOrder.restaurantLocation || rest?.location || { lat: 35.5669, lng: 45.4162 };

    // Filter candidate drivers:
    // 1. isOnline = true
    // 2. isActive !== false
    // 3. Has not already rejected this order
    // 4. Not currently delivering another order
    const availableCandidates = drivers.filter(d => {
      if (!d.isOnline || d.isActive === false) return false;
      if (targetOrder.rejectedDriverIds?.includes(d.id)) return false;
      const isBusy = orders.some(
        o => o.id !== orderId && o.driverId === d.id && o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
      );
      return !isBusy;
    });

    if (availableCandidates.length === 0) {
      addNotification(
        'شۆفێری بەردەست نییە',
        `هیچ شۆفێرێکی سەرهێڵ و بەردەست نەدۆزرایەوە بۆ داواکاری #${targetOrder.orderNumber}.`,
        orderId,
        'RESTAURANT'
      );
      return;
    }

    // Rank candidate drivers by proximity to the restaurant (closest first)
    const ranked = availableCandidates
      .map(d => {
        const dist = calculateDistanceKm(d.currentLocation, restLoc);
        return {
          driver: d,
          distanceKm: dist,
          estimatedMinutes: estimateDeliveryMinutes(dist)
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const topCandidate = ranked[0];
    const candidateQueue = ranked.map(r => r.driver.id);
    const now = Date.now();

    const updateFields = {
      currentCandidateDriverId: topCandidate.driver.id,
      assignmentStartTime: now,
      candidateQueue,
      distanceKm: topCandidate.distanceKm,
      estimatedMinutes: topCandidate.estimatedMinutes,
      updatedAt: now
    };

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updateFields } : o));

    try {
      updateDoc(doc(db, 'orders', orderId), updateFields).catch(err => {
        console.warn('Firestore candidate update catch:', err);
      });
    } catch (e) {
      console.warn('Firestore update err:', e);
    }

    // Audio chime for candidate driver if logged in
    if (currentRole === 'DRIVER' && currentDriver?.id === topCandidate.driver.id) {
      soundService.playDriverDispatchRingtone();
    }

    addNotification(
      'داواکاری نوێ بۆ گەیاندن! 🛵',
      `داواکاری نوێ لە ${targetOrder.restaurantName} گەیشت. ٣٠ چرکەت لەبەردەستە بۆ قبوڵکردن.`,
      orderId,
      'DRIVER'
    );
  };

  // 30-Second Countdown & Automatic Driver Reassignment Engine
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setOrders(prevOrders => {
        let hasChanges = false;

        const updatedOrders = prevOrders.map(order => {
          if (
            order.status === 'READY' &&
            !order.driverId &&
            order.currentCandidateDriverId &&
            order.assignmentStartTime
          ) {
            const elapsed = Math.floor((now - order.assignmentStartTime) / 1000);

            // If 30 seconds exceeded without driver response:
            if (elapsed >= 30) {
              hasChanges = true;
              const timedOutDriverId = order.currentCandidateDriverId;
              const rejected = [...(order.rejectedDriverIds || []), timedOutDriverId];

              const rest = restaurants.find(r => r.id === order.restaurantId);
              const restLoc = order.restaurantLocation || rest?.location || { lat: 35.5669, lng: 45.4162 };

              // Find next candidate from queue or available drivers
              const remainingDrivers = drivers
                .filter(d =>
                  d.isOnline &&
                  d.isActive !== false &&
                  !rejected.includes(d.id) &&
                  !prevOrders.some(
                    o => o.id !== order.id && o.driverId === d.id && o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
                  )
                )
                .map(d => ({
                  driver: d,
                  distanceKm: calculateDistanceKm(d.currentLocation, restLoc),
                  estimatedMinutes: estimateDeliveryMinutes(calculateDistanceKm(d.currentLocation, restLoc))
                }))
                .sort((a, b) => a.distanceKm - b.distanceKm);

              if (remainingDrivers.length > 0) {
                const nextTop = remainingDrivers[0];
                const newQueue = remainingDrivers.map(r => r.driver.id);

                const nextFields = {
                  currentCandidateDriverId: nextTop.driver.id,
                  assignmentStartTime: now,
                  candidateQueue: newQueue,
                  rejectedDriverIds: rejected,
                  distanceKm: nextTop.distanceKm,
                  estimatedMinutes: nextTop.estimatedMinutes,
                  updatedAt: now
                };

                try {
                  updateDoc(doc(db, 'orders', order.id), nextFields).catch(() => {});
                } catch (e) {}

                addNotification(
                  'داواکاری نوێ بۆ شۆفێری دواتر 🛵',
                  `داواکاری #${order.orderNumber} بەهۆی تەواوبوونی کاتی شۆفێری یەکەم، ڕەوانەی ${nextTop.driver.name} کرا.`,
                  order.id,
                  'DRIVER'
                );

                return {
                  ...order,
                  ...nextFields
                };
              } else {
                // No more candidate drivers available
                const finalFields = {
                  currentCandidateDriverId: null,
                  assignmentStartTime: null,
                  rejectedDriverIds: rejected,
                  updatedAt: now
                };

                try {
                  updateDoc(doc(db, 'orders', order.id), finalFields).catch(() => {});
                } catch (e) {}

                addNotification(
                  'شۆفێری بەردەست نییە',
                  `سەرجەم شۆفێرەکان سەرقاڵن یان کاتیان بەسەرچوو بۆ داواکاری #${order.orderNumber}.`,
                  order.id,
                  'RESTAURANT'
                );

                return {
                  ...order,
                  ...finalFields
                };
              }
            }
          }
          return order;
        });

        return hasChanges ? updatedOrders : prevOrders;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [drivers, restaurants]);

  // Update order status with notifications
  const updateOrderStatus = (orderId: string, status: OrderStatus, driverStep?: Order['driverStep']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status, driverStep: driverStep !== undefined ? driverStep : o.driverStep, updatedAt: Date.now() };
      }
      return o;
    }));

    try {
      const updateData: any = { status, updatedAt: Date.now() };
      if (driverStep !== undefined) updateData.driverStep = driverStep;
      updateDoc(doc(db, 'orders', orderId), updateData).catch(err => {
        console.warn('Firestore status update catch:', err);
      });
    } catch (e) {
      console.warn('Firestore update err:', e);
    }

    const order = orders.find(o => o.id === orderId);
    if (order) {
      let notifMsg = `باری داواکاری #${order.orderNumber} گۆڕدرا بۆ: ${status}`;
      if (status === 'ACCEPTED') notifMsg = `ڕێستورانت داواکاری #${order.orderNumber}ی قبوڵ کرد.`;
      if (status === 'PREPARING') notifMsg = `خواردنەکەت لە ${order.restaurantName} ئامادە دەکرێت.`;
      if (status === 'READY') notifMsg = `داواکاری #${order.orderNumber} ئامادەیە و سیستەم بەدوای شۆفێردا دەگەڕێت.`;
      if (status === 'DRIVER_ACCEPTED') notifMsg = `شۆفێر داواکاری #${order.orderNumber}ی قبوڵ کرد و بەرەو چێشتخانە بەڕێکەوت.`;
      if (status === 'DRIVER_PICKED_UP') notifMsg = `شۆفێر داواکاری #${order.orderNumber}ی لە چێشتخانە وەرگرت.`;
      if (status === 'ON_THE_WAY') notifMsg = `داواکاریەکەت لە ڕێگایە بەرەو تۆ! 🛵`;
      if (status === 'DELIVERED') notifMsg = `داواکاری #${order.orderNumber} گەیشت. نۆشی گیانتان بێت! 🎉`;

      addNotification(`داواکاری #${order.orderNumber}`, notifMsg, orderId);
    }

    // Trigger driver search when status becomes READY!
    if (status === 'READY') {
      setTimeout(() => {
        assignDriverToReadyOrder(orderId);
      }, 150);
    }
  };

  // Driver actions
  const toggleDriverOnline = (driverId: string) => {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, isOnline: !d.isOnline } : d));
  };

  // Driver rejects delivery proposal -> immediately reassign to next driver without waiting for 30s
  const rejectOrderAsDriver = (orderId: string, driverId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const now = Date.now();
    const rejected = [...(order.rejectedDriverIds || []), driverId];

    const rest = restaurants.find(r => r.id === order.restaurantId);
    const restLoc = order.restaurantLocation || rest?.location || { lat: 35.5669, lng: 45.4162 };

    const remainingDrivers = drivers
      .filter(d =>
        d.isOnline &&
        d.isActive !== false &&
        !rejected.includes(d.id) &&
        !orders.some(
          o => o.id !== orderId && o.driverId === d.id && o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
        )
      )
      .map(d => ({
        driver: d,
        distanceKm: calculateDistanceKm(d.currentLocation, restLoc),
        estimatedMinutes: estimateDeliveryMinutes(calculateDistanceKm(d.currentLocation, restLoc))
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    if (remainingDrivers.length > 0) {
      const nextTop = remainingDrivers[0];
      const newQueue = remainingDrivers.map(r => r.driver.id);

      const updateData = {
        currentCandidateDriverId: nextTop.driver.id,
        assignmentStartTime: now,
        candidateQueue: newQueue,
        rejectedDriverIds: rejected,
        distanceKm: nextTop.distanceKm,
        estimatedMinutes: nextTop.estimatedMinutes,
        updatedAt: now
      };

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updateData } : o));

      try {
        updateDoc(doc(db, 'orders', orderId), updateData).catch(() => {});
      } catch (e) {}

      addNotification(
        'داواکاری بۆ شۆفێری دواتر نێردرا 🛵',
        `داواکاری #${order.orderNumber} ڕەوانەی شۆفێر ${nextTop.driver.name} کرا.`,
        orderId,
        'DRIVER'
      );
    } else {
      const updateData = {
        currentCandidateDriverId: null,
        assignmentStartTime: null,
        rejectedDriverIds: rejected,
        updatedAt: now
      };

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updateData } : o));

      try {
        updateDoc(doc(db, 'orders', orderId), updateData).catch(() => {});
      } catch (e) {}

      addNotification(
        'شۆفێری بەردەست نەما',
        `داواکاری #${order.orderNumber} لەلایەن شۆفێرەوە ڕەتکرایەوە و شۆفێری بەردەست نەما.`,
        orderId,
        'RESTAURANT'
      );
    }
  };

  // Driver accepts delivery proposal with Atomic Pre-Check to prevent race conditions
  const acceptOrderAsDriver = (orderId: string, driverId: string): { success: boolean; error?: string } => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'داواکاری نەدۆزرایەوە.' };

    // ATOMIC PRE-CHECK: driverId must be null/empty
    if (order.driverId) {
      return {
        success: false,
        error: 'ئەم داواکارییە پێشتر لەلایەن شۆفێرێکی ترەوە وەرگیراوە و داخراوە!'
      };
    }

    const drv = drivers.find(d => d.id === driverId) || currentDriver;
    const now = Date.now();

    const acceptData = {
      driverId: drv.id,
      driverName: drv.name,
      driverPhone: drv.phone,
      status: 'DRIVER_ACCEPTED' as OrderStatus,
      driverStep: 'ACCEPTED' as const,
      currentCandidateDriverId: null,
      assignmentStartTime: null,
      updatedAt: now
    };

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...acceptData } : o));

    try {
      updateDoc(doc(db, 'orders', orderId), acceptData).catch(err => {
        console.warn('Firestore accept order catch:', err);
      });
    } catch (e) {
      console.warn('Firestore err:', e);
    }

    soundService.playSuccessChime();

    addNotification(
      'داواکاری قبوڵکرا! 🛵',
      `شۆفێر ${drv.name} داواکاری #${order.orderNumber}ی قبوڵ کرد و لە ئامادەباشیدایە.`,
      orderId
    );

    return { success: true };
  };

  const advanceDriverDeliveryStep = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (!order.driverStep || order.driverStep === 'ACCEPTED') {
      updateOrderStatus(orderId, 'PREPARING', 'HEADING_TO_RESTAURANT');
    } else if (order.driverStep === 'HEADING_TO_RESTAURANT') {
      updateOrderStatus(orderId, 'DRIVER_PICKED_UP', 'PICKED_UP');
    } else if (order.driverStep === 'PICKED_UP') {
      updateOrderStatus(orderId, 'ON_THE_WAY', 'HEADING_TO_CUSTOMER');
    } else if (order.driverStep === 'HEADING_TO_CUSTOMER') {
      updateOrderStatus(orderId, 'DELIVERED', 'DELIVERED');
      // update driver earnings
      setDrivers(prev => prev.map(d => {
        if (d.id === order.driverId) {
          return {
            ...d,
            todayEarnings: d.todayEarnings + order.deliveryFee,
            totalDeliveries: d.totalDeliveries + 1
          };
        }
        return d;
      }));
    }
  };

  const playTestSound = (type: 'restaurant' | 'driver' | 'success') => {
    if (type === 'restaurant') soundService.playRestaurantOrderChime();
    if (type === 'driver') soundService.playDriverDispatchRingtone();
    if (type === 'success') soundService.playSuccessChime();
  };

  const addDriver = (d: Omit<DriverProfile, 'id'>) => {
    const newDriver: DriverProfile = {
      ...d,
      id: 'drv-' + Date.now()
    };
    setDrivers(prev => [...prev, newDriver]);
  };

  const toggleDriverActive = (id: string) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d));
  };

  // Restaurant menu management
  const addRestaurant = (r: Omit<Restaurant, 'id'>) => {
    const newRest: Restaurant = {
      ...r,
      id: 'rest-' + Date.now()
    };
    setRestaurants(prev => [...prev, newRest]);
  };

  const updateRestaurant = (id: string, updates: Partial<Restaurant>) => {
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const toggleRestaurantStatus = (id: string) => {
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, isOpen: !r.isOpen } : r));
  };

  const deleteRestaurant = (id: string) => {
    setRestaurants(prev => prev.filter(r => r.id !== id));
  };

  const moveRestaurantOrder = (restaurantId: string, direction: 'UP' | 'DOWN') => {
    setRestaurants(prev => {
      const index = prev.findIndex(r => r.id === restaurantId);
      if (index === -1) return prev;
      if (direction === 'UP' && index === 0) return prev;
      if (direction === 'DOWN' && index === prev.length - 1) return prev;

      const targetIndex = direction === 'UP' ? index - 1 : index + 1;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const moveRestaurantToTop = (restaurantId: string) => {
    setRestaurants(prev => {
      const index = prev.findIndex(r => r.id === restaurantId);
      if (index <= 0) return prev;
      const target = prev[index];
      const remaining = prev.filter(r => r.id !== restaurantId);
      return [target, ...remaining];
    });
  };

  const toggleRestaurantSponsored = (restaurantId: string) => {
    setRestaurants(prev => {
      const target = prev.find(r => r.id === restaurantId);
      if (!target) return prev;
      const willBeSponsored = !target.isSponsored;

      const updated = prev.map(r => {
        if (r.id === restaurantId) {
          return {
            ...r,
            isSponsored: willBeSponsored,
            sponsoredBadge: willBeSponsored ? (r.sponsoredBadge || 'سپۆنسەرکراو ⭐') : undefined
          };
        }
        return r;
      });

      if (willBeSponsored) {
        const item = updated.find(r => r.id === restaurantId)!;
        const others = updated.filter(r => r.id !== restaurantId);
        return [item, ...others];
      }
      return updated;
    });
  };

  const setRestaurantRank = (restaurantId: string, newRank: number) => {
    setRestaurants(prev => {
      const index = prev.findIndex(r => r.id === restaurantId);
      if (index === -1) return prev;
      const targetIndex = Math.max(0, Math.min(prev.length - 1, newRank - 1));
      if (targetIndex === index) return prev;

      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, item);
      return copy;
    });
  };

  const setRestaurantsOrder = (orderedRestaurants: Restaurant[]) => {
    setRestaurants(orderedRestaurants);
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: 'menu-' + Date.now()
    };
    setMenuItems(prev => [...prev, newItem]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(m => m.id !== id));
  };

  // Restaurant Offers & Discounts (Full Freedom for Restaurants)
  const applyRestaurantOffer = (restaurantId: string, offer: { hasOffer: boolean; offerText: string; discountPercent?: number; offerBadge?: string }) => {
    setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, ...offer } : r));
    const rest = restaurants.find(r => r.id === restaurantId);
    if (offer.hasOffer && rest) {
      addNotification(
        'ئۆفەری نوێ ڕاگەیەندرا! 🔥',
        `چێشتخانەی ${rest.name} ئۆفەری نوێی بۆ کڕیاران دانا: ${offer.offerText}`,
        undefined,
        'CUSTOMER'
      );
    }
  };

  const applyMenuItemDiscount = (itemId: string, discount: { hasDiscount: boolean; price: number; originalPrice?: number; discountPercent?: number; discountBadge?: string }) => {
    setMenuItems(prev => prev.map(m => m.id === itemId ? { ...m, ...discount } : m));
  };

  const applyBulkCategoryDiscount = (restaurantId: string, category: string, discountPercent: number) => {
    setMenuItems(prev => prev.map(m => {
      if (m.restaurantId !== restaurantId) return m;
      if (category !== 'all' && m.category !== category) return m;

      const orig = m.originalPrice || m.price;
      const discFactor = (100 - discountPercent) / 100;
      const newPrice = Math.max(500, Math.round((orig * discFactor) / 250) * 250);
      return {
        ...m,
        originalPrice: orig,
        price: newPrice,
        hasDiscount: true,
        discountPercent,
        discountBadge: `${discountPercent}٪ داشکان 🔥`
      };
    }));

    const rest = restaurants.find(r => r.id === restaurantId);
    if (rest) {
      addNotification(
        'داشکاندنی بە کۆمەڵ جێبەجێکرا! 🏷️',
        `${discountPercent}٪ داشکان بۆ خواردنەکانی ${category === 'all' ? 'هەموو جۆرەکان' : category} لە چێشتخانەکەت چالاک کرا.`,
        undefined,
        'RESTAURANT'
      );
    }
  };

  const clearRestaurantDiscounts = (restaurantId: string) => {
    setMenuItems(prev => prev.map(m => {
      if (m.restaurantId !== restaurantId) return m;
      return {
        ...m,
        price: m.originalPrice || m.price,
        originalPrice: undefined,
        hasDiscount: false,
        discountPercent: undefined,
        discountBadge: undefined
      };
    }));
    setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, hasOffer: false, offerText: '', discountPercent: undefined } : r));

    addNotification(
      'داشکانەکان خاوێنکرانەوە',
      'سەرجەم داشکان و ئۆفەرە چالاکەکانی چێشتخانەکەت لابران و نرخەکان ئاسایی بوونەوە.',
      undefined,
      'RESTAURANT'
    );
  };

  // Delivery Zones
  const updateDeliveryZone = (id: string, updates: Partial<DeliveryZone>) => {
    setDeliveryZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  const addDeliveryZone = (zone: Omit<DeliveryZone, 'id'>) => {
    const newZone: DeliveryZone = {
      ...zone,
      id: 'zone-' + Date.now()
    };
    setDeliveryZones(prev => [...prev, newZone]);
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        switchRole,
        customerTab,
        setCustomerTab,
        restaurantTab,
        setRestaurantTab,
        driverTab,
        setDriverTab,
        adminTab,
        setAdminTab,
        restaurants,
        menuItems,
        selectedRestaurantId,
        setSelectedRestaurantId,
        addRestaurant,
        updateRestaurant,
        toggleRestaurantStatus,
        deleteRestaurant,
        moveRestaurantOrder,
        moveRestaurantToTop,
        toggleRestaurantSponsored,
        setRestaurantRank,
        setRestaurantsOrder,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        applyRestaurantOffer,
        applyMenuItemDiscount,
        applyBulkCategoryDiscount,
        clearRestaurantDiscounts,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartDeliveryFee,
        cartTotal,
        orders,
        activeOrderId,
        setActiveOrderId,
        placeOrder,
        updateOrderStatus,
        drivers,
        currentDriver,
        toggleDriverOnline,
        acceptOrderAsDriver,
        rejectOrderAsDriver,
        assignDriverToReadyOrder,
        advanceDriverDeliveryStep,
        addDriver,
        toggleDriverActive,
        playTestSound,
        deliveryZones,
        deliveryPricePerKm,
        deliveryMinFee,
        setDeliveryPricePerKm,
        setDeliveryMinFee,
        getRestaurantDistance,
        calculateDeliveryFee,
        updateDeliveryZone,
        addDeliveryZone,
        userLocation,
        setUserLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        notifications,
        markNotificationAsRead,
        unreadNotificationsCount,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isCartOpen,
        setIsCartOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isRoleSwitcherOpen,
        setIsRoleSwitcherOpen,
        accounts,
        registerCustomer,
        loginWithCredentials,
        createRestaurantAccount,
        createDriverAccount,
        logout,
        ads,
        addAd,
        updateAd,
        deleteAd,
        toggleAdActive,
        activePopupAd,
        dismissPopupAd,
        showAdPreview
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
