
"use client";

import { Suspense } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent } from '@/ai/flows/create-payment-intent';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import CheckoutForm from '@/components/CheckoutForm';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const TAX_RATE = 0.16; // 16%

function ConfirmPageContent() {
    const searchParams = useSearchParams();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // useMemo to prevent re-running on every render
    const params = useMemo(() => ({
      price: searchParams.get('price'),
    }), [searchParams]);


    useEffect(() => {
        if (params.price) {
            const subtotal = parseFloat(params.price);
            const tax = subtotal * TAX_RATE;
            const total = subtotal + tax;

            createPaymentIntent({ amount: Math.round(total * 100) }) // Convert to cents
                .then(data => {
                    setClientSecret(data.clientSecret);
                })
                .catch(err => {
                    console.error("Failed to create payment intent:", err);
                    setError("Could not initialize payment. Please try again.");
                });
        }
    }, [params]);

    if (error) {
        return <div className="text-center text-destructive">{error}</div>;
    }

    if (!clientSecret) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Preparing secure payment...</p>
            </div>
        );
    }

    const appearance = {
        theme: 'stripe' as const,
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <Elements options={options} stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    );
}

export default function ConfirmPage() {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
        <ConfirmPageContent />
      </Suspense>
    )
}
