import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

export type AppLocale = 'en' | 'ar';

const LOCALE_STORAGE_KEY = 'eduflow.locale';

const translations: Record<AppLocale, Record<string, string>> = {
  en: {
    'app.name': 'EduFlow AI',
    'app.tagline': 'Multi-Agent Admission System',
    'common.email': 'Email address',
    'common.password': 'Password',
    'common.confirmPassword': 'Confirm password',
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.save': 'Save profile',
    'common.saving': 'Saving…',
    'common.retry': 'Try again',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.loading': 'Loading…',
    'common.logout': 'Log out',
    'common.language': 'العربية',
    'common.required': 'This field is required.',
    'common.invalidEmail': 'Enter a valid email address.',
    'common.unexpected': 'Something went wrong. Please try again.',
    'auth.login.title': 'Welcome back',
    'auth.login.subtitle': 'Sign in to continue your admission journey',
    'auth.login.submit': 'Sign in',
    'auth.login.submitting': 'Signing in…',
    'auth.login.forgot': 'Forgot password?',
    'auth.login.noAccount': "Don't have an account?",
    'auth.login.register': 'Create an account',
    'auth.login.invalid': 'The email address or password is incorrect.',
    'auth.login.confirmRequired':
      'Please confirm your email address before signing in.',
    'auth.login.inactive': 'This account is currently inactive.',
    'auth.login.locked':
      'This account is temporarily locked after repeated failed attempts. Please try again later.',
    'auth.login.rateLimited':
      'Too many sign-in attempts. Please wait a moment and try again.',
    'auth.register.title': 'Create your account',
    'auth.register.subtitle': 'Start your EduFlow AI admission journey',
    'auth.register.submit': 'Create account',
    'auth.register.submitting': 'Creating account…',
    'auth.register.hasAccount': 'Already have an account?',
    'auth.register.signIn': 'Sign in',
    'auth.register.success':
      'Your account was created. Check your email to confirm it before signing in.',
    'auth.password.requirements': 'Your password must contain:',
    'auth.password.length': 'At least 8 characters',
    'auth.password.uppercase': 'One uppercase letter',
    'auth.password.lowercase': 'One lowercase letter',
    'auth.password.number': 'One number',
    'auth.password.mismatch': 'Passwords do not match.',
    'auth.confirm.title': 'Confirming your email',
    'auth.confirm.success': 'Your email has been confirmed.',
    'auth.confirm.invalid':
      'This confirmation link is invalid or has expired.',
    'auth.confirm.login': 'Continue to sign in',
    'auth.forgot.title': 'Forgot your password?',
    'auth.forgot.subtitle':
      "Enter your email and we'll send password-reset instructions.",
    'auth.forgot.submit': 'Send reset instructions',
    'auth.forgot.success':
      'If an eligible account exists, password reset instructions have been issued.',
    'auth.forgot.back': 'Back to sign in',
    'auth.reset.title': 'Create a new password',
    'auth.reset.subtitle': 'Choose a secure password for your account.',
    'auth.reset.submit': 'Reset password',
    'auth.reset.success': 'Your password has been reset successfully.',
    'auth.reset.invalid': 'This reset link is invalid or has expired.',
    'auth.dev.title': 'Development testing only',
    'auth.dev.confirm': 'Open confirmation link',
    'auth.dev.reset': 'Open password-reset link',
    'layout.applicant.profile': 'Applicant profile',
    'layout.applicant.applications': 'Applications',
    'layout.applicant.portal': 'Applicant portal',
    'layout.applicant.navigation': 'Applicant navigation',
    'layout.applicant.role': 'Applicant',
    'layout.openNavigation': 'Open navigation',
    'layout.closeNavigation': 'Close navigation',
    'layout.homeLabel': 'EduFlow AI home',
    'layout.legal': 'Legal',
    'layout.operations.title': 'Operations workspace',
    'layout.admin.title': 'Administration',
    'profile.title': 'Applicant profile',
    'profile.subtitle':
      'Complete your information so we can assess your eligibility.',
    'profile.step.personal': 'Personal information',
    'profile.step.contact': 'Contact & preferences',
    'profile.step.academic': 'Academic information',
    'profile.locked.title': 'Eligibility information is locked',
    'profile.locked.description':
      'Fields used for eligibility and document verification cannot be changed after application submission. Contact and notification preferences remain editable.',
    'profile.saved': 'Your profile was saved successfully.',
    'profile.loadFailed': 'We could not load your profile.',
    'profile.conflict': 'Some profile information could not be updated.',
    'profile.fullNameEn': 'Full name in English',
    'profile.fullNameAr': 'Full name in Arabic',
    'profile.nationalId': 'National ID',
    'profile.nationality': 'Nationality',
    'profile.dateOfBirth': 'Date of birth',
    'profile.gender': 'Gender',
    'profile.address': 'Address',
    'profile.governorate': 'Governorate',
    'profile.phoneNumber': 'Phone number',
    'profile.preferredLanguage': 'Preferred language',
    'profile.notifications': 'Gmail notifications',
    'profile.notificationsHint':
      'Receive admission updates and reminders by email.',
    'profile.university': 'University',
    'profile.faculty': 'Faculty',
    'profile.degreeLevel': 'Degree level',
    'profile.major': 'Major',
    'profile.graduationYear': 'Graduation year',
    'profile.cumulativeGrade': 'Cumulative grade',
    'profile.militaryStatus': 'Military status',
    'profile.select': 'Select an option',
    'profile.gender.male': 'Male',
    'profile.gender.female': 'Female',
    'profile.grade.acceptable': 'Acceptable',
    'profile.grade.good': 'Good',
    'profile.grade.veryGood': 'Very good',
    'profile.grade.excellent': 'Excellent',
    'profile.military.completed': 'Completed',
    'profile.military.exempted': 'Exempted',
    'profile.military.postponed': 'Postponed',
    'profile.military.serving': 'Currently serving',
    'error.notFound.title': 'Page not found',
    'error.notFound.description':
      "The page you're looking for doesn't exist or has moved.",
    'error.notFound.action': 'Return to sign in',
    'error.unexpected.title': 'Unexpected error',
    'error.unexpected.description':
      'The application encountered an unexpected problem. Please try again.',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.copyright': '© 2026 EduFlow AI. All rights reserved.',
  },
  ar: {
    'app.name': 'إديوفلو الذكي',
    'app.tagline': 'نظام القبول متعدد الوكلاء',
    'common.email': 'البريد الإلكتروني',
    'common.password': 'كلمة المرور',
    'common.confirmPassword': 'تأكيد كلمة المرور',
    'common.continue': 'متابعة',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.save': 'حفظ الملف الشخصي',
    'common.saving': 'جارٍ الحفظ…',
    'common.retry': 'إعادة المحاولة',
    'common.cancel': 'إلغاء',
    'common.close': 'إغلاق',
    'common.loading': 'جارٍ التحميل…',
    'common.logout': 'تسجيل الخروج',
    'common.language': 'English',
    'common.required': 'هذا الحقل مطلوب.',
    'common.invalidEmail': 'أدخل بريدًا إلكترونيًا صحيحًا.',
    'common.unexpected': 'حدث خطأ. حاول مرة أخرى.',
    'auth.login.title': 'مرحبًا بعودتك',
    'auth.login.subtitle': 'سجّل الدخول لمتابعة رحلة التقديم',
    'auth.login.submit': 'تسجيل الدخول',
    'auth.login.submitting': 'جارٍ تسجيل الدخول…',
    'auth.login.forgot': 'نسيت كلمة المرور؟',
    'auth.login.noAccount': 'ليس لديك حساب؟',
    'auth.login.register': 'إنشاء حساب',
    'auth.login.invalid': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'auth.login.confirmRequired':
      'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.',
    'auth.login.inactive': 'هذا الحساب غير نشط حاليًا.',
    'auth.login.locked':
      'تم قفل الحساب مؤقتًا بعد محاولات متعددة غير ناجحة. حاول لاحقًا.',
    'auth.login.rateLimited':
      'محاولات تسجيل دخول كثيرة. انتظر قليلًا ثم حاول مرة أخرى.',
    'auth.register.title': 'أنشئ حسابك',
    'auth.register.subtitle': 'ابدأ رحلة التقديم مع إديوفلو الذكي',
    'auth.register.submit': 'إنشاء الحساب',
    'auth.register.submitting': 'جارٍ إنشاء الحساب…',
    'auth.register.hasAccount': 'لديك حساب بالفعل؟',
    'auth.register.signIn': 'تسجيل الدخول',
    'auth.register.success':
      'تم إنشاء حسابك. راجع بريدك الإلكتروني لتأكيده قبل تسجيل الدخول.',
    'auth.password.requirements': 'يجب أن تحتوي كلمة المرور على:',
    'auth.password.length': '8 أحرف على الأقل',
    'auth.password.uppercase': 'حرف إنجليزي كبير',
    'auth.password.lowercase': 'حرف إنجليزي صغير',
    'auth.password.number': 'رقم واحد',
    'auth.password.mismatch': 'كلمتا المرور غير متطابقتين.',
    'auth.confirm.title': 'جارٍ تأكيد بريدك الإلكتروني',
    'auth.confirm.success': 'تم تأكيد بريدك الإلكتروني.',
    'auth.confirm.invalid': 'رابط التأكيد غير صالح أو انتهت صلاحيته.',
    'auth.confirm.login': 'المتابعة لتسجيل الدخول',
    'auth.forgot.title': 'هل نسيت كلمة المرور؟',
    'auth.forgot.subtitle':
      'أدخل بريدك الإلكتروني وسنرسل تعليمات إعادة التعيين.',
    'auth.forgot.submit': 'إرسال تعليمات إعادة التعيين',
    'auth.forgot.success':
      'إذا كان هناك حساب مؤهل فسيتم إرسال تعليمات إعادة تعيين كلمة المرور.',
    'auth.forgot.back': 'العودة لتسجيل الدخول',
    'auth.reset.title': 'أنشئ كلمة مرور جديدة',
    'auth.reset.subtitle': 'اختر كلمة مرور آمنة لحسابك.',
    'auth.reset.submit': 'إعادة تعيين كلمة المرور',
    'auth.reset.success': 'تم تغيير كلمة المرور بنجاح.',
    'auth.reset.invalid': 'رابط إعادة التعيين غير صالح أو انتهت صلاحيته.',
    'auth.dev.title': 'لاختبارات بيئة التطوير فقط',
    'auth.dev.confirm': 'فتح رابط التأكيد',
    'auth.dev.reset': 'فتح رابط إعادة تعيين كلمة المرور',
    'layout.applicant.profile': 'ملف المتقدم',
    'layout.applicant.applications': 'الطلبات',
    'layout.applicant.portal': 'بوابة المتقدم',
    'layout.applicant.navigation': 'تنقل المتقدم',
    'layout.applicant.role': 'متقدم',
    'layout.openNavigation': 'فتح قائمة التنقل',
    'layout.closeNavigation': 'إغلاق قائمة التنقل',
    'layout.homeLabel': 'الصفحة الرئيسية لإديوفلو الذكي',
    'layout.legal': 'روابط قانونية',
    'layout.operations.title': 'مساحة عمل العمليات',
    'layout.admin.title': 'الإدارة',
    'profile.title': 'ملف المتقدم',
    'profile.subtitle': 'أكمل بياناتك حتى نتمكن من تقييم أهليتك.',
    'profile.step.personal': 'المعلومات الشخصية',
    'profile.step.contact': 'التواصل والتفضيلات',
    'profile.step.academic': 'المعلومات الأكاديمية',
    'profile.locked.title': 'تم قفل بيانات الأهلية',
    'profile.locked.description':
      'لا يمكن تغيير الحقول المستخدمة لتقييم الأهلية والتحقق من المستندات بعد تقديم الطلب. تظل بيانات التواصل والإشعارات قابلة للتعديل.',
    'profile.saved': 'تم حفظ ملفك الشخصي بنجاح.',
    'profile.loadFailed': 'تعذر تحميل ملفك الشخصي.',
    'profile.conflict': 'تعذر تحديث بعض بيانات الملف الشخصي.',
    'profile.fullNameEn': 'الاسم الكامل بالإنجليزية',
    'profile.fullNameAr': 'الاسم الكامل بالعربية',
    'profile.nationalId': 'الرقم القومي',
    'profile.nationality': 'الجنسية',
    'profile.dateOfBirth': 'تاريخ الميلاد',
    'profile.gender': 'النوع',
    'profile.address': 'العنوان',
    'profile.governorate': 'المحافظة',
    'profile.phoneNumber': 'رقم الهاتف',
    'profile.preferredLanguage': 'اللغة المفضلة',
    'profile.notifications': 'إشعارات Gmail',
    'profile.notificationsHint':
      'استقبل تحديثات ومواعيد التقديم عبر البريد الإلكتروني.',
    'profile.university': 'الجامعة',
    'profile.faculty': 'الكلية',
    'profile.degreeLevel': 'الدرجة العلمية',
    'profile.major': 'التخصص',
    'profile.graduationYear': 'سنة التخرج',
    'profile.cumulativeGrade': 'التقدير التراكمي',
    'profile.militaryStatus': 'الموقف من التجنيد',
    'profile.select': 'اختر',
    'profile.gender.male': 'ذكر',
    'profile.gender.female': 'أنثى',
    'profile.grade.acceptable': 'مقبول',
    'profile.grade.good': 'جيد',
    'profile.grade.veryGood': 'جيد جدًا',
    'profile.grade.excellent': 'ممتاز',
    'profile.military.completed': 'تمت الخدمة',
    'profile.military.exempted': 'إعفاء',
    'profile.military.postponed': 'تأجيل',
    'profile.military.serving': 'يؤدي الخدمة حاليًا',
    'error.notFound.title': 'الصفحة غير موجودة',
    'error.notFound.description':
      'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
    'error.notFound.action': 'العودة لتسجيل الدخول',
    'error.unexpected.title': 'خطأ غير متوقع',
    'error.unexpected.description':
      'واجه التطبيق مشكلة غير متوقعة. حاول مرة أخرى.',
    'footer.privacy': 'الخصوصية',
    'footer.terms': 'الشروط',
    'footer.copyright': '© 2026 إديوفلو الذكي. جميع الحقوق محفوظة.',
  },
};

function storedLocale(): AppLocale {
  if (typeof localStorage === 'undefined') {
    return 'en';
  }

  return localStorage.getItem(LOCALE_STORAGE_KEY) === 'ar' ? 'ar' : 'en';
}

function applyDocumentLocale(locale: AppLocale): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
}

function interpolate(value: string, params?: Record<string, string | number>): string {
  if (!params) {
    return value;
  }

  return Object.entries(params).reduce(
    (result, [key, replacement]) =>
      result.replaceAll(`{{${key}}}`, String(replacement)),
    value,
  );
}

export const LocaleStore = signalStore(
  { providedIn: 'root' },
  withState(() => {
    const locale = storedLocale();
    applyDocumentLocale(locale);
    return { locale };
  }),
  withComputed(({ locale }) => ({
    direction: computed(() => (locale() === 'ar' ? 'rtl' : 'ltr')),
    isRtl: computed(() => locale() === 'ar'),
  })),
  withMethods((store) => ({
    setLocale(locale: AppLocale): void {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      }

      applyDocumentLocale(locale);
      patchState(store, { locale });
    },

    toggle(): void {
      const locale: AppLocale = store.locale() === 'en' ? 'ar' : 'en';

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      }

      applyDocumentLocale(locale);
      patchState(store, { locale });
    },

    t(key: string, params?: Record<string, string | number>): string {
      const locale = store.locale();
      const value = translations[locale][key] ?? translations.en[key] ?? key;
      return interpolate(value, params);
    },
  })),
);
