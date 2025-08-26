import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { BookingLookupClient } from "./BookingLookupClient";

interface BookingLookupPageProps {
  params: { lang: Locale };
}

export default async function BookingLookupPage({ params }: BookingLookupPageProps) {
  const dictionary = await getDictionary(params.lang);
  const t = dictionary.bookingLookupPage;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">{t.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{t.subtitle}</p>
      </div>
      <BookingLookupClient dictionary={t} lang={params.lang} />
    </div>
  );
}
