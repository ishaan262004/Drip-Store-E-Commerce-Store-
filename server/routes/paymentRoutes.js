const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/create-payment-intent
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body;

        // Validate amount (minimum $0.50 = 50 cents)
        if (!amount || typeof amount !== 'number' || amount < 50) {
            return res.status(400).json({ error: 'Invalid amount. Minimum is 50 cents.' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // amount in cents
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: { integration: 'drip-store' },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('Stripe error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
