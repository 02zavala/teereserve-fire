# Stripe Domain Registration Setup

## Current Issues and Solutions

### 1. ❌ ClientSecret Mutation Error
**Error**: `Unsupported prop change: options.clientSecret is not a mutable property`

**✅ Status**: FIXED - Updated the confirm page to prevent clientSecret from changing after initialization.

### 2. ❌ Apple Pay Domain Registration
**Error**: `You have not registered or verified the domain, so the following payment methods are not enabled in the Payment Element: - apple_pay`

**✅ Solution**: Follow the steps below to register your domain.

## Domain Registration Steps

### For Development (localhost)

1. **Use ngrok for HTTPS tunnel** (Required for Apple Pay testing):
   ```bash
   # Install ngrok if you haven't already
   npm install -g ngrok
   
   # Create HTTPS tunnel to your local server
   ngrok http 3000
   ```

2. **Register the ngrok domain in Stripe Dashboard**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Navigate to **Settings** → **Payment methods**
   - Click **Payment method domains**
   - Click **Add a new domain**
   - Enter your ngrok domain (e.g., `https://abc123.ngrok.io`)
   - Click **Save and continue**

### For Production

1. **Register your production domain**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Navigate to **Settings** → **Payment methods**
   - Click **Payment method domains**
   - Click **Add a new domain**
   - Enter your production domain (e.g., `teereserve-golf.web.app`)
   - Click **Save and continue**

2. **Verify domain ownership**:
   - Stripe will provide verification instructions
   - Follow the DNS or file upload verification method
   - Wait for verification to complete

## Environment Variables Check

Ensure these Stripe variables are properly configured:

```env
# Development
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

## Testing Apple Pay

### Requirements:
- ✅ HTTPS domain (use ngrok for local development)
- ✅ Domain registered in Stripe Dashboard
- ✅ Safari browser or iOS device
- ✅ Apple Pay enabled device/browser

### Test Steps:
1. Open your application in Safari
2. Navigate to checkout
3. Apple Pay should appear as a payment option
4. Test a payment with Apple Pay

## Troubleshooting

### Common Issues:

1. **Apple Pay not showing**:
   - Verify domain is registered in Stripe
   - Ensure you're using HTTPS
   - Check that you're using Safari or iOS

2. **Domain verification failed**:
   - Double-check domain spelling
   - Ensure DNS records are properly configured
   - Wait up to 24 hours for DNS propagation

3. **Still seeing warnings**:
   - Clear browser cache
   - Check browser console for additional errors
   - Verify Stripe keys are correct for your environment

## Quick Fix Commands

```bash
# Start development server with ngrok
npm run dev &
ngrok http 3000

# Test Stripe configuration
node scripts/test-stripe-payments.js
```

## Documentation Links

- [Stripe Domain Registration Guide](https://stripe.com/docs/payments/payment-methods/pmd-registration)
- [Apple Pay Setup](https://stripe.com/docs/apple-pay)
- [Stripe Dashboard](https://dashboard.stripe.com/)

---

**Note**: The clientSecret mutation error has been resolved. The remaining Apple Pay domain registration is a configuration issue that needs to be addressed in the Stripe Dashboard.