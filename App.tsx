import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { NotificationsModal } from './components/common/NotificationsModal';
import { AuthModal } from './components/common/AuthModal';
import { LocationPickerModal } from './components/common/LocationPickerModal';
import { DriverOrderRequestModal } from './components/driver/DriverOrderRequestModal';

// Customer Components
import { CustomerHome } from './components/customer/CustomerHome';
import { RestaurantDetail } from './components/customer/RestaurantDetail';
import { CustomerOrders } from './components/customer/CustomerOrders';
import { OrderTracking } from './components/customer/OrderTracking';
import { CustomerAccount } from './components/customer/CustomerAccount';
import { CartView } from './components/customer/CartView';
import { CustomerBottomNav } from './components/customer/CustomerBottomNav';

// Restaurant Components
import { RestaurantDashboard } from './components/restaurant/RestaurantDashboard';
import { RestaurantOrders } from './components/restaurant/RestaurantOrders';
import { RestaurantMenu } from './components/restaurant/RestaurantMenu';
import { RestaurantAccount } from './components/restaurant/RestaurantAccount';
import { RestaurantBottomNav } from './components/restaurant/RestaurantBottomNav';

// Driver Components
import { DriverDashboard } from './components/driver/DriverDashboard';
import { DriverAvailableOrders } from './components/driver/DriverAvailableOrders';
import { DriverEarnings } from './components/driver/DriverEarnings';
import { DriverAccount } from './components/driver/DriverAccount';
import { DriverBottomNav } from './components/driver/DriverBottomNav';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminRestaurants } from './components/admin/AdminRestaurants';
import { AdminDrivers } from './components/admin/AdminDrivers';
import { AdminCustomers } from './components/admin/AdminCustomers';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminDeliveryZones } from './components/admin/AdminDeliveryZones';
import { AdminAds } from './components/admin/AdminAds';
import { AdminNavbar } from './components/admin/AdminNavbar';
import { AdPopupModal } from './components/common/AdPopupModal';

const MainLayout: React.FC = () => {
  const {
    currentRole,
    customerTab,
    selectedRestaurantId,
    activeOrderId,
    restaurantTab,
    driverTab,
    adminTab,
    isAuthModalOpen,
    setIsAuthModalOpen
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-800 antialiased selection:bg-orange-500 selection:text-white" dir="rtl">
      {/* Mobile-first simulated shell */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative shadow-2xl overflow-x-hidden">
        {/* Universal Top Header with Role Switcher & Address */}
        <Navbar onOpenNotifications={() => setIsNotifOpen(true)} />

        {/* Dynamic Role-Based View */}
        <main className="flex-1 overflow-y-auto">
          {/* 1. CUSTOMER ROLE */}
          {currentRole === 'CUSTOMER' && (
            <>
              {selectedRestaurantId ? (
                <RestaurantDetail />
              ) : customerTab === 'HOME' || customerTab === 'SEARCH' ? (
                <CustomerHome />
              ) : customerTab === 'ORDERS' ? (
                activeOrderId ? <OrderTracking /> : <CustomerOrders />
              ) : customerTab === 'ACCOUNT' ? (
                <CustomerAccount />
              ) : (
                <CustomerHome />
              )}
              <CustomerBottomNav />
            </>
          )}

          {/* 2. RESTAURANT ROLE */}
          {currentRole === 'RESTAURANT' && (
            <>
              {restaurantTab === 'DASHBOARD' && <RestaurantDashboard />}
              {restaurantTab === 'ORDERS' && <RestaurantOrders />}
              {restaurantTab === 'MENU' && <RestaurantMenu />}
              {restaurantTab === 'ACCOUNT' && <RestaurantAccount />}
              <RestaurantBottomNav />
            </>
          )}

          {/* 3. DELIVERY DRIVER ROLE */}
          {currentRole === 'DRIVER' && (
            <>
              {driverTab === 'HOME' && <DriverDashboard />}
              {driverTab === 'ORDERS' && <DriverAvailableOrders />}
              {driverTab === 'DELIVERIES' && <DriverDashboard />}
              {driverTab === 'EARNINGS' && <DriverEarnings />}
              {driverTab === 'ACCOUNT' && <DriverAccount />}
              <DriverBottomNav />
            </>
          )}

          {/* 4. SUPER ADMIN ROLE */}
          {currentRole === 'SUPER_ADMIN' && (
            <div className="p-4 pb-24">
              {adminTab === 'OVERVIEW' && <AdminDashboard />}
              {adminTab === 'RESTAURANTS' && <AdminRestaurants />}
              {adminTab === 'DRIVERS' && <AdminDrivers />}
              {adminTab === 'CUSTOMERS' && <AdminCustomers />}
              {adminTab === 'ORDERS' && <AdminOrders />}
              {adminTab === 'ZONES' && <AdminDeliveryZones />}
              {adminTab === 'ADS' && <AdminAds />}
              <AdminNavbar />
            </div>
          )}
        </main>

        {/* Global Modals */}
        <NotificationsModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        <LocationPickerModal />
        <AdPopupModal />
        <DriverOrderRequestModal />
        <CartView />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
