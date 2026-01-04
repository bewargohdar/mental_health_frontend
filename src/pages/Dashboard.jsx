import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    TrendingUp, Calendar, Smile, Activity,
    Settings, User, Bell, Shield, ChevronRight,
    BarChart3, Target, Flame
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import api from '../api/axios';

// Mock data for charts
const weeklyMoodData = [
    { day: 'Mon', mood: 4, entries: 2 },
    { day: 'Tue', mood: 3, entries: 1 },
    { day: 'Wed', mood: 5, entries: 3 },
    { day: 'Thu', mood: 4, entries: 2 },
    { day: 'Fri', mood: 3, entries: 1 },
    { day: 'Sat', mood: 4, entries: 2 },
    { day: 'Sun', mood: 5, entries: 2 },
];

const monthlyTrendData = [
    { week: 'Week 1', average: 3.2 },
    { week: 'Week 2', average: 3.8 },
    { week: 'Week 3', average: 3.5 },
    { week: 'Week 4', average: 4.1 },
];

export default function Dashboard() {
    const { t } = useTranslation();
    const { isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        averageMood: 4.2,
        totalEntries: 28,
        currentStreak: 5,
    });
    const [chartPeriod, setChartPeriod] = useState('week');

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchData = async () => {
        try {
            const res = await api.get('/dashboard');
            if (res.data.data) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="card p-3 shadow-lg border-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
                    <p className="text-sm text-[var(--primary)]">
                        Mood: {payload[0].value}/5
                    </p>
                </div>
            );
        }
        return null;
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="card p-8 sm:p-12 text-center max-w-md w-full">
                    <div className="text-6xl mb-6">📊</div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                        {t('dashboard.title')}
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-8">
                        Sign in to view your mood analytics and personalized insights.
                    </p>
                    <Link to="/login" className="btn-primary inline-block">
                        {t('nav.signIn')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-2">{t('dashboard.title')}</h1>
                    <p className="opacity-90">{t('dashboard.welcome')}, {user?.name || 'User'}!</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-[var(--text-secondary)]">{t('dashboard.averageMood')}</span>
                            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                <Smile className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-[var(--text-primary)]">
                            {stats.averageMood.toFixed(1)}
                            <span className="text-lg text-[var(--text-muted)]">/5</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                            <TrendingUp className="w-4 h-4" />
                            <span>+0.3 from last week</span>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-[var(--text-secondary)]">{t('dashboard.totalEntries')}</span>
                            <div className="w-10 h-10 rounded-full bg-[var(--secondary)]/20 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-[var(--secondary-dark)]" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-[var(--text-primary)]">
                            {stats.totalEntries}
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mt-2">
                            Mood entries recorded
                        </p>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-[var(--text-secondary)]">{t('dashboard.streak')}</span>
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Flame className="w-5 h-5 text-orange-500" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-[var(--text-primary)]">
                            {stats.currentStreak}
                            <span className="text-lg text-[var(--text-muted)] ms-1">{t('dashboard.days')}</span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mt-2">
                            Keep it going! 🔥
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Mood Analytics Chart */}
                    <div className="lg:col-span-2">
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-[var(--primary)]" />
                                    {t('dashboard.moodAnalytics')}
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setChartPeriod('week')}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${chartPeriod === 'week'
                                                ? 'bg-[var(--primary)] text-white'
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                                            }`}
                                    >
                                        {t('dashboard.thisWeek')}
                                    </button>
                                    <button
                                        onClick={() => setChartPeriod('month')}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${chartPeriod === 'month'
                                                ? 'bg-[var(--primary)] text-white'
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                                            }`}
                                    >
                                        {t('dashboard.thisMonth')}
                                    </button>
                                </div>
                            </div>

                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    {chartPeriod === 'week' ? (
                                        <AreaChart data={weeklyMoodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                            <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                                            <YAxis domain={[0, 5]} stroke="var(--text-muted)" fontSize={12} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="mood"
                                                stroke="var(--primary)"
                                                strokeWidth={2}
                                                fill="url(#moodGradient)"
                                            />
                                        </AreaChart>
                                    ) : (
                                        <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                            <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={12} />
                                            <YAxis domain={[0, 5]} stroke="var(--text-muted)" fontSize={12} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="average" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Profile Settings */}
                    <div className="lg:col-span-1">
                        <div className="card p-6">
                            <h2 className="font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-[var(--primary)]" />
                                {t('dashboard.profileSettings')}
                            </h2>

                            <div className="space-y-2">
                                <Link
                                    to="/profile"
                                    className="flex items-center justify-between p-4 rounded-xl hover:bg-[var(--surface-hover)] transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                            <User className="w-5 h-5 text-[var(--primary)]" />
                                        </div>
                                        <span className="font-medium text-[var(--text-primary)]">{t('dashboard.editProfile')}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                                </Link>

                                <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-[var(--surface-hover)] transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                                            <Bell className="w-5 h-5 text-[var(--accent-dark)]" />
                                        </div>
                                        <span className="font-medium text-[var(--text-primary)]">{t('dashboard.notifications')}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                                </button>

                                <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-[var(--surface-hover)] transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--secondary)]/20 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-[var(--secondary-dark)]" />
                                        </div>
                                        <span className="font-medium text-[var(--text-primary)]">{t('dashboard.privacy')}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                                </button>

                                <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-[var(--surface-hover)] transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Target className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <span className="font-medium text-[var(--text-primary)]">{t('dashboard.preferences')}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
