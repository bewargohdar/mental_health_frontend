import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Play,
    ArrowRight,
    Brain,
    Heart,
    Users,
    Phone,
    CheckCircle,
    Star,
    Sparkles,
    Activity,
    MessageCircle,
    Calendar,
    Lightbulb,
    TrendingUp,
    Shield,
    Lock,
    Award,
    HeartHandshake,
    Quote
} from 'lucide-react';
import api from '../api/axios';

// Breathing Circle Component
const BreathingCircle = () => (
    <div className="breathing-circle mb-8">
        <div className="breathing-circle-outer"></div>
        <div className="breathing-circle-middle"></div>
        <div className="breathing-circle-inner"></div>
    </div>
);

// Mood Check Widget Component
const MoodCheckWidget = ({ onMoodSelect }) => {
    const [selectedMood, setSelectedMood] = useState(null);
    const { t } = useTranslation();

    const moods = [
        { emoji: '😊', label: 'Happy', value: 5 },
        { emoji: '😌', label: 'Calm', value: 4 },
        { emoji: '😔', label: 'Sad', value: 2 },
        { emoji: '😰', label: 'Anxious', value: 2 },
        { emoji: '😤', label: 'Frustrated', value: 2 },
        { emoji: '🌟', label: 'Hopeful', value: 4 },
    ];

    const handleSelect = (mood) => {
        setSelectedMood(mood.value === selectedMood ? null : mood.value);
        if (onMoodSelect) onMoodSelect(mood);
    };

    return (
        <div className="mood-check-widget">
            <h3 className="mood-check-title">
                {t('home.moodCheck', 'How are you feeling right now?')}
            </h3>
            <div className="mood-check-emojis">
                {moods.map((mood, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSelect(mood)}
                        className={`mood-check-emoji focus-calm ${selectedMood === mood.value ? 'selected' : ''}`}
                        aria-label={mood.label}
                        title={mood.label}
                    >
                        {mood.emoji}
                    </button>
                ))}
            </div>
            {selectedMood && (
                <Link
                    to="/track-mood"
                    className="inline-flex items-center gap-2 mt-4 text-sm text-[var(--primary)] hover:underline"
                >
                    {t('home.logFullMood', 'Log your full mood entry')}
                    <ArrowRight className="w-4 h-4" />
                </Link>
            )}
        </div>
    );
};

// Trust Badge Component
const TrustBadge = ({ icon: Icon, title, description }) => (
    <div className="trust-badge">
        <div className="trust-badge-icon">
            <Icon className="w-5 h-5" />
        </div>
        <div className="trust-badge-content">
            <h4>{title}</h4>
            <p>{description}</p>
        </div>
    </div>
);

// Crisis Banner Component
const CrisisBanner = () => {
    const { t } = useTranslation();
    return (
        <a href="tel:988" className="crisis-banner block">
            <div className="crisis-banner-icon">
                <Phone className="w-5 h-5" />
            </div>
            <div className="crisis-banner-text">
                <h4>{t('home.crisisTitle', '24/7 Crisis Support')}</h4>
                <p>{t('home.crisisDesc', 'Call 988 anytime you need someone to talk to')}</p>
            </div>
        </a>
    );
};

// Testimonial Card Component
const TestimonialCard = ({ quote, author, role }) => (
    <div className="testimonial-card">
        <p className="testimonial-quote">{quote}</p>
        <div className="testimonial-author">
            <div className="testimonial-avatar">
                <HeartHandshake className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div className="testimonial-author-info">
                <span>{author}</span>
                <small>{role}</small>
            </div>
        </div>
    </div>
);

export default function Home() {
    const { t } = useTranslation();
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [weeklyProgress, setWeeklyProgress] = useState([]);
    const [daysLogged, setDaysLogged] = useState(0);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    const testimonials = [
        {
            quote: "Nafas helped me understand my emotions better. The mood tracking feature made me realize patterns I never noticed before.",
            author: "Anonymous User",
            role: "Member since 2025"
        },
        {
            quote: "Finding a therapist through this platform changed my life. The doctors here truly care about their patients.",
            author: "Sarah M.",
            role: "Verified Member"
        },
        {
            quote: "The community feature made me feel less alone. Knowing others share similar experiences is incredibly comforting.",
            author: "Anonymous User",
            role: "Community Member"
        }
    ];

    useEffect(() => {
        const fetchTips = async () => {
            try {
                const res = await api.get('/wellness-tips');
                setTips(res.data.data || []);
            } catch (error) {
                console.error('Failed to fetch tips:', error);
                setTips([]);
            } finally {
                setLoading(false);
            }
        };

        const fetchWeeklyProgress = async () => {
            try {
                const res = await api.get('/progress/weekly');
                const data = res.data.data || [];

                const chartData = data.map(item => ({
                    day: item.day,
                    value: item.avg_mood ? (item.avg_mood / 5) * 100 : 0,
                    logged: item.count > 0
                }));

                setWeeklyProgress(chartData);
                setDaysLogged(chartData.filter(d => d.logged).length);
            } catch (error) {
                console.error('Failed to fetch weekly progress:', error);
                setWeeklyProgress([]);
            }
        };

        fetchTips();
        fetchWeeklyProgress();
    }, []);

    // Rotate tips every 10 seconds
    useEffect(() => {
        if (tips.length > 1) {
            const interval = setInterval(() => {
                setCurrentTipIndex((prev) => (prev + 1) % tips.length);
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [tips]);

    // Rotate testimonials every 8 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    const features = [
        {
            icon: Activity,
            title: t('home.features.trackMood'),
            description: t('home.features.trackMoodDesc'),
            color: 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)]',
            link: '/track-mood'
        },
        {
            icon: Brain,
            title: t('home.features.learn'),
            description: t('home.features.learnDesc'),
            color: 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)]',
            link: '/learn'
        },
        {
            icon: Users,
            title: t('home.features.community'),
            description: t('home.features.communityDesc'),
            color: 'bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-dark)]',
            link: '/community'
        },
        {
            icon: Phone,
            title: t('home.features.doctors'),
            description: t('home.features.doctorsDesc'),
            color: 'bg-gradient-to-br from-[var(--pink)] to-rose-500',
            link: '/doctors'
        },
    ];

    const trustBadges = [
        {
            icon: Lock,
            title: t('home.trust.privacy', 'Your Data is Private'),
            description: t('home.trust.privacyDesc', 'End-to-end encryption')
        },
        {
            icon: Award,
            title: t('home.trust.licensed', 'Licensed Professionals'),
            description: t('home.trust.licensedDesc', 'Verified credentials')
        },
        {
            icon: Shield,
            title: t('home.trust.safe', 'Safe & Confidential'),
            description: t('home.trust.safeDesc', 'No judgment, ever')
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section - Calm Redesign */}
            <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
                {/* Ambient pattern background */}
                <div className="ambient-pattern"></div>

                {/* Floating decorative blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -end-40 w-96 h-96 bg-[var(--primary-light)] rounded-full opacity-15 blur-3xl float-gentle"></div>
                    <div className="absolute top-40 -start-40 w-80 h-80 bg-[var(--accent-light)] rounded-full opacity-15 blur-3xl float-gentle float-gentle-delay-1"></div>
                    <div className="absolute bottom-0 start-1/2 w-72 h-72 bg-[var(--secondary-light)] rounded-full opacity-15 blur-3xl float-gentle float-gentle-delay-2"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Safe Space Tag */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-[var(--primary-light)] text-[var(--primary-dark)] mb-8 animate-fade-in-up">
                            <Heart className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">{t('home.safeSpace', 'A safe space for your wellness journey')}</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight animate-fade-in-up delay-100">
                            <span className="gradient-text">{t('home.welcome')}</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                            {t('home.heroDescription')}
                        </p>

                        {/* Breathing Circle - Integrated */}
                        <div className="flex justify-center mb-12 animate-fade-in-up delay-300">
                            <BreathingCircle />
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-5 justify-center animate-fade-in-up delay-400">
                            <Link to="/track-mood" className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-lg">
                                {t('home.startJourney')}
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/learn" className="btn-gentle inline-flex items-center justify-center gap-2 px-8 py-4 text-lg">
                                <Play className="w-5 h-5" />
                                {t('home.learnMore')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mood & Daily Insights Section - Joined for cleaner layout */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 relative z-10 -mt-10">
                <div className="max-w-6xl mx-auto">
                    {/* Main Mood Check - Floating Card */}
                    <div className="mb-8 transform hover:-translate-y-1 transition-transform duration-500">
                        <MoodCheckWidget />
                    </div>

                    {/* Grid for Tip and Progress */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Daily Wellness Tip */}
                        <div className="wellness-tip-home relative h-full">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/40 flex items-center justify-center">
                                    <Lightbulb className="w-6 h-6 text-[var(--primary-dark)]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                                        {t('home.dailyTip')}
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/40 font-medium">Daily</span>
                                    </h3>
                                    <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
                                        {loading ? (
                                            <span className="inline-block w-full h-5 bg-white/30 rounded animate-pulse"></span>
                                        ) : (
                                            tips[currentTipIndex]?.content || "Take a moment to breathe deeply. Inhale peace, exhale tension."
                                        )}
                                    </p>
                                    {tips.length > 1 && (
                                        <div className="flex gap-2 mt-6">
                                            {tips.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentTipIndex(idx)}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentTipIndex
                                                        ? 'bg-[var(--primary)] w-8'
                                                        : 'bg-black/10 w-2 hover:bg-black/20'
                                                        }`}
                                                    aria-label={`View tip ${idx + 1}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Weekly Progress */}
                        <div className="card p-6 md:p-8 h-full flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
                                    {t('home.weeklyProgress')}
                                </h3>
                                <span className="text-sm font-medium bg-[var(--light-blue)] text-[var(--primary-dark)] px-3 py-1 rounded-full">
                                    {daysLogged}/7 days
                                </span>
                            </div>

                            <div className="flex items-end justify-between gap-3 h-32">
                                {weeklyProgress.length > 0 ? (
                                    weeklyProgress.map((day, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                            <div className="w-full bg-[var(--light-gray)] rounded-t-lg relative overflow-hidden transition-all duration-500 group-hover:bg-[var(--border)]" style={{ height: '100%' }}>
                                                <div
                                                    className="absolute bottom-0 w-full rounded-t-lg transition-all duration-1000 ease-out"
                                                    style={{
                                                        height: `${day.value}%`,
                                                        background: day.logged
                                                            ? 'linear-gradient(to top, var(--primary), var(--primary-light))'
                                                            : 'transparent'
                                                    }}
                                                ></div>
                                            </div>
                                            <span className={`text-xs font-medium ${day.logged ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                                                {day.day}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full text-center py-4 text-[var(--text-muted)] self-center">
                                        <p className="mb-2 text-sm">Start tracking to see progress!</p>
                                        <Link to="/track-mood" className="text-[var(--primary)] hover:underline inline-flex items-center gap-1 text-sm font-medium">
                                            Log Mood <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Calm Card Design */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
                            {t('home.featuresTitle', 'Everything You Need')}
                        </h2>
                        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                            {t('home.featuresSubtitle', 'Comprehensive tools and resources to support your mental wellness journey')}
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <Link
                                key={idx}
                                to={feature.link}
                                className="feature-card-calm group p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary-light)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 block h-full"
                            >
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${feature.color} text-white shadow-md`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-[var(--text-secondary)] leading-relaxed">
                                    {feature.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section - Clean & Trusting */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--background)]">
                <div className="max-w-4xl mx-auto text-center">
                    <Quote className="w-12 h-12 text-[var(--primary-light)] mx-auto mb-8 opacity-50" />

                    <div className="relative min-h-[200px] flex items-center justify-center">
                        <div className="animate-fade-in-up">
                            <p className="text-2xl sm:text-3xl font-medium text-[var(--text-primary)] mb-8 leading-relaxed italic">
                                "{testimonials[currentTestimonial].quote}"
                            </p>
                            <div className="flex flex-col items-center justify-center gap-2">
                                <span className="font-semibold text-[var(--text-primary)]">{testimonials[currentTestimonial].author}</span>
                                <span className="text-sm text-[var(--text-muted)] bg-[var(--surface)] px-3 py-1 rounded-full border border-[var(--border)]">
                                    {testimonials[currentTestimonial].role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial navigation dots */}
                    <div className="flex justify-center gap-2 mt-10">
                        {testimonials.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentTestimonial(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentTestimonial
                                    ? 'bg-[var(--primary)] w-8'
                                    : 'bg-[var(--border)] w-2 hover:bg-[var(--primary-light)]'
                                    }`}
                                aria-label={`View testimonial ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Section & Crisis - Soft Background */}
            <section className="trust-section py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--surface)] to-[var(--background)]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
                                {t('home.trustTitle', 'Your Trust Matters')}
                            </h2>
                            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-lg">
                                {t('home.trustSubtitle', 'We prioritize your safety and privacy above all else suitable for a professional healthcare environment.')}
                            </p>

                            <div className="space-y-4">
                                {trustBadges.map((badge, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-[var(--background)] transition-colors">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--primary-light)]/20 flex items-center justify-center text-[var(--primary)]">
                                            <badge.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-[var(--text-primary)] mb-1">{badge.title}</h4>
                                            <p className="text-sm text-[var(--text-secondary)]">{badge.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2 w-full">
                            <div className="bg-[var(--surface)] rounded-2xl p-8 border border-[var(--border)] shadow-sm">
                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Need Immediate Help?</h3>
                                <CrisisBanner />
                                <div className="mt-6 text-sm text-[var(--text-secondary)] text-center">
                                    <p>If you or someone you know is in immediate danger, please call emergency services immediately.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* CTA Section - Warm, No-Pressure */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="cta-calm">
                        <div className="relative z-10">
                            <Sparkles className="w-10 h-10 text-[var(--primary)] mx-auto mb-4 float-gentle" />
                            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4">
                                {t('home.ctaTitle', 'Ready When You Are')}
                            </h2>
                            <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto leading-relaxed">
                                {t('home.ctaDesc', 'There\'s no pressure here. Take your time, explore at your own pace, and know that support is always available when you need it.')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2">
                                    {t('home.ctaButton', 'Get Started Free')}
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link to="/learn" className="btn-gentle inline-flex items-center justify-center gap-2">
                                    <span>{t('home.ctaSecondary', 'Explore Resources')}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
