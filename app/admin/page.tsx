'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Main } from '@/components/main';
import { useTranslations } from '@/hooks/use-translations';

const roles = [
  { key: 'products', label: 'Products', icon: '📦' },
  { key: 'orders', label: 'Commandes', icon: '📋' },
  { key: 'clients', label: 'Clients', icon: '👥' },
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
  if (userRole === 'product_manager' && section === 'products') return true;
  if (userRole === 'gestion_commandes' && (section === 'orders' || section === 'clients')) return true;
  return false;
}

function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', ram: '', storage: '', graphics: '', os: '', processor: '', old_price: '', new_price: '', description: ''
  });
  const [mainImages, setMainImages] = useState<FileList | null>(null);
  const [optionalImages, setOptionalImages] = useState<FileList | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
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
          name: '', ram: '', storage: '', graphics: '', os: '', processor: '', old_price: '', new_price: '', description: ''
        });
        setMainImages(null);
        setOptionalImages(null);
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error saving product:', error);
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
      description: product.description
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
      console.error('Error deleting product:', error);
    }
  };
  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
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
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold flex-1"
          >
            {editingId ? 'تحديث المنتج' : 'حفظ المنتج'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  name: '', ram: '', storage: '', graphics: '', os: '', processor: '', old_price: '', new_price: '', description: ''
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
            {products.map((product: any) => (
              <tr key={product.id} className="border-b">
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3">{product.new_price?.toLocaleString()} دج</td>
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
  );
}

function OrdersManager() {
  const [orders, setOrders] = useState([]);
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
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
      console.error('Error updating order status:', error);
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
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">تحديث الحالة</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id} className="border-b">
                <td className="px-4 py-3">#{order.id}</td>
                <td className="px-4 py-3">{order.full_name}</td>
                <td className="px-4 py-3">{order.product_name}</td>
                <td className="px-4 py-3">{order.phone}</td>
                <td className="px-4 py-3">{order.city}</td>
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
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
  const [clients, setClients] = useState([]);
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
      console.error('Error fetching clients:', error);
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
              <th className="px-4 py-3">رقم الهاتف</th>
              <th className="px-4 py-3">المدينة</th>
              <th className="px-4 py-3">العنوان</th>
              <th className="px-4 py-3">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client: any) => (
              <tr key={client.id} className="border-b">
                <td className="px-4 py-3">{client.full_name}</td>
                <td className="px-4 py-3">{client.phone_number}</td>
                <td className="px-4 py-3">{client.city}</td>
                <td className="px-4 py-3">{client.address}</td>
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
  const [users, setUsers] = useState([]);
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
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
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
      console.error('Error saving user:', error);
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
      console.error('Error deleting user:', error);
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
            {users.map((user: any) => (
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

