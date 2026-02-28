import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

// Premium B&W Streetwear Hero Images
const heroSlides = [
    {
        image: 'https://res.cloudinary.com/dzewuyhhx/image/upload/v1771753571/drip-store/hero/hero-slide-5.jpg',
        headline: 'SQUAD GOALS.',
        subtext: 'Coordinated drip. Unmatched energy.',
        cta1: 'VIEW ALL',
        cta2: 'NEW ARRIVALS',
        cta1Link: '/products',
        cta2Link: '/products?category=Men'
    },
    {
        image: 'https://res.cloudinary.com/dzewuyhhx/image/upload/v1771753569/drip-store/hero/hero-slide-2.jpg',
        headline: 'BUILT DIFFERENT.',
        subtext: 'Varsity. Workwear. Moto.',
        cta1: 'VIEW DROP',
        cta1Link: '/products'
    },
    {
        image: '/hero-slide-3-new.png',
        headline: 'DRIP SO CLEAN.',
        subtext: 'Fresh fits. Bold moves. Zero limits.',
        cta1: 'DISCOVER MORE',
        cta1Link: '/products',
        objectPos: 'center bottom'
    },
    {
        image: 'https://res.cloudinary.com/dzewuyhhx/image/upload/v1771753570/drip-store/hero/hero-slide-4.jpg',
        headline: 'WALK THE LINE.',
        subtext: 'Elegance meets edge. Own the night.',
        cta1: 'SHOP WOMEN',
        cta1Link: '/products?category=Women',
        objectPos: 'center 20%'
    },
    {
        image: 'https://res.cloudinary.com/dzewuyhhx/image/upload/v1771753568/drip-store/hero/hero-slide-1.jpg',
        headline: 'OWN THE SHADOW.',
        subtext: 'Streetwear built for presence.',
        cta1: 'SHOP NOW',
        cta2: 'EXPLORE COLLECTION',
        cta1Link: '/products',
        cta2Link: '/products?category=Men'
    }
];

export default function HeroBanner() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-slide every 3 seconds
    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [isPaused]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    };

    return (
        <section
            className="relative h-screen w-full overflow-hidden grain-texture"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background Image Slider */}
            {heroSlides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 z-0 pointer-events-none transition-all duration-1000 ease-out ${index === currentSlide
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-105'
                        }`}
                >
                    <img
                        src={slide.image}
                        alt={slide.headline}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: slide.objectPos || 'center top', minWidth: '100%', minHeight: '100%' }}
                    />
                    {/* Darker overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/60" />
                </div>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
                aria-label="Previous slide"
            >
                <HiOutlineChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:text-white transition-colors" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
                aria-label="Next slide"
            >
                <HiOutlineChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:text-white transition-colors" />
            </button>

            {/* Content Container */}
            <div className="relative z-20 h-full flex items-center justify-center pointer-events-none">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
                    {/* Animated Content */}
                    {heroSlides.map((slide, index) => (
                        <div
                            key={index}
                            className={`transition-all duration-700 ${index === currentSlide
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-8 absolute inset-0'
                                }`}
                        >
                            {index === currentSlide && (
                                <>
                                    {/* Headline */}
                                    <h1
                                        className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl"
                                        style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
                                    >
                                        {slide.headline}
                                    </h1>

                                    {/* Subtext */}
                                    <p
                                        className="text-xl sm:text-2xl lg:text-3xl text-gray-200 mb-10 font-light tracking-wide drop-shadow-lg"
                                        style={{ fontFamily: "'Inter', sans-serif", textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}
                                    >
                                        {slide.subtext}
                                    </p>

                                    {/* CTA Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                        {/* Primary Button - Solid White */}
                                        <Link
                                            to={slide.cta1Link}
                                            className="group pointer-events-auto px-10 py-4 bg-white text-black font-bold text-sm uppercase tracking-wider rounded-lg transition-all duration-300 hover:bg-black hover:text-white border-2 border-white shadow-xl hover:shadow-2xl"
                                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                        >
                                            {slide.cta1}
                                        </Link>

                                        {/* Secondary Button - Outline */}
                                        {slide.cta2 && (
                                            <Link
                                                to={slide.cta2Link}
                                                className="group pointer-events-auto px-10 py-4 bg-black/30 backdrop-blur-sm text-white font-bold text-sm uppercase tracking-wider rounded-lg border-2 border-white transition-all duration-300 hover:bg-white hover:text-black shadow-xl hover:shadow-2xl"
                                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                            >
                                                {slide.cta2}
                                            </Link>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Progress Indicators */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                {heroSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentSlide
                            ? 'bg-white w-8'
                            : 'bg-white/40 hover:bg-white/60'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>


        </section>
    );
}
