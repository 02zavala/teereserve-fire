export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/i18n-config';
import { notFound } from 'next/navigation';
import ReviewDetailClient from './ReviewDetailClient';

interface ReviewDetailPageProps {
  params: Promise<{
    id: string;
    lang: Locale;
  }>;
}

export async function generateMetadata({ params }: ReviewDetailPageProps): Promise<Metadata> {
  await params;
  return {
    title: `Reseña de Golf | TeeReserve`,
    description: 'Lee los detalles de esta reseña de golf y las experiencias compartidas por otros golfistas.',
  };
}

export default async function ReviewDetailPage({ params: paramsProp }: ReviewDetailPageProps) {
  const params = await paramsProp;
  const dict = await getDictionary(params.lang);

  // Validate review ID
  if (!params.id || params.id.length < 3) {
    notFound();
  }

  return <ReviewDetailClient reviewId={params.id} dict={dict} lang={params.lang} />;
}