import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, Category, AdminSubView, OrderLog, PromoCode } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";
import { ADMIN_PASSWORD } from '../constants';

declare var Swal: any;
declare var QRCode: any;

const getNumericOrderId = (log: OrderLog): string => {
  if (log.orderNumber) {
    return String(log.orderNumber);
  }
  let hash = 0;
  for (let i = 0; i < log.id.length; i++) {
    hash = log.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const numericId = Math.abs(hash) % 9000 + 1000;
  return String(numericId);
};

interface AdminPanelProps {
  products: Product[];
  categories: Category[];
  isSoundEnabled: boolean;
  telegramChatId: string;
  discordWebhookUrl: string;
  businessLogo: string;
  orderLogs: OrderLog[];
  isLocalAdmin: boolean;
  onAdminAuthChange: (authenticated: boolean) => void;
  isClosed: boolean;
  adminPassword?: string;
  mainBanner?: string;
  shopPhone?: string;
  shopAddress?: string;
  createdBy?: string;
  promoCodes?: PromoCode[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products, 
  categories, 
  telegramChatId,
  discordWebhookUrl,
  businessLogo,
  orderLogs,
  isLocalAdmin,
  onAdminAuthChange,
  isClosed,
  adminPassword,
  mainBanner,
  shopPhone = '',
  shopAddress = '',
  createdBy = '',
  promoCodes = []
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState<AdminSubView>('DASHBOARD');
  const [isUploading, setIsUploading] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Table Management State
  const [tableNumber, setTableNumber] = useState('');
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<any>(null);

  const [imgbbKeys, setImgbbKeys] = useState<string[]>(['', '', '', '', '']);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const [productForm, setProductForm] = useState<{id?: string, name: string, price: string, priceM: string, priceL: string, img: string, category: string, order: string, isNew: boolean}>({ 
    name: '', price: '', priceM: '', priceL: '', img: '', category: categories[0]?.id || '', order: '0', isNew: false 
  });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [categoryForm, setCategoryForm] = useState({ name: '', imageUrl: '', order: '' });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Selected order for the custom POS printing modal
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<OrderLog | null>(null);
  const [customDeliveryFee, setCustomDeliveryFee] = useState<string>('0');

  // Driver Interface
  interface Driver {
    id: string;
    name: string;
    phone?: string;
    vehicleNumber?: string;
  }

  // Driver Management State
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [newDriverName, setNewDriverName] = useState<string>('');
  const [newDriverPhone, setNewDriverPhone] = useState<string>('');
  const [newDriverVehicle, setNewDriverVehicle] = useState<string>('');
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);

  // Edit Order State
  const [editingOrder, setEditingOrder] = useState<OrderLog | null>(null);
  const [editOrderItems, setEditOrderItems] = useState<string[]>([]);
  const [editOrderTotal, setEditOrderTotal] = useState<number>(0);
  const [editCustomerName, setEditCustomerName] = useState<string>('');
  const [editCustomerPhone, setEditCustomerPhone] = useState<string>('');
  const [editManualAddress, setEditManualAddress] = useState<string>('');
  const [editTableNumber, setEditTableNumber] = useState<string>('');
  const [editCustomerNote, setEditCustomerNote] = useState<string>('');
  const [editDiscountAmount, setEditDiscountAmount] = useState<number>(0);
  const [editPromoCode, setEditPromoCode] = useState<string>('');
  const [editDeliveryDriver, setEditDeliveryDriver] = useState<string>('');
  const [editDeliveryFee, setEditDeliveryFee] = useState<number>(0);

  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');
  const [selectedSizeToAdd, setSelectedSizeToAdd] = useState<'S' | 'M' | 'L'>('S');
  const [selectedQtyToAdd, setSelectedQtyToAdd] = useState<number>(1);

  const selectedProductCategory = useMemo(() => {
    const prod = products.find(p => p.id === selectedProductToAdd);
    if (!prod) return null;
    return categories.find(c => c.id === prod.category);
  }, [selectedProductToAdd, products, categories]);

  const isSelectedProductPizza = useMemo(() => {
    return !!(selectedProductCategory?.name.toLowerCase().includes('pizza') || selectedProductCategory?.name.includes('پیتزا'));
  }, [selectedProductCategory]);

  // Promo Code State
  const [promoForm, setPromoForm] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    minOrderAmount: '',
    isActive: true
  });

  useEffect(() => {
    if (!productForm.category && categories.length > 0) {
      setProductForm(prev => ({ ...prev, category: categories[0].id }));
    }
  }, [categories, productForm.category]);

  useEffect(() => {
    if (isLocalAdmin) {
      const unsub = onSnapshot(doc(db, "settings", "api_keys"), (d) => {
        if (d.exists()) {
          const data = d.data();
          const keys = data.keys || ['', '', '', '', ''];
          const index = typeof data.activeIndex === 'number' ? data.activeIndex : 0;
          setImgbbKeys(keys);
          setActiveIndex(index);
        }
      });
      return () => unsub();
    }
  }, [isLocalAdmin]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "drivers"), (snap) => {
      const dList: Driver[] = [];
      snap.forEach(d => {
        dList.push({ id: d.id, ...d.data() } as Driver);
      });
      setDrivers(dList);
    });
    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    return { 
      totalProducts: products.length, 
      totalOrders: orderLogs.length, 
      totalRevenue: orderLogs.reduce((acc, curr) => acc + curr.total, 0)
    };
  }, [products, orderLogs]);

  const driverStats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const deliveryOrders = orderLogs.filter(o => o.orderType === 'DELIVERY');

    const totalDeliveryFee = deliveryOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const todayDeliveryFee = deliveryOrders
      .filter(o => o.timestamp >= todayStart)
      .reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const monthDeliveryFee = deliveryOrders
      .filter(o => o.timestamp >= monthStart)
      .reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

    const perDriverStats = drivers.map(driver => {
      const driverOrders = deliveryOrders.filter(o => o.deliveryDriver === driver.name);
      const totalEarned = driverOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
      
      const todayEarned = driverOrders
        .filter(o => o.timestamp >= todayStart)
        .reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

      const monthEarned = driverOrders
        .filter(o => o.timestamp >= monthStart)
        .reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

      const totalDelivered = driverOrders.length;
      const todayDelivered = driverOrders.filter(o => o.timestamp >= todayStart).length;
      const monthDelivered = driverOrders.filter(o => o.timestamp >= monthStart).length;

      return {
        ...driver,
        totalEarned,
        todayEarned,
        monthEarned,
        totalDelivered,
        todayDelivered,
        monthDelivered,
        orders: driverOrders
      };
    });

    return {
      totalDeliveryFee,
      todayDeliveryFee,
      monthDeliveryFee,
      perDriverStats,
      deliveryOrdersCount: deliveryOrders.length
    };
  }, [orderLogs, drivers]);

  const isPizzaCategory = useMemo(() => {
    const cat = categories.find(c => c.id === productForm.category);
    return cat?.name.toLowerCase().includes('pizza') || cat?.name.includes('پیتزا');
  }, [categories, productForm.category]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePassword = adminPassword || ADMIN_PASSWORD;
    if (passwordInput === effectivePassword) {
      onAdminAuthChange(true);
    } else {
      Swal.fire({ icon: 'error', title: 'هەڵە', text: 'وشەی نهێنی هەڵەیە!', confirmButtonText: 'باشە' });
    }
  };

  const uploadToImgBB = async (file: File): Promise<string | null> => {
    const activeKey = imgbbKeys[activeIndex];
    if (!activeKey || activeKey.trim() === '') {
      Swal.fire({ icon: 'error', title: 'کلیلی API نییە', text: 'تکایە سەرەتا کلیلی ImgBB کارا لە بەشی ڕێکخستن بنووسە.' });
      return null;
    }
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${activeKey}`, { method: 'POST', body: formData });
      const result = await response.json();
      if (result.success) return result.data.display_url || result.data.url;
      return null;
    } catch (error) { return null; }
  };

  const saveApiKeysToFirestore = async () => {
    try {
      setIsLoading(true);
      await setDoc(doc(db, "settings", "api_keys"), { keys: imgbbKeys, activeIndex: activeIndex }, { merge: true });
      Swal.fire({ icon: 'success', title: 'سەرکەوتوو', timer: 1500, showConfirmButton: false });
    } finally { setIsLoading(false); }
  };

  const updateGeneralSetting = async (field: string, value: any) => {
    await setDoc(doc(db, "settings", "general"), { [field]: value }, { merge: true });
  };

  const updateThemeSetting = async (field: string, value: any) => {
    await setDoc(doc(db, "settings", "theme"), { [field]: value }, { merge: true });
  };

  const updateBannerSetting = async (value: string) => {
    await setDoc(doc(db, "settings", "banner"), { url: value }, { merge: true });
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if ((await Swal.fire({ title: 'دڵنیایت؟', text: `سڕینەوەی (${name})`, icon: 'warning', showCancelButton: true, confirmButtonText: 'سڕینەوە', cancelButtonText: 'پاشگەزبوونەوە' })).isConfirmed) {
      await deleteDoc(doc(db, "menu", id));
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim()) {
      Swal.fire({ icon: 'error', title: 'هەڵە', text: 'تکایە ناوی سایق بنووسە' });
      return;
    }
    setIsLoading(true);
    try {
      await addDoc(collection(db, "drivers"), {
        name: newDriverName.trim(),
        phone: newDriverPhone.trim() || null,
        vehicleNumber: newDriverVehicle.trim() || null
      });
      setNewDriverName('');
      setNewDriverPhone('');
      setNewDriverVehicle('');
      Swal.fire({
        icon: 'success',
        title: 'سایق زیادکرا',
        text: 'سایقەکە بە سەرکەوتوویی زیادکرا!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'هەڵە', text: 'نەتوانرا سایقەکە پاشەکەوت بکرێت.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDriver = async (id: string, name: string) => {
    const confirm = await Swal.fire({
      title: 'دڵنیای؟',
      text: `ئەم سایقە (${name}) بە تەواوی دەسڕێتەوە!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'بەڵێ، بیسڕەوە',
      cancelButtonText: 'پەشیمانبوونەوە'
    });
    if (confirm.isConfirmed) {
      setIsLoading(true);
      try {
        await deleteDoc(doc(db, "drivers", id));
        Swal.fire({
          icon: 'success',
          title: 'سڕایەوە',
          text: 'سایقەکە بە سەرکەوتوویی سڕایەوە.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'هەڵە', text: 'کێشەیەک ڕوویدا لە کاتی سڕینەوە.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if ((await Swal.fire({ title: 'دڵنیایت؟', text: `سڕینەوەی بەشی (${name})`, icon: 'warning', showCancelButton: true, confirmButtonText: 'سڕینەوە', cancelButtonText: 'پاشگەزبوونەوە' })).isConfirmed) {
      await deleteDoc(doc(db, "categories", id));
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if ((await Swal.fire({ title: 'سڕینەوەی داواکاری', text: "ئایا دڵنیایت لە سڕینەوەی ئەم داواکارییە؟", icon: 'warning', showCancelButton: true, confirmButtonText: 'بەڵێ، بسڕەوە', cancelButtonText: 'پاشگەزبوونەوە' })).isConfirmed) {
      try {
        await deleteDoc(doc(db, "orders", id));
        Swal.fire({ icon: 'success', title: 'سڕایەوە', timer: 1000, showConfirmButton: false });
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'هەڵە', text: 'سڕینەوە سەرکەوتوو نەبوو' });
      }
    }
  };

  const handleDeleteAllOrders = async () => {
    if (orderLogs.length === 0) return;
    
    const result = await Swal.fire({
      title: 'سڕینەوەی هەموو داواکارییەکان؟',
      text: `ئایا دڵنیایت لە سڕینەوەی هەموو (${orderLogs.length}) داواکارییەکە؟ ئەم کردارە ناگەڕێتەوە!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'بەڵێ، هەمووی بسڕەوە',
      cancelButtonText: 'پاشگەزبوونەوە'
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        const deletePromises = orderLogs.map(log => deleteDoc(doc(db, "orders", log.id)));
        await Promise.all(deletePromises);
        Swal.fire({ icon: 'success', title: 'هەمووی سڕایەوە', timer: 1500, showConfirmButton: false });
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'هەڵە', text: 'سڕینەوەی گشتی سەرکەوتوو نەبوو' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleIframePrint = (log: OrderLog) => {
    const deliveryFeeNum = Number(customDeliveryFee) || 0;
    const iframeId = 'pos-print-iframe';
    let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
    if (iframe) {
      document.body.removeChild(iframe);
    }
    iframe = document.createElement('iframe') as HTMLIFrameElement;
    iframe.id = iframeId;
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const itemsHtml = (log.items || []).map(item => {
      const parts = (typeof item === 'string' ? item : String(item || '')).split(' - ');
      const name = parts[0];
      const price = parts[1] || '';
      return `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px; font-size: 14px; font-weight: normal; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
          <span style="text-align: right; font-weight: normal;">${name}</span>
          ${price ? `<span style="text-align: left; font-weight: normal; white-space: nowrap;">${price}</span>` : ''}
        </div>
      `;
    }).join('');
    
    const isDelivery = log.orderType === 'DELIVERY';
    const isDineIn = log.orderType === 'DINE_IN';
    
    let orderTypeLabel = 'داواکاری ئاسایی';
    if (isDelivery) {
      orderTypeLabel = '🛵 گەیاندن (DELIVERY)';
    } else if (isDineIn) {
      orderTypeLabel = `🍽️ ناودوکان - مێزی ${log.tableNumber || 'دیاری نەکراو'}`;
    }

    const html = `
      <html dir="rtl">
        <head>
          <title>پسوولەی داواکاری #${getNumericOrderId(log)}</title>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap');
            @page {
              margin: 0;
              size: auto;
            }
            * {
              box-sizing: border-box;
            }
            body { 
              font-family: 'Noto Sans Arabic', 'Inter', sans-serif; 
              padding: 10px; 
              color: #000;
              background-color: #fff;
              max-width: 80mm;
              margin: 0 auto;
              font-size: 12px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px dashed #000; 
              padding-bottom: 12px; 
              margin-bottom: 12px; 
            }
            .logo { 
              max-width: 70px; 
              max-height: 70px; 
              object-fit: contain; 
              margin-bottom: 6px; 
              filter: grayscale(100%);
            }
            .title { 
              font-size: 22px; 
              font-weight: bold; 
              margin: 0 0 4px 0; 
              letter-spacing: -0.5px;
            }
            .badge-order-type {
              border: 1.5px solid #000;
              padding: 6px;
              font-size: 14px;
              font-weight: bold;
              text-align: center;
              margin: 10px 0;
              background: #fff;
              text-transform: uppercase;
            }
            .order-info { 
              font-size: 12px; 
              margin-bottom: 12px; 
              border-bottom: 1px dashed #000; 
              padding-bottom: 8px; 
            }
            .order-info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
              font-weight: normal;
            }
            .items { 
              margin-bottom: 12px; 
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              font-size: 13px;
              font-weight: normal;
              margin-top: 4px;
            }
            .grand-total {
              border-top: 1.5px dashed #000;
              border-bottom: 1.5px dashed #000;
              padding: 8px 0;
              font-size: 18px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              margin-top: 8px;
              margin-bottom: 12px;
            }
            .customer { 
              margin-top: 15px; 
              font-size: 12px; 
              border: 1px dashed #000; 
              padding: 10px; 
              border-radius: 0px; 
            }
            .customer-title {
              font-weight: bold; 
              margin-bottom: 6px; 
              border-bottom: 1px dashed #000;
              padding-bottom: 4px;
              font-size: 13px;
            }
            .footer { 
              text-align: center; 
              margin-top: 25px; 
              font-size: 11px; 
              font-weight: normal;
              border-top: 1px dashed #000;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">BOOM'S PIZZA 🍕</h1>
            <p style="font-size: 11px; margin: 2px 0; font-weight: normal;">پیتزای ڕاستەقینە لێرەیە</p>
          </div>
          <div class="badge-order-type">
            ${orderTypeLabel}
          </div>
          <div class="order-info">
            <div class="order-info-row">
              <span>ژمارەی داواکاری:</span>
              <span style="font-size: 14px; font-weight: bold;">#${getNumericOrderId(log)}</span>
            </div>
            <div class="order-info-row">
              <span>بەروار و کات:</span>
              <span>${new Date(log.timestamp).toLocaleString('ku-IQ')}</span>
            </div>
          </div>
          <div class="items">
            <div style="font-weight: bold; font-size: 11px; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span>ناوی خواردن و قەبارە</span>
              <span>نرخ</span>
            </div>
            ${itemsHtml}
          </div>
          ${(log.discountAmount || deliveryFeeNum > 0) ? `
          <div class="total-row">
            <span>کۆی خواردنەکان:</span>
            <span>${(log.total + (log.discountAmount || 0)).toLocaleString()} IQD</span>
          </div>
          ` : ''}
          ${log.discountAmount ? `
          <div class="total-row" style="color: #000;">
            <span>داشکاندن (${log.promoCode}):</span>
            <span>-${log.discountAmount.toLocaleString()} IQD</span>
          </div>
          ` : ''}
          ${deliveryFeeNum > 0 ? `
          <div class="total-row">
            <span>نرخی گەیاندن:</span>
            <span>+${deliveryFeeNum.toLocaleString()} IQD</span>
          </div>
          ` : ''}
          <div class="grand-total">
            <span>کۆی گشتی:</span>
            <span>${(log.total + deliveryFeeNum).toLocaleString()} IQD</span>
          </div>
          ${(log.customerName || log.customerPhone || log.manualAddress || log.customerNote) ? `
          <div class="customer">
            <div class="customer-title">👤 زانیاری کڕیار</div>
            ${log.customerName ? `<div style="margin-bottom: 3px; font-weight: normal;">ناو: ${log.customerName}</div>` : ''}
            ${log.customerPhone ? `<div style="margin-bottom: 3px; font-weight: normal;">مۆبایل: ${log.customerPhone}</div>` : ''}
            ${log.manualAddress ? `<div style="margin-bottom: 3px; font-weight: normal;">ناونیشان: ${log.manualAddress}</div>` : ''}
            ${log.customerNote ? `<div style="margin-top: 5px; font-style: italic; border-top: 1px dotted #000; padding-top: 3px;">تێبینی کڕیار: ${log.customerNote}</div>` : ''}
          </div>
          ` : ''}
          <div class="footer">
            سوپاس بۆ کڕینەکەتان! دیسان چاوەڕوانتانین.<br>
            <span style="font-size: 9px; font-weight: normal; font-family: monospace; display: block; margin-top: 4px;">Powered by Boom Fast App</span>
          </div>
        </body>
      </html>
    `;

    const docObj = iframe.contentWindow?.document || iframe.contentDocument;
    if (docObj) {
      docObj.open();
      docObj.write(html);
      docObj.close();
      
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 500);
    }
  };

  const handleNewWindowPrint = (log: OrderLog) => {
    const deliveryFeeNum = Number(customDeliveryFee) || 0;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Swal.fire({
        icon: 'warning',
        title: 'ڕێگری لە پەڕەی نوێ کرا ⚠️',
        text: 'تکایە لە ڕێکخستنی براوسەرەکەتدا ڕێگە بدە بە Pop-up بۆ ئەم سایتە، یان ڕێگەی تری پرێنت لە خوارەوە بەکاربێنە.',
        confirmButtonText: 'باشە',
        confirmButtonColor: '#ea580c'
      });
      return;
    }

    const itemsHtml = (log.items || []).map(item => {
      const parts = (typeof item === 'string' ? item : String(item || '')).split(' - ');
      const name = parts[0];
      const price = parts[1] || '';
      return `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px; font-size: 14px; font-weight: normal; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
          <span style="text-align: right; font-weight: normal;">${name}</span>
          ${price ? `<span style="text-align: left; font-weight: normal; white-space: nowrap;">${price}</span>` : ''}
        </div>
      `;
    }).join('');
    
    const isDelivery = log.orderType === 'DELIVERY';
    const isDineIn = log.orderType === 'DINE_IN';
    
    let orderTypeLabel = 'داواکاری ئاسایی';
    if (isDelivery) {
      orderTypeLabel = '🛵 گەیاندن (DELIVERY)';
    } else if (isDineIn) {
      orderTypeLabel = `🍽️ ناودوکان - مێزی ${log.tableNumber || 'دیاری نەکراو'}`;
    }

    const html = `
      <html dir="rtl">
        <head>
          <title>پسوولەی داواکاری #${getNumericOrderId(log)}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap');
            @page {
              margin: 0;
              size: auto;
            }
            * {
              box-sizing: border-box;
            }
            body { 
              font-family: 'Noto Sans Arabic', sans-serif; 
              padding: 15px; 
              color: #000;
              background-color: #fff;
              max-width: 80mm;
              margin: 0 auto;
              font-size: 13px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px dashed #000; 
              padding-bottom: 12px; 
              margin-bottom: 12px; 
            }
            .logo { 
              max-width: 70px; 
              max-height: 70px; 
              object-fit: contain; 
              margin-bottom: 6px; 
              filter: grayscale(100%);
            }
            .title { 
              font-size: 22px; 
              font-weight: bold; 
              margin: 0 0 4px 0; 
              letter-spacing: -0.5px;
            }
            .badge-order-type {
              border: 1.5px solid #000;
              padding: 6px;
              font-size: 14px;
              font-weight: bold;
              text-align: center;
              margin: 10px 0;
              background: #fff;
              text-transform: uppercase;
            }
            .order-info { 
              font-size: 12px; 
              margin-bottom: 12px; 
              border-bottom: 1px dashed #000; 
              padding-bottom: 8px; 
            }
            .order-info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
              font-weight: normal;
            }
            .items { 
              margin-bottom: 12px; 
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              font-size: 13px;
              font-weight: normal;
              margin-top: 4px;
            }
            .grand-total {
              border-top: 1.5px dashed #000;
              border-bottom: 1.5px dashed #000;
              padding: 8px 0;
              font-size: 18px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              margin-top: 8px;
              margin-bottom: 12px;
            }
            .customer { 
              margin-top: 15px; 
              font-size: 12px; 
              border: 1px dashed #000; 
              padding: 10px; 
              border-radius: 0px; 
            }
            .customer-title {
              font-weight: bold; 
              margin-bottom: 6px; 
              border-bottom: 1px dashed #000;
              padding-bottom: 4px;
              font-size: 13px;
            }
            .footer { 
              text-align: center; 
              margin-top: 25px; 
              font-size: 11px; 
              font-weight: normal;
              border-top: 1px dashed #000;
              padding-top: 10px;
            }
            .no-print {
              display: block;
              text-align: center;
              background: #ea580c;
              color: white;
              padding: 12px;
              margin-bottom: 20px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              cursor: pointer;
              border: none;
              width: 100%;
              font-family: inherit;
              font-size: 14px;
            }
            @media print {
              .no-print {
                display: none !important;
              }
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <button class="no-print" onclick="window.print()">🖨️ دەستپێکردنی چاپکردن (Print)</button>
          
          <div class="header">
            <h1 class="title">BOOM'S PIZZA 🍕</h1>
            <p style="font-size: 11px; margin: 2px 0; font-weight: normal;">پیتزای ڕاستەقینە لێرەیە</p>
          </div>
          <div class="badge-order-type">
            ${orderTypeLabel}
          </div>
          <div class="order-info">
            <div class="order-info-row">
              <span>ژمارەی داواکاری:</span>
              <span style="font-size: 14px; font-weight: bold;">#${getNumericOrderId(log)}</span>
            </div>
            <div class="order-info-row">
              <span>بەروار و کات:</span>
              <span>${new Date(log.timestamp).toLocaleString('ku-IQ')}</span>
            </div>
          </div>
          <div class="items">
            <div style="font-weight: bold; font-size: 11px; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span>ناوی خواردن و قەبارە</span>
              <span>نرخ</span>
            </div>
            ${itemsHtml}
          </div>
          ${(log.discountAmount || deliveryFeeNum > 0) ? `
          <div class="total-row">
            <span>کۆی خواردنەکان:</span>
            <span>${(log.total + (log.discountAmount || 0)).toLocaleString()} IQD</span>
          </div>
          ` : ''}
          ${log.discountAmount ? `
          <div class="total-row" style="color: #000;">
            <span>داشکاندن (${log.promoCode}):</span>
            <span>-${log.discountAmount.toLocaleString()} IQD</span>
          </div>
          ` : ''}
          ${deliveryFeeNum > 0 ? `
          <div class="total-row">
            <span>نرخی گەیاندن:</span>
            <span>+${deliveryFeeNum.toLocaleString()} IQD</span>
          </div>
          ` : ''}
          <div class="grand-total">
            <span>کۆی گشتی:</span>
            <span>${(log.total + deliveryFeeNum).toLocaleString()} IQD</span>
          </div>
          ${(log.customerName || log.customerPhone || log.manualAddress || log.customerNote) ? `
          <div class="customer">
            <div class="customer-title">👤 زانیاری کڕیار</div>
            ${log.customerName ? `<div style="margin-bottom: 3px; font-weight: normal;">ناو: ${log.customerName}</div>` : ''}
            ${log.customerPhone ? `<div style="margin-bottom: 3px; font-weight: normal;">مۆبایل: ${log.customerPhone}</div>` : ''}
            ${log.manualAddress ? `<div style="margin-bottom: 3px; font-weight: normal;">ناونیشان: ${log.manualAddress}</div>` : ''}
            ${log.customerNote ? `<div style="margin-top: 5px; font-style: italic; border-top: 1px dotted #000; padding-top: 3px;">تێبینی کڕیار: ${log.customerNote}</div>` : ''}
          </div>
          ` : ''}
          <div class="footer">
            سوپاس بۆ کڕینەکەتان! دیسان چاوەڕوانتانین.<br>
            <span style="font-size: 9px; font-weight: normal; font-family: monospace; display: block; margin-top: 4px;">Powered by Boom Fast App</span>
          </div>
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintOrder = (log: OrderLog) => {
    setSelectedPrintOrder(log);
    setCustomDeliveryFee('0');
  };

  const handleStartEditOrder = (log: OrderLog) => {
    setEditingOrder(log);
    setEditOrderItems([...log.items]);
    setEditOrderTotal(log.total);
    setEditCustomerName(log.customerName || '');
    setEditCustomerPhone(log.customerPhone || '');
    setEditManualAddress(log.manualAddress || '');
    setEditTableNumber(log.tableNumber || '');
    setEditCustomerNote(log.customerNote || '');
    setEditDiscountAmount(log.discountAmount || 0);
    setEditPromoCode(log.promoCode || '');
    setEditDeliveryDriver(log.deliveryDriver || '');
    setEditDeliveryFee(log.deliveryFee || 0);
    
    if (products.length > 0) {
      setSelectedProductToAdd(products[0].id);
    } else {
      setSelectedProductToAdd('');
    }
    setSelectedSizeToAdd('S');
    setSelectedQtyToAdd(1);
  };

  const handleDeleteItemFromEdit = (index: number) => {
    const item = editOrderItems[index];
    const regex = /-\s*([\d,]+)\s*IQD/i;
    const match = item.match(regex);
    if (match) {
      const parsedPrice = parseInt(match[1].replace(/,/g, ''));
      if (!isNaN(parsedPrice)) {
        setEditOrderTotal(prev => Math.max(0, prev - parsedPrice));
      }
    }
    setEditOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemTextChange = (index: number, newText: string) => {
    setEditOrderItems(prev => {
      const updated = [...prev];
      updated[index] = newText;
      return updated;
    });
  };

  const handleAddProductToOrder = () => {
    const prod = products.find(p => p.id === selectedProductToAdd);
    if (!prod) return;

    let price = prod.price;
    let sizeLabel = '';
    
    const cat = categories.find(c => c.id === prod.category);
    const isPizza = cat?.name.toLowerCase().includes('pizza') || cat?.name.includes('پیتزا');
    
    if (isPizza) {
      if (selectedSizeToAdd === 'M') {
        price = prod.priceM || prod.price;
        sizeLabel = ' (M)';
      } else if (selectedSizeToAdd === 'L') {
        price = prod.priceL || prod.price;
        sizeLabel = ' (L)';
      } else {
        sizeLabel = ' (S)';
      }
    }

    const itemTotal = price * selectedQtyToAdd;
    const itemString = `${selectedQtyToAdd}x ${prod.name}${sizeLabel} - ${itemTotal.toLocaleString()} IQD`;
    
    setEditOrderItems(prev => [...prev, itemString]);
    setEditOrderTotal(prev => prev + itemTotal);
  };

  const handleSaveOrderEdit = async () => {
    if (!editingOrder) return;
    try {
      setIsLoading(true);
      const updatedData: any = {
        items: editOrderItems,
        total: editOrderTotal,
        customerName: editCustomerName.trim(),
        customerPhone: editCustomerPhone.trim() || null,
        manualAddress: editManualAddress.trim() || null,
        tableNumber: editTableNumber.trim() || null,
        customerNote: editCustomerNote.trim() || null,
        discountAmount: editDiscountAmount,
        promoCode: editPromoCode.trim() || null,
        deliveryDriver: editDeliveryDriver || null,
        deliveryFee: Number(editDeliveryFee) || 0
      };

      await updateDoc(doc(db, "orders", editingOrder.id), updatedData);
      setEditingOrder(null);
      Swal.fire({
        icon: 'success',
        title: 'داواکاری نوێکرایەوە',
        text: 'داواکارییەکە بە سەرکەوتوویی نوێکرایەوە!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'هەڵە',
        text: 'نەتوانرا داواکارییەکە نوێ بکرێتەوە.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProductForm({ name: p.name, price: p.price.toString(), priceM: p.priceM?.toString() || '', priceL: p.priceL?.toString() || '', img: p.img, category: p.category, order: p.order?.toString() || '0', isNew: p.isNew || false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateQR = () => {
    if (!tableNumber) {
      Swal.fire({ icon: 'warning', title: 'تکایە ژمارەی مێز بنووسە' });
      return;
    }

    const baseUrl = window.location.origin + window.location.pathname;
    const finalUrl = `${baseUrl}?table=${tableNumber}`;

    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
      qrInstanceRef.current = new QRCode(qrContainerRef.current, {
        text: finalUrl,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    }
  };

  const handleDownloadQR = () => {
    if (!qrContainerRef.current) return;
    const canvas = qrContainerRef.current.querySelector('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `table-${tableNumber}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!isLocalAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6" dir="rtl">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-[40px] shadow-xl w-full max-w-md border border-gray-100">
          <h2 className="text-2xl font-black text-center mb-6 text-slate-800">بەشی بەڕێوەبەر</h2>
          <input type="password" placeholder="وشەی نهێنی" className="w-full p-5 bg-gray-50 rounded-3xl border border-gray-200 mb-4 text-center text-2xl tracking-widest outline-none focus:border-orange-500 transition-all" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
          <button className="w-full bg-orange-600 text-white py-5 rounded-3xl font-black text-lg shadow-lg shadow-orange-100">چوونەژوورەوە</button>
        </form>
      </div>
    );
  }

  const getPlainTextReceipt = (log: OrderLog) => {
    const divider = "================================";
    const subDivider = "--------------------------------";
    
    const isDelivery = log.orderType === 'DELIVERY';
    const isDineIn = log.orderType === 'DINE_IN';
    let typeLabel = 'داواکاری ئاسایی';
    if (isDelivery) {
      typeLabel = '🛵 گەیاندن';
    } else if (isDineIn) {
      typeLabel = `🍽️ ناودوکان (مێزی ${log.tableNumber || 'دیاری نەکراو'})`;
    }
    
    const itemsText = log.items.map(item => `  - ${item}`).join('\n');
    
    const deliveryFeeNum = Number(customDeliveryFee) || 0;
    
    let text = '';
    text += `        BOOM'S PIZZA 🍕\n`;
    text += `    پیتزای ڕاستەقینە لێرەیە\n`;
    text += `${divider}\n`;
    text += `ژمارەی داواکاری: #${getNumericOrderId(log)}\n`;
    text += `جۆری داواکاری: ${typeLabel}\n`;
    text += `بەروار و کات: ${new Date(log.timestamp).toLocaleString('ku-IQ')}\n`;
    text += `${divider}\n`;
    text += `خواردنەکان:\n${itemsText}\n`;
    text += `${subDivider}\n`;
    if (log.discountAmount || deliveryFeeNum > 0) {
      if (log.discountAmount) {
        text += `کۆی خواردنەکان: ${(log.total + log.discountAmount).toLocaleString()} IQD\n`;
        text += `داشکاندن (${log.promoCode}): -${log.discountAmount.toLocaleString()} IQD\n`;
      } else {
        text += `کۆی خواردنەکان: ${log.total.toLocaleString()} IQD\n`;
      }
      if (deliveryFeeNum > 0) {
        text += `نرخی گەیاندن: +${deliveryFeeNum.toLocaleString()} IQD\n`;
      }
    }
    text += `کۆی گشتی: ${(log.total + deliveryFeeNum).toLocaleString()} IQD\n`;
    text += `${divider}\n`;
    
    if (log.customerName || log.customerPhone || log.manualAddress || log.customerNote) {
      text += `زانیاری کڕیار:\n`;
      if (log.customerName) text += `👤 ناو: ${log.customerName}\n`;
      if (log.customerPhone) text += `📞 مۆبایل: ${log.customerPhone}\n`;
      if (log.manualAddress) text += `🏠 ناونیشان: ${log.manualAddress}\n`;
      if (log.customerNote) text += `📝 تێبینی کڕیار: ${log.customerNote}\n`;
      text += `${divider}\n`;
    }
    
    text += `سوپاس بۆ کڕینەکەتان! دیسان چاوەڕوانتانین.\n`;
    text += `Powered by Boom Fast App`;
    return text;
  };

  return (
    <>
      <div className="no-print-area flex flex-col lg:flex-row min-h-screen bg-slate-50" dir="rtl">
      <nav className="w-full lg:w-64 bg-white border-l border-gray-100 p-4 sticky top-0 h-auto lg:h-screen flex lg:flex-col gap-2 overflow-x-auto no-scrollbar z-30">
        <div className="hidden lg:block p-4 mb-4 text-center">
          {businessLogo && <img src={businessLogo} className="w-20 h-20 object-contain mx-auto mb-2 rounded-xl" />}
          <h2 className="font-black text-xl text-slate-800">Boom Fast</h2>
          <p className="text-xs text-slate-400 font-bold">بەڕێوەبردن</p>
        </div>
        {[
          { id: 'DASHBOARD', icon: '📊', label: 'سەرەتا' },
          { id: 'ORDERS', icon: '📦', label: 'داواکارییەکان' },
          { id: 'PRODUCTS', icon: '🍔', label: 'خواردنەکان' },
          { id: 'CATEGORIES', icon: '📁', label: 'بەشەکان' },
          { id: 'TABLES', icon: '🪑', label: 'مێزەکان' },
          { id: 'PROMO_CODES', icon: '🎟️', label: 'کۆدی داشکاندن' },
          { id: 'DRIVERS', icon: '🛵', label: 'داهاتی سایق' },
          { id: 'DISCORD', icon: '💬', label: 'دیسکۆرد' },
          { id: 'SETTINGS', icon: '⚙️', label: 'ڕێکخستن' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-4 rounded-3xl font-black whitespace-nowrap transition-all flex items-center gap-3 ${activeTab === tab.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'text-gray-500 hover:bg-gray-50'}`}>
            <span>{tab.icon}</span><span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex-grow p-4 lg:p-12 space-y-8 max-w-5xl mx-auto w-full">
        {activeTab === 'DASHBOARD' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm text-center">
              <div className="text-gray-400 text-sm font-black mb-1">کۆی خواردنەکان</div>
              <div className="text-5xl font-black text-slate-800">{stats.totalProducts}</div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm text-center">
              <div className="text-gray-400 text-sm font-black mb-1">کۆی داواکارییەکان</div>
              <div className="text-5xl font-black text-green-600">{stats.totalOrders}</div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm text-center">
              <div className="text-gray-400 text-sm font-black mb-1">کۆی فرۆش</div>
              <div className="text-3xl font-black text-orange-600">{stats.totalRevenue.toLocaleString()} د.ع</div>
            </div>
          </div>
        )}

        {activeTab === 'PRODUCTS' && (
          <div className="space-y-8">
            <div className={`bg-white p-8 rounded-[40px] shadow-sm border-2 transition-colors ${editingProductId ? 'border-orange-500' : 'border-gray-100'}`}>
              <h3 className="font-black text-xl mb-6 text-slate-800">{editingProductId ? 'دەستکاری کردنی خواردن' : 'زیادکردنی خواردنی نوێ'}</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsLoading(true);
                const pData: any = { 
                  name: productForm.name, 
                  price: parseInt(productForm.price), 
                  img: productForm.img, 
                  category: productForm.category,
                  order: parseInt(productForm.order) || 0,
                  isNew: productForm.isNew
                };
                
                // Only save M/L prices if it's a pizza
                if (isPizzaCategory) {
                  if (productForm.priceM) pData.priceM = parseInt(productForm.priceM);
                  if (productForm.priceL) pData.priceL = parseInt(productForm.priceL);
                }

                if (editingProductId) await updateDoc(doc(db, "menu", editingProductId), pData);
                else await addDoc(collection(db, "menu"), pData);
                
                setEditingProductId(null);
                setProductForm({ name: '', price: '', priceM: '', priceL: '', img: '', category: categories[0]?.id || '', order: '0', isNew: false });
                setIsLoading(false);
              }} className="space-y-4">
                <input className="input-admin w-full" placeholder="ناوی خواردن" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                <div className="grid grid-cols-2 gap-4">
                  <select className="input-admin w-full" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} required>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input className="input-admin w-full" type="number" placeholder="ڕیزبەندی (ژمارە)" value={productForm.order} onChange={e => setProductForm({...productForm, order: e.target.value})} />
                </div>
                
                <div className={`grid ${isPizzaCategory ? 'grid-cols-3' : 'grid-cols-1'} gap-4`}>
                  <div className="space-y-1">
                    {isPizzaCategory && <label className="text-[10px] font-black text-gray-400 mr-2">نرخی بچوک (S)</label>}
                    <input className="input-admin w-full" type="number" placeholder={isPizzaCategory ? "S" : "نرخی خواردن"} value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required />
                  </div>
                  
                  {isPizzaCategory && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 mr-2">ناوەند (M)</label>
                        <input className="input-admin w-full" type="number" placeholder="M" value={productForm.priceM} onChange={e => setProductForm({...productForm, priceM: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 mr-2">گەورە (L)</label>
                        <input className="input-admin w-full" type="number" placeholder="L" value={productForm.priceL} onChange={e => setProductForm({...productForm, priceL: e.target.value})} />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-2 px-2 py-4">
                  <input type="checkbox" id="isNew" checked={productForm.isNew} onChange={e => setProductForm({...productForm, isNew: e.target.checked})} className="w-5 h-5 accent-orange-600" />
                  <label htmlFor="isNew" className="text-sm font-black text-slate-700 cursor-pointer">ئەم خواردنە نوێیە (نیشانەی نوێ دەربکەوێت)</label>
                </div>

                <div className="relative h-56 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {productForm.img ? <img src={productForm.img} className="h-full w-full object-cover" /> : <span className="font-black text-slate-400">بارکردنی وێنە</span>}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) { setIsUploading(true); const url = await uploadToImgBB(file); if (url) setProductForm(p => ({...p, img: url})); setIsUploading(false); }
                  }} />
                  {isUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm font-black text-orange-600">باردەکرێت...</div>}
                </div>
                <button disabled={isUploading || isLoading} className="w-full bg-orange-600 text-white py-5 rounded-[24px] font-black shadow-xl shadow-orange-100">
                  {isLoading ? 'پاشەکەوت دەکرێت...' : editingProductId ? 'نوێکردنەوە' : 'زیادکردن'}
                </button>
              </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-[32px] border border-gray-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4"><img src={p.img} className="w-20 h-20 rounded-2xl object-cover bg-slate-50" /><div><div className="font-black text-slate-800">{p.name}</div><div className="text-orange-600 font-black text-sm">{p.price.toLocaleString()} IQD</div></div></div>
                  <div className="flex gap-2 items-center">
                    <button 
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, "menu", p.id), { isOutOfStock: !p.isOutOfStock });
                        } catch (e) {
                          Swal.fire({ icon: 'error', title: 'هەڵە', text: 'گۆڕینی دۆخی خواردن سەرکەوتوو نەبوو' });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl font-black text-[10px] transition-all border ${
                        p.isOutOfStock 
                          ? 'bg-red-50 text-red-600 border-red-100' 
                          : 'bg-green-50 text-green-600 border-green-100'
                      }`}
                    >
                      {p.isOutOfStock ? 'خلاس بووە' : 'ماوە'}
                    </button>
                    <button onClick={() => startEditProduct(p)} className="w-10 h-10 flex items-center justify-center text-blue-400">✏️</button>
                    <button onClick={() => handleDeleteProduct(p.id, p.name)} className="w-10 h-10 flex items-center justify-center text-red-400">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'CATEGORIES' && (
          <div className="space-y-8">
            <div className={`bg-white p-8 rounded-[40px] shadow-sm border-2 transition-colors ${editingCategoryId ? 'border-orange-500' : 'border-gray-100'}`}>
              <h3 className="font-black text-xl mb-6 text-slate-800">{editingCategoryId ? 'دەستکاری کردنی بەش' : 'زیادکردنی بەشی نوێ'}</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsLoading(true);
                const cData = { 
                  name: categoryForm.name, 
                  imageUrl: categoryForm.imageUrl, 
                  order: parseInt(categoryForm.order) || 0 
                };
                if (editingCategoryId) await updateDoc(doc(db, "categories", editingCategoryId), cData);
                else await addDoc(collection(db, "categories"), cData);
                setEditingCategoryId(null);
                setCategoryForm({ name: '', imageUrl: '', order: '' });
                setIsLoading(false);
              }} className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <input className="input-admin w-full" placeholder="ناوی بەش" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required />
                  </div>
                  <div className="col-span-1">
                    <input className="input-admin w-full" type="number" placeholder="ڕیزبەندی" value={categoryForm.order} onChange={e => setCategoryForm({...categoryForm, order: e.target.value})} />
                  </div>
                </div>
                <div className="relative h-48 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {categoryForm.imageUrl ? <img src={categoryForm.imageUrl} className="h-full w-full object-cover" /> : <span className="font-black text-slate-400">بارکردنی وێنەی بەش</span>}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) { setIsUploading(true); const url = await uploadToImgBB(file); if (url) setCategoryForm(c => ({...c, imageUrl: url})); setIsUploading(false); }
                  }} />
                  {isUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm font-black text-orange-600">باردەکرێت...</div>}
                </div>
                <button disabled={isUploading || isLoading} className="w-full bg-orange-600 text-white py-5 rounded-[24px] font-black shadow-xl">
                  {isLoading ? 'پاشەکەوت دەکرێت...' : editingCategoryId ? 'نوێکردنەوە' : 'زیادکردن'}
                </button>
              </form>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {categories.map(c => (
                <div key={c.id} className="bg-white p-3 rounded-[20px] border border-gray-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-black text-xs">{c.order || 0}</span>
                    <img src={c.imageUrl} className="w-[60px] h-[60px] rounded-[12px] object-cover shadow-sm bg-slate-50" />
                    <div className="font-black text-base text-slate-800">{c.name}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingCategoryId(c.id); setCategoryForm({ name: c.name, imageUrl: c.imageUrl, order: (c.order || 0).toString() }); window.scrollTo({top: 0, behavior:'smooth'}); }} className="p-2.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-all font-black text-[11px]">دەستکاری</button>
                    <button onClick={() => handleDeleteCategory(c.id, c.name)} className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all font-black text-[11px]">سڕینەوە</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'TABLES' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <h3 className="font-black text-2xl mb-6 text-slate-800">بەڕێوەبردنی مێزەکان 🪑</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500 mr-2">ژمارەی مێز</label>
                  <input 
                    type="number" 
                    placeholder="بۆ نموونە: ٥" 
                    className="input-admin w-full text-center text-3xl h-20"
                    value={tableNumber}
                    onChange={e => setTableNumber(e.target.value)}
                  />
                </div>
                
                <button 
                  onClick={handleGenerateQR}
                  className="w-full bg-orange-600 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-orange-100 transition-all active:scale-95"
                >
                  دروستکردنی کۆد (Generate QR)
                </button>

                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 min-h-[350px]">
                  <div ref={qrContainerRef} className="bg-white p-6 rounded-3xl shadow-lg mb-6 border border-gray-100">
                    {/* QR Code will be injected here */}
                    <div className="w-64 h-64 flex items-center justify-center text-slate-300 font-bold">
                      QR لێرە دەردەکەوێت
                    </div>
                  </div>
                  
                  {tableNumber && (
                    <button 
                      onClick={handleDownloadQR}
                      className="px-8 py-3 bg-white border-2 border-orange-600 text-orange-600 font-black rounded-2xl hover:bg-orange-50 transition-all active:scale-95"
                    >
                      دابەزاندنی وێنە 📥
                    </button>
                  )}
                </div>

                <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100">
                  <h4 className="font-black text-orange-800 mb-2">چۆن کار دەکات؟</h4>
                  <p className="text-sm text-orange-700 leading-relaxed font-bold">
                    کاتێک کڕیار ئەم کۆدە سکان دەکات، وێبسایتەکە دەکرێتەوە و بە ئۆتۆماتیکی ژمارەی مێزەکە لەناو داواکارییەکەدا جێگیر دەبێت.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'DISCORD' && (
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-8 text-right">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#5865F2] rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-indigo-100">
                💬
              </div>
              <div>
                <h3 className="font-black text-2xl text-slate-800">ڕێکخستنی دیسکۆرد</h3>
                <p className="text-sm text-slate-400 font-bold">ناردنی داواکارییەکان بۆ دیسکۆرد</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[32px] space-y-4">
                <h4 className="text-sm font-black text-indigo-700">Discord Webhook URL</h4>
                <p className="text-xs text-indigo-600 font-bold leading-relaxed">
                  لێرە دەتوانیت لینکی Webhook ی دیسکۆرد دابنێیت بۆ ئەوەی هەموو داواکارییەکان بچن بۆ چەناڵێکی دیاریکراو لە دیسکۆرد.
                </p>
                <input 
                  className="input-admin w-full text-left font-mono text-xs" 
                  placeholder="https://discord.com/api/webhooks/..." 
                  value={discordWebhookUrl} 
                  onChange={e => updateGeneralSetting('discordWebhookUrl', e.target.value)} 
                />
              </div>

              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                <h4 className="font-black text-slate-700 mb-3">چۆن وەردەگیرێت؟</h4>
                <ol className="text-xs text-slate-500 space-y-2 font-bold list-decimal list-inside">
                  <li>بڕۆ بۆ سێرڤەرەکەت لە دیسکۆرد.</li>
                  <li>بڕۆ بۆ بەشی Server Settings پاشان Integrations.</li>
                  <li>کلیک لەسەر Webhooks بکە و دانەیەکی نوێ دروست بکە.</li>
                  <li>لینکی Webhookەکە کۆپی بکە و لێرە دایبنێ.</li>
                </ol>
              </div>

              <button 
                onClick={async () => {
                  if (!discordWebhookUrl) {
                    Swal.fire({ icon: 'warning', title: 'تکایە لینکەکە بنووسە' });
                    return;
                  }
                  try {
                    const response = await fetch(discordWebhookUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ content: "🚀 تاقیکردنەوەی دیسکۆرد لە لایەن ئەدمینەوە سەرکەوتوو بوو!" })
                    });
                    if (response.ok) {
                      Swal.fire({ icon: 'success', title: 'سەرکەوتوو بوو', text: 'نامەی تاقیکردنەوە نێردرا بۆ دیسکۆرد.' });
                    } else {
                      throw new Error();
                    }
                  } catch (e) {
                    Swal.fire({ icon: 'error', title: 'هەڵە', text: 'نەتوانرا نامە بنێردرێت، تکایە دڵنیابەرەوە لە ڕاستی لینکەکە.' });
                  }
                }}
                className="w-full bg-[#5865F2] text-white py-5 rounded-[24px] font-black shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                تاقیکردنەوەی ناردن (Test Webhook)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ORDERS' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xl text-slate-800">داواکارییەکان</h3>
              {orderLogs.length > 0 && (
                <button 
                  onClick={handleDeleteAllOrders}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-black text-xs hover:bg-red-100 transition-all flex items-center gap-2"
                >
                  <span>🗑️</span>
                  <span>سڕینەوەی هەمووی</span>
                </button>
              )}
            </div>
            {orderLogs.length === 0 ? (
              <div className="bg-white p-12 rounded-[40px] text-center text-gray-400 font-bold border border-gray-100">داواکاری نییە</div>
            ) : (
              orderLogs.map(log => (
                <div key={log.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs text-gray-400 font-black mb-1">{new Date(log.timestamp).toLocaleString('ku-IQ')}</div>
                      <div className="font-black text-slate-800">داواکاری #{getNumericOrderId(log)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end">
                        <div className="text-orange-600 font-black ml-2">{log.total.toLocaleString()} IQD</div>
                        {log.promoCode && (
                          <div className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md mt-1 font-mono">
                            🎟️ {log.promoCode} (-{log.discountAmount?.toLocaleString()} د.ع)
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => handlePrintOrder(log)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all"
                        title="پرێنت"
                      >
                        🖨️
                      </button>
                      <button 
                        onClick={() => handleStartEditOrder(log)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all"
                        title="دەستکاری کردنی داواکاری"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(log.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                        title="سڕینەوە"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                    <div className="space-y-2">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">خواردنەکان</div>
                      {log.items.map((item, idx) => <div key={idx} className="text-sm text-gray-600 font-bold">• {item}</div>)}
                    </div>
                    
                    <div className="space-y-2">
                      {(log.customerName || log.customerPhone || log.manualAddress || log.customerNote || log.gpsLocation) && (
                        <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">زانیاری کڕیار</div>
                          {log.customerName && <div className="text-sm font-bold text-slate-700">👤 {log.customerName}</div>}
                          {log.customerPhone && <div className="text-sm font-bold text-slate-700">📞 {log.customerPhone}</div>}
                          {log.manualAddress && <div className="text-sm font-bold text-slate-700">🏠 {log.manualAddress}</div>}
                          {log.customerNote && <div className="text-sm font-bold text-slate-500 italic">📝 {log.customerNote}</div>}
                          {log.gpsLocation && (
                            <a href={log.gpsLocation} target="_blank" rel="noreferrer" className="inline-block text-xs font-black text-blue-500 hover:underline">
                              📍 کردنەوەی لۆکەیشن لە نەخشە
                            </a>
                          )}
                        </div>
                      )}

                      {log.orderType === 'DELIVERY' && (
                        <div className="space-y-1.5 bg-orange-50/50 p-4 rounded-2xl border border-orange-100/40">
                          <div className="text-[10px] font-black text-orange-800 uppercase tracking-wider">🛵 زانیاری گەیاندن</div>
                          <div className="text-xs font-bold text-slate-700">سایق: <span className="text-orange-600 font-black">{log.deliveryDriver || 'دیاری نەکراوە'}</span></div>
                          <div className="text-xs font-bold text-slate-700">کرێی گەیاندن: <span className="text-slate-900 font-black">{(log.deliveryFee || 0).toLocaleString()} IQD</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'PROMO_CODES' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <h3 className="font-black text-xl mb-6 text-slate-800 text-right">کۆدی داشکاندنی نوێ</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsLoading(true);
                const codeUpper = promoForm.code.toUpperCase().replace(/\s+/g, '');
                if (!codeUpper) {
                  Swal.fire({ icon: 'error', title: 'هەڵە', text: 'تکایە کۆدەکە بنووسە' });
                  setIsLoading(false);
                  return;
                }
                const promoData = {
                  code: codeUpper,
                  discountType: promoForm.discountType,
                  discountValue: parseFloat(promoForm.discountValue) || 0,
                  isActive: promoForm.isActive,
                  minOrderAmount: parseFloat(promoForm.minOrderAmount) || 0
                };
                try {
                  await setDoc(doc(db, "promocodes", codeUpper), promoData);
                  setPromoForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderAmount: '', isActive: true });
                  Swal.fire({ icon: 'success', title: 'سەرکەوتوو', text: 'کۆدی داشکاندن زیادکرا!', timer: 1500, showConfirmButton: false });
                } catch(err) {
                  Swal.fire({ icon: 'error', title: 'هەڵە', text: 'کێشەیەک ڕوویدا لە کاتی زیادکردندا' });
                } finally {
                  setIsLoading(false);
                }
              }} className="space-y-4 text-right">
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-1">کۆدی دڵخواز (وێنە: PIZZA20)</label>
                  <input className="input-admin w-full text-center" style={{textTransform: 'uppercase'}} placeholder="PIZZA20" value={promoForm.code} onChange={e => setPromoForm({...promoForm, code: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-1">بڕی داشکاندن</label>
                    <input className="input-admin w-full text-center" type="number" placeholder="بڕی داشکاندن یان ڕێژە" value={promoForm.discountValue} onChange={e => setPromoForm({...promoForm, discountValue: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-1">جۆری داشکاندن</label>
                    <select className="input-admin w-full" value={promoForm.discountType} onChange={e => setPromoForm({...promoForm, discountType: e.target.value as any})} required>
                      <option value="PERCENTAGE">ڕێژەیی (%)</option>
                      <option value="FIXED">بڕی دیاریکراو (د.ع)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-[20px] cursor-pointer border border-slate-100 select-none">
                      <input type="checkbox" checked={promoForm.isActive} onChange={e => setPromoForm({...promoForm, isActive: e.target.checked})} className="w-5 h-5 accent-orange-600" />
                      <span className="font-black text-slate-700 text-sm">ئەم کۆدە کارابێت</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-1">کەمترین بڕی داواکاری بۆ کارابوون (د.ع)</label>
                    <input className="input-admin w-full text-center" type="number" placeholder="ئارەزوومەندانە" value={promoForm.minOrderAmount} onChange={e => setPromoForm({...promoForm, minOrderAmount: e.target.value})} />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-orange-600 text-white py-5 rounded-[24px] font-black shadow-xl shadow-orange-100">
                  {isLoading ? 'پاشەکەوت دەکرێت...' : 'پاشەکەوتکردنی کۆد'}
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="font-black text-xl text-slate-800 text-right">کۆدە بەردەستەکان ({promoCodes.length})</h3>
              {promoCodes.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-[40px] border border-gray-100 font-bold text-slate-400">
                  هیچ کۆدێکی داشکاندن بەردەست نییە.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                  {promoCodes.map(pc => (
                    <div key={pc.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xl text-orange-600 bg-orange-50 px-3 py-1 rounded-full">{pc.code}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${pc.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {pc.isActive ? 'بەردەست' : 'نابەردەست'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-black">
                          🎁 داشکاندن: <span className="text-slate-800">{pc.discountValue.toLocaleString()} {pc.discountType === 'PERCENTAGE' ? '%' : 'د.ع'}</span>
                        </div>
                        {pc.minOrderAmount && pc.minOrderAmount > 0 ? (
                          <div className="text-xs text-slate-400 font-bold">
                            ⚠️ لانی کەم: {pc.minOrderAmount.toLocaleString()} د.ع دابینبکرێت
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={async () => {
                            await updateDoc(doc(db, "promocodes", pc.id), { isActive: !pc.isActive });
                          }}
                          className={`p-3 rounded-2xl hover:opacity-80 transition-all font-black text-xs ${pc.isActive ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}
                        >
                          {pc.isActive ? 'ناکاراکردن' : 'کاراکردن'}
                        </button>
                        <button 
                          onClick={async () => {
                            Swal.fire({
                              title: 'دڵنیای؟',
                              text: `ئایا دڵنیای لە سڕینەوەی کۆدی داشکاندنی ${pc.code}؟`,
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonText: 'بەڵێ، بیسڕەوە',
                              cancelButtonText: 'نەخێر',
                              confirmButtonColor: '#dc2626'
                            }).then(async (result: any) => {
                              if (result.isConfirmed) {
                                await deleteDoc(doc(db, "promocodes", pc.id));
                                Swal.fire({ icon: 'success', title: 'سڕایەوە', timer: 1000, showConfirmButton: false });
                              }
                            });
                          }}
                          className="bg-red-50 text-red-600 p-3 rounded-2xl hover:bg-red-100 transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'DRIVERS' && (
          <div className="space-y-8 text-right">
            <div className="bg-gradient-to-l from-orange-500 to-red-600 p-8 rounded-[40px] text-white shadow-xl">
              <h3 className="font-black text-2xl mb-2 flex items-center gap-3 justify-end">
                <span>ڕاپۆرتی داهاتی سایقی دلیڤەری</span>
                <span className="text-3xl">🛵</span>
              </h3>
              <p className="font-bold opacity-90 text-sm leading-relaxed">
                لێرەوە سەرپەرشتی داهاتی ڕۆژانە، مانگانە و کۆی گشتی کرێی گەیاندنی سایقەکانی فاست فوودەکەت بکە بە شێوەیەکی خۆکارانە و ڕێکخراو.
              </p>
            </div>

            {/* General Earnings Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-orange-500"></div>
                <div className="text-gray-400 text-xs font-black mb-1">💰 داهاتی گەیاندنی ئەمڕۆ</div>
                <div className="text-2xl font-black text-orange-600 font-mono">
                  {driverStats.todayDeliveryFee.toLocaleString()} <span className="text-xs font-black">د.ع</span>
                </div>
                <div className="text-[10px] text-gray-400 font-bold mt-1">تەنها بۆ ڕۆژی کارکردنی ئێستا</div>
              </div>

              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-500"></div>
                <div className="text-gray-400 text-xs font-black mb-1">🗓️ داهاتی گەیاندنی ئەم مانگە</div>
                <div className="text-2xl font-black text-blue-600 font-mono">
                  {driverStats.monthDeliveryFee.toLocaleString()} <span className="text-xs font-black">د.ع</span>
                </div>
                <div className="text-[10px] text-gray-400 font-bold mt-1">سەرجەم ڕۆژەکانی ئەم مانگە</div>
              </div>

              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-green-500"></div>
                <div className="text-gray-400 text-xs font-black mb-1">📊 کۆی گشتی داهاتی گەیاندن</div>
                <div className="text-2xl font-black text-green-600 font-mono">
                  {driverStats.totalDeliveryFee.toLocaleString()} <span className="text-xs font-black">د.ع</span>
                </div>
                <div className="text-[10px] text-gray-400 font-bold mt-1">سەرجەم کاتەکان لە سیستمدا</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Driver Card */}
              <div className="lg:col-span-1 bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm h-fit">
                <h4 className="font-black text-lg text-slate-800 mb-6 pb-2 border-b border-gray-100 flex items-center justify-end gap-2">
                  <span>زیادکردنی سایقی نوێ</span>
                  <span>➕</span>
                </h4>
                <form onSubmit={handleAddDriver} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5">ناوی سایق:</label>
                    <input 
                      type="text"
                      placeholder="بۆ نموونە: ئارام ئەحمەد"
                      value={newDriverName}
                      onChange={(e) => setNewDriverName(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-orange-500 focus:bg-white text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5">مۆبایل:</label>
                    <input 
                      type="tel"
                      placeholder="بۆ نموونە: 07501234567"
                      value={newDriverPhone}
                      onChange={(e) => setNewDriverPhone(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-orange-500 focus:bg-white text-left font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5">ژمارەی تابلۆ/ماتۆڕ (ئارەزوومەندانە):</label>
                    <input 
                      type="text"
                      placeholder="بۆ نموونە: ١٢٣٤٥ سلێمانی"
                      value={newDriverVehicle}
                      onChange={(e) => setNewDriverVehicle(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-orange-500 focus:bg-white text-right"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4.5 rounded-2xl transition-all shadow-md shadow-orange-100 text-xs"
                  >
                    {isLoading ? 'پاشەکەوت دەکرێت...' : '💾 پاشەکەوتکردنی سایق'}
                  </button>
                </form>
              </div>

              {/* Drivers & Earnings Breakdown Card */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="font-black text-lg text-slate-800 flex items-center justify-end gap-2 px-2">
                  <span>لیستی داهاتی سایقەکان ({drivers.length})</span>
                  <span>📋</span>
                </h4>
                {drivers.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100 font-bold text-slate-400">
                    هیچ سایقێک لە سیستمدا تۆمار نەکراوە. لە ڕێگەی فۆرمی لای ڕاست سایق زیاد بکە!
                  </div>
                ) : (
                  driverStats.perDriverStats.map(driver => (
                    <div key={driver.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                            🛵
                          </div>
                          <div className="text-right">
                            <h5 className="font-black text-base text-slate-800">{driver.name}</h5>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 font-bold">
                              {driver.phone && <span>📞 {driver.phone}</span>}
                              {driver.vehicleNumber && <span>• 🚘 {driver.vehicleNumber}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setExpandedDriverId(expandedDriverId === driver.id ? null : driver.id)}
                            className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl font-black text-xs transition-all flex items-center gap-1.5"
                          >
                            <span>{expandedDriverId === driver.id ? '📊 شاردنەوەی وردەکاری' : '📊 بینینی وردەکاری'}</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteDriver(driver.id, driver.name)}
                            className="w-10 h-10 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl flex items-center justify-center transition-all"
                            title="سڕینەوەی سایق"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Earning stats breakdown */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/50 text-center">
                          <span className="block text-[10px] font-black text-gray-400 mb-1">💰 ئەمڕۆ</span>
                          <span className="block font-mono font-black text-sm text-orange-600">{driver.todayEarned.toLocaleString()} <span className="text-[9px]">د.ع</span></span>
                          <span className="block text-[9px] text-gray-400 font-bold mt-0.5">({driver.todayDelivered} داواکاری)</span>
                        </div>
                        <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/50 text-center">
                          <span className="block text-[10px] font-black text-gray-400 mb-1">🗓️ ئەم مانگە</span>
                          <span className="block font-mono font-black text-sm text-blue-600">{driver.monthEarned.toLocaleString()} <span className="text-[9px]">د.ع</span></span>
                          <span className="block text-[9px] text-gray-400 font-bold mt-0.5">({driver.monthDelivered} داواکاری)</span>
                        </div>
                        <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/50 text-center">
                          <span className="block text-[10px] font-black text-gray-400 mb-1">📊 کۆی گشتی</span>
                          <span className="block font-mono font-black text-sm text-green-600">{driver.totalEarned.toLocaleString()} <span className="text-[9px]">د.ع</span></span>
                          <span className="block text-[9px] text-gray-400 font-bold mt-0.5">({driver.totalDelivered} داواکاری)</span>
                        </div>
                      </div>

                      {/* Expanded Order List Details */}
                      {expandedDriverId === driver.id && (
                        <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl mt-2 animate-in fade-in duration-300">
                          <h6 className="font-black text-xs text-slate-700 mb-3 border-b pb-1.5 border-slate-200/50">داواکارییە گەیەندراوەکانی {driver.name}:</h6>
                          {driver.orders.length === 0 ? (
                            <div className="text-center py-4 text-xs font-bold text-gray-400">هیچ داواکارییەکی گەیەنراو نییە بۆ ئەم سایقە</div>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {driver.orders.map(order => (
                                <div key={order.id} className="bg-white p-2.5 rounded-xl border border-slate-200/50 flex justify-between items-center text-xs">
                                  <div className="text-right">
                                    <div className="font-black text-slate-800">داواکاری #{getNumericOrderId(order)}</div>
                                    <div className="text-[9px] text-gray-400 font-bold mt-0.5">{new Date(order.timestamp).toLocaleDateString('ku-IQ')}</div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <div className="text-[10px] text-gray-400 font-bold">کرێی دلیڤەری</div>
                                      <div className="font-mono font-black text-orange-600">{(order.deliveryFee || 0).toLocaleString()} د.ع</div>
                                    </div>
                                    <div className="text-left">
                                      <div className="text-[10px] text-gray-400 font-bold">کۆی داواکاری</div>
                                      <div className="font-mono font-black text-slate-800">{(order.total).toLocaleString()} د.ع</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'SETTINGS' && (
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-8 text-right">
            <h3 className="font-black text-xl text-slate-800">ڕێکخستنەکان</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                <label className="block text-sm font-black text-slate-700">لۆگۆی وێبسایت</label>
                <input type="file" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) { setIsLogoUploading(true); const url = await uploadToImgBB(file); if (url) await updateThemeSetting('logoUrl', url); setIsLogoUploading(false); }
                }} className="input-admin w-full text-xs" />
                {businessLogo && <img src={businessLogo} className="w-20 h-20 object-contain rounded-xl" />}
              </div>
              <div className="space-y-4 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                <label className="block text-sm font-black text-slate-700">باڵاوەری سەرەکی</label>
                <input type="file" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) { setIsBannerUploading(true); const url = await uploadToImgBB(file); if (url) await updateBannerSetting(url); setIsBannerUploading(false); }
                }} className="input-admin w-full text-xs" />
                {mainBanner && <img src={mainBanner} className="w-full h-20 object-cover rounded-xl mt-2" />}
              </div>
            </div>
            <div className="p-6 bg-orange-50 border border-orange-100 rounded-[32px] space-y-6">
              <h4 className="text-sm font-black text-orange-700">دۆخی فاست فوود (کراوە/داخراو)</h4>
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-orange-100">
                <span className="font-black text-slate-700">{isClosed ? '🔴 ئێستا داخراوە' : '🟢 ئێستا کراوەیە'}</span>
                <button 
                  onClick={() => updateGeneralSetting('isClosed', !isClosed)}
                  className={`px-6 py-2 rounded-xl font-black text-white transition-all ${isClosed ? 'bg-green-600' : 'bg-red-600'}`}
                >
                  {isClosed ? 'بیکەرەوە' : 'دایبخە'}
                </button>
              </div>
            </div>
            <div className="p-6 bg-orange-50 border border-orange-100 rounded-[32px] space-y-6">
              <h4 className="text-sm font-black text-orange-700">ImgBB API Keys</h4>
              <div className="space-y-4">
                {imgbbKeys.map((key, index) => (
                  <div key={index} className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-orange-100">
                    <div className="flex items-center justify-between"><label className="text-xs font-black text-orange-600">کلیل {index + 1}</label><input type="radio" name="api_key" checked={activeIndex === index} onChange={() => setActiveIndex(index)} /></div>
                    <input className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none text-xs" value={key} onChange={e => { const nk = [...imgbbKeys]; nk[index] = e.target.value; setImgbbKeys(nk); }} />
                  </div>
                ))}
                <button onClick={saveApiKeysToFirestore} className="w-full bg-orange-600 text-white py-4 rounded-[20px] font-black shadow-lg">پاشەکەوتکردن</button>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-black text-slate-400">Telegram Chat ID</label>
              <input className="input-admin w-full" value={telegramChatId} onChange={e => updateGeneralSetting('telegramChatId', e.target.value)} />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-black text-slate-400">وشەی نهێنی ئەدمین (Admin Password)</label>
              <input className="input-admin w-full" value={adminPassword} onChange={e => updateGeneralSetting('adminPassword', e.target.value)} />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-black text-slate-400">ژمارەی مۆبایلی دوکان (Shop Phone Number)</label>
              <input type="tel" className="input-admin w-full" value={shopPhone} onChange={e => updateGeneralSetting('shopPhone', e.target.value)} placeholder="+964 750 000 0000" />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-black text-slate-400">ناونیشانی دوکان (Shop Address)</label>
              <input className="input-admin w-full" value={shopAddress} onChange={e => updateGeneralSetting('shopAddress', e.target.value)} placeholder="سولەیمانی، شەقامی شەست مەتری" />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-black text-slate-400">گەشەپێدەر / دروستکەری سیستم (Created By)</label>
              <input className="input-admin w-full" value={createdBy} onChange={e => updateGeneralSetting('createdBy', e.target.value)} placeholder="Aram Baras" />
            </div>
            <button onClick={() => onAdminAuthChange(false)} className="w-full py-5 rounded-[24px] text-red-600 font-black bg-red-50 hover:bg-red-100">دەرچوون</button>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <div id="edit-order-modal-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200" dir="rtl">
          <div id="edit-order-modal-container" className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full flex flex-col p-6 text-right border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                <span>✏️</span>
                <span>دەستکاری کردنی داواکاری #{getNumericOrderId(editingOrder)}</span>
              </h3>
              <button 
                id="close-edit-order-modal"
                onClick={() => setEditingOrder(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Order Items List */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-400">🍕 خواردنەکانی ناو داواکاری:</label>
                {editOrderItems.length === 0 ? (
                  <div className="text-center py-4 bg-slate-50 rounded-2xl text-slate-400 font-bold text-xs">خواردن لەم داواکارییەدا نییە</div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {editOrderItems.map((item, index) => (
                      <div key={index} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                        <input 
                          type="text" 
                          value={item} 
                          onChange={(e) => handleItemTextChange(index, e.target.value)}
                          className="flex-grow p-2 bg-white rounded-xl border border-slate-200 text-xs font-black outline-none focus:border-orange-500 text-slate-700 text-right"
                        />
                        <button 
                          onClick={() => handleDeleteItemFromEdit(index)}
                          className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center rounded-xl text-xs transition-all flex-shrink-0"
                          title="سڕینەوە"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Product Section */}
              <div className="p-4 bg-orange-50/50 rounded-3xl border border-orange-100/50 space-y-3">
                <span className="block text-xs font-black text-orange-800">➕ زیادکردنی خواردنی نوێ بۆ داواکاری:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-1">ناوی خواردن:</label>
                    <select 
                      id="edit-order-product-select"
                      value={selectedProductToAdd} 
                      onChange={(e) => setSelectedProductToAdd(e.target.value)}
                      className="w-full p-3 bg-white rounded-xl border border-slate-200 text-xs font-black outline-none text-right"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - {p.price.toLocaleString()} IQD</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3">
                    {isSelectedProductPizza && (
                      <div className="flex-grow">
                        <label className="block text-[10px] font-black text-slate-400 mb-1">قەبارە:</label>
                        <select 
                          id="edit-order-size-select"
                          value={selectedSizeToAdd} 
                          onChange={(e) => setSelectedSizeToAdd(e.target.value as any)}
                          className="w-full p-3 bg-white rounded-xl border border-slate-200 text-xs font-black outline-none text-right"
                        >
                          <option value="S">S (بچوک)</option>
                          <option value="M">M (ناوەند)</option>
                          <option value="L">L (گەورە)</option>
                        </select>
                      </div>
                    )}
                    <div className="w-20">
                      <label className="block text-[10px] font-black text-slate-400 mb-1">دانە:</label>
                      <input 
                        id="edit-order-qty-input"
                        type="number" 
                        min="1" 
                        value={selectedQtyToAdd} 
                        onChange={(e) => setSelectedQtyToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full p-3 bg-white rounded-xl border border-slate-200 text-xs font-black text-center outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  id="add-product-to-edit-order-btn"
                  type="button"
                  onClick={handleAddProductToOrder}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-black py-3 rounded-2xl transition-all active:scale-95 shadow-md shadow-orange-100"
                >
                  زیادکردنی ئەم خواردنە
                </button>
              </div>

              {/* Total Price and Discount override */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-1">💵 کۆی گشتی (د.ع):</label>
                  <input 
                    id="edit-order-total-input"
                    type="number" 
                    value={editOrderTotal} 
                    onChange={(e) => setEditOrderTotal(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-right outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-1">🎟️ بڕی داشکاندن (د.ع):</label>
                  <input 
                    id="edit-order-discount-input"
                    type="number" 
                    value={editDiscountAmount} 
                    onChange={(e) => setEditDiscountAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-right outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Customer details */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-3xl border border-slate-100">
                <span className="block text-xs font-black text-slate-400 mb-1">👤 زانیارییەکانی کڕیار:</span>
                
                <div className="grid grid-cols-2 gap-3">
                  {editingOrder.orderType === 'DELIVERY' && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1">ناوی کڕیار:</label>
                      <input 
                        id="edit-order-customer-name"
                        type="text" 
                        value={editCustomerName} 
                        onChange={(e) => setEditCustomerName(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none focus:border-orange-500 text-right"
                      />
                    </div>
                  )}
                  {editingOrder.orderType === 'DELIVERY' && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1">مۆبایل:</label>
                      <input 
                        id="edit-order-customer-phone"
                        type="tel" 
                        value={editCustomerPhone} 
                        onChange={(e) => setEditCustomerPhone(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-left outline-none focus:border-orange-500"
                      />
                    </div>
                  )}
                  {editingOrder.orderType === 'DINE_IN' && (
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 mb-1">ژمارەی مێز:</label>
                      <input 
                        id="edit-order-table-number"
                        type="text" 
                        value={editTableNumber} 
                        onChange={(e) => setEditTableNumber(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-center outline-none focus:border-orange-500"
                      />
                    </div>
                  )}
                </div>

                {editingOrder.orderType === 'DELIVERY' && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-1">ناونیشان:</label>
                    <input 
                      id="edit-order-manual-address"
                      type="text" 
                      value={editManualAddress} 
                      onChange={(e) => setEditManualAddress(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none focus:border-orange-500 text-right"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1">تێبینی داواکاری:</label>
                  <textarea 
                    id="edit-order-customer-note"
                    value={editCustomerNote} 
                    onChange={(e) => setEditCustomerNote(e.target.value)}
                    rows={2}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none focus:border-orange-500 resize-none text-right"
                  />
                </div>
              </div>

              {editingOrder.orderType === 'DELIVERY' && (
                <div className="p-4 bg-orange-50/40 rounded-3xl border border-orange-100/50 space-y-3">
                  <span className="block text-xs font-black text-orange-800">🛵 زانیاری گەیاندن و سایق:</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1">ناوی سایق:</label>
                      <select 
                        id="edit-order-driver-select"
                        value={editDeliveryDriver} 
                        onChange={(e) => setEditDeliveryDriver(e.target.value)}
                        className="w-full p-3 bg-white rounded-xl border border-slate-200 text-xs font-black outline-none text-right"
                      >
                        <option value="">دیاری نەکراوە (هیچ)</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1">کرێی گەیاندن (IQD):</label>
                      <input 
                        id="edit-order-delivery-fee"
                        type="number" 
                        value={editDeliveryFee} 
                        onChange={(e) => setEditDeliveryFee(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-right outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 border-t border-gray-100 pt-4">
              <button 
                id="save-edit-order-btn"
                onClick={handleSaveOrderEdit}
                disabled={isLoading}
                className="flex-grow bg-green-600 hover:bg-green-700 text-white font-black py-4 px-4 rounded-2xl shadow-lg transition-all active:scale-95 text-sm"
              >
                {isLoading ? 'پاشەکەوت دەکرێت...' : '💾 پاشەکەوتکردنی گۆڕانکارییەکان'}
              </button>
              <button 
                id="cancel-edit-order-btn"
                onClick={() => setEditingOrder(null)}
                className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all active:scale-95 text-sm"
              >
                پاشگەزبوونەوە
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Receipt Modal */}
      {selectedPrintOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-md w-full flex flex-col p-6 text-right border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                <span>🖨️</span>
                <span>یارمەتیدەری پرێنتکردنی پسوولە</span>
              </h3>
              <button 
                onClick={() => setSelectedPrintOrder(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* Alert Banner */}
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-xs font-bold text-orange-700 leading-relaxed mb-4 text-right">
              ✨ بۆ چاپکردن لە مۆبایلەوە، تکایە ڕێگەی یەکەم بەکاربهێنە کە لاپەڕەیەکی نوێت بۆ دەکاتەوە و پەڕەی پرێنتی فەرمی سیستەمەکە چالاک دەکات.
            </div>

            {/* Delivery Price Input */}
            <div className="mb-4 bg-slate-50 p-4 rounded-3xl border border-slate-100 text-right">
              <label className="block text-xs font-black text-slate-500 mb-2">
                🛵 دیاریکردنی نرخی گەیاندن (پێش چاپکردن):
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={customDeliveryFee}
                  onChange={(e) => setCustomDeliveryFee(e.target.value)}
                  className="w-full text-left font-black p-3 bg-white border border-slate-200 rounded-2xl pr-4 pl-12 text-sm focus:border-orange-500 outline-none"
                  placeholder="0"
                  min="0"
                  step="250"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                  IQD
                </span>
              </div>
              <div className="mt-2 flex gap-1 justify-end">
                {['٠', '١,٠٠٠', '٢,٠٠٠', '٣,٠٠٠'].map((lbl, idx) => {
                  const val = idx * 1000;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCustomDeliveryFee(val.toString())}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all ${
                        Number(customDeliveryFee) === val
                          ? 'bg-orange-600 border-orange-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Print Options */}
            <div className="space-y-3 mb-6">
              <button 
                onClick={() => {
                  handleNewWindowPrint(selectedPrintOrder);
                }}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white font-black py-4 px-4 rounded-2xl shadow-lg hover:bg-orange-700 transition-all active:scale-95 text-sm"
              >
                <span>📱 ڕێگەی یەکەم: پرێنتی مۆبایل (پەڕەی نوێ)</span>
              </button>

              <button 
                onClick={() => {
                  handleIframePrint(selectedPrintOrder);
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-700 text-white font-black py-4 px-4 rounded-2xl shadow-md hover:bg-slate-800 transition-all active:scale-95 text-sm"
              >
                <span>💻 ڕێگەی دووەم: پرێنتی ڕاستەوخۆ (بۆ کۆمپیوتەر)</span>
              </button>

              <button 
                onClick={() => {
                  const plainText = getPlainTextReceipt(selectedPrintOrder);
                  navigator.clipboard.writeText(plainText).then(() => {
                    Swal.fire({
                      icon: 'success',
                      title: 'کۆپی کرا! ✅',
                      text: 'دەقی پسوولەکە کۆپی کرا. ئێستا دەتوانیت لەناو بەرنامەی پرێنتەری بلووتوس دایبنێیت.',
                      confirmButtonText: 'باشە',
                      confirmButtonColor: '#ea580c'
                    });
                  }).catch(() => {
                    Swal.fire({
                      icon: 'error',
                      title: 'کێشەیەک ڕوویدا',
                      text: 'تکایە دەقەکەی خوارەوە بە دەست کۆپی بکە.',
                      confirmButtonText: 'باشە',
                      confirmButtonColor: '#ea580c'
                    });
                  });
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 font-black py-4 px-4 rounded-2xl hover:bg-blue-100 transition-all active:scale-95 text-sm"
              >
                <span>📋 کۆپیکردنی دەقی ڕوون (بۆ پرێنتەری بلووتوس)</span>
              </button>

              <button 
                onClick={() => {
                  const text = encodeURIComponent(getPlainTextReceipt(selectedPrintOrder));
                  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                }}
                className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-100 font-black py-4 px-4 rounded-2xl hover:bg-green-100 transition-all active:scale-95 text-sm"
              >
                <span>💬 شێرکردن لە ڕێگەی واتسئەپ (WhatsApp)</span>
              </button>
            </div>

            {/* Receipt Preview */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-400">👀 پێشبینی پسوولەکە (دەتوانیت لێرەش کۆپی بکەیت):</span>
              <pre className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-mono leading-normal text-right select-all whitespace-pre-wrap max-h-48 overflow-y-auto text-slate-700 font-bold">
                {getPlainTextReceipt(selectedPrintOrder)}
              </pre>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* POS Thermal Receipt for Print-Only Media */}
      {selectedPrintOrder && (
        <div className="print-receipt-area select-none" dir="rtl">
          <div className="text-center border-b-2 border-dashed border-black pb-3 mb-3">
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0' }}>BOOM'S PIZZA 🍕</h1>
            <p style={{ fontSize: '11px', margin: '2px 0', fontWeight: 'normal' }}>پیتزای ڕاستەقینە لێرەیە</p>
          </div>

          <div style={{ border: '1.5px solid #000', padding: '6px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', margin: '10px 0', background: '#fff' }}>
            {selectedPrintOrder.orderType === 'DELIVERY' ? '🛵 گەیاندن (DELIVERY)' : selectedPrintOrder.orderType === 'DINE_IN' ? `🍽️ ناودوکان - مێزی ${selectedPrintOrder.tableNumber || 'دیاری نەکراو'}` : 'داواکاری ئاسایی'}
          </div>

          <div style={{ fontSize: '12px', marginBottom: '12px', borderBottom: '1px dashed #000', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontWeight: 'normal' }}>
              <span>ژمارەی داواکاری:</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>#{getNumericOrderId(selectedPrintOrder)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontWeight: 'normal' }}>
              <span>بەروار و کات:</span>
              <span>{new Date(selectedPrintOrder.timestamp).toLocaleString('ku-IQ')}</span>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '11px', borderBottom: '1px solid #000', paddingBottom: '3px', margin: '8px 0 8px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span>ناوی خواردن و قەبارە</span>
              <span>نرخ</span>
            </div>
            {(selectedPrintOrder.items || []).map((item, idx) => {
              const parts = (typeof item === 'string' ? item : String(item || '')).split(' - ');
              const name = parts[0];
              const price = parts[1] || '';
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px', fontSize: '14px', fontWeight: 'normal', borderBottom: '1px dotted #ccc', paddingBottom: '4px' }}>
                  <span style={{ textAlign: 'right', fontWeight: 'normal' }}>{name}</span>
                  {price && <span style={{ textAlign: 'left', fontWeight: 'normal', whiteSpace: 'nowrap' }}>{price}</span>}
                </div>
              );
            })}
          </div>

          {((selectedPrintOrder.discountAmount || 0) > 0 || (Number(customDeliveryFee) || 0) > 0) ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'normal', marginTop: '4px' }}>
              <span>کۆی خواردنەکان:</span>
              <span>{(selectedPrintOrder.total + (selectedPrintOrder.discountAmount || 0)).toLocaleString()} IQD</span>
            </div>
          ) : null}
          {selectedPrintOrder.discountAmount ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'normal', marginTop: '4px' }}>
              <span>داشکاندن ({selectedPrintOrder.promoCode}):</span>
              <span>-{selectedPrintOrder.discountAmount.toLocaleString()} IQD</span>
            </div>
          ) : null}
          {(Number(customDeliveryFee) || 0) > 0 ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'normal', marginTop: '4px' }}>
              <span>نرخی گەیاندن:</span>
              <span>+{(Number(customDeliveryFee) || 0).toLocaleString()} IQD</span>
            </div>
          ) : null}

          <div style={{ borderTop: '1.5px dashed #000', borderBottom: '1.5px dashed #000', padding: '8px 0', fontSize: '18px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', marginTop: '8px', marginBottom: '12px' }}>
            <span>کۆی گشتی:</span>
            <span>{(selectedPrintOrder.total + (Number(customDeliveryFee) || 0)).toLocaleString()} IQD</span>
          </div>

          {(selectedPrintOrder.customerName || selectedPrintOrder.customerPhone || selectedPrintOrder.manualAddress || selectedPrintOrder.customerNote) ? (
            <div style={{ marginTop: '15px', fontSize: '12px', border: '1px dashed #000', padding: '10px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px', borderBottom: '1px dashed #000', paddingBottom: '4px', fontSize: '13px' }}>👤 زانیاری کڕیار</div>
              {selectedPrintOrder.customerName ? <div style={{ marginBottom: '3px', fontWeight: 'normal' }}>ناو: {selectedPrintOrder.customerName}</div> : null}
              {selectedPrintOrder.customerPhone ? <div style={{ marginBottom: '3px', fontWeight: 'normal' }}>مۆبایل: {selectedPrintOrder.customerPhone}</div> : null}
              {selectedPrintOrder.manualAddress ? <div style={{ marginBottom: '3px', fontWeight: 'normal' }}>ناونیشان: {selectedPrintOrder.manualAddress}</div> : null}
              {selectedPrintOrder.customerNote ? <div style={{ marginTop: '5px', fontStyle: 'italic', borderTop: '1px dotted #000', paddingTop: '3px' }}>تێبینی کڕیار: {selectedPrintOrder.customerNote}</div> : null}
            </div>
          ) : null}

          <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '11px', fontWeight: 'normal', borderTop: '1px dashed #000', paddingTop: '10px' }}>
            سوپاس بۆ کڕینەکەتان! دیسان چاوەڕوانتانین.<br />
            <span style={{ fontSize: '9px', fontWeight: 'normal', fontFamily: 'monospace', display: 'block', marginTop: '4px' }}>Powered by Boom Fast App</span>
          </div>
        </div>
      )}

      <style>{`
        .input-admin { @apply p-5 bg-slate-50 rounded-[20px] border border-slate-100 outline-none focus:border-orange-500 focus:bg-white font-black text-slate-700 transition-all; } 
        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        @media print {
          .no-print-area {
            display: none !important;
          }
          .print-receipt-area {
            display: block !important;
            width: 100% !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 10px !important;
            background: #fff !important;
            color: #000 !important;
            font-family: 'Noto Sans Arabic', 'Inter', sans-serif !important;
            direction: rtl !important;
          }
          html, body {
            background-color: #fff !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
        @media screen {
          .print-receipt-area {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};