import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const sections = [
    {
        title: 'Acceptance of Terms',
        content: `By accessing or using the DRIP Store website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. These terms apply to all visitors, users, and customers of the website.`,
    },
    {
        title: 'Account Responsibility',
        content: `When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password you use to access the service and for any activities or actions under your account. You agree to notify us immediately of any unauthorized access to your account. DRIP Store will not be liable for any loss or damage arising from your failure to comply with this section.`,
    },
    {
        title: 'Product Information',
        content: `We strive to display product colors, images, and descriptions as accurately as possible. However, we cannot guarantee that your device's display will accurately reflect the actual colors of the products. All product descriptions, pricing, and availability are subject to change without notice. We reserve the right to limit the quantities of any products or services we offer.`,
    },
    {
        title: 'Pricing & Payments',
        content: `All prices displayed on the website are in Indian Rupees (₹) unless otherwise stated and are inclusive of applicable taxes. We reserve the right to change prices at any time without prior notice. Payment must be made in full at the time of purchase through our accepted payment methods — including credit/debit cards, UPI, net banking, and select wallets. In the event of a pricing error, we reserve the right to cancel any orders placed at the incorrect price.`,
    },
    {
        title: 'Order Cancellation',
        content: `We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in product or pricing information, or suspected fraudulent activity. If your order is cancelled after payment has been processed, a full refund will be issued to your original payment method within 5-7 business days.`,
    },
    {
        title: 'Intellectual Property',
        content: `All content on this website — including text, graphics, logos, images, audio clips, digital downloads, data compilations, and software — is the property of DRIP Store or its content suppliers and is protected by international copyright laws. The DRIP brand name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of DRIP Store. You may not use such marks without our prior written permission.`,
    },
    {
        title: 'User Conduct',
        content: `You agree not to use the website for any unlawful purpose or in any way that could damage, disable, or impair the site. You may not attempt to gain unauthorized access to any part of the service, other accounts, computer systems, or networks. You agree not to use any automated means (bots, scrapers, etc.) to access the site for any purpose without our express written permission.`,
    },
    {
        title: 'Limitation of Liability',
        content: `DRIP Store shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of (or inability to access or use) the service. In no event shall our total liability exceed the amount you paid for the product or service giving rise to the claim.`,
    },
    {
        title: 'Governing Law',
        content: `These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.`,
    },
];

export default function TermsOfService() {
    useEffect(() => {
        document.title = 'Terms of Service — DRIP Store';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', 'Read the Terms of Service for DRIP Store. By using our website, you agree to these terms and conditions.');
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
                        Terms of <span className="text-gradient">Service</span>
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Last updated: February 22, 2026
                    </p>
                    <p className="text-text-secondary mt-4 leading-relaxed">
                        Please read these Terms of Service carefully before using the DRIP Store website. Your access to and use of the service is conditioned on your acceptance of and compliance with these terms.
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
                        These Terms of Service are effective as of February 22, 2026. We reserve the right to update or modify these terms at any time. Continued use of the website after any such changes constitutes your acceptance of the new terms.
                    </p>
                </div>
            </div>
        </div>
    );
}
