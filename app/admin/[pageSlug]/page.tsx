"use client";

import React, { useEffect, useMemo, useState } from "react";
import { redirect, useParams, useRouter } from "next/navigation";
import { Main } from "@/components/main";
import { useTranslations } from "@/hooks/use-translations";
import { API_BASE_URL } from "@/lib/config";
import { CurrencyConverter } from "@/lib/currency";
import { useCurrency } from "@/components/currency-context";
import { useCheckAdminSlugPage } from "@/hooks/use-check-admin-slug-page";

const roles = [
  { key: "products", label: "Products", icon: "📦" },
  { key: "accessoires", label: "Accessoires", icon: "🔧" },
  { key: "orders", label: "Commandes", icon: "📋" },
  { key: "clients", label: "Clients", icon: "👥" },
  { key: "categories", label: "Categorie", icon: "📂" },
  { key: "promos", label: "Code Promo", icon: "🎫" },
  { key: "reviews", label: "Reviews", icon: "⭐" },
  { key: "payment-methods", label: "طرق الدفع", icon: "💳" },
  { key: "users", label: "Gestion des utilisateurs", icon: "⚙️" },
  { key: "dashboard", label: "Dashboard", icon: "📊" },
] as const;

type RoleKey = (typeof roles)[number]["key"];

export default function AdminPage() {
  const [activeRole, setActiveRole] = useState<RoleKey>("products");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { loading: checking, isValid, pageSlug } = useCheckAdminSlugPage();
  const [pageSlugFormValue, setPageSlugFormValue] = useState(pageSlug);

  // Set default section based on logged-in user's role
  useEffect(() => {
    if (user?.role === "product_manager") setActiveRole("products");
    else if (user?.role === "gestion_commandes") setActiveRole("orders");
    else if (user?.role === "super_admin") setActiveRole("dashboard");
  }, [user]);

  useEffect(() => {
    setMounted(true);

    // Add a small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      const token = localStorage.getItem("adminToken");
      const userData = localStorage.getItem("adminUser");

      if (!token || !userData) {
        router.push(`/admin/${pageSlug}/login`);
        return;
      }

      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        router.push(`/admin/${pageSlug}/login`);
        return;
      }

      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
    }
    router.push(`/admin/${pageSlug}/login`);
  };

  const handleSubmitPageSlugFormValue = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (pageSlugFormValue === pageSlug) return;

    if (!pageSlugFormValue || !pageSlugFormValue.trim()) {
      alert("يرجى إدخال سلاگ صالح");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      alert("يرجى تسجيل الدخول أولاً");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/settings/admin-page`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ pageSlug: pageSlugFormValue }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        router.replace(`/admin/${data.pageSlug}`);
        alert(`✅ تم تحديث السلاگ: ${data.pageSlug}`);
      } else {
        alert("❌ فشل تحديث السلاگ");
      }
    } catch (error) {
      alert("❌ خطأ في الاتصال");
    }
  };

  if (!mounted || loading || checking || !isValid) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center"
        suppressHydrationWarning
      >
        <div className="text-center" suppressHydrationWarning>
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"
            suppressHydrationWarning
          ></div>
          <p className="mt-4 text-gray-600" suppressHydrationWarning>
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white"
      suppressHydrationWarning
    >
      <Main>
        <div className="py-10" suppressHydrationWarning>
          <div
            className="mb-8 flex justify-between items-center"
            suppressHydrationWarning
          >
            <div suppressHydrationWarning>
              <h1 className="text-4xl font-bold text-gray-900">لوحة التحكم</h1>
              <p className="text-gray-600 mt-2">
                مرحباً {user.username} - {getRoleLabel(user.role)}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>

          {/* Sidebar Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <form onSubmit={handleSubmitPageSlugFormValue} className="mb-4">
                <input
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                  placeholder="Product Name"
                  onChange={(e) => setPageSlugFormValue(e.target.value)}
                  value={pageSlugFormValue}
                  required
                />
              </form>
              <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  القائمة الرئيسية
                </h2>
                <nav className="space-y-1">
                  {roles
                    .filter((r) => hasAccess(user.role, r.key))
                    .map((r) => (
                      <button
                        key={r.key}
                        onClick={() => setActiveRole(r.key)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-right transition-all duration-300 text-sm ${
                          activeRole === r.key
                            ? "text-white shadow-lg"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        style={
                          activeRole === r.key
                            ? {
                                background:
                                  "linear-gradient(to right, #3a4956, #2a3440)",
                              }
                            : {}
                        }
                      >
                        <span className="text-base">{r.icon}</span>
                        <span className="font-medium">{r.label}</span>
                      </button>
                    ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-4">
              {activeRole === "products" &&
                hasAccess(user.role, "products") && <ProductsManager />}
              {activeRole === "accessoires" &&
                hasAccess(user.role, "accessoires") && <AccessoiresManager />}
              {activeRole === "orders" && hasAccess(user.role, "orders") && (
                <OrdersManager />
              )}
              {activeRole === "clients" && hasAccess(user.role, "clients") && (
                <ClientsManager />
              )}
              {activeRole === "categories" &&
                hasAccess(user.role, "categories") && <CategoryManager />}
              {activeRole === "promos" && hasAccess(user.role, "promos") && (
                <PromoManager />
              )}
              {activeRole === "reviews" && hasAccess(user.role, "reviews") && (
                <ReviewsManager />
              )}
              {activeRole === "payment-methods" &&
                hasAccess(user.role, "payment-methods") && (
                  <PaymentMethodsManager />
                )}
              {activeRole === "users" && hasAccess(user.role, "users") && (
                <UsersManager />
              )}
              {activeRole === "dashboard" &&
                hasAccess(user.role, "dashboard") && <SuperAdminDashboard />}
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
    case "product_manager":
      return "مدير المنتجات";
    case "gestion_commandes":
      return "إدارة الطلبات";
    case "super_admin":
      return "المدير العام";
    default:
      return role;
  }
}

function hasAccess(userRole: string, section: string) {
  if (userRole === "super_admin") return true;
  if (
    userRole === "product_manager" &&
    (section === "products" ||
      section === "accessoires" ||
      section === "categories" ||
      section === "promos" ||
      section === "reviews" ||
      section === "payment-methods")
  )
    return true;
  if (
    userRole === "gestion_commandes" &&
    (section === "orders" || section === "clients")
  )
    return true;
  return false;
}

function ProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    ram: "",
    storage: "",
    graphics: "",
    os: "",
    processor: "",
    old_price: "",
    new_price: "",
    description: "",
    category_id: "",
  });
  const [mainImages, setMainImages] = useState<FileList | null>(null);
  const [optionalImages, setOptionalImages] = useState<FileList | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [existingMainImages, setExistingMainImages] = useState<string[]>([]);
  const [existingOptionalImages, setExistingOptionalImages] = useState<
    string[]
  >([]);
  const { format } = useCurrency();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
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
      const response = await fetch(`${API_BASE_URL}/api/categories`);
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
      alert("يرجى تعبئة اسم المنتج والسعر الجديد على الأقل");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      alert("يرجى تسجيل الدخول أولاً");
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value as any);
    });

    // Append main images
    if (mainImages) {
      Array.from(mainImages).forEach((file) => {
        formDataToSend.append("mainImages", file);
      });
    } else if (editingId && existingMainImages.length > 0) {
      // Keep existing main images if no new ones are uploaded
      formDataToSend.append(
        "existing_main_images",
        JSON.stringify(existingMainImages),
      );
    }

    // Append optional images
    if (optionalImages) {
      Array.from(optionalImages).forEach((file) => {
        formDataToSend.append("optionalImages", file);
      });
    } else if (editingId && existingOptionalImages.length > 0) {
      // Keep existing optional images if no new ones are uploaded
      formDataToSend.append(
        "existing_optional_images",
        JSON.stringify(existingOptionalImages),
      );
    }

    try {
      const url = editingId
        ? `${API_BASE_URL}/api/products/${editingId}`
        : `${API_BASE_URL}/api/products`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        fetchProducts();
        setFormData({
          name: "",
          ram: "",
          storage: "",
          graphics: "",
          os: "",
          processor: "",
          old_price: "",
          new_price: "",
          description: "",
          category_id: "",
        });
        setMainImages(null);
        setOptionalImages(null);
        setEditingId(null);
        setExistingMainImages([]);
        setExistingOptionalImages([]);
        alert(editingId ? "تم تحديث المنتج بنجاح" : "تم إنشاء المنتج بنجاح");
      } else {
        let errorMessage = "خطأ غير معروف";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.error || errorData.message || "خطأ غير معروف";
        } catch (jsonError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(
          `خطأ في ${editingId ? "تحديث" : "إنشاء"} المنتج: ${errorMessage}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "خطأ في الاتصال";
      alert(`خطأ في ${editingId ? "تحديث" : "إنشاء"} المنتج: ${errorMessage}`);
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      ram: product.ram,
      storage: product.storage,
      graphics: product.graphics,
      os: product.os,
      processor: product.processor || "",
      old_price: product.old_price,
      new_price: product.new_price,
      description: product.description,
      category_id: product.category_id || "",
    });
    setEditingId(product.id);

    // Load existing images from the new structure (main_images and optional_images)
    // If those don't exist, fall back to the legacy images field
    let mainImgs = [];
    let optionalImgs = [];

    if (product.main_images && Array.isArray(product.main_images)) {
      mainImgs = product.main_images;
    } else if (product.images && Array.isArray(product.images)) {
      // Fallback: use first 3 images as main
      mainImgs = product.images.slice(0, 3);
    }

    if (product.optional_images && Array.isArray(product.optional_images)) {
      optionalImgs = product.optional_images;
    } else if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 3
    ) {
      // Fallback: use remaining images as optional
      optionalImgs = product.images.slice(3);
    }

    setExistingMainImages(mainImgs);
    setExistingOptionalImages(optionalImgs);

    // Clear new image selections
    setMainImages(null);
    setOptionalImages(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    const token = localStorage.getItem("adminToken");
    try {
      await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
          {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المنتج (English) <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
              placeholder="Product Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الذاكرة (RAM)
            </label>
            <input
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
              placeholder="مثال: 16GB"
              value={formData.ram}
              onChange={(e) =>
                setFormData({ ...formData, ram: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التخزين
            </label>
            <input
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
              placeholder="مثال: 512GB SSD"
              value={formData.storage}
              onChange={(e) =>
                setFormData({ ...formData, storage: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كرت الشاشة
            </label>
            <input
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
              placeholder="مثال: NVIDIA GTX 1650"
              value={formData.graphics}
              onChange={(e) =>
                setFormData({ ...formData, graphics: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المعالج (Processor)
            </label>
            <input
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
              placeholder="مثال: Intel Core i5-1135G7"
              value={formData.processor}
              onChange={(e) =>
                setFormData({ ...formData, processor: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نظام التشغيل
            </label>
            <input
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
              placeholder="مثال: Windows 11"
              value={formData.os}
              onChange={(e) => setFormData({ ...formData, os: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الفئة <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              السعر القديم
            </label>
            <input
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300"
              style={{ "--tw-ring-color": "#3a4956" } as any}
              placeholder="0"
              type="number"
              min="0"
              value={formData.old_price}
              onChange={(e) =>
                setFormData({ ...formData, old_price: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              السعر الجديد <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300"
              style={{ "--tw-ring-color": "#3a4956" } as any}
              placeholder="0"
              type="number"
              min="0"
              value={formData.new_price}
              onChange={(e) =>
                setFormData({ ...formData, new_price: e.target.value })
              }
              required
            />
          </div>
          {/* Main Images Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الصور الرئيسية
            </label>

            {/* Existing Main Images */}
            {editingId && existingMainImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">الصور الحالية:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {existingMainImages.map((image, idx) => (
                    <div
                      key={idx}
                      className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-blue-200"
                    >
                      <img
                        src={`${API_BASE_URL}${image}`}
                        alt={`existing-main-${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                        رئيسية {idx + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setExistingMainImages((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  يمكنك حذف الصور الحالية أو رفع صور جديدة لاستبدالها
                </p>
              </div>
            )}

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
                  {mainImages
                    ? `تم اختيار ${mainImages.length} صور رئيسية`
                    : "لم يتم اختيار صور رئيسية"}
                </span>
              </div>
            </div>
            {/* Main Images Previews */}
            {mainImages && mainImages.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from(mainImages).map((file, idx) => (
                  <div
                    key={idx}
                    className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-blue-200"
                  >
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الصور الاختيارية
            </label>

            {/* Existing Optional Images */}
            {editingId && existingOptionalImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  الصور الاختيارية الحالية:
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                  {existingOptionalImages.map((image, idx) => (
                    <div
                      key={idx}
                      className="relative w-full aspect-square rounded-lg overflow-hidden border border-green-200"
                    >
                      <img
                        src={`${API_BASE_URL}${image}`}
                        alt={`existing-optional-${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded-br">
                        {idx + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setExistingOptionalImages((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                        className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 py-0.5 rounded-bl hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  يمكنك حذف الصور الحالية أو رفع صور جديدة لاستبدالها
                </p>
              </div>
            )}

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
                  {optionalImages
                    ? `تم اختيار ${optionalImages.length} صور اختيارية`
                    : "لم يتم اختيار صور اختيارية"}
                </span>
              </div>
            </div>
            {/* Optional Images Previews */}
            {optionalImages && optionalImages.length > 0 && (
              <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {Array.from(optionalImages).map((file, idx) => (
                  <div
                    key={idx}
                    className="relative w-full aspect-square rounded-lg overflow-hidden border border-green-200"
                  >
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف (English)
            </label>
            <textarea
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
              placeholder="Product description in English"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2 flex gap-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-[#6188a4] to-[#262a2f] text-white px-6 py-3 rounded-xl font-semibold flex-1"
            >
              {editingId ? "تحديث المنتج" : "حفظ المنتج"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    name: "",
                    ram: "",
                    storage: "",
                    graphics: "",
                    os: "",
                    processor: "",
                    old_price: "",
                    new_price: "",
                    description: "",
                    category_id: "",
                  });
                  setMainImages(null);
                  setOptionalImages(null);
                  setExistingMainImages([]);
                  setExistingOptionalImages([]);
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
              {Array.isArray(products) &&
                products.map((product: any) => (
                  <tr key={product.id} className="border-b">
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">
                      {format(product.new_price || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {product.ram} | {product.storage}
                    </td>
                    <td className="px-4 py-3 space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleEdit(product)}
                        className="hover:underline"
                        style={{ color: "#3a4956" }}
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: "all",
    dateFrom: "",
    dateTo: "",
    promoCode: "all",
  });
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchPromoCodes();
  }, [pagination.page, filters]);

  const sendFacture = async (order: any) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${order.id}/facture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();

      if (result.success) {
        alert("✅ " + result.message);
      } else {
        alert("❌ " + result.message);
      }
    } catch (error) {
      alert("❌ فشل في إرسال الفاتورة. يرجى المحاولة مرة أخرى!");
      console.error(error);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      dateFrom: "",
      dateTo: "",
      promoCode: "all",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.promoCode !== "all" && { promoCode: filters.promoCode }),
      });

      const response = await fetch(
        `${API_BASE_URL}/api/orders?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (data.orders) {
        setOrders(data.orders);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      } else {
        setOrders([]);
      }
    } catch (error) {
      setOrders([]);
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/orders/promo-codes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPromoCodes(Array.isArray(data) ? data : []);
    } catch (error) {
      setPromoCodes([]);
      console.error("Error fetching promo codes:", error);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    if (updatingStatus === orderId) return; // Prevent multiple clicks

    setUpdatingStatus(orderId);

    // Store original status for potential revert
    const originalOrder = orders.find((order) => order.id === orderId);
    const originalStatus = originalOrder?.status;

    // Optimistically update the UI first
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        // Revert the optimistic update on error
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: originalStatus } : order,
          ),
        );
        alert("فشل في تحديث حالة الطلب");
      }
    } catch (error) {
      // Revert the optimistic update on error
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: originalStatus } : order,
        ),
      );
      alert("فشل في تحديث حالة الطلب");
      console.error(error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      en_attente: "بانتظار التأكيد",
      confirme: "مؤكد",
      declined: "مرفوض",
      en_cours: "قيد التنفيذ",
      livre: "تم التوصيل",
      retour: "مرتجع",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      en_attente: "bg-slate-100 text-slate-800",
      confirme: "bg-green-100 text-green-800",
      declined: "bg-red-100 text-red-800",
      en_cours: "bg-blue-100 text-blue-800",
      livre: "bg-purple-100 text-purple-800",
      retour: "bg-gray-100 text-gray-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h2>
        <div className="text-sm text-gray-600">
          المجموع: {pagination.total} طلب | الصفحة {pagination.page} من{" "}
          {pagination.totalPages}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="en_attente">بانتظار التأكيد</option>
              <option value="confirme">مؤكد</option>
              <option value="declined">مرفوض</option>
              <option value="en_cours">قيد التنفيذ</option>
              <option value="livre">تم التوصيل</option>
              <option value="retour">مرتجع</option>
            </select>
          </div>

          {/* Date From Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              من تاريخ
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date To Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Promo Code Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كود التخفيض
            </label>
            <select
              value={filters.promoCode}
              onChange={(e) => handleFilterChange("promoCode", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الأكواد</option>
              {promoCodes.map((promo) => (
                <option key={promo.code} value={promo.code}>
                  {promo.code} ({promo.usage_count} استخدام)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            مسح الفلاتر
          </button>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            تحديث
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-2 py-3 font-semibold text-xs w-16">
                رقم الطلب
              </th>
              <th className="px-2 py-3 font-semibold text-xs w-24">العميل</th>
              <th className="px-2 py-3 font-semibold text-xs w-32">المنتج</th>
              <th className="px-2 py-3 font-semibold text-xs w-20">الهاتف</th>
              <th className="px-2 py-3 font-semibold text-xs w-16">المدينة</th>
              <th className="px-2 py-3 font-semibold text-xs w-20">
                طريقة الدفع
              </th>
              <th className="px-2 py-3 font-semibold text-xs w-16">
                كود التخفيض
              </th>
              <th className="px-2 py-3 font-semibold text-xs w-20">
                السعر النهائي
              </th>
              <th className="px-2 py-3 font-semibold text-xs w-20">الحالة</th>
              <th className="px-2 py-3 font-semibold text-xs w-24">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(orders) && orders.length > 0 ? (
              orders.map((order: any) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2">
                    <span className="font-mono text-blue-600 text-xs">
                      #{order.id}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <div
                      className="font-medium text-xs truncate max-w-24"
                      title={order.full_name}
                    >
                      {order.full_name}
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <div
                      className="font-medium text-xs truncate max-w-32"
                      title={order.product_name}
                    >
                      {order.product_name}
                    </div>
                    {order.quantity && order.quantity > 1 && (
                      <div className="text-xs text-gray-500">
                        ×{order.quantity}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <span className="font-mono text-xs">{order.phone}</span>
                  </td>
                  <td className="px-2 py-2">
                    <span className="text-xs">{order.city}</span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="text-xs">
                      {order.payment_method || "غير محدد"}
                      {order.virement_discount > 0 && (
                        <div className="text-green-600">
                          -{order.virement_discount}د
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    {order.code_promo ? (
                      <div>
                        <div className="text-xs font-medium text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
                          {order.code_promo}
                        </div>
                        {order.promo_discount > 0 && (
                          <div className="text-xs text-green-600">
                            -{order.promo_discount}د
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <div className="font-bold text-green-600 text-xs">
                      {CurrencyConverter.format(
                        order.final_price,
                        order.currency || "DH",
                        "ar",
                      )}
                    </div>
                    {order.original_price &&
                      order.original_price !== order.final_price && (
                        <div className="text-xs text-gray-500 line-through">
                          {CurrencyConverter.format(
                            order.original_price,
                            order.currency || "DH",
                            "ar",
                          )}
                        </div>
                      )}
                  </td>
                  <td className="px-2 py-2">
                    <div className="space-y-1">
                      <span
                        className={`px-1 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                      {order.status.toLowerCase() === "livre" && (
                        <button
                          onClick={() => sendFacture(order)}
                          className="block w-full px-1 py-0.5 rounded bg-green-500 text-white text-xs hover:bg-green-600 transition-colors"
                        >
                          📄 فاتورة
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <div className="grid grid-cols-2 gap-0.5">
                      {[
                        "confirme",
                        "declined",
                        "en_cours",
                        "livre",
                        "retour",
                      ].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order.id, status)}
                          className={`px-1 py-0.5 rounded text-xs transition-colors ${
                            order.status === status
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          } ${updatingStatus === order.id ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={
                            order.status === status ||
                            updatingStatus === order.id
                          }
                          title={getStatusLabel(status)}
                        >
                          {updatingStatus === order.id &&
                          order.status === status ? (
                            <div className="flex items-center justify-center">
                              <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            getStatusLabel(status).substring(0, 3)
                          )}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-8 text-center text-gray-500"
                >
                  لا توجد طلبات تطابق المعايير المحددة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            عرض {(pagination.page - 1) * pagination.limit + 1} إلى{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} من{" "}
            {pagination.total} طلب
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              السابق
            </button>

            <div className="flex space-x-1 space-x-reverse">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 border rounded-md ${
                        pagination.page === pageNum
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                },
              )}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Add a small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      // Check if user has super_admin role before fetching stats
      const userData = localStorage.getItem("adminUser");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role === "super_admin") {
          fetchStats();
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      { title: "جميع المنتجات", value: stats.products },
      { title: "جميع الطلبات", value: stats.orders },
      { title: "جميع العملاء", value: stats.clients },
      { title: "الطلبات المؤكدة", value: stats.confirmed },
      { title: "الطلبات بانتظار التأكيد", value: stats.pending },
      { title: "الطلبات المرفوضة", value: stats.declined },
      { title: "قيد التنفيذ", value: stats.inProgress },
      { title: "تم التوصيل", value: stats.delivered },
      { title: "المرتجعات", value: stats.returned },
    ];
  }, [stats]);

  if (!mounted || loading) {
    return (
      <div className="text-center py-8" suppressHydrationWarning>
        جاري التحميل...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            غير متاح
          </h3>
          <p className="text-slate-700">
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
          <div
            key={c.title}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <p className="text-gray-600 text-sm mb-2">{c.title}</p>
            <p className="text-3xl font-extrabold text-gray-900">
              {c.value?.toLocaleString() || 0}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">النشاط اللحظي</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
            <h4 className="font-semibold text-green-800 mb-2">
              الطلبات الجديدة اليوم
            </h4>
            <p className="text-2xl font-bold text-green-600">
              {stats?.pending || 0}
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">
              الطلبات المكتملة
            </h4>
            <p className="text-2xl font-bold text-blue-600">
              {stats?.delivered || 0}
            </p>
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
      const response = await fetch(`${API_BASE_URL}/api/clients`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
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
            {Array.isArray(clients) &&
              clients.map((client: any) => (
                <tr key={client.id} className="border-b">
                  <td className="px-4 py-3">{client.full_name}</td>
                  <td className="px-4 py-3">
                    {client.email ? (
                      <a
                        href={`mailto:${client.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
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
                    {new Date(client.created_at).toLocaleDateString("ar-DZ")}
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
    email: "",
    password: "",
    role: "product_manager",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
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
    const token = localStorage.getItem("adminToken");

    try {
      const url = editingUser
        ? `${API_BASE_URL}/api/users/${editingUser.id}`
        : `${API_BASE_URL}/api/users`;
      const method = editingUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchUsers();
        setFormData({ email: "", password: "", role: "product_manager" });
        setEditingUser(null);
        setShowForm(false);
        alert(
          editingUser ? "تم تحديث المستخدم بنجاح" : "تم إنشاء المستخدم بنجاح",
        );
      } else {
        const error = await response.json();
        alert(error.error || "حدث خطأ");
      }
    } catch (error) {
      alert("حدث خطأ في الاتصال");
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.username,
      password: "",
      role: user.role,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchUsers();
        alert("تم حذف المستخدم بنجاح");
      } else {
        const error = await response.json();
        alert(error.error || "حدث خطأ");
      }
    } catch (error) {
      alert("حدث خطأ في الاتصال");
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "product_manager":
        return "مدير المنتجات";
      case "gestion_commandes":
        return "إدارة الطلبات";
      case "super_admin":
        return "المدير العام";
      default:
        return role;
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
            setFormData({ email: "", password: "", role: "product_manager" });
          }}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300"
        >
          إضافة مستخدم جديد
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">
            {editingUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور{" "}
                {editingUser ? "(اتركها فارغة للاحتفاظ بالحالية)" : "*"}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
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
                {editingUser ? "تحديث" : "إضافة"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                  setFormData({
                    email: "",
                    password: "",
                    role: "product_manager",
                  });
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
            {Array.isArray(users) &&
              users.map((user: any) => (
                <tr key={user.id} className="border-b">
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3">
                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm">
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(user.created_at).toLocaleDateString("ar-DZ")}
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
    name: "",
    code: "",
    type: "percentage",
    value: "",
    applies_to: "all",
    product_ids: [] as number[],
    commercial_name: "",
    is_active: true,
  });

  useEffect(() => {
    fetchPromos();
    fetchProducts();
  }, []);

  const fetchPromos = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/promos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      setProducts([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");

    try {
      const url = editingPromo
        ? `${API_BASE_URL}/api/promos/${editingPromo.id}`
        : `${API_BASE_URL}/api/promos`;
      const method = editingPromo ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchPromos();
        setFormData({
          name: "",
          code: "",
          type: "percentage",
          value: "",
          applies_to: "all",
          product_ids: [],
          commercial_name: "",
          is_active: true,
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
      commercial_name: promo.commercial_name || "",
      is_active: promo.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكود؟")) return;

    const token = localStorage.getItem("adminToken");
    try {
      await fetch(`${API_BASE_URL}/api/promos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchPromos();
    } catch (error) {
      // Handle error silently
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    const token = localStorage.getItem("adminToken");
    try {
      await fetch(`${API_BASE_URL}/api/promos/${id}/toggle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !isActive }),
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
          {showForm ? "إلغاء" : "إضافة كود جديد"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 rounded-xl p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الكود
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6188a4]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الكود
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6188a4]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الخصم
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6188a4]"
              >
                <option value="percentage">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                قيمة الخصم
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6188a4]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم التاجر (اختياري)
              </label>
              <input
                type="text"
                value={formData.commercial_name}
                onChange={(e) =>
                  setFormData({ ...formData, commercial_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6188a4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ينطبق على
              </label>
              <select
                value={formData.applies_to}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applies_to: e.target.value,
                    product_ids: [],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6188a4]"
              >
                <option value="all">جميع المنتجات</option>
                <option value="specific">منتجات محددة</option>
              </select>
            </div>
          </div>

          {formData.applies_to === "specific" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختر المنتجات
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                {products.map((product: any) => (
                  <label
                    key={product.id}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={formData.product_ids.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            product_ids: [...formData.product_ids, product.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            product_ids: formData.product_ids.filter(
                              (id) => id !== product.id,
                            ),
                          });
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
              {editingPromo ? "تحديث" : "حفظ"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingPromo(null);
                setFormData({
                  name: "",
                  code: "",
                  type: "percentage",
                  value: "",
                  applies_to: "all",
                  product_ids: [],
                  commercial_name: "",
                  is_active: true,
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
            {Array.isArray(promos) &&
              promos.map((promo: any) => (
                <tr key={promo.id} className="border-b">
                  <td className="px-4 py-3">{promo.name}</td>
                  <td className="px-4 py-3 font-mono bg-gray-100 rounded">
                    {promo.code}
                  </td>
                  <td className="px-4 py-3">
                    {promo.type === "percentage" ? "نسبة مئوية" : "مبلغ ثابت"}
                  </td>
                  <td className="px-4 py-3">
                    {promo.value}
                    {promo.type === "percentage" ? "%" : " درهم"}
                  </td>
                  <td className="px-4 py-3">
                    {promo.applies_to === "all"
                      ? "جميع المنتجات"
                      : "منتجات محددة"}
                  </td>
                  <td className="px-4 py-3">{promo.commercial_name || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${promo.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {promo.is_active ? "نشط" : "غير نشط"}
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
                        className={`px-3 py-1 rounded text-sm text-white ${promo.is_active ? "bg-red-500" : "bg-green-500"}`}
                      >
                        {promo.is_active ? "إلغاء تفعيل" : "تفعيل"}
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
    name: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
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
    const token = localStorage.getItem("adminToken");

    try {
      const url = editingCategory
        ? `${API_BASE_URL}/api/categories/${editingCategory.id}`
        : `${API_BASE_URL}/api/categories`;
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchCategories();
        setFormData({ name: "" });
        setShowForm(false);
        setEditingCategory(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "حدث خطأ في حفظ الفئة");
      }
    } catch (error) {
      alert("حدث خطأ في حفظ الفئة");
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفئة؟")) return;

    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchCategories();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "حدث خطأ في حذف الفئة");
      }
    } catch (error) {
      alert("حدث خطأ في حذف الفئة");
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
          {showForm ? "إلغاء" : "إضافة فئة جديدة"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 rounded-xl p-6 mb-6"
        >
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الفئة
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
              {editingCategory ? "تحديث" : "حفظ"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingCategory(null);
                setFormData({ name: "" });
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
            {Array.isArray(categories) &&
              categories.map((category: any) => (
                <tr key={category.id} className="border-b">
                  <td className="px-4 py-3">#{category.id}</td>
                  <td className="px-4 py-3 font-semibold">{category.name}</td>
                  <td className="px-4 py-3">
                    {new Date(category.created_at).toLocaleDateString("ar-DZ")}
                  </td>
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

// Payment Methods Manager Component
function PaymentMethodsManager() {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    name_en: "",
    name_fr: "",
    name_es: "",
    description: "",
    description_ar: "",
    description_en: "",
    description_fr: "",
    description_es: "",
    discount_amount: 0,
    discount_type: "fixed" as "fixed" | "percentage",
    is_active: true,
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${API_BASE_URL}/api/admin/payment-methods`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch (error) {
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const url = editingMethod
        ? `${API_BASE_URL}/api/admin/payment-methods/${editingMethod.id}`
        : `${API_BASE_URL}/api/admin/payment-methods`;

      const response = await fetch(url, {
        method: editingMethod ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchPaymentMethods();
        setShowForm(false);
        setEditingMethod(null);
        setFormData({
          name: "",
          name_ar: "",
          name_en: "",
          name_fr: "",
          name_es: "",
          description: "",
          description_ar: "",
          description_en: "",
          description_fr: "",
          description_es: "",
          discount_amount: 0,
          discount_type: "fixed",
          is_active: true,
        });
      }
    } catch (error) {
      console.error("Error saving payment method:", error);
    }
  };

  const handleEdit = (method: any) => {
    setEditingMethod(method);
    setFormData(method);
    setShowForm(true);
  };

  const handleToggle = async (id: number, is_active: boolean) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${API_BASE_URL}/api/admin/payment-methods/${id}/toggle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active }),
      });
      fetchPaymentMethods();
    } catch (error) {
      console.error("Error toggling payment method:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف طريقة الدفع هذه؟")) {
      try {
        const token = localStorage.getItem("adminToken");
        await fetch(`${API_BASE_URL}/api/admin/payment-methods/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchPaymentMethods();
      } catch (error) {
        console.error("Error deleting payment method:", error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">إدارة طرق الدفع</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors"
        >
          إضافة طريقة دفع جديدة
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border rounded-xl bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {editingMethod ? "تعديل طريقة الدفع" : "إضافة طريقة دفع جديدة"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="الاسم"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="الاسم بالعربية"
                value={formData.name_ar}
                onChange={(e) =>
                  setFormData({ ...formData, name_ar: e.target.value })
                }
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="الاسم بالإنجليزية"
                value={formData.name_en}
                onChange={(e) =>
                  setFormData({ ...formData, name_en: e.target.value })
                }
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="number"
                placeholder="مبلغ الخصم"
                value={formData.discount_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={formData.discount_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_type: e.target.value as "fixed" | "percentage",
                  })
                }
                className="border rounded px-3 py-2"
              >
                <option value="fixed">مبلغ ثابت</option>
                <option value="percentage">نسبة مئوية</option>
              </select>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="mr-2"
                />
                نشط
              </label>
            </div>
            <textarea
              placeholder="الوصف بالعربية"
              value={formData.description_ar}
              onChange={(e) =>
                setFormData({ ...formData, description_ar: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
            <textarea
              placeholder="Description in english"
              value={formData.description_en}
              onChange={(e) =>
                setFormData({ ...formData, description_en: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
            <textarea
              placeholder="Description in spanish"
              value={formData.description_es}
              onChange={(e) =>
                setFormData({ ...formData, description_es: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
            <textarea
              placeholder="Description en francais"
              value={formData.description_fr}
              onChange={(e) =>
                setFormData({ ...formData, description_fr: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              >
                {editingMethod ? "تحديث" : "إضافة"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingMethod(null);
                  setFormData({
                    name: "",
                    name_ar: "",
                    name_en: "",
                    name_fr: "",
                    name_es: "",
                    description: "",
                    description_ar: "",
                    description_en: "",
                    description_fr: "",
                    description_es: "",
                    discount_amount: 0,
                    discount_type: "fixed",
                    is_active: true,
                  });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
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
              <th className="px-4 py-3">الاسم</th>
              <th className="px-4 py-3">الوصف</th>
              <th className="px-4 py-3">الخصم</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {paymentMethods.map((method) => (
              <tr key={method.id} className="border-b">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium">
                      {method.name_ar || method.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {method.name_en}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {method.description_ar || method.description}
                </td>
                <td className="px-4 py-3">
                  {method.discount_amount > 0 ? (
                    <span className="text-green-600">
                      -{method.discount_amount}
                      {method.discount_type === "percentage" ? "%" : " درهم"}
                    </span>
                  ) : (
                    <span className="text-gray-500">لا يوجد</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={method.is_active}
                      onChange={(e) =>
                        handleToggle(method.id, e.target.checked)
                      }
                      className="mr-2"
                    />
                    {method.is_active ? "نشط" : "غير نشط"}
                  </label>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(method)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(method.id)}
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
        {paymentMethods.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            لا توجد طرق دفع حالياً
          </div>
        )}
      </div>
    </section>
  );
}

function AccessoiresManager() {
  const [accessoires, setAccessoires] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    old_price: "",
    new_price: "",
    description: "",
    category_id: "",
  });
  const [mainImages, setMainImages] = useState<FileList | null>(null);
  const [optionalImages, setOptionalImages] = useState<FileList | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [existingMainImages, setExistingMainImages] = useState<string[]>([]);
  const [existingOptionalImages, setExistingOptionalImages] = useState<
    string[]
  >([]);

  useEffect(() => {
    fetchAccessoires();
    fetchCategories();
  }, []);

  const fetchAccessoires = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/accessoires`);
      const data = await response.json();
      setAccessoires(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching accessoires:", error);
      setAccessoires([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.new_price) {
      alert("يرجى تعبئة اسم الإكسسوار والسعر الجديد على الأقل");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      alert("يرجى تسجيل الدخول أولاً");
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value as any);
    });

    // Append main images
    if (mainImages) {
      Array.from(mainImages).forEach((file) => {
        formDataToSend.append("mainImages", file);
      });
    } else if (editingId && existingMainImages.length > 0) {
      // Keep existing main images if no new ones are uploaded
      formDataToSend.append(
        "existing_main_images",
        JSON.stringify(existingMainImages),
      );
    }

    // Append optional images
    if (optionalImages) {
      Array.from(optionalImages).forEach((file) => {
        formDataToSend.append("optionalImages", file);
      });
    } else if (editingId && existingOptionalImages.length > 0) {
      // Keep existing optional images if no new ones are uploaded
      formDataToSend.append(
        "existing_optional_images",
        JSON.stringify(existingOptionalImages),
      );
    }

    try {
      const url = editingId
        ? `${API_BASE_URL}/api/accessoires/${editingId}`
        : `${API_BASE_URL}/api/accessoires`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        fetchAccessoires();
        setFormData({
          name: "",
          old_price: "",
          new_price: "",
          description: "",
          category_id: "",
        });
        setMainImages(null);
        setOptionalImages(null);
        setEditingId(null);
        setExistingMainImages([]);
        setExistingOptionalImages([]);
        alert(
          editingId ? "تم تحديث الإكسسوار بنجاح" : "تم إنشاء الإكسسوار بنجاح",
        );
      } else {
        let errorMessage = "خطأ غير معروف";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.error || errorData.message || "خطأ غير معروف";
        } catch (jsonError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(
          `خطأ في ${editingId ? "تحديث" : "إنشاء"} الإكسسوار: ${errorMessage}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "خطأ في الاتصال";
      alert(
        `خطأ في ${editingId ? "تحديث" : "إنشاء"} الإكسسوار: ${errorMessage}`,
      );
    }
  };

  const handleEdit = (accessoire: any) => {
    setFormData({
      name: accessoire.name,
      old_price: accessoire.old_price,
      new_price: accessoire.new_price,
      description: accessoire.description,
      category_id: accessoire.category_id || "",
    });
    setEditingId(accessoire.id);

    // Load existing images from the new structure (main_images and optional_images)
    // If those don't exist, fall back to the legacy images field
    let mainImgs = [];
    let optionalImgs = [];

    if (accessoire.main_images && Array.isArray(accessoire.main_images)) {
      mainImgs = accessoire.main_images;
    } else if (accessoire.images && Array.isArray(accessoire.images)) {
      // Fallback: use first 3 images as main
      mainImgs = accessoire.images.slice(0, 3);
    }

    if (
      accessoire.optional_images &&
      Array.isArray(accessoire.optional_images)
    ) {
      optionalImgs = accessoire.optional_images;
    } else if (
      accessoire.images &&
      Array.isArray(accessoire.images) &&
      accessoire.images.length > 3
    ) {
      // Fallback: use remaining images as optional
      optionalImgs = accessoire.images.slice(3);
    }

    setExistingMainImages(mainImgs);
    setExistingOptionalImages(optionalImgs);

    // Clear new image selections
    setMainImages(null);
    setOptionalImages(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإكسسوار؟")) return;

    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`${API_BASE_URL}/api/accessoires/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAccessoires();
        alert("تم حذف الإكسسوار بنجاح");
      } else {
        alert("فشل في حذف الإكسسوار");
      }
    } catch (error) {
      alert("خطأ في حذف الإكسسوار");
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">إدارة الإكسسوارات</h2>
        <div className="text-sm text-gray-600">
          المجموع: {accessoires.length} إكسسوار
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">جاري التحميل...</p>
        </div>
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الإكسسوار <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                placeholder="اسم الإكسسوار"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
              >
                <option value="">اختر الفئة</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر القديم
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                placeholder="السعر القديم"
                value={formData.old_price}
                onChange={(e) =>
                  setFormData({ ...formData, old_price: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر الجديد <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                placeholder="السعر الجديد"
                value={formData.new_price}
                onChange={(e) =>
                  setFormData({ ...formData, new_price: e.target.value })
                }
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                placeholder="وصف الإكسسوار"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الصور الرئيسية
              </label>

              {/* Existing Main Images */}
              {editingId && existingMainImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">الصور الحالية:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {existingMainImages.map((image, idx) => (
                      <div
                        key={idx}
                        className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-blue-200"
                      >
                        <img
                          src={`${API_BASE_URL}${image}`}
                          alt={`existing-main-${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                          رئيسية {idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExistingMainImages((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    يمكنك حذف الصور الحالية أو رفع صور جديدة لاستبدالها
                  </p>
                </div>
              )}

              <input
                type="file"
                multiple
                accept="image/*"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                onChange={(e) => setMainImages(e.target.files)}
              />

              {/* Main Images Previews */}
              {mainImages && mainImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    معاينة الصور الرئيسية:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from(mainImages).map((file, idx) => (
                      <div
                        key={idx}
                        className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-blue-200"
                      >
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
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صور إضافية
              </label>

              {/* Existing Optional Images */}
              {editingId && existingOptionalImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    الصور الاختيارية الحالية:
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {existingOptionalImages.map((image, idx) => (
                      <div
                        key={idx}
                        className="relative w-full aspect-square rounded-lg overflow-hidden border border-green-200"
                      >
                        <img
                          src={`${API_BASE_URL}${image}`}
                          alt={`existing-optional-${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded-br">
                          {idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExistingOptionalImages((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 py-0.5 rounded-bl hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    يمكنك حذف الصور الحالية أو رفع صور جديدة لاستبدالها
                  </p>
                </div>
              )}

              <input
                type="file"
                multiple
                accept="image/*"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                onChange={(e) => setOptionalImages(e.target.files)}
              />

              {/* Optional Images Previews */}
              {optionalImages && optionalImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    معاينة الصور الإضافية:
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {Array.from(optionalImages).map((file, idx) => (
                      <div
                        key={idx}
                        className="relative w-full aspect-square rounded-lg overflow-hidden border border-green-200"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`optional-preview-${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded-br">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-[#6188a4] to-[#262a2f] text-white px-6 py-3 rounded-xl font-semibold flex-1"
              >
                {editingId ? "تحديث الإكسسوار" : "حفظ الإكسسوار"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      name: "",
                      old_price: "",
                      new_price: "",
                      description: "",
                      category_id: "",
                    });
                  }}
                  className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>

          {/* Accessoires Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإكسسوار
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الفئة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    السعر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accessoires.map((accessoire) => (
                  <tr key={accessoire.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {accessoire.main_images &&
                          accessoire.main_images.length > 0 && (
                            <img
                              src={`${API_BASE_URL}${accessoire.main_images[0]}`}
                              alt={accessoire.name}
                              className="h-10 w-10 rounded-lg object-cover ml-4"
                            />
                          )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {accessoire.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {accessoire.description?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {categories.find((c) => c.id === accessoire.category_id)
                        ?.name || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        {accessoire.old_price && (
                          <span className="text-gray-500 line-through">
                            {accessoire.old_price} MAD
                          </span>
                        )}
                        <span className="text-green-600 font-semibold">
                          {accessoire.new_price} MAD
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(accessoire)}
                        className="text-indigo-600 hover:text-indigo-900 ml-4"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(accessoire.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {accessoires.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                لا توجد إكسسوارات حالياً
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function ReviewsManager() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/reviews/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reviews/${id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        fetchReviews();
        alert("تم الموافقة على المراجعة بنجاح");
      } else {
        alert("فشل في الموافقة على المراجعة");
      }
    } catch (error) {
      alert("خطأ في الموافقة على المراجعة");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه المراجعة؟")) return;

    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchReviews();
        alert("تم حذف المراجعة بنجاح");
      } else {
        alert("فشل في حذف المراجعة");
      }
    } catch (error) {
      alert("خطأ في حذف المراجعة");
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === "pending") return !review.approved;
    if (filter === "approved") return review.approved;
    return true;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? "text-yellow-400" : "text-gray-300"}
      >
        ⭐
      </span>
    ));
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">إدارة المراجعات</h2>
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع المراجعات</option>
            <option value="pending">في الانتظار</option>
            <option value="approved">مقبولة</option>
          </select>
          <div className="text-sm text-gray-600">
            المجموع: {filteredReviews.length} مراجعة
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">جاري التحميل...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`border rounded-lg p-4 ${review.approved ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      {review.name || "مجهول"}
                    </span>
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        review.approved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {review.approved ? "مقبولة" : "في الانتظار"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    المنتج:{" "}
                    <span className="font-medium">{review.product_name}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    العميل:{" "}
                    <span className="font-medium">{review.client_name}</span>
                  </p>
                  {review.comment && (
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                  )}
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.photos.map((photo: string, index: number) => (
                        <img
                          key={index}
                          src={`${API_BASE_URL}${photo}`}
                          alt={`Review photo ${index + 1}`}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  {!review.approved && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      موافقة
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredReviews.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد مراجعات{" "}
              {filter === "pending"
                ? "في الانتظار"
                : filter === "approved"
                  ? "مقبولة"
                  : ""}{" "}
              حالياً
            </div>
          )}
        </div>
      )}
    </section>
  );
}
