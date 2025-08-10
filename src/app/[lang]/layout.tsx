
import { Locale, i18n } from "@/i18n-config";
import { CookieConsent } from "@/components/CookieConsent";
import { getDictionary } from "@/lib/get-dictionary";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(params.lang);

  return (
    <div className="relative flex min-h-screen flex-col">
       <main className="flex-1">{children}</main>
       <CookieConsent dictionary={dictionary.cookieConsent} />
    </div>
  );
}
