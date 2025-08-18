'use client';

import React from 'react';
import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { useTranslations } from '@/hooks/use-translations';

export default function LocalizedConfidentialityPage() {
  const { t } = useTranslations();
  
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t('confidentialityPage')}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto mt-8"></div>
          </div>
        </div>

        <Main>
          <div className="py-20">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                <div className="prose prose-lg max-w-none text-right" dir="rtl">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">سياسة الخصوصية</h2>
                  
                  <div className="bg-blue-50 border-r-4 border-blue-500 p-6 mb-8">
                    <p className="text-blue-700 leading-relaxed">
                      موقعنا يحترم خصوصيّتك ويسعى لحماية بياناتك الشخصية. توضح سياسة الخصوصيّة كيفية جمع واستخدام بياناتك الشخصية (تحت ظروفٍ معينةٍ). كما تذكرُ أيضًا الإجراءات المتبعة لضمان خصوصية معلوماتك.
                    </p>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-4">1 – البيانات التي نجمعها</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    قد نحتاج لجمع المعلومات الخاصة بكَ إذا أردت تسجيل طلب شراء لسلعة من موقعنا.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    ونقوم بجمع وتخزين ومعالجة بياناتك الازمة لمتابعة شرائك من موقعنا لتأمين أية مطالب محتملة قد تظهر لاحقاً، ولتزويدكَ بالخدمات المتوفرة لدينا. وقد نقوم بجمع معلومات شخصية تتضمَّن، على سبيل المثال وليس الحصر، الاسم والجنس وتاريخ الميلاد وعنوان البريد الإلكتروني والعنوان البريدي وعنوان التسليم (إذا كان مختلفًا) ورقم الهاتف وتفاصيل الدفع وتفاصيل عن بطاقات الدفع.
                  </p>

                  <h3 className="text-2xl font-bold text-gray-800 mb-4">استخدامات أخرى لمعلوماتك الشخصيَّة</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    قد نستخدم معلوماتك الشخصيَّة في استطلاعات الرأي وأبحاث التسويق، بناءً على رغبتك، لأغراضٍ إحصائية مع ضمان سريتها التامة، كما يحق لك الانسحاب في أيّ وقت. ولا نقوم بإرسال أي إجابات إلى أي طرف ثالث. ولا يتم الإفصاح عن عنوان بريدك الالكتروني إلا إذا رغبتَ في المشاركة في المسابقات.
                  </p>

                  <h3 className="text-2xl font-bold text-gray-800 mb-4">المنافسات</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    فيما يتعلق بأي منافسة، نستخدم البيانات لإخطار الفائزين وللإعلان عن عروضنا. ويمكنك العثور على مزيد من التفاصيل عن شروط المشاركة في كل منافسة على حدة.
                  </p>

                  <h3 className="text-2xl font-bold text-gray-800 mb-4">الأطراف الاخرى وروابط المواقع</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    قد ننقل معلوماتك إلى شركات أخرى في مجموعتنا أو إلى وكلائنا والمتعاقدين معنا لمساعدتنا في المعاملات المتعلقة وفقا لبنود سياسة الخصوصية. وقد نلجأ على سبيل المثال إلى طرف ثالث لمعاونتنا في تسليم المنتجات إليك واستلام الدفعات منك واستخدامها لأغراض الإحصاءات وأبحاث التسويق أو لمساعدة فريق خدمة العملاء.
                  </p>

                  <h3 className="text-2xl font-bold text-gray-800 mb-4">2 – ملفات تعريف الارتباط (COOKIES)</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    لا يُعتبر قبول ملفات تعريف الارتباط شرطًا أساسيًا لزيارة الموقع. ولكنّنا نشير إلى أنّه لا يمكن استخدام وظائف "السلّة" على الموقع وطلب أي غرض من دون تفعيل ملفات تعريف الارتباط. وتُعتبر ملفات تعريف الارتباط ملفات نصيّة صغيرة تسمح لخادمنا بتحديد حاسوبك كمستخدم فريدٍ عند زيارة صفحات معينة من الموقع.
                  </p>

                  <h3 className="text-2xl font-bold text-gray-800 mb-4">3- الأمان</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    نستخدم تقنيات وإجراءات أمان ملائمة لمنع أي وصول غير مصرَّح به أو غير قانوني لمعلوماتك أو فقدانها أو تدميرها. فعندما نجمع البيانات من خلال الموقع، نقوم بتخزين معلوماتك الشخصية على قاعدة بيانات ضمن خادم إلكتروني آمن. فنستخدم أنظمة جدار الحماية على خوادمنا.
                  </p>

                  <h3 className="text-2xl font-bold text-gray-800 mb-4">4 – حقوق العميل</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    في حال شعورك بالقلق على بياناتك، يحق لك طلب الوصول إلى البيانات الشخصيّة التي نحملها عنك أو سبق ونقلتها إلينا. ويحق لك أن تطلب منَّا تصحيح أي أخطاء في بياناتك الشخصيّة ويتم ذلك مجانًا. ولك الحق أيضًا في مطالبتنا، في أي وقت، بالتوقُّف عن استخدام بياناتك الشخصية لأغراض تسويقيّة مباشرة.
                  </p>

                  <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
                    <h4 className="font-bold text-green-800 mb-2">التزامنا بحماية خصوصيتك</h4>
                    <p className="text-green-700 text-sm">
                      نحن ملتزمون بحماية خصوصيتك وأمان بياناتك. إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا.
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
