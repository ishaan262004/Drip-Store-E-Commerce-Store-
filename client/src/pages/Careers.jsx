import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineBriefcase, HiOutlineMapPin, HiOutlineClock } from 'react-icons/hi2';
import { toast } from 'react-toastify';

const openings = [
    { title: 'Frontend Developer', type: 'Full-time', location: 'New Delhi', desc: 'Build beautiful, performant interfaces using React, Next.js, and Tailwind CSS.' },
    { title: 'UI/UX Designer', type: 'Full-time', location: 'Remote', desc: 'Craft pixel-perfect designs for web and mobile that define the DRIP experience.' },
    { title: 'Social Media Manager', type: 'Part-time', location: 'Remote', desc: 'Own our Instagram, TikTok, and X presence. Create viral content for Gen-Z audiences.' },
    { title: 'Content Writer', type: 'Freelance', location: 'Remote', desc: 'Write compelling product descriptions, blog posts, and marketing copy.' },
    { title: 'Supply Chain Intern', type: 'Internship', location: 'New Delhi', desc: 'Help optimize our inventory management and logistics operations.' },
];

const perks = [
    '🏠 Remote-first culture',
    '💰 Competitive compensation',
    '👕 Free DRIP merch every quarter',
    '📚 Learning & development budget',
    '🎯 Flexible work hours',
    '🚀 Fast-track growth opportunities',
];

export default function Careers() {
    const [form, setForm] = useState({ name: '', email: '', role: '', message: '' });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        document.title = 'Careers — DRIP Store';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', 'Join the DRIP Store team. Explore open positions and apply to be part of the freshest streetwear brand.');
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
            toast.success('Application received! We\'ll review it and get back to you. 🔥');
            setForm({ name: '', email: '', role: '', message: '' });
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
                        Join the <span className="text-gradient">Squad</span>
                    </h1>
                    <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        We're building the future of streetwear in India. If you're creative, driven, and live for the culture — we want you on the team.
                    </p>
                </div>

                {/* Perks */}
                <div className="mb-16 p-6 sm:p-8 rounded-2xl bg-surface-card border border-border">
                    <h2 className="text-xl font-black mb-5">Why Work at <span className="text-gradient">DRIP</span></h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {perks.map((perk, i) => (
                            <div key={i} className="text-sm text-text-secondary py-2">{perk}</div>
                        ))}
                    </div>
                </div>

                {/* Open Positions */}
                <div className="mb-16">
                    <h2 className="text-2xl sm:text-3xl font-black mb-8">Open <span className="text-gradient">Positions</span></h2>
                    <div className="space-y-4">
                        {openings.map((job, i) => (
                            <div key={i} className="group p-5 sm:p-6 rounded-2xl bg-surface-card border border-border hover:border-primary/30 transition-all duration-300">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-bold group-hover:text-gradient transition-colors">{job.title}</h3>
                                        <p className="text-sm text-text-secondary mt-1">{job.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="flex items-center gap-1 text-xs text-text-secondary">
                                            <HiOutlineBriefcase className="w-3.5 h-3.5" /> {job.type}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-text-secondary">
                                            <HiOutlineMapPin className="w-3.5 h-3.5" /> {job.location}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Application Form */}
                <div id="apply" className="scroll-mt-28">
                    <h2 className="text-2xl sm:text-3xl font-black mb-8">Apply <span className="text-gradient">Now</span></h2>
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-surface-card border border-border space-y-5">
                        <p className="text-sm text-text-secondary mb-2">
                            Interested in joining DRIP? Fill out the form below and we'll get back to you within 3-5 business days.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="career-name" className="block text-xs uppercase tracking-wider text-text-secondary mb-2">Full Name *</label>
                                <input
                                    id="career-name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label htmlFor="career-email" className="block text-xs uppercase tracking-wider text-text-secondary mb-2">Email *</label>
                                <input
                                    id="career-email"
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
                            <label htmlFor="career-role" className="block text-xs uppercase tracking-wider text-text-secondary mb-2">Position Interested In</label>
                            <select
                                id="career-role"
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                            >
                                <option value="">Select a role...</option>
                                {openings.map((job, i) => (
                                    <option key={i} value={job.title}>{job.title} — {job.type}</option>
                                ))}
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="career-message" className="block text-xs uppercase tracking-wider text-text-secondary mb-2">Tell Us About Yourself *</label>
                            <textarea
                                id="career-message"
                                name="message"
                                rows={5}
                                value={form.message}
                                onChange={handleChange}
                                placeholder="Share your experience, portfolio links, or anything you'd like us to know..."
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full py-3.5 rounded-full bg-white text-black font-bold text-sm hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? 'Submitting...' : 'Submit Application →'}
                        </button>
                        <p className="text-xs text-text-secondary text-center">
                            Or email us directly at <a href="mailto:ishaanbaberwal@gmail.com" className="text-primary-light hover:underline">ishaanbaberwal@gmail.com</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
