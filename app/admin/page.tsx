'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Main } from '@/components/main';
import { useTranslations } from '@/hooks/use-translations';

const roles = [
  { key: 'products', label: 'Products', icon: '📦' },
  { key: 'orders', label: 'Commandes', icon: '📋' },
  { key: 'clients', label: 'Clients', icon: '👥' },
  { key: 'categories', label: 'Categorie', icon: '📂' },
  { key: 'promos', label: 'Code Promo', icon: '🎫' },
  { key: 'users', label: 'Gestion des utilisateurs', icon: '⚙️' },
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
] as const;

type RoleKey = typeof roles[number]['key'];

export default function AdminPage() {
  const [activeRole, setActiveRole] = useState<RoleKey>('products');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Set default section based on logged-in user's role
  useEffect(() => {
    if (user?.role === 'product_manager') setActiveRole('products');
    else if (user?.role === 'gestion_commandes') setActiveRole('orders');
    else if (user?.role === 'super_admin') setActiveRole('dashboard');
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      router.push('/admin/login');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white" suppressHydrationWarning={true}>
      <Main>
        <div className="py-10" suppressHydrationWarning={true}>
          <div className="mb-8 flex justify-between items-center" suppressHydrationWarning={true}>
            <div suppressHydrationWarning={true}>
              <h1 className="text-4xl font-bold text-gray-900">لوحة التحكم</h1>
              <p className="text-gray-600 mt-2">مرحباً {user.username} - {getRoleLabel(user.role)}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>

          {/* Sidebar Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">القائمة الرئيسية</h2>
                <nav className="space-y-2">
                  {roles.filter(r => hasAccess(user.role, r.key)).map((r) => (
                    <button
                      key={r.key}
                      onClick={() => setActiveRole(r.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all duration-300 ${
                        activeRole === r.key
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{r.icon}</span>
                      <span className="font-medium">{r.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeRole === 'products' && hasAccess(user.role, 'products') && <ProductsManager />}
              {activeRole === 'orders' && hasAccess(user.role, 'orders') && <OrdersManager />}
              {activeRole === 'clients' && hasAccess(user.role, 'clients') && <ClientsManager />}
              {activeRole === 'categories' && hasAccess(user.role, 'categories') && <CategoryManager />}
              {activeRole === 'promos' && hasAccess(user.role, 'promos') && <PromoManager />}
              {activeRole === 'users' && hasAccess(user.role, 'users') && <UsersManager />}
              {activeRole === 'dashboard' && hasAccess(user.role, 'dashboard') && <SuperAdminDashboard />}
            </div>
          </div>
        </div>
      </Main>
    </div>
  );
}

// Helper functions
function getRoleLabel(role: string) {
  switch (role) {
    case 'product_manager': return 'مدير المنتجات';
    case 'gestion_commandes': return 'إدارة الطلبات';
    case 'super_admin': return 'المدير العام';
    default: return role;
  }
}

function hasAccess(userRole: string, section: string) {
  if (userRole === 'super_admin') return true;
  if (userRole === 'product_manager' && (section === 'products' || section === 'categories' || section === 'promos')) return true;
  if (userRole === 'gestion_commandes' && (section === 'orders' || section === 'clients')) return true;
  return false;
}

function ProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', ram: '', storage: '', graphics: '', os: '', processor: '', old_price: '', new_price: '', description: '', category_id: ''
  });
  const [mainImages, setMainImages] = useState<FileList | null>(null);
  const [optionalImages, setOptionalImages] = useState<FileList | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      // Ensure data is an array
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      setProducts([]); // Set empty array on error
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.new_price) {
      alert('يرجى تعبئة اسم المنتج والسعر الجديد على الأقل');
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value as any);
    });

    // Append main images
    if (mainImages) {
      Array.from(mainImages).forEach(file => {
        formDataToSend.append('mainImages', file);
      });
    }

    // Append optional images
    if (optionalImages) {
      Array.from(optionalImages).forEach(file => {
        formDataToSend.append('optionalImages', file);
      });
    }

    try {
      const url = editingId ? `http://localhost:5000/api/products/${editingId}` : 'http://localhost:5000/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        fetchProducts();
        setFormData({
          name: '', ram: '', storage: '', graphics: '', os: '', processor: '', old_price: '', new_price: '', description: '', category_id: ''
        });
        setMainImages(null);
        setOptionalImages(null);
        setEditingId(null);
        alert(editingId ? 'تم تحديث المنتج بنجاح' : 'تم إنشاء المنتج بنجاح');
      } else {
        let errorMessage = 'خطأ غير معروف';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || 'خطأ غير معروف';
        } catch (jsonError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(`خطأ في ${editingId ? 'تحديث' : 'إنشاء'} المنتج: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ في الاتصال';
      alert(`خطأ في ${editingId ? 'تحديث' : 'إنشاء'} المنتج: ${errorMessage}`);
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      ram: product.ram,
      storage: product.storage,
      graphics: product.graphics,
      os: product.os,
      processor: product.processor || '',
      old_price: product.old_price,
      new_price: product.new_price,
      description: product.description,
      category_id: product.category_id || ''
    });
    setEditingId(product.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchProducts();
    } catch (error) {
      // Handle error silently
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <React.Fragment>
      <section className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {editingId ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسم المنتج (English) <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الذاكرة (RAM)</label>
          <input
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
            placeholder="مثال: 16GB"
            value={formData.ram}
            onChange={(e) => setFormData({...formData, ram: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">التخزين</label>
          <input
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
            placeholder="مثال: 512GB SSD"
            value={formData.storage}
            onChange={(e) => setFormData({...formData, storage: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">كرت الشاشة</label>
          <input
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
            placeholder="مثال: NVIDIA GTX 1650"
            value={formData.graphics}
            onChange={(e) => setFormData({...formData, graphics: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">المعالج (Processor)</label>
          <input
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
            placeholder="مثال: Intel Core i5-1135G7"
            value={formData.processor}
            onChange={(e) => setFormData({...formData, processor: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">نظام التشغيل</label>
          <input
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
            placeholder="مثال: Windows 11"
            value={formData.os}
            onChange={(e) => setFormData({...formData, os: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الفئة <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
            value={formData.category_id}
            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
            required
          >
            <option value="">اختر الفئة</option>
            {categories.map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">السعر القديم</label>
          <input
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
            placeholder="0"
            type="number"
            min="0"
            value={formData.old_price}
            onChange={(e) => setFormData({...formData, old_price: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            السعر الجديد <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
            placeholder="0"
            type="number"
            min="0"
            value={formData.new_price}
            onChange={(e) => setFormData({...formData, new_price: e.target.value})}
            required
          />
        </div>
        {/* Main Images Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الصور الرئيسية</label>
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 hover:border-blue-400 transition-colors bg-blue-50">
            <input
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setMainImages(e.target.files)}
            />
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>الصور الرئيسية للمنتج (حد أقصى 3 صور)</span>
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {mainImages ? `تم اختيار ${mainImages.length} صور رئيسية` : 'لم يتم اختيار صور رئيسية'}
              </span>
            </div>
          </div>
          {/* Main Images Previews */}
          {mainImages && mainImages.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from(mainImages).map((file, idx) => (
                <div key={idx} className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-blue-200">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`main-preview-${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                    رئيسية {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optional Images Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الصور الاختيارية</label>
          <div className="border-2 border-dashed border-green-300 rounded-xl p-4 hover:border-green-400 transition-colors bg-green-50">
            <input
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setOptionalImages(e.target.files)}
            />
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>صور إضافية للتفاصيل (حد أقصى 5 صور)</span>
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                {optionalImages ? `تم اختيار ${optionalImages.length} صور اختيارية` : 'لم يتم اختيار صور اختيارية'}
              </span>
            </div>
          </div>
          {/* Optional Images Previews */}
          {optionalImages && optionalImages.length > 0 && (
            <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {Array.from(optionalImages).map((file, idx) => (
                <div key={idx} className="relative w-full aspect-square rounded-lg overflow-hidden border border-green-200">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`optional-preview-${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الوصف (English)</label>
          <textarea
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
            placeholder="Product description in English"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="md:col-span-2 flex gap-4">
          <button
            type="submit"
            className="bg-gradient-to-r from-[#6188a4] to-[#262a2f] text-white px-6 py-3 rounded-xl font-semibold flex-1"
          >
            {editingId ? 'تحديث المنتج' : 'حفظ المنتج'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  name: '', ram: '', storage: '', graphics: '', os: '', processor: '', old_price: '', new_price: '', description: '', category_id: ''
                });
              }}
              className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-right">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3">الاسم</th>
              <th className="px-4 py-3">السعر الجديد</th>
              <th className="px-4 py-3">المواصفات</th>
              <th className="px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(products) && products.map((product: any) => (
              <tr key={product.id} className="border-b">
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3">{product.new_price?.toLocaleString()} درهم</td>
                <td className="px-4 py-3 text-sm">
                  {product.ram} | {product.storage}
                </td>
                <td className="px-4 py-3 space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-amber-600 hover:underline"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:underline"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
    </React.Fragment>
  );
}

function OrdersManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      // Ensure data is an array
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchOrders();
    } catch (error) {
      // Handle error silently
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'en_attente': 'بانتظار التأكيد',
      'confirme': 'مؤكد',
      'declined': 'مرفوض',
      'en_cours': 'قيد التنفيذ',
      'livre': 'تم التوصيل',
      'retour': 'مرتجع'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'en_attente': 'bg-yellow-100 text-yellow-800',
      'confirme': 'bg-green-100 text-green-800',
      'declined': 'bg-red-100 text-red-800',
      'en_cours': 'bg-blue-100 text-blue-800',
      'livre': 'bg-purple-100 text-purple-800',
      'retour': 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">إدارة الطلبات</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-right">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3">رقم الطلب</th>
              <th className="px-4 py-3">العميل</th>
              <th className="px-4 py-3">المنتج</th>
              <th className="px-4 py-3">الهاتف</th>
              <th className="px-4 py-3">المدينة</th>
              <th className="px-4 py-3">طريقة الدفع</th>
              <th className="px-4 py-3">كود التخفيض</th>
              <th className="px-4 py-3">السعر النهائي</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">تحديث الحالة</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(orders) && orders.map((order: any) => (
              <tr key={order.id} className="border-b">
                <td className="px-4 py-3">#{order.id}</td>
                <td className="px-4 py-3">{order.full_name}</td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium">{order.product_name}</div>
                    {order.quantity && order.quantity > 1 && (
                      <div className="text-xs text-gray-500">الكمية: {order.quantity}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">{order.phone}</td>
                <td className="px-4 py-3">{order.city}</td>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">
                      {order.payment_method || 'غير محدد'}
                    </div>
                    {order.virement_discount > 0 && (
                      <div className="text-xs text-green-600">خصم: -{order.virement_discount} درهم</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    {order.code_promo ? (
                      <div>
                        <div className="text-sm font-medium text-blue-600">{order.code_promo}</div>
                        {order.promo_discount > 0 && (
                          <div className="text-xs text-green-600">خصم: -{order.promo_discount} درهم</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">لا يوجد</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    {order.final_price ? (
                      <div>
                        <div className="font-medium text-green-600">{order.final_price} درهم</div>
                        {order.original_price && order.original_price !== order.final_price && (
                          <div className="text-xs text-gray-500 line-through">{order.original_price} درهم</div>
                        )}
                        {order.discount_amount > 0 && (
                          <div className="text-xs text-green-600">وفر: {order.discount_amount} درهم</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">غير محدد</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {['confirme', 'declined', 'en_cours', 'livre', 'retour'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(order.id, status)}
                        className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-sm transition-colors"
                      >
                        {getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has super_admin role before fetching stats
    const userData = localStorage.getItem('adminUser');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role === 'super_admin') {
        fetchStats();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        setStats(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const cards = useMemo(() => {
    if (!stats) return [];
    return [
      { title: 'جميع المنتجات', value: stats.products },
      { title: 'جميع الطلبات', value: stats.orders },
      { title: 'جميع العملاء', value: stats.clients },
      { title: 'الطلبات المؤكدة', value: stats.confirmed },
      { title: 'الطلبات بانتظار التأكيد', value: stats.pending },
      { title: 'الطلبات المرفوضة', value: stats.declined },
      { title: 'قيد التنفيذ', value: stats.inProgress },
      { title: 'تم التوصيل', value: stats.delivered },
      { title: 'المرتجعات', value: stats.returned },
    ];
  }, [stats]);

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">غير متاح</h3>
          <p className="text-yellow-700">
            لا يمكن الوصول إلى الإحصائيات. تأكد من أن لديك صلاحيات المدير العام.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <div key={c.title} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <p className="text-gray-600 text-sm mb-2">{c.title}</p>
            <p className="text-3xl font-extrabold text-gray-900">{c.value?.toLocaleString() || 0}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">النشاط اللحظي</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
            <h4 className="font-semibold text-green-800 mb-2">الطلبات الجديدة اليوم</h4>
            <p className="text-2xl font-bold text-green-600">{stats?.pending || 0}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">الطلبات المكتملة</h4>
            <p className="text-2xl font-bold text-blue-600">{stats?.delivered || 0}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClientsManager() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/clients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">إدارة العملاء</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-right">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3">الاسم الكامل</th>
              <th className="px-4 py-3">البريد الإلكتروني</th>
              <th className="px-4 py-3">رقم الهاتف</th>
              <th className="px-4 py-3">المدينة</th>
              <th className="px-4 py-3">العنوان</th>
              <th className="px-4 py-3">عدد الطلبات</th>
              <th className="px-4 py-3">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(clients) && clients.map((client: any) => (
              <tr key={client.id} className="border-b">
                <td className="px-4 py-3">{client.full_name}</td>
                <td className="px-4 py-3">
                  {client.email ? (
                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-800">
                      {client.email}
                    </a>
                  ) : (
                    <span className="text-gray-400">غير متوفر</span>
                  )}
                </td>
                <td className="px-4 py-3">{client.phone_number}</td>
                <td className="px-4 py-3">{client.city}</td>
                <td className="px-4 py-3">{client.address}</td>
                <td className="px-4 py-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {client.total_orders || 0} طلب
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(client.created_at).toLocaleDateString('ar-DZ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            لا توجد عملاء مسجلين حالياً
          </div>
        )}
      </div>
    </section>
  );
}

function UsersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'product_manager'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      // Ensure data is an array
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      const url = editingUser
        ? `http://localhost:5000/api/users/${editingUser.id}`
        : 'http://localhost:5000/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchUsers();
        setFormData({ email: '', password: '', role: 'product_manager' });
        setEditingUser(null);
        setShowForm(false);
        alert(editingUser ? 'تم تحديث المستخدم بنجاح' : 'تم إنشاء المستخدم بنجاح');
      } else {
        const error = await response.json();
        alert(error.error || 'حدث خطأ');
      }
    } catch (error) {
      alert('حدث خطأ في الاتصال');
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.username,
      password: '',
      role: user.role
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchUsers();
        alert('تم حذف المستخدم بنجاح');
      } else {
        const error = await response.json();
        alert(error.error || 'حدث خطأ');
      }
    } catch (error) {
      alert('حدث خطأ في الاتصال');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'product_manager': return 'مدير المنتجات';
      case 'gestion_commandes': return 'إدارة الطلبات';
      case 'super_admin': return 'المدير العام';
      default: return role;
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingUser(null);
            setFormData({ email: '', password: '', role: 'product_manager' });
          }}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300"
        >
          إضافة مستخدم جديد
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">
            {editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور {editingUser ? '(اتركها فارغة للاحتفاظ بالحالية)' : '*'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required={!editingUser}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدور <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              >
                <option value="product_manager">مدير المنتجات</option>
                <option value="gestion_commandes">إدارة الطلبات</option>
                <option value="super_admin">المدير العام</option>
              </select>
            </div>
            <div className="flex gap-4 items-end">
              <button
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300"
              >
                {editingUser ? 'تحديث' : 'إضافة'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                  setFormData({ email: '', password: '', role: 'product_manager' });
                }}
                className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-right">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3">البريد الإلكتروني</th>
              <th className="px-4 py-3">الدور</th>
              <th className="px-4 py-3">تاريخ الإنشاء</th>
              <th className="px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(users) && users.map((user: any) => (
              <tr key={user.id} className="border-b">
                <td className="px-4 py-3">{user.username}</td>
                <td className="px-4 py-3">
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm">
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(user.created_at).toLocaleDateString('ar-DZ')}
                </td>
                <td className="px-4 py-3 space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-amber-600 hover:underline"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:underline"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            لا توجد مستخدمين مسجلين حالياً
          </div>
        )}
      </div>
    </section>
  );
}

function PromoManager() {
  const [promos, setPromos] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'percentage',
    value: '',
    applies_to: 'all',
    product_ids: [] as number[],
    commercial_name: '',
    is_active: true
  });

  useEffect(() => {
    fetchPromos();
    fetchProducts();
  }, []);

  const fetchPromos = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/promos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPromos(Array.isArray(data) ? data : []);
    } catch (error) {
      setPromos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      setProducts([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      const url = editingPromo ? `http://localhost:5000/api/promos/${editingPromo.id}` : 'http://localhost:5000/api/promos';
      const method = editingPromo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchPromos();
        setFormData({
          name: '', code: '', type: 'percentage', value: '', applies_to: 'all',
          product_ids: [], commercial_name: '', is_active: true
        });
        setShowForm(false);
        setEditingPromo(null);
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const handleEdit = (promo: any) => {
    setEditingPromo(promo);
    setFormData({
      name: promo.name,
      code: promo.code,
      type: promo.type,
      value: promo.value.toString(),
      applies_to: promo.applies_to,
      product_ids: promo.product_ids || [],
      commercial_name: promo.commercial_name || '',
      is_active: promo.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكود؟')) return;

    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`http://localhost:5000/api/promos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchPromos();
    } catch (error) {
      // Handle error silently
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`http://localhost:5000/api/promos/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !isActive })
      });
      fetchPromos();
    } catch (error) {
      // Handle error silently
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">إدارة أكواد الخصم</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-[#6188a4] to-[#262a2f] text-white px-4 py-2 rounded-xl font-semibold"
        >
          {showForm ? 'إلغاء' : 'إضافة كود جديد'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم الكود</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6188a4]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الكود</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6188a4]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع الخصم</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6188a4]"
              >
                <option value="percentage">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">قيمة الخصم</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6188a4]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم التاجر (اختياري)</label>
              <input
                type="text"
                value={formData.commercial_name}
                onChange={(e) => setFormData({...formData, commercial_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6188a4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ينطبق على</label>
              <select
                value={formData.applies_to}
                onChange={(e) => setFormData({...formData, applies_to: e.target.value, product_ids: []})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6188a4]"
              >
                <option value="all">جميع المنتجات</option>
                <option value="specific">منتجات محددة</option>
              </select>
            </div>
          </div>

          {formData.applies_to === 'specific' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">اختر المنتجات</label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                {products.map((product: any) => (
                  <label key={product.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.product_ids.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, product_ids: [...formData.product_ids, product.id]});
                        } else {
                          setFormData({...formData, product_ids: formData.product_ids.filter(id => id !== product.id)});
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{product.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-[#6188a4] to-[#262a2f] text-white px-6 py-2 rounded-lg font-semibold"
            >
              {editingPromo ? 'تحديث' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingPromo(null);
                setFormData({
                  name: '', code: '', type: 'percentage', value: '', applies_to: 'all',
                  product_ids: [], commercial_name: '', is_active: true
                });
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-right">اسم الكود</th>
              <th className="px-4 py-3 text-right">الكود</th>
              <th className="px-4 py-3 text-right">النوع</th>
              <th className="px-4 py-3 text-right">القيمة</th>
              <th className="px-4 py-3 text-right">ينطبق على</th>
              <th className="px-4 py-3 text-right">التاجر</th>
              <th className="px-4 py-3 text-right">الحالة</th>
              <th className="px-4 py-3 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(promos) && promos.map((promo: any) => (
              <tr key={promo.id} className="border-b">
                <td className="px-4 py-3">{promo.name}</td>
                <td className="px-4 py-3 font-mono bg-gray-100 rounded">{promo.code}</td>
                <td className="px-4 py-3">{promo.type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}</td>
                <td className="px-4 py-3">{promo.value}{promo.type === 'percentage' ? '%' : ' درهم'}</td>
                <td className="px-4 py-3">{promo.applies_to === 'all' ? 'جميع المنتجات' : 'منتجات محددة'}</td>
                <td className="px-4 py-3">{promo.commercial_name || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${promo.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {promo.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(promo)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => toggleActive(promo.id, promo.is_active)}
                      className={`px-3 py-1 rounded text-sm text-white ${promo.is_active ? 'bg-red-500' : 'bg-green-500'}`}
                    >
                      {promo.is_active ? 'إلغاء تفعيل' : 'تفعيل'}
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {promos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            لا توجد أكواد خصم حالياً
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      const url = editingCategory ? `http://localhost:5000/api/categories/${editingCategory.id}` : 'http://localhost:5000/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchCategories();
        setFormData({ name: '' });
        setShowForm(false);
        setEditingCategory(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'حدث خطأ في حفظ الفئة');
      }
    } catch (error) {
      alert('حدث خطأ في حفظ الفئة');
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchCategories();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'حدث خطأ في حذف الفئة');
      }
    } catch (error) {
      alert('حدث خطأ في حذف الفئة');
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">إدارة الفئات</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-[#6188a4] to-[#262a2f] text-white px-4 py-2 rounded-xl font-semibold"
        >
          {showForm ? 'إلغاء' : 'إضافة فئة جديدة'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم الفئة</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6188a4]"
                placeholder="مثال: أجهزة كمبيوتر محمولة"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-[#6188a4] to-[#262a2f] text-white px-6 py-2 rounded-lg font-semibold"
            >
              {editingCategory ? 'تحديث' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingCategory(null);
                setFormData({ name: '' });
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-right">الرقم</th>
              <th className="px-4 py-3 text-right">اسم الفئة</th>
              <th className="px-4 py-3 text-right">تاريخ الإنشاء</th>
              <th className="px-4 py-3 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(categories) && categories.map((category: any) => (
              <tr key={category.id} className="border-b">
                <td className="px-4 py-3">#{category.id}</td>
                <td className="px-4 py-3 font-semibold">{category.name}</td>
                <td className="px-4 py-3">{new Date(category.created_at).toLocaleDateString('ar-DZ')}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            لا توجد فئات حالياً
          </div>
        )}
      </div>
    </section>
  );
}

