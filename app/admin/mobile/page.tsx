'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Mobile-optimized admin dashboard
export default function MobileAdminPage() {
  const [user, setUser] = useState<any>(null);
  const [activeRole, setActiveRole] = useState('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const roles = [
    { key: 'products', label: 'المنتجات', icon: '📦' },
    { key: 'orders', label: 'الطلبات', icon: '📋' },
    { key: 'clients', label: 'العملاء', icon: '👥' },
    { key: 'categories', label: 'الفئات', icon: '📂' },
    { key: 'promos', label: 'أكواد الخصم', icon: '🎫' },
    { key: 'users', label: 'المستخدمين', icon: '⚙️' },
    { key: 'dashboard', label: 'الإحصائيات', icon: '📊' },
  ] as const;

  function hasAccess(userRole: string, section: string) {
    if (userRole === 'super_admin') return true;
    if (userRole === 'product_manager' && (section === 'products' || section === 'categories' || section === 'promos')) return true;
    if (userRole === 'gestion_commandes' && (section === 'orders' || section === 'clients')) return true;
    return false;
  }

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('dashboardVersion');
    router.push('/admin/login');
  };

  const switchToDesktop = () => {
    localStorage.setItem('dashboardVersion', 'desktop');
    router.push('/admin');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fdfefd] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6188a4] mx-auto mb-4"></div>
          <p className="text-[#adb8c1]">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfefd] flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b border-[#adb8c1]/20 px-3 sm:px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-[#262a2f] hover:bg-[#adb8c1]/10 transition-colors mr-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-[#262a2f]">لوحة التحكم</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={switchToDesktop}
            className="p-2 rounded-lg text-[#6188a4] hover:bg-[#6188a4]/10 transition-colors"
            title="التبديل إلى نسخة سطح المكتب"
          >
            🖥️
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            title="تسجيل الخروج"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white shadow-xl transform transition-transform duration-300 z-50 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 border-b border-[#adb8c1]/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#262a2f]">مرحباً، {user.email}</h2>
              <p className="text-sm text-[#adb8c1]">{user.role}</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-[#adb8c1] hover:bg-[#adb8c1]/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            {roles.filter(role => hasAccess(user.role, role.key)).map((role) => (
              <button
                key={role.key}
                onClick={() => {
                  setActiveRole(role.key);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center p-4 rounded-xl text-right transition-all duration-300 ${
                  activeRole === role.key
                    ? 'bg-gradient-to-r from-[#6188a4] to-[#262a2f] text-white shadow-lg'
                    : 'text-[#262a2f] hover:bg-[#adb8c1]/10'
                }`}
              >
                <span className="text-2xl ml-4">{role.icon}</span>
                <span className="font-semibold text-lg">{role.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 lg:p-6">
        <div className="max-w-full">
          {/* Active Role Header */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="text-3xl ml-3">
                {roles.find(r => r.key === activeRole)?.icon}
              </span>
              <h2 className="text-2xl font-bold text-[#262a2f]">
                {roles.find(r => r.key === activeRole)?.label}
              </h2>
            </div>
            <div className="h-1 bg-gradient-to-r from-[#6188a4] to-[#262a2f] rounded-full w-20"></div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#adb8c1]/20 p-3 sm:p-4 lg:p-6">
            {activeRole === 'products' && hasAccess(user.role, 'products') && <MobileProductsManager />}
            {activeRole === 'orders' && hasAccess(user.role, 'orders') && <MobileOrdersManager />}
            {activeRole === 'clients' && hasAccess(user.role, 'clients') && <MobileClientsManager />}
            {activeRole === 'categories' && hasAccess(user.role, 'categories') && <MobileCategoryManager />}
            {activeRole === 'promos' && hasAccess(user.role, 'promos') && <MobilePromoManager />}
            {activeRole === 'users' && hasAccess(user.role, 'users') && <MobileUsersManager />}
            {activeRole === 'dashboard' && hasAccess(user.role, 'dashboard') && <MobileDashboard />}
          </div>
        </div>
      </main>
    </div>
  );
}

// Mobile-optimized components
function MobileProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      setCategories([]);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6188a4] mx-auto mb-4"></div>
        <p className="text-[#adb8c1]">جاري تحميل المنتجات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg font-bold text-[#262a2f]">المنتجات ({products.length})</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-[#6188a4] to-[#262a2f] text-white px-4 py-2 rounded-xl font-semibold text-sm"
        >
          {showAddForm ? 'إلغاء' : '+ إضافة منتج'}
        </button>
      </div>

      {/* Add Product Form (Mobile Optimized) */}
      {showAddForm && (
        <div className="bg-[#fdfefd] border border-[#adb8c1]/20 rounded-xl p-4">
          <h4 className="font-semibold text-[#262a2f] mb-3">إضافة منتج جديد</h4>
          <p className="text-sm text-[#adb8c1] mb-4">للحصول على تجربة أفضل في إضافة المنتجات، يُنصح بالتبديل إلى نسخة سطح المكتب</p>
          <button
            onClick={() => {
              localStorage.setItem('dashboardVersion', 'desktop');
              window.location.href = '/admin';
            }}
            className="w-full bg-[#6188a4] text-white py-3 rounded-lg font-semibold"
          >
            🖥️ التبديل إلى نسخة سطح المكتب
          </button>
        </div>
      )}

      {/* Products Grid (Mobile Optimized) */}
      <div className="space-y-3">
        {products.length === 0 ? (
          <div className="text-center py-8 text-[#adb8c1]">
            لا توجد منتجات حالياً
          </div>
        ) : (
          products.map((product: any) => (
            <div key={product.id} className="bg-[#fdfefd] border border-[#adb8c1]/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                {/* Product Image */}
                <div className="w-16 h-16 bg-[#adb8c1]/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000${product.images[0]}`}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-[#adb8c1] text-xl">📦</span>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#262a2f] text-sm leading-tight mb-1 truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-[#6188a4]">
                      {product.new_price?.toLocaleString()} درهم
                    </span>
                    {product.old_price && product.old_price > product.new_price && (
                      <span className="text-xs text-[#adb8c1] line-through">
                        {product.old_price.toLocaleString()} درهم
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 text-xs">
                    <span className="bg-[#6188a4]/10 text-[#6188a4] px-2 py-1 rounded">
                      {product.ram}
                    </span>
                    <span className="bg-[#6188a4]/10 text-[#6188a4] px-2 py-1 rounded">
                      {product.storage}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MobileOrdersManager() {
  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold text-[#262a2f] mb-2">إدارة الطلبات</h3>
      <p className="text-[#adb8c1]">قريباً - النسخة المحمولة لإدارة الطلبات</p>
    </div>
  );
}

function MobileClientsManager() {
  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold text-[#262a2f] mb-2">إدارة العملاء</h3>
      <p className="text-[#adb8c1]">قريباً - النسخة المحمولة لإدارة العملاء</p>
    </div>
  );
}

function MobileCategoryManager() {
  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold text-[#262a2f] mb-2">إدارة الفئات</h3>
      <p className="text-[#adb8c1]">قريباً - النسخة المحمولة لإدارة الفئات</p>
    </div>
  );
}

function MobilePromoManager() {
  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold text-[#262a2f] mb-2">إدارة أكواد الخصم</h3>
      <p className="text-[#adb8c1]">قريباً - النسخة المحمولة لإدارة أكواد الخصم</p>
    </div>
  );
}

function MobileUsersManager() {
  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold text-[#262a2f] mb-2">إدارة المستخدمين</h3>
      <p className="text-[#adb8c1]">قريباً - النسخة المحمولة لإدارة المستخدمين</p>
    </div>
  );
}

function MobileDashboard() {
  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold text-[#262a2f] mb-2">لوحة الإحصائيات</h3>
      <p className="text-[#adb8c1]">قريباً - النسخة المحمولة للإحصائيات</p>
    </div>
  );
}
