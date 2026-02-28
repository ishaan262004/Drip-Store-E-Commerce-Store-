import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const sections = [
    {
        title: 'Eligibility for Returns',
        content: `We want you to love every piece you purchase from DRIP Store. If you're not completely satisfied, you may return most items within 7 days of delivery. Items must be unworn, unwashed, and in their original condition with all tags attached. The original packaging must be included. Items purchased during sale events are eligible for exchange only, not refunds.`,
    },
    {
        title: 'Non-Returnable Items',
        content: `For hygiene and safety reasons, the following items cannot be returned or exchanged: innerwear and undergarments, swimwear, socks, face masks, accessories that have been used or show signs of wear, customized or personalized items, and any product marked as "Final Sale" or "Non-Returnable" on the product page.`,
    },
    {
        title: 'How to Initiate a Return',
        content: `To start a return, log in to your DRIP Store account and navigate to "My Orders." Select the item you wish to return and choose the reason for return. Once your return request is approved, you will receive a prepaid return shipping label via email. Pack the item securely in its original packaging and drop it off at the nearest courier partner location or schedule a pickup.`,
    },
    {
        title: 'Refund Process',
        content: `Once we receive and inspect your returned item, we will notify you via email about the approval or rejection of your refund. If approved, your refund will be processed within 5-7 business days to your original payment method. Please note that it may take an additional 3-5 business days for the refund to reflect in your bank account, depending on your financial institution. Original shipping charges are non-refundable.`,
    },
    {
        title: 'Exchange Policy',
        content: `We offer free exchanges for different sizes or colors of the same item, subject to availability. To request an exchange, follow the same process as a return and select "Exchange" as your preference. The replacement item will be shipped once we receive the original item. If the requested size or color is unavailable, you will be offered a full refund or store credit.`,
    },
    {
        title: 'Damaged or Defective Items',
        content: `If you receive a damaged, defective, or incorrect item, please contact us within 48 hours of delivery with photos of the issue. We will arrange a free pickup and send a replacement or issue a full refund at no additional cost. Damaged item claims made after 48 hours will be reviewed on a case-by-case basis.`,
    },
    {
        title: 'Shipping Responsibility',
        content: `For standard returns, DRIP Store provides a prepaid return shipping label at no cost for your first return per order. Additional returns from the same order may incur a shipping fee of ₹99. For exchanges, all shipping costs are covered by DRIP Store. Items shipped back to us without a valid return authorization will not be accepted.`,
    },
    {
        title: 'Store Credit',
        content: `As an alternative to a refund, you may opt to receive DRIP Store credit. Store credit is issued instantly upon return approval and never expires. Store credit can be used on any future purchase and cannot be converted to cash. Store credit is non-transferable and tied to your account.`,
    },
];

export default function ReturnPolicy() {
    useEffect(() => {
        document.title = 'Return Policy — DRIP Store';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', 'Learn about DRIP Store return, refund, and exchange policies. Easy 7-day returns on most items.');
    }, []);

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <Link to="/" className="text-xs uppercase tracking-widest text-text-secondary hover:text-primary-light transition-colors">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl sm:text-5xl font-black mt-4 mb-3">
                        Return <span className="text-gradient">Policy</span>
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Last updated: February 22, 2026
                    </p>
                    <p className="text-text-secondary mt-4 leading-relaxed">
                        We want every DRIP Store purchase to be a perfect fit. If something isn't right, our hassle-free return and exchange process has you covered.
                    </p>
                </div>

                {/* Quick Info Bar */}
                <div className="grid grid-cols-3 gap-3 mb-12">
                    {[
                        { label: 'Return Window', value: '7 Days' },
                        { label: 'Refund Time', value: '5-7 Days' },
                        { label: 'Free Exchanges', value: 'Always' },
                    ].map((item, i) => (
                        <div key={i} className="text-center p-4 rounded-xl bg-surface-card border border-border">
                            <p className="text-lg sm:text-xl font-black text-gradient">{item.value}</p>
                            <p className="text-xs text-text-secondary mt-1">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Sections */}
                <div className="space-y-10">
                    {sections.map((section, i) => (
                        <section key={i} className="group">
                            <div className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-card border border-border flex items-center justify-center text-xs font-bold text-text-secondary group-hover:border-primary/30 group-hover:text-primary-light transition-colors">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <div>
                                    <h2 className="text-xl font-bold text-text-primary mb-3 group-hover:text-gradient transition-colors">
                                        {section.title}
                                    </h2>
                                    <p className="text-text-secondary leading-relaxed text-sm">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                {/* Footer note */}
                <div className="mt-16 pt-8 border-t border-border">
                    <p className="text-xs text-text-secondary leading-relaxed">
                        This Return Policy is effective as of February 22, 2026. For any questions about returns, exchanges, or refunds, please contact our support team at support@dripstore.com.
                    </p>
                </div>
            </div>
        </div>
    );
}
