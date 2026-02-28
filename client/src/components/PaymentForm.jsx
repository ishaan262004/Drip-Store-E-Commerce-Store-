import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const cardStyle = {
    style: {
        base: {
            color: '#ffffff',
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            '::placeholder': { color: '#666666' },
        },
        invalid: { color: '#ff4444' },
    },
};

export default function PaymentForm({ total, onSuccess, disabled }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handlePay = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        try {
            // 1. Create PaymentIntent on backend
            const { data } = await axios.post(`${API_BASE}/api/payments/create-payment-intent`, {
                amount: Math.round(total * 100), // dollars to cents
            });

            if (data.error) throw new Error(data.error);

            // 2. Confirm card payment
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: { card: elements.getElement(CardElement) },
            });

            if (stripeError) {
                setError(stripeError.message);
                toast.error(stripeError.message);
            } else if (paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent.id);
            }
        } catch (err) {
            setError(err.message);
            toast.error('Payment failed: ' + err.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handlePay} className="space-y-5">
            {/* Card Input */}
            <div className="p-4 rounded-xl bg-surface border border-border">
                <label className="block text-xs uppercase tracking-wider text-text-secondary mb-3">Card Details</label>
                <CardElement options={cardStyle} />
            </div>

            {/* Test Card Hint */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-card border border-border/50">
                <span className="text-xs text-text-secondary">🧪 Test card:</span>
                <code className="text-xs text-primary-light font-mono">4242 4242 4242 4242</code>
                <span className="text-xs text-text-secondary">| Any future date | Any CVC</span>
            </div>

            {/* Error */}
            {error && (
                <p className="text-sm text-red-400 bg-red-400/10 px-4 py-2 rounded-xl">{error}</p>
            )}

            {/* Pay Button */}
            <button
                type="submit"
                disabled={!stripe || processing || disabled}
                className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm transition-all hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {processing ? (
                    <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Processing...
                    </>
                ) : (
                    `Pay $${total.toFixed(2)}`
                )}
            </button>

            <p className="text-xs text-text-secondary text-center">
                🔒 Payments are securely processed by Stripe. We never store your card details.
            </p>
        </form>
    );
}
