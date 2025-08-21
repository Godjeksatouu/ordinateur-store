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

    // Validation
    if (!formData.name.trim()) {
      setError('يرجى إدخال اسمك');
      return;
    }

    if (!formData.comment.trim()) {
      setError('يرجى إدخال تعليقك');
      return;
    }

    if (formData.comment.trim().length < 10) {
      setError('يرجى كتابة تعليق أطول (10 أحرف على الأقل)');
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      setError('يرجى اختيار تقييم صحيح');
      return;
    }

    setError(null);
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

  const [hoveredRating, setHoveredRating] = useState(0);

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starNumber = i + 1;
      const isActive = starNumber <= (hoveredRating || formData.rating);

      return (
        <button
          key={i}
          type="button"
          onClick={() => setFormData({ ...formData, rating: starNumber })}
          onMouseEnter={() => setHoveredRating(starNumber)}
          onMouseLeave={() => setHoveredRating(0)}
          className={`text-4xl transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded ${
            isActive
              ? 'text-yellow-400 drop-shadow-sm'
              : 'text-gray-300 hover:text-yellow-300'
          }`}
          aria-label={`تقييم ${starNumber} نجوم`}
        >
          {isActive ? '★' : '☆'}
        </button>
      );
    });
  };

  const getRatingText = (rating: number) => {
    const ratingTexts = {
      1: 'سيء جداً',
      2: 'سيء',
      3: 'متوسط',
      4: 'جيد',
      5: 'ممتاز'
    };
    return ratingTexts[rating as keyof typeof ratingTexts] || '';
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
                  <label className="block text-lg font-medium text-gray-700 mb-4">
                    التقييم <span className="text-red-500">*</span>
                  </label>
                  <div className="flex justify-center gap-2 mb-3">
                    {renderStars()}
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-700">
                      {formData.rating} من 5 نجوم
                    </p>
                    <p className="text-sm text-gray-500">
                      {getRatingText(formData.rating)}
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      formData.name.trim()
                        ? 'border-gray-300 focus:ring-blue-500'
                        : 'border-red-300 focus:ring-red-500'
                    }`}
                    placeholder="أدخل اسمك"
                  />
                  {!formData.name.trim() && (
                    <p className="text-red-500 text-xs mt-1">هذا الحقل مطلوب</p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التعليق <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                      formData.comment.trim()
                        ? 'border-gray-300 focus:ring-blue-500'
                        : 'border-red-300 focus:ring-red-500'
                    }`}
                    placeholder="شاركنا تجربتك مع المنتج بالتفصيل..."
                    minLength={10}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {!formData.comment.trim() ? (
                      <p className="text-red-500 text-xs">هذا الحقل مطلوب (10 أحرف على الأقل)</p>
                    ) : formData.comment.length < 10 ? (
                      <p className="text-orange-500 text-xs">يرجى كتابة تعليق أطول (10 أحرف على الأقل)</p>
                    ) : (
                      <p className="text-green-500 text-xs">ممتاز!</p>
                    )}
                    <p className="text-gray-400 text-xs">{formData.comment.length} حرف</p>
                  </div>
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

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-red-500 text-xl mr-3">⚠️</div>
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !formData.name.trim() || !formData.comment.trim() || formData.comment.length < 10}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                    submitting || !formData.name.trim() || !formData.comment.trim() || formData.comment.length < 10
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      جاري الإرسال...
                    </div>
                  ) : (
                    'إرسال المراجعة ⭐'
                  )}
                </button>

                {/* Form Requirements */}
                <div className="text-center text-sm text-gray-500">
                  <p>جميع الحقول المطلوبة مُعلمة بـ <span className="text-red-500">*</span></p>
                </div>
              </form>
            </div>
          </div>
        </Main>
      </div>
    </PublicLayout>
  );
}
