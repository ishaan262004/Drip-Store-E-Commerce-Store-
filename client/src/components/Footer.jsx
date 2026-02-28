import { Link } from 'react-router-dom';
import { FaInstagram, FaXTwitter, FaTiktok, FaYoutube } from 'react-icons/fa6';

export default function Footer() {
    const year = new Date().getFullYear();

    const links = {
        Shop: [
            { label: 'Men', to: '/products?category=Men' },
            { label: 'Women', to: '/products?category=Women' },
            { label: 'Accessories', to: '/products?category=Accessories' },
            { label: 'New Arrivals', to: '/products' },
        ],
        Company: [
            { label: 'About Us', to: '/about' },
            { label: 'Contact', to: '/contact' },
            { label: 'Careers', to: '/careers' },
        ],
        Legal: [
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Terms of Service', to: '/terms' },
            { label: 'Return Policy', to: '/returns' },
        ],
    };

    const socials = [
        { icon: <FaInstagram />, href: '#' },
        { icon: <FaXTwitter />, href: '#' },
        { icon: <FaTiktok />, href: '#' },
        { icon: <FaYoutube />, href: '#' },
    ];

    return (
        <footer className="bg-surface-light border-t border-border mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
                    {/* Brand */}
                    <div className="col-span-2">
                        <Link to="/" className="text-3xl font-black text-gradient">DRIP</Link>
                        <p className="mt-3 text-text-secondary text-sm leading-relaxed max-w-xs">
                            Your one-stop destination for trendy Gen-Z fashion. Stay dripped, stay lit. 🔥
                        </p>
                        <div className="flex gap-3 mt-5">
                            {socials.map((s, i) => (
                                <a key={i} href={s.href} className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-text-secondary hover:text-primary-light hover:bg-primary/10 transition-all duration-200 text-lg">
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Groups */}
                    {Object.entries(links).map(([title, items]) => (
                        <div key={title}>
                            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">{title}</h4>
                            <ul className="space-y-2.5">
                                {items.map((item) => (
                                    <li key={item.label}>
                                        <Link to={item.to} className="text-sm text-text-secondary hover:text-primary-light transition-colors duration-200">
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="mt-14 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-text-secondary">© {year} DRIP Store. All rights reserved.</p>
                    <p className="text-xs text-text-secondary">Made by Ishaan Baberwal for the CULTURE</p>
                </div>
            </div>
        </footer>
    );
}
