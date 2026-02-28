import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const sections = [
    {
        title: 'Information We Collect',
        content: `We collect information you provide directly, including your name, email address, shipping address, phone number, and payment details when you create an account or place an order. We also automatically collect browsing data such as IP address, device type, browser information, and pages visited through cookies and similar technologies.`,
    },
    {
        title: 'How We Use Your Information',
        content: `Your information helps us process and fulfill orders, personalize your shopping experience, send order confirmations and shipping updates, improve our website and product offerings, prevent fraud and unauthorized transactions, and communicate promotional offers (with your consent). We never sell your personal data to third parties.`,
    },
    {
        title: 'Payment Security',
        content: `All payment transactions are processed through industry-leading, PCI-DSS compliant payment gateways. We do not store your full credit card details on our servers. Payment information is encrypted using SSL/TLS technology during transmission. We partner with Stripe and Razorpay for secure payment processing.`,
    },
    {
        title: 'Cookies & Tracking',
        content: `We use essential cookies to keep your cart items saved and maintain your session. Analytics cookies help us understand how visitors interact with our site so we can improve the experience. Marketing cookies may be used to deliver relevant advertisements. You can manage cookie preferences through your browser settings at any time.`,
    },
    {
        title: 'Data Protection',
        content: `We implement industry-standard security measures including data encryption at rest and in transit, regular security audits and vulnerability assessments, access controls limiting employee access to personal data, and secure data centers with physical security measures. We retain your data only as long as necessary to fulfill the purposes outlined in this policy.`,
    },
    {
        title: 'Your Rights',
        content: `You have the right to access, correct, or delete your personal information at any time. You may request a copy of all data we hold about you, opt out of marketing communications, request deletion of your account and associated data, and lodge a complaint with a data protection authority. To exercise any of these rights, contact us at privacy@dripstore.com.`,
    },
    {
        title: 'Third-Party Services',
        content: `We may share your information with trusted third-party service providers who assist in operating our website, conducting business, or servicing you — including shipping carriers, payment processors, and analytics providers. These parties are contractually obligated to keep your information confidential and secure.`,
    },
    {
        title: 'Contact Information',
        content: `If you have questions about this Privacy Policy or our data practices, please contact us at privacy@dripstore.com or write to us at DRIP Store, 123 Fashion Avenue, Mumbai, Maharashtra 400001, India.`,
    },
];

export default function PrivacyPolicy() {
    useEffect(() => {
        document.title = 'Privacy Policy — DRIP Store';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', 'Learn how DRIP Store collects, uses, and protects your personal information. Your privacy matters to us.');
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
                        Privacy <span className="text-gradient">Policy</span>
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Last updated: February 22, 2026
                    </p>
                    <p className="text-text-secondary mt-4 leading-relaxed">
                        At DRIP Store, we are committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information when you visit our website or make a purchase.
                    </p>
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
                        This Privacy Policy is effective as of February 22, 2026 and will remain in effect until modified. We reserve the right to update this policy at any time. Changes will be posted on this page with an updated revision date.
                    </p>
                </div>
            </div>
        </div>
    );
}
