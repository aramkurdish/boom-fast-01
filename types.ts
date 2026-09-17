export type UserRole = 'CUSTOMER' | 'RESTAURANT' | 'DRIVER' | 'SUPER_ADMIN';

export interface AppAccount {
  id: string;
  name: string;
  phone: string;
  password?: string;
  role: UserRole;
  restaurantName?: string;
  restaurantId?: string;
  managerName?: string;
  vehicleType?: string;
  driverId?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  restaurantId?: string;
  driverId?: string;
  isBlocked?: boolean;
  createdAt: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  vehicleType: string; // 'ماتۆڕسکیل' | 'ئۆتۆمبێل' | 'پایسکل'
  isOnline: boolean;
  isActive: boolean;
  totalDeliveries: number;
  todayEarnings: number;
  rating: number;
  currentLocation?: { lat: number; lng: number };
}

export interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  imageUrl?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  logo: string;
  coverImage: string;
  rating: number;
  ratingCount: number;
  deliveryTime: string;
  category: string;
  description: string;
  isOpen: boolean;
  address: string;
  distanceKm?: number;
  deliveryFee?: number;
  isFeatured?: boolean;
  isPopular?: boolean;
  hasOffer?: boolean;
  offerText?: string;
  discountPercent?: number;
  offerBadge?: string;
  isSponsored?: boolean;
  sponsoredBadge?: string;
  priorityOrder?: number;
  subscriptionPlan?: string;
  ownerId?: string;
  location?: { lat: number; lng: number };
}

export interface MenuItemOption {
  name: string;
  choices: { title: string; extraPrice: number }[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  hasDiscount?: boolean;
  discountPercent?: number;
  discountBadge?: string;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  options?: MenuItemOption[];
}

export interface CartItem {
  id: string;
  menuItemId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  imageUrl: string;
  selectedExtras?: string[];
  notes?: string;
}

export type OrderStatus =
  | 'PLACED'           // 1. داواکاری نێردرا
  | 'ACCEPTED'         // 2. ڕێستورانت قبوڵی کرد
  | 'PREPARING'        // 3. ئامادە دەکرێت
  | 'READY'            // 4. ئامادەیە
  | 'DRIVER_ACCEPTED'  // 4.5. شۆفێر قبوڵی کرد
  | 'DRIVER_PICKED_UP' // 5. Driver داواکارییەکەی وەرگرت
  | 'ON_THE_WAY'       // 6. لە ڕێگایە
  | 'DELIVERED'        // 7. گەیشت
  | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    notes?: string;
    extras?: string[];
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerAddress: string;
  addressDetails?: string;
  deliveryNotes?: string;
  customerLocation?: { lat: number; lng: number };
  restaurantLocation?: { lat: number; lng: number };
  status: OrderStatus;
  paymentMethod: 'CASH_ON_DELIVERY';
  driverStep?: 'ACCEPTED' | 'HEADING_TO_RESTAURANT' | 'PICKED_UP' | 'HEADING_TO_CUSTOMER' | 'DELIVERED';
  createdAt: number;
  updatedAt?: number;
  // Dynamic driver assignment & notification fields
  currentCandidateDriverId?: string | null;
  assignmentStartTime?: number | null;
  candidateQueue?: string[];
  rejectedDriverIds?: string[];
  distanceKm?: number;
  estimatedMinutes?: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  minDistance: number;
  maxDistance: number;
  fee: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  orderId?: string;
  targetRole?: UserRole | 'ALL';
  targetUserId?: string;
  timestamp: number;
  isRead: boolean;
}

export type CustomerTab = 'HOME' | 'SEARCH' | 'ORDERS' | 'CART' | 'ACCOUNT';
export type RestaurantTab = 'DASHBOARD' | 'ORDERS' | 'MENU' | 'ACCOUNT';
export type DriverTab = 'HOME' | 'ORDERS' | 'DELIVERIES' | 'EARNINGS' | 'ACCOUNT';
export type AdminTab = 'OVERVIEW' | 'RESTAURANTS' | 'DRIVERS' | 'CUSTOMERS' | 'ORDERS' | 'ZONES' | 'ADS';

export interface Advertisement {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl?: string;
  actionText?: string;
  actionUrl?: string;
  actionType: 'LINK' | 'RESTAURANT' | 'PHONE' | 'NONE';
  targetRestaurantId?: string;
  phoneNumber?: string;
  isActive: boolean;
  showOnEntry: boolean;
  showBanner: boolean;
  badgeText?: string;
  createdAt: string;
}

// Legacy types for backward compatibility
export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
  isPopular?: boolean;
  options?: any[];
  [key: string]: any;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  [key: string]: any;
}

export type AdminSubView = 'PRODUCTS' | 'ORDERS' | 'CATEGORIES' | 'PROMOS' | 'SETTINGS';

export interface OrderLog {
  id: string;
  orderNumber: number;
  [key: string]: any;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  isActive: boolean;
}

export type ViewState = 'MENU' | 'CART' | 'ADMIN';

