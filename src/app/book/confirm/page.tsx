
"use client"

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '@/ai/flows/create-payment-intent';
import CheckoutForm from '@/components/CheckoutForm';
import { Locale } from '@/i18n-config';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function ConfirmationPageContent() {
    const searchParams = useSearchParams();
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(true);

    const price = searchParams.get('price');

    useEffect(() => {
        const createIntent = async () => {
            if (!price) {
                setLoading(false);
                return;
            }
            try {
                const amountInCents = Math.round(parseFloat(price) * 100);
                const { clientSecret } = await createPaymentIntent({ amount: amountInCents, currency: 'usd' });
                setClientSecret(clientSecret);
            } catch (error) {
                console.error("Failed to create payment intent:", error);
            } finally {
                setLoading(false);
            }
        };
        createIntent();
    }, [price]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!clientSecret) {
        return (
             <div className="container mx-auto max-w-4xl px-4 py-12 text-center">
                <h1 className="text-2xl font-bold text-destructive">Error</h1>
                <p className="text-muted-foreground">Could not initialize payment. Please go back and try again.</p>
            </div>
        )
    }

    const options = { clientSecret };

    return (
        <Elements stripe={stripePromise} options={options}>
            <CheckoutForm />
        </Elements>
    );
}

export default function ConfirmationPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <ConfirmationPageContent />
        </Suspense>
    )
}
