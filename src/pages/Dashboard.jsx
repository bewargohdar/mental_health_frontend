import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    TrendingUp, Calendar, Smile, Activity,
    Settings, User, Bell, Shield, ChevronRight,
    BarChart3, Target, Flame, CalendarCheck, Clock,
    Sun, Plus
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import api from '../api/axios';

const affirmartions = [
    "You are capable of amazing things.",
    "Every day is a fresh start.",
    "Small steps lead to big changes.",
    "Your potential is endless.",
    "Believe in yourself and all that you are.",
    "You are stronger than you think.",
    "Focus on the good.",
    "You are doing your best, and that is enough.",
    "Peace begins with a smile.",
    "Today is a good day to have a good day."
];

export default function Dashboard() {
    const { t } = useTranslation();
    const { isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        averageMood: 0,
        totalEntries: 0,
        currentStreak: 0,
        moodChange: 0,
    });
    const [chartPeriod, setChartPeriod] = useState('week');
    const [weeklyMoodData, setWeeklyMoodData] = useState([]);
    const [monthlyTrendData, setMonthlyTrendData] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dailyAffirmation, setDailyAffirmation] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            fetchAllData();
            setDailyAffirmation(affirmartions[Math.floor(Math.random() * affirmartions.length)]);
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchAllData = async () => {
        try {
            const [progressRes, weeklyRes, statsRes, appointmentsRes] = await Promise.allSettled([
                api.get('/progress/overview'),
                api.get('/progress/weekly'),
                api.get('/moods/statistics'),
                api.get('/appointments'),
            ]);

            if (progressRes.status === 'fulfilled' && progressRes.value.data?.data) {
                const data = progressRes.value.data.data;
                setStats(prev => ({
                    ...prev,
                    averageMood: data.average_mood || data.averageMood || prev.averageMood,
                    totalEntries: data.total_entries || data.totalEntries || prev.totalEntries,
                    currentStreak: data.current_streak || data.streak || prev.currentStreak,
                    moodChange: data.mood_change || data.change || 0,
                }));
            }

            if (weeklyRes.status === 'fulfilled' && weeklyRes.value.data?.data) {
                const data = weeklyRes.value.data.data;
                if (Array.isArray(data)) {
                    setWeeklyMoodData(data.map(d => ({
                        day: d.day || d.date,
                        mood: d.mood || d.average_mood || d.value || 0,
                        entries: d.entries || d.count || 1,
                    })));
                }
            }

            if (statsRes.status === 'fulfilled' && statsRes.value.data?.data) {
                const data = statsRes.value.data.data;
                if (data.average_mood) {
                    setStats(prev => ({ ...prev, averageMood: data.average_mood }));
                }
                if (data.weekly_averages && Array.isArray(data.weekly_averages)) {
                    setMonthlyTrendData(data.weekly_averages.map((avg, idx) => ({
                        week: `Week ${idx + 1}`,
                        average: avg,
                    })));
                }
            }

            if (appointmentsRes.status === 'fulfilled') {
                const data = appointmentsRes.value.data?.data?.data || appointmentsRes.value.data?.data || [];
                setAppointments(Array.isArray(data) ? data.slice(0, 3) : []);
            }

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const isDoctor = user?.roles?.some(r => r.name === 'doctor');

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.post(`/appointments/${id}/${status}`);
            fetchAllData();
        } catch (error) {
            console.error(`Failed to ${status} appointment:`, error);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[var(--surface)] p-3 shadow-lg border border-[var(--border)] rounded-lg">
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
            <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)]">
                <div className="text-center max-w-md w-full animate-fade-in-up">
                    <div className="w-24 h-24 bg-[var(--surface)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-5xl">📊</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
                        {t('dashboard.title')}
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-8 text-lg leading-relaxed">
                        Sign in to view your mood analytics, track your progress, and see your personalized insights.
                    </p>
                    <Link to="/login" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg">
                        {t('nav.signIn')} <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-12 bg-[var(--background)]">
            {/* Header / Greeting */}
            <div className="bg-[var(--surface)] border-b border-[var(--border)] pt-24 pb-8 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2">
                                <Sun className="w-5 h-5 text-orange-400" />
                                <span>{dailyAffirmation}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                                {t('dashboard.welcome')}, {user?.name?.split(' ')[0] || 'Friend'}!
                            </h1>
                        </div>
                        <div className="flex gap-3">
                            <Link to="/track-mood" className="btn-primary flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Track Mood
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Stat Card 1: Streak */}
                    <div className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors p-6 rounded-3xl border border-[var(--border)] shadow-sm group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-orange-100 rounded-2xl group-hover:scale-110 transition-transform">
                                <Flame className="w-6 h-6 text-orange-500" />
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 bg-[var(--background)] rounded-lg text-[var(--text-muted)] border border-[var(--border)]">
                                Current
                            </span>
                        </div>
                        <div>
                            <span className="text-3xl font-bold text-[var(--text-primary)]">{stats.currentStreak}</span>
                            <span className="text-sm text-[var(--text-secondary)] ml-1">days streak</span>
                        </div>
                    </div>

                    {/* Stat Card 2: Average Mood */}
                    <div className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors p-6 rounded-3xl border border-[var(--border)] shadow-sm group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-100 rounded-2xl group-hover:scale-110 transition-transform">
                                <Smile className="w-6 h-6 text-blue-500" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border ${stats.moodChange >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                <TrendingUp className={`w-3 h-3 ${stats.moodChange < 0 && 'rotate-180'}`} />
                                {Math.abs(stats.moodChange).toFixed(1)}
                            </div>
                        </div>
                        <div>
                            <span className="text-3xl font-bold text-[var(--text-primary)]">{stats.averageMood.toFixed(1)}</span>
                            <span className="text-sm text-[var(--text-secondary)] ml-1">avg mood</span>
                        </div>
                    </div>

                    {/* Stat Card 3: Total Entries */}
                    <div className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors p-6 rounded-3xl border border-[var(--border)] shadow-sm group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-purple-100 rounded-2xl group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-6 h-6 text-purple-500" />
                            </div>
                        </div>
                        <div>
                            <span className="text-3xl font-bold text-[var(--text-primary)]">{stats.totalEntries}</span>
                            <span className="text-sm text-[var(--text-secondary)] ml-1">total entries</span>
                        </div>
                    </div>

                    {/* Main Chart Area - Spans 2 columns on large screens */}
                    <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-[var(--primary)]" />
                                    {t('dashboard.moodAnalytics')}
                                </h3>
                                <p className="text-sm text-[var(--text-secondary)]">Your emotional trends over time</p>
                            </div>
                            <div className="flex bg-[var(--background)] p-1 rounded-xl border border-[var(--border)]">
                                <button
                                    onClick={() => setChartPeriod('week')}
                                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${chartPeriod === 'week'
                                        ? 'bg-[var(--surface)] text-[var(--primary)] shadow-sm'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    Week
                                </button>
                                <button
                                    onClick={() => setChartPeriod('month')}
                                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${chartPeriod === 'month'
                                        ? 'bg-[var(--surface)] text-[var(--primary)] shadow-sm'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    Month
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartPeriod === 'week' ? (
                                    <AreaChart data={weeklyMoodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                                        <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeDasharray: '4 4' }} />
                                        <Area
                                            type="monotone"
                                            dataKey="mood"
                                            stroke="var(--primary)"
                                            strokeWidth={3}
                                            fill="url(#moodGradient)"
                                            activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'var(--surface)', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                ) : (
                                    <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                                        <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-hover)' }} />
                                        <Bar dataKey="average" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Appointments Widget */}
                    <div className="md:col-span-1 lg:col-span-2 bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <CalendarCheck className="w-5 h-5 text-[var(--primary)]" />
                                {isDoctor ? 'Requests' : 'Appointments'}
                            </h3>
                            <Link to="/appointments" className="text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 px-2 py-1 rounded-lg transition-colors">
                                View all
                            </Link>
                        </div>

                        <div className="space-y-3 flex-1">
                            {appointments.length > 0 ? (
                                appointments.map((apt) => (
                                    <div key={apt.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary-light)] transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                                            <img
                                                src={(() => {
                                                    const avatar = isDoctor ? apt.patient?.avatar : apt.doctor?.avatar;
                                                    if (!avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent((isDoctor ? apt.patient?.name : apt.doctor?.name) || 'User')}&background=random`;
                                                    return avatar.startsWith('http') ? avatar : `/storage/${avatar}`;
                                                })()}
                                                alt={isDoctor ? apt.patient?.name : apt.doctor?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                                {isDoctor ? apt.patient?.name : apt.doctor?.name}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                                <span>{new Date(apt.scheduled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                <span>•</span>
                                                <span>{new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                                            ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'}`}>
                                            {apt.status}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-[var(--border)] rounded-2xl">
                                    <div className="w-10 h-10 bg-[var(--background)] rounded-full flex items-center justify-center mb-2">
                                        <Calendar className="w-5 h-5 text-[var(--text-muted)]" />
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)]">No upcoming items</p>
                                    {!isDoctor && (
                                        <Link to="/doctors" className="text-xs text-[var(--primary)] font-medium mt-1 hover:underline">
                                            Book one now
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Settings / Profile */}
                    <div className="md:col-span-1 lg:col-span-1 bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm p-6">
                        <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-[var(--primary)]" />
                            Profile
                        </h3>
                        <div className="space-y-2">
                            <Link to="/profile" className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-hover)] transition-colors group">
                                <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Edit Profile</span>
                                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                            </Link>
                            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-hover)] transition-colors group cursor-pointer">
                                <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Notifications</span>
                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-hover)] transition-colors group cursor-pointer">
                                <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Settings</span>
                                <Settings className="w-4 h-4 text-[var(--text-muted)]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
