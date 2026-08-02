import { Injectable, inject } from '@angular/core';

import { LocaleStore } from '../../../core/i18n/locale.store';

export type TrackCatalogCopyKey =
  | 'eyebrow'
  | 'title'
  | 'subtitle'
  | 'searchLabel'
  | 'searchPlaceholder'
  | 'availableCount'
  | 'loading'
  | 'loadFailed'
  | 'retry'
  | 'emptyTitle'
  | 'emptyDescription'
  | 'noMatchesTitle'
  | 'noMatchesDescription'
  | 'activeIntake'
  | 'prerequisites'
  | 'noPrerequisites'
  | 'branches'
  | 'branchCount'
  | 'seats'
  | 'viewDetails'
  | 'backToCatalog'
  | 'aboutTrack'
  | 'branchOfferings'
  | 'branchOfferingsDescription'
  | 'governorate'
  | 'notProvided'
  | 'capacity'
  | 'detailsNotFound'
  | 'detailsLoadFailed';

type CopyDictionary = Record<TrackCatalogCopyKey, string>;

const COPY: Record<'en' | 'ar', CopyDictionary> = {
  en: {
    eyebrow: 'Active admission cycle',
    title: 'Explore available training tracks',
    subtitle:
      'Compare track topics, delivery branches, and available capacity before starting your application.',
    searchLabel: 'Search tracks',
    searchPlaceholder: 'Search by track, topic, branch, or governorate',
    availableCount: '{{count}} tracks available',
    loading: 'Loading the active track catalog…',
    loadFailed: 'We could not load the track catalog.',
    retry: 'Try again',
    emptyTitle: 'No tracks are available yet',
    emptyDescription:
      'The active admission cycle does not currently have public track offerings.',
    noMatchesTitle: 'No matching tracks',
    noMatchesDescription: 'Try a different track, topic, branch, or governorate.',
    activeIntake: 'Available now',
    prerequisites: 'Recommended topics',
    noPrerequisites: 'No prerequisite topics listed',
    branches: 'Branches',
    branchCount: '{{count}} branch offerings',
    seats: '{{count}} seats',
    viewDetails: 'View track details',
    backToCatalog: 'Back to track catalog',
    aboutTrack: 'About this track',
    branchOfferings: 'Available branches',
    branchOfferingsDescription:
      'These are the active branch offerings configured for the current admission cycle.',
    governorate: 'Governorate',
    notProvided: 'Not specified',
    capacity: 'Capacity',
    detailsNotFound: 'This track is not available in the active admission cycle.',
    detailsLoadFailed: 'We could not load this track.',
  },
  ar: {
    eyebrow: 'دورة التقديم النشطة',
    title: 'استكشف المسارات التدريبية المتاحة',
    subtitle:
      'قارن بين موضوعات المسار والفروع المتاحة والسعة قبل بدء طلب التقديم.',
    searchLabel: 'البحث في المسارات',
    searchPlaceholder: 'ابحث باسم المسار أو الموضوع أو الفرع أو المحافظة',
    availableCount: '{{count}} مسارات متاحة',
    loading: 'جارٍ تحميل مسارات دورة التقديم النشطة…',
    loadFailed: 'تعذر تحميل قائمة المسارات.',
    retry: 'إعادة المحاولة',
    emptyTitle: 'لا توجد مسارات متاحة حاليًا',
    emptyDescription:
      'لا تحتوي دورة التقديم النشطة حاليًا على مسارات منشورة للمتقدمين.',
    noMatchesTitle: 'لا توجد نتائج مطابقة',
    noMatchesDescription: 'جرّب اسم مسار أو موضوع أو فرع أو محافظة أخرى.',
    activeIntake: 'متاح الآن',
    prerequisites: 'الموضوعات الموصى بها',
    noPrerequisites: 'لا توجد موضوعات تمهيدية مسجلة',
    branches: 'الفروع',
    branchCount: '{{count}} فروع متاحة',
    seats: '{{count}} مقعدًا',
    viewDetails: 'عرض تفاصيل المسار',
    backToCatalog: 'العودة إلى قائمة المسارات',
    aboutTrack: 'عن المسار',
    branchOfferings: 'الفروع المتاحة',
    branchOfferingsDescription:
      'هذه هي الفروع النشطة المحددة لهذا المسار في دورة التقديم الحالية.',
    governorate: 'المحافظة',
    notProvided: 'غير محدد',
    capacity: 'السعة',
    detailsNotFound: 'هذا المسار غير متاح في دورة التقديم النشطة.',
    detailsLoadFailed: 'تعذر تحميل بيانات هذا المسار.',
  },
};

@Injectable({ providedIn: 'root' })
export class TrackCatalogCopy {
  private readonly locale = inject(LocaleStore);

  readonly isRtl = this.locale.isRtl;

  text(
    key: TrackCatalogCopyKey,
    params?: Record<string, string | number>,
  ): string {
    const locale = this.locale.locale();
    const value = COPY[locale][key];

    if (!params) {
      return value;
    }

    return Object.entries(params).reduce(
      (result, [name, replacement]) =>
        result.replaceAll(`{{${name}}}`, String(replacement)),
      value,
    );
  }
}
