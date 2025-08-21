'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { useTranslations } from '@/hooks/use-translations';
import { API_BASE_URL } from '@/lib/config';

export default function ReviewPage() {
  const params = useParams();
  const token = params?.token as string;
  const { t } = useTranslations();
  
  const [validationData, setValidationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    rating: 5,
    name: '',
    comment: ''
  });
  const [photos, setPhotos] = useState<FileList | null>(null);

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/validate?token=${token}`);
      if (response.ok) {
        const data = await response.json();
        setValidationData(data);
        setFormData(prev => ({ ...prev, name: data.client_name || '' }));
      } else {
        setError('رابط المراجعة غير صالح أو منتهي الصلاحية');
      }
    } catch (error) {
      setError('خطأ في التحقق من الرابط');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append('token', token);
    formDataToSend.append('rating', formData.rating.toString());
    formDataToSend.append('name', formData.name);
    formDataToSend.append('comment', formData.comment);

    if (photos) {
      Array.from(photos).forEach(file => {
        formDataToSend.append('photos', file);
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/submit`, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'فشل في إرسال المراجعة');
      }
    } catch (error) {
      setError('خطأ في إرسال المراجعة');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setFormData({ ...formData, rating: i + 1 })}
        className={`text-3xl ${i < formData.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
      >
        ⭐
      </button>
    ));
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">جاري التحقق من الرابط...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">خطأ في الرابط</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              العودة للصفحة الرئيسية
            </a>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (submitted) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">شكراً لك!</h1>
            <p className="text-gray-600 mb-6">
              تم إرسال مراجعتك بنجاح. سيتم مراجعتها من قبل الإدارة قبل النشر.
            </p>
            <a
              href="/"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              العودة للصفحة الرئيسية
            </a>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
        <Main>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">⭐ قيم تجربتك</h1>
                <p className="text-gray-600">
                  شاركنا رأيك في المنتج: <span className="font-semibold">{validationData?.product_name}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div className="text-center">
                  <label className="block text-lg font-medium text-gray-700 mb-4">التقييم</label>
                  <div className="flex justify-center gap-1">
                    {renderStars()}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {formData.rating} من 5 نجوم
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="اسمك (اختياري)"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">التعليق</label>
                  <textarea
                    rows={4}
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="شاركنا تجربتك مع المنتج (اختياري)"
                  />
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">صور (اختياري)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setPhotos(e.target.files)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">يمكنك رفع حتى 5 صور</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال المراجعة'}
                </button>
              </form>
            </div>
          </div>
        </Main>
      </div>
    </PublicLayout>
  );
}
