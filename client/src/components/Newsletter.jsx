import { useState } from 'react';
import { toast } from 'react-toastify';
import { HiOutlineMail } from 'react-icons/hi';

export default function Newsletter() {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        toast.success("You're on the list! 💌 Welcome to the drip fam.", { theme: 'dark' });
        setEmail('');
    };

    return (
        <section className="py-20 px-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />

            <div className="relative max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-6">
                    <HiOutlineMail className="w-4 h-4" />
                    Stay in the loop
                </div>
                <h2 className="text-3xl sm:text-4xl font-black mb-3">
                    Get the <span className="text-gradient">Drip</span> first
                </h2>
                <p className="text-text-secondary mb-8 max-w-md mx-auto">
                    Early access to drops, exclusive deals, and style inspo straight to your inbox. No spam, just vibes.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1 px-5 py-3 rounded-full bg-surface-card border border-border text-text-primary text-sm placeholder:text-text-secondary/50 focus:border-primary focus:outline-none transition"
                    />
                    <button
                        type="submit"
                        className="px-7 py-3 rounded-full bg-black hover:bg-gray-900 text-white font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/50 hover:scale-105 whitespace-nowrap border border-white/20"
                    >
                        Subscribe ✨
                    </button>
                </form>
            </div>
        </section>
    );
}
