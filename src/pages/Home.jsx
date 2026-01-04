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
    TrendingUp
} from 'lucide-react';
import api from '../api/axios';

export default function Home() {
    const { t } = useTranslation();
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    // Mock weekly progress data
    const weeklyProgress = [
        { day: 'Mon', value: 80, logged: true },
        { day: 'Tue', value: 65, logged: true },
        { day: 'Wed', value: 90, logged: true },
        { day: 'Thu', value: 75, logged: true },
        { day: 'Fri', value: 85, logged: true },
        { day: 'Sat', value: 0, logged: false },
        { day: 'Sun', value: 0, logged: false },
    ];

    useEffect(() => {
        const fetchTips = async () => {
            try {
                const res = await api.get('/wellness-tips');
                setTips(res.data.data || []);
            } catch (error) {
                console.error('Failed to fetch tips:', error);
                // Fallback tips
                setTips([
                    { id: 1, content: "Take 5 deep breaths when you feel overwhelmed. It activates your body's natural relaxation response." },
                    { id: 2, content: "Practice gratitude by naming 3 things you're thankful for today." },
                    { id: 3, content: "Take a short walk outside. Nature and movement boost mental clarity." }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchTips();
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

    const features = [
        {
            icon: Activity,
            title: t('home.features.trackMood'),
            description: t('home.features.trackMoodDesc'),
            color: 'from-[var(--primary)] to-[var(--primary-dark)]',
            link: '/track-mood'
        },
        {
            icon: Brain,
            title: t('home.features.learn'),
            description: t('home.features.learnDesc'),
            color: 'from-[var(--accent)] to-[var(--accent-dark)]',
            link: '/learn'
        },
        {
            icon: Users,
            title: t('home.features.community'),
            description: t('home.features.communityDesc'),
            color: 'from-[var(--secondary)] to-[var(--secondary-dark)]',
            link: '/community'
        },
        {
            icon: Phone,
            title: t('home.features.doctors'),
            description: t('home.features.doctorsDesc'),
            color: 'from-[var(--pink)] to-rose-500',
            link: '/doctors'
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -end-40 w-80 h-80 bg-[var(--primary-light)] rounded-full opacity-20 blur-3xl animate-blob"></div>
                    <div className="absolute top-40 -start-40 w-80 h-80 bg-[var(--accent-light)] rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 start-1/2 w-80 h-80 bg-[var(--secondary-light)] rounded-full opacity-20 blur-3xl animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>Your Mental Wellness Journey</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                            <span className="gradient-text">{t('home.welcome')}</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
                            {t('home.heroDescription')}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/track-mood" className="btn-primary inline-flex items-center justify-center gap-2">
                                {t('home.startJourney')}
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/learn" className="btn-secondary inline-flex items-center justify-center gap-2">
                                <Play className="w-5 h-5" />
                                {t('home.learnMore')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Daily Wellness Tip */}
            <section className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="wellness-tip relative">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                                <Lightbulb className="w-6 h-6 text-[var(--primary-dark)]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                                    {t('home.dailyTip')}
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/30">Daily</span>
                                </h3>
                                <p className="text-[var(--text-secondary)] leading-relaxed">
                                    {loading ? (
                                        <span className="inline-block w-full h-5 bg-white/30 rounded animate-pulse"></span>
                                    ) : (
                                        tips[currentTipIndex]?.content || "Take a moment to breathe and appreciate the present."
                                    )}
                                </p>
                                {tips.length > 1 && (
                                    <div className="flex gap-1.5 mt-4">
                                        {tips.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentTipIndex(idx)}
                                                className={`w-2 h-2 rounded-full transition-all ${idx === currentTipIndex
                                                    ? 'bg-[var(--primary)] w-6'
                                                    : 'bg-white/40 hover:bg-white/60'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Weekly Progress Bar */}
            <section className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
                                {t('home.weeklyProgress')}
                            </h3>
                            <span className="text-sm text-[var(--text-secondary)]">5/7 days logged</span>
                        </div>

                        <div className="flex items-end justify-between gap-2 sm:gap-4">
                            {weeklyProgress.map((day, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full h-24 bg-[var(--light-gray)] rounded-lg relative overflow-hidden">
                                        <div
                                            className="absolute bottom-0 w-full rounded-lg transition-all duration-500"
                                            style={{
                                                height: `${day.value}%`,
                                                background: day.logged
                                                    ? 'linear-gradient(to top, var(--primary), var(--primary-light))'
                                                    : 'var(--border)'
                                            }}
                                        ></div>
                                        {day.logged && (
                                            <div className="absolute top-2 left-1/2 -translate-x-1/2">
                                                <CheckCircle className="w-4 h-4 text-[var(--primary)]" />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-xs font-medium ${day.logged ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                                        {day.day}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                            Comprehensive tools and resources to support your mental wellness journey
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <Link
                                key={idx}
                                to={feature.link}
                                className="card card-hover p-6 group"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {feature.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--surface)]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { value: '10K+', label: 'Active Users' },
                            { value: '50+', label: 'Expert Doctors' },
                            { value: '100+', label: 'Learning Resources' },
                            { value: '4.9', label: 'User Rating', icon: Star },
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2 flex items-center justify-center gap-1">
                                    {stat.value}
                                    {stat.icon && <stat.icon className="w-6 h-6 text-yellow-500 fill-yellow-500" />}
                                </div>
                                <p className="text-[var(--text-secondary)]">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="card p-8 sm:p-12 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 border-[var(--primary)]/20">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
                            Join thousands of users who have taken the first step towards better mental health.
                        </p>
                        <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                            Get Started Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
