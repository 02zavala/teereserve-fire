
import * as React from 'react';
import { Locale, i18n } from "@/i18n-config";
import { CookieConsent } from "@/components/CookieConsent";
import { getDictionary } from "@/lib/get-dictionary";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Header } from '@/components/layout/Header';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params: paramsProp,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const params = await paramsProp;
  const dictionary = await getDictionary(params.lang);

  return (
    <div className="relative flex min-h-screen flex-col">
       <Header dictionary={dictionary.header} lang={params.lang} />
       <main className="flex-1">{children}</main>
       <CookieConsent dictionary={dictionary.cookieConsent} />
       <WhatsAppButton />
    </div>
  );
}
