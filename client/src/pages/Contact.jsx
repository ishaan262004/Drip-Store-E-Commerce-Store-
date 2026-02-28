import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMapPin, HiOutlineEnvelope, HiOutlinePhone, HiOutlineClock } from 'react-icons/hi2';
import { toast } from 'react-toastify';

const contactInfo = [
    { icon: HiOutlineMapPin, label: 'Address', value: 'Maharaja Agrasen Institute of Technology, Sector-22, Rohini, New Delhi — 110086' },
    { icon: HiOutlineEnvelope, label: 'Email', value: 'ishaanbaberwal@gmail.com', href: 'mailto:ishaanbaberwal@gmail.com' },
    { icon: HiOutlinePhone, label: 'Phone', value: '+91 9319950482', href: 'tel:+919319950482' },
    { icon: HiOutlineClock, label: 'Hours', value: 'Mon — Sat, 10:00 AM — 7:00 PM IST' },
];

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        document.title = 'Contact Us — DRIP Store';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', 'Get in touch with DRIP Store. We\'d love to hear from you — questions, feedback, or just to say hi.');
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast.warn('Please fill in all required fields.');
            return;
        }
        setSending(true);
        setTimeout(() => {
            toast.success('Message sent! We\'ll get back to you soon. 🔥');
            setForm({ name: '', email: '', subject: '', message: '' });
            setSending(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <Link to="/" className="text-xs uppercase tracking-widest text-text-secondary hover:text-primary-light transition-colors">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl sm:text-6xl font-black mt-6 mb-4">
                        Get in <span className="text-gradient">Touch</span>
                    </h1>
                    <p className="text-text-secondary max-w-xl mx-auto leading-relaxed">
                        Have a question, suggestion, or just want to say hi? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-10">
                    {/* Contact Info */}
                    <div className="lg:col-span-2 space-y-4">
                        {contactInfo.map((item, i) => (
                            <div key={i} className="group flex items-start gap-4 p-5 rounded-2xl bg-surface-card border border-border hover:border-primary/30 transition-colors">
                                <item.icon className="w-6 h-6 text-text-secondary group-hover:text-primary-light transition-colors flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-text-secondary mb-1">{item.label}</p>
                                    {item.href ? (
                                        <a href={item.href} className="text-sm font-medium text-text-primary hover:text-primary-light transition-colors">
                                            {item.value}
                                        </a>
                                    ) : (
                                        <p className="text-sm text-text-primary leading-relaxed">{item.value}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-surface-card border border-border space-y-5">
                        <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="contact-name" className="block text-xs uppercase tracking-wider text-text-secondary mb-2">Name *</label>
                                <input
                                    id="contact-name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label htmlFor="contact-email" className="block text-xs uppercase tracking-wider text-text-secondary mb-2">Email *</label>
                                <input
                                    id="contact-email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="contact-subject" className="block text-xs uppercase tracking-wider text-text-secondary mb-2">Subject</label>
                            <input
                                id="contact-subject"
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                placeholder="What's this about?"
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="contact-message" className="block text-xs uppercase tracking-wider text-text-secondary mb-2">Message *</label>
                            <textarea
                                id="contact-message"
                                name="message"
                                rows={5}
                                value={form.message}
                                onChange={handleChange}
                                placeholder="Tell us what's on your mind..."
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full py-3.5 rounded-full bg-white text-black font-bold text-sm hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? 'Sending...' : 'Send Message →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
