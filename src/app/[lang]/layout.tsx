
import { Locale, i18n } from "@/i18n-config";
import { CookieBanner } from "@/components/CookieBanner";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
       <main className="flex-1">{children}</main>
       <CookieBanner />
    </div>
  );
}
