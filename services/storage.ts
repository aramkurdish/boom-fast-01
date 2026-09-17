
import { Product, Category, OrderLog } from '../types';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '../constants';

const PRODUCTS_KEY = 'fastfood_products_v1';
const CATEGORIES_KEY = 'fastfood_categories_v1';
const SOUND_KEY = 'fastfood_sound_enabled_v1';
const ORDERS_KEY = 'fastfood_orders_v1';
const IMGBB_KEY = 'fastfood_imgbb_key_v1';
const LOGO_KEY = 'fastfood_logo_v1';

export const getStoredProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (!stored) return DEFAULT_PRODUCTS;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_PRODUCTS;
  }
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getStoredCategories = (): Category[] => {
  const stored = localStorage.getItem(CATEGORIES_KEY);
  if (!stored) return DEFAULT_CATEGORIES;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategories = (categories: Category[]) => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const getSoundPreference = (): boolean => {
  const stored = localStorage.getItem(SOUND_KEY);
  return stored === null ? true : stored === 'true';
};

export const saveSoundPreference = (enabled: boolean) => {
  localStorage.setItem(SOUND_KEY, enabled.toString());
};

export const getOrderLogs = (): OrderLog[] => {
  const stored = localStorage.getItem(ORDERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addOrderLog = (log: OrderLog) => {
  const logs = getOrderLogs();
  const updated = [log, ...logs].slice(0, 50); // Keep last 50
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
};

export const getStoredImgBBKey = (): string => {
  return localStorage.getItem(IMGBB_KEY) || '';
};

export const saveImgBBKey = (key: string) => {
  localStorage.setItem(IMGBB_KEY, key);
};

export const getStoredLogo = (): string => {
  return localStorage.getItem(LOGO_KEY) || '';
};

export const saveLogo = (url: string) => {
  localStorage.setItem(LOGO_KEY, url);
};
