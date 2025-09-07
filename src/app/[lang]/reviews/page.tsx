export const revalidate = 300;

import { Metadata } from 'next';
import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/i18n-config';
import ReviewsPageClient from './ReviewsPageClient';

export const metadata: Metadata = {
  title: 'Reseñas de Golfistas | TeeReserve',
  description: 'Descubre las experiencias de otros golfistas en Los Cabos. Lee reseñas auténticas y comparte tu propia experiencia.',
};

interface ReviewsPageProps {
  params: Promise<{
    lang: Locale;
  }>;
}

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <ReviewsPageClient dict={dict} lang={lang} />;
}