import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSparkles, HiOutlineGlobeAlt, HiOutlineHeart, HiOutlineBolt } from 'react-icons/hi2';

const values = [
    { icon: HiOutlineSparkles, title: 'Bold Creativity', desc: 'We push boundaries and redefine what streetwear means for the next generation.' },
    { icon: HiOutlineGlobeAlt, title: 'Sustainability First', desc: 'Ethical sourcing, eco-friendly packaging, and conscious production at every step.' },
    { icon: HiOutlineHeart, title: 'Community Driven', desc: 'Built by the culture, for the culture. Every drop is shaped by our community.' },
    { icon: HiOutlineBolt, title: 'Quality Over Hype', desc: 'Premium fabrics, precision tailoring, and pieces that last beyond the trend cycle.' },
];

const stats = [
    { value: '50K+', label: 'Happy Customers' },
    { value: '500+', label: 'Products' },
    { value: '15+', label: 'Cities' },
    { value: '4.8★', label: 'Avg. Rating' },
];

const team = [
    { name: 'Ishaan Baberwal', role: 'Founder & CEO', initial: 'IB' },
];

export default function AboutUs() {
    useEffect(() => {
        document.title = 'About Us — DRIP Store';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', 'Learn about DRIP Store — our story, values, and the team behind the freshest streetwear brand.');
    }, []);

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <Link to="/" className="text-xs uppercase tracking-widest text-text-secondary hover:text-primary-light transition-colors">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl sm:text-6xl font-black mt-6 mb-4">
                        We Are <span className="text-gradient">DRIP</span>
                    </h1>
                    <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        Born from the streets, built for the culture. DRIP Store is more than a clothing brand — it's a movement. We curate bold, unapologetic streetwear that lets you express who you are without saying a word.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center p-6 rounded-2xl bg-surface-card border border-border hover:border-primary/30 transition-colors">
                            <p className="text-3xl sm:text-4xl font-black text-gradient">{stat.value}</p>
                            <p className="text-xs text-text-secondary mt-2 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Story */}
                <div className="mb-20">
                    <h2 className="text-2xl sm:text-3xl font-black mb-6">Our <span className="text-gradient">Story</span></h2>
                    <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
                        <p>
                            DRIP Store started in 2024 as a small passion project from a college dorm room at Maharaja Agrasen Institute of Technology, New Delhi. What began as a curated collection of streetwear for friends quickly grew into a full-fledged brand embraced by thousands across India.
                        </p>
                        <p>
                            We noticed a gap in the Indian fashion scene — quality streetwear that didn't break the bank but still carried the premium feel of international brands. So we set out to bridge that gap, one drop at a time.
                        </p>
                        <p>
                            Today, DRIP Store offers over 500 products across men's, women's, and accessories categories — from oversized tees and cargo pants to statement sneakers and premium accessories. Every piece is designed to make you feel confident, bold, and unapologetically yourself.
                        </p>
                    </div>
                </div>

                {/* Values */}
                <div className="mb-20">
                    <h2 className="text-2xl sm:text-3xl font-black mb-8">What We <span className="text-gradient">Stand For</span></h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {values.map((value, i) => (
                            <div key={i} className="group p-6 rounded-2xl bg-surface-card border border-border hover:border-primary/30 transition-all duration-300">
                                <value.icon className="w-8 h-8 text-text-secondary group-hover:text-primary-light transition-colors mb-4" />
                                <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team */}
                <div className="mb-20">
                    <h2 className="text-2xl sm:text-3xl font-black mb-8">The <span className="text-gradient">Team</span></h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {team.map((member, i) => (
                            <div key={i} className="text-center p-6 rounded-2xl bg-surface-card border border-border hover:border-primary/30 transition-colors">
                                <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4">
                                    <span className="text-lg font-black text-gradient">{member.initial}</span>
                                </div>
                                <h3 className="font-bold text-sm">{member.name}</h3>
                                <p className="text-xs text-text-secondary mt-1">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center p-10 rounded-2xl bg-surface-card border border-border">
                    <h2 className="text-2xl font-black mb-3">Want to Join the <span className="text-gradient">Movement</span>?</h2>
                    <p className="text-text-secondary text-sm mb-6">We're always looking for passionate people to join our team.</p>
                    <Link to="/careers" className="inline-block px-8 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-primary-light transition-colors">
                        View Open Positions →
                    </Link>
                </div>
            </div>
        </div>
    );
}
