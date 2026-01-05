import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    TrendingUp, Calendar, Smile, Activity,
    Settings, User, Bell, Shield, ChevronRight,
    BarChart3, Target, Flame, CalendarCheck, Clock
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import api from '../api/axios';

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

    useEffect(() => {
        if (isAuthenticated) {
            fetchAllData();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchAllData = async () => {
        try {
            // Fetch all dashboard data in parallel
            const [progressRes, weeklyRes, statsRes, appointmentsRes] = await Promise.allSettled([
                api.get('/progress/overview'),
                api.get('/progress/weekly'),
                api.get('/moods/statistics'),
                api.get('/appointments'),
            ]);

            // Process progress overview
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

            // Process weekly data for chart
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

            // Process mood statistics for monthly trend
            if (statsRes.status === 'fulfilled' && statsRes.value.data?.data) {
                const data = statsRes.value.data.data;
                // Update stats from mood statistics if available
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

            // Process appointments
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
            // Refresh data
            fetchAllData();
        } catch (error) {
            console.error(`Failed to ${status} appointment:`, error);
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
                            <span>{stats.moodChange >= 0 ? '+' : ''}{stats.moodChange.toFixed(1)} from last week</span>
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
                    {/* Main Content Areas */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Upcoming Appointments */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                    <CalendarCheck className="w-5 h-5 text-[var(--primary)]" />
                                    {isDoctor ? 'Incoming Requests' : (t('dashboard.appointments') || 'Your Appointments')}
                                </h2>
                                <Link to="/appointments" className="text-sm text-[var(--primary)] hover:underline">
                                    View all
                                </Link>
                            </div>

                            {appointments.length > 0 ? (
                                <div className="space-y-4">
                                    {appointments.map((apt) => (
                                        <div key={apt.id} className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={
                                                            (isDoctor ? apt.patient?.avatar : apt.doctor?.avatar) ||
                                                            `https://ui-avatars.com/api/?name=${encodeURIComponent((isDoctor ? apt.patient?.name : apt.doctor?.name) || 'User')}&background=random`
                                                        }
                                                        alt={isDoctor ? apt.patient?.name : apt.doctor?.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-[var(--text-primary)]">
                                                        {isDoctor ? apt.patient?.name : apt.doctor?.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{new Date(apt.scheduled_at).toLocaleDateString()}</span>
                                                        <Clock className="w-3 h-3 ml-1" />
                                                        <span>{new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons for Doctor */}
                                            {isDoctor ? (
                                                <div className="flex gap-2">
                                                    {apt.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(apt.id, 'confirm')}
                                                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
                                                        >
                                                            Accept
                                                        </button>
                                                    )}
                                                    {apt.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(apt.id, 'complete')}
                                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(apt.id, 'cancel')}
                                                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                    {apt.status !== 'pending' && apt.status !== 'confirmed' && (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                            ${apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {apt.status}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                /* Status Badge for Patient */
                                                <div className="text-right">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                        ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'}`}>
                                                        {apt.status}
                                                    </span>
                                                    <p className="text-xs text-[var(--text-muted)] mt-1 capitalize">{apt.type?.replace('_', ' ') || 'Consultation'}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-[var(--text-muted)]">
                                    <p>No {isDoctor ? 'incoming requests' : 'upcoming appointments'}</p>
                                    {!isDoctor && (
                                        <Link to="/doctors" className="text-[var(--primary)] text-sm hover:underline mt-2 inline-block">
                                            Book a consultation
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mood Analytics Chart */}
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
