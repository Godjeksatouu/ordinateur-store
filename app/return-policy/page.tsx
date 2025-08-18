'use client';

import React from 'react';
import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { useTranslations } from '@/hooks/use-translations';

export default function ReturnPolicyPage() {
  const { t } = useTranslations();
  
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t('returnPolicyPage')}
            </h1>
            <div className="w-32 h-1 mx-auto mt-8" style={{background: 'linear-gradient(to right, #3a4956, #3a4956)'}}></div>
          </div>
        </div>

        <Main>
          <div className="py-20">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                <div className="prose prose-lg max-w-none text-right" dir="rtl">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">سياسة الاستبدال والاسترجاع</h2>
                  
                  <div className="bg-slate-50 border-r-4 p-6 mb-8" style={{borderColor: '#3a4956'}}>
                    <h3 className="text-xl font-bold mb-3" style={{color: '#3a4956'}}>ملخص السياسة</h3>
                    <p style={{color: '#3a4956'}}>
                      الإستبدال والإسترجاع حق مضمون لكل عملائنا وهو يشمل جميع المنتجات التي نعرضها على متجرنا.
                    </p>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-4">الشروط العامة</h3>
                  <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-6 space-y-2">
                    <li>جميع المنتجات المعروضة على متجرنا قابلة لسياسة الإستبدال والإسترجع وفق الشروط والأحكام المنصوص عليها في هذه الصفحة.</li>
                    <li>يمكن الإرجاع أو الإستبدال إذا كان المنتج بنفس حالته الأصلية عند الشراء ومغلفا بالغلاف الأصلي.</li>
                    <li>الاسترجاع خلال ثلاثة (3) أيام والاستبدال خلال سبعة (7) أيام من تاريخ الشراء.</li>
                  </ul>

                  <h3 className="text-2xl font-bold text-gray-800 mb-4">كيفية طلب الاستبدال أو الاسترجاع</h3>
                  <div className="bg-blue-50 border-r-4 border-blue-500 p-6 mb-6">
                    <p className="text-blue-700 leading-relaxed">
                      يرجى التواصل معنا عبر صفحة اتصل بنا أو عبر أرقامنا الهاتفية من أجل طلب الإسترجاع أو الإستبدال.
                    </p>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-4">حالات الاستبدال</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    يرجى تصوير المنتج وإرساله مع تحديد المدينة والعنوان ورقم الطلب ليتم إستبداله بمنتج اخر في حالة كان المنتج فاسدا أو به عيب معين، أو لا يشتغل وفق المتفق عليه.
                  </p>

                  <h3 className="text-2xl font-bold text-gray-800 mb-4">حالات الاسترجاع الكامل</h3>
                  <div className="bg-green-50 border-r-4 border-green-500 p-6 mb-6">
                    <p className="text-green-700 leading-relaxed">
                      يتم إسترجاع المبلغ للعميل كاملا في حالة كان المنتج الذي توصل به مختلف تماما مع وصف المنتج في صفحة المنتج بموقعنا.
                    </p>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-4">المسؤوليات والاستثناءات</h3>
                  <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-6 space-y-2">
                    <li>لسنا مسؤولين عن أي توقعات لإستعمال المنتجات من طرف العميل لم نذكرها بصفحة المنتج بموقعنا.</li>
                    <li>تخصم 30 بالمائة أو قيمة لا تقل عن 25 درهما إذا كان العميل لا يريد المنتج وليس به عيب ولا أي مشكل يذكر.</li>
                  </ul>

                  <h3 className="text-2xl font-bold text-gray-800 mb-4">معلومات الاتصال</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">الهاتف</h4>
                        <p className="text-gray-700">+212 661-585396</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">البريد الإلكتروني</h4>
                        <p className="text-gray-700">info@laptopstore.ma</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                    <h4 className="font-bold text-slate-800 mb-2">ملاحظة مهمة</h4>
                    <p className="text-slate-700 text-sm">
                      هذه السياسة قابلة للتغيير دون إشعار مسبق. يرجى مراجعة هذه الصفحة بانتظام للاطلاع على أي تحديثات.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Main>
      </div>
    </PublicLayout>
  );
}
