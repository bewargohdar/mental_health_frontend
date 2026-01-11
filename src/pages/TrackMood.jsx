import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, Plus, TrendingUp, Clock, ChevronLeft, ChevronRight, Sparkles, Smile, Frown, Meh, Activity, X, Target, Flame, BarChart3 } from 'lucide-react';
import api from '../api/axios';

const moodEmojis = [
    { type: 'happy', emoji: '😊', label: 'happy', color: 'bg-green-100 text-green-600 border-green-200' },
    { type: 'calm', emoji: '😌', label: 'calm', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { type: 'hopeful', emoji: '🌟', label: 'hopeful', color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
    { type: 'sad', emoji: '😢', label: 'sad', color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
    { type: 'anxious', emoji: '😰', label: 'anxious', color: 'bg-orange-100 text-orange-600 border-orange-200' },
    { type: 'angry', emoji: '😠', label: 'angry', color: 'bg-red-100 text-red-600 border-red-200' },
];

export default function TrackMood() {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();
    const [selectedMood, setSelectedMood] = useState(null);
    const [moodIntensity, setMoodIntensity] = useState(3);
    const [note, setNote] = useState('');
    const [moodHistory, setMoodHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchMoodHistory();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchMoodHistory = async () => {
        try {
            const res = await api.get('/moods');
            setMoodHistory(res.data.data?.data || res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch mood history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedMood || submitting) return;
        setSubmitting(true);
        try {
            await api.post('/moods', {
                mood_type: selectedMood.type,
                intensity: moodIntensity,
                notes: note,
            });
            setSubmitted(true);
            setSelectedMood(null);
            setMoodIntensity(3);
            setNote('');
            fetchMoodHistory();
            setTimeout(() => setSubmitted(false), 3000);
        } catch (error) {
            console.error('Failed to save mood:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)]">
                <div className="text-center max-w-md w-full animate-fade-in-up">
                    <div className="w-24 h-24 bg-[var(--surface)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-5xl">🌿</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
                        {t('trackMood.title')}
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-8 text-lg leading-relaxed">
                        Sign in to start tracking your emotional journey and gain insights into your mental wellness.
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
            {/* Header */}
            <div className="bg-[var(--surface)] border-b border-[var(--border)] pt-24 pb-12 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-[var(--primary)]" />
                                {t('trackMood.title')}
                            </h1>
                            <p className="text-[var(--text-secondary)] text-lg">{t('trackMood.subtitle')}</p>
                        </div>
                        <div className="hidden md:block">
                            <Link to="/dashboard" className="btn-secondary text-sm">
                                View Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Column: Input Area */}
                    <div className="lg:col-span-7">
                        <div className="bg-[var(--surface)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-sm sticky top-24">
                            {submitted ? (
                                <div className="text-center py-16 animate-fade-in-up">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Sparkles className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Mood Saved!</h3>
                                    <p className="text-[var(--text-secondary)] mb-6">Great job being mindful of your emotions.</p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="btn-secondary"
                                    >
                                        Track Another
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
                                        {t('trackMood.createEntry', 'New Entry')}
                                    </h2>

                                    {/* Mood Selection */}
                                    <div className="mb-8">
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-4">
                                            {t('trackMood.selectMood')}
                                        </label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {moodEmojis.map((mood) => (
                                                <button
                                                    key={mood.type}
                                                    onClick={() => setSelectedMood(mood)}
                                                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 group ${selectedMood?.type === mood.type
                                                        ? `${mood.color} border-current ring-2 ring-offset-2 ring-blue-100`
                                                        : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--surface-hover)]'
                                                        }`}
                                                >
                                                    <span className={`text-4xl transition-transform duration-300 ${selectedMood?.type === mood.type ? 'scale-125' : 'group-hover:scale-110'}`}>
                                                        {mood.emoji}
                                                    </span>
                                                    <span className="text-sm font-medium capitalize">{t(`trackMood.moods.${mood.label}`)}</span>
                                                    {selectedMood?.type === mood.type && (
                                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current animate-pulse"></div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Intensity & Notes - Only show when mood is selected */}
                                    {selectedMood && (
                                        <div className="animate-fade-in-up">
                                            {/* Intensity Slider */}
                                            <div className="mb-8">
                                                <div className="flex items-center justify-between mb-4">
                                                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                                                        {t('trackMood.moodScale')}
                                                    </label>
                                                    <span className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-bold">
                                                        Level {moodIntensity}
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="5"
                                                    value={moodIntensity}
                                                    onChange={(e) => setMoodIntensity(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-[var(--light-gray)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                                                />
                                                <div className="flex justify-between text-xs mt-2 font-medium uppercase tracking-wide transition-colors">
                                                    <span className={moodIntensity <= 2 ? 'text-[var(--primary)] font-bold' : 'text-[var(--text-muted)]'}>Mild</span>
                                                    <span className={moodIntensity === 3 ? 'text-[var(--primary)] font-bold' : 'text-[var(--text-muted)]'}>Moderate</span>
                                                    <span className={moodIntensity >= 4 ? 'text-[var(--primary)] font-bold' : 'text-[var(--text-muted)]'}>Intense</span>
                                                </div>
                                            </div>

                                            {/* Note Input */}
                                            <div className="mb-8">
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-4">
                                                    {t('trackMood.note')} <span className="text-[var(--text-muted)] font-normal">(Optional)</span>
                                                </label>
                                                <textarea
                                                    value={note}
                                                    onChange={(e) => setNote(e.target.value)}
                                                    placeholder={t('trackMood.notePlaceholder')}
                                                    className="w-full p-4 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all resize-none h-32"
                                                />
                                            </div>

                                            {/* Submit */}
                                            <button
                                                onClick={handleSubmit}
                                                disabled={submitting}
                                                className="w-full btn-primary py-4 text-lg rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
                                            >
                                                {submitting ? (
                                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <span>{t('trackMood.submit')}</span>
                                                        <Plus className="w-5 h-5" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column: History & Stats */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Stats Cards Row */}
                        <div className="grid grid-cols-3 gap-4">
                            {/* Most Frequent Mood */}
                            <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-[var(--text-muted)]" />
                                    <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Top Mood</span>
                                </div>
                                {(() => {
                                    if (moodHistory.length === 0) return <div className="text-2xl text-center py-2 opacity-30">—</div>;
                                    const moodCounts = moodHistory.reduce((acc, entry) => {
                                        acc[entry.mood_type] = (acc[entry.mood_type] || 0) + 1;
                                        return acc;
                                    }, {});
                                    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
                                    const moodEmoji = moodEmojis.find(m => m.type === topMood[0]);
                                    return (
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl">{moodEmoji?.emoji || '😊'}</span>
                                            <div>
                                                <div className="font-bold text-[var(--text-primary)] capitalize">{topMood[0]}</div>
                                                <div className="text-xs text-[var(--text-muted)]">{topMood[1]} times</div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Streak */}
                            <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-2">
                                    <Flame className="w-4 h-4 text-[var(--text-muted)]" />
                                    <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Streak</span>
                                </div>
                                {(() => {
                                    if (moodHistory.length === 0) return <div className="text-2xl text-center py-2 opacity-30">0</div>;
                                    const sortedDates = [...new Set(moodHistory.map(m => new Date(m.created_at).toDateString()))].sort((a, b) => new Date(b) - new Date(a));
                                    let streak = 0;
                                    const today = new Date().toDateString();
                                    if (sortedDates[0] === today || sortedDates[0] === new Date(Date.now() - 86400000).toDateString()) {
                                        for (let i = 0; i < sortedDates.length; i++) {
                                            const expectedDate = new Date(Date.now() - i * 86400000).toDateString();
                                            if (sortedDates[i] === expectedDate) {
                                                streak++;
                                            } else {
                                                break;
                                            }
                                        }
                                    }
                                    return (
                                        <div>
                                            <div className="text-3xl font-bold text-[var(--primary)]">{streak}</div>
                                            <div className="text-xs text-[var(--text-muted)]">{streak === 1 ? 'day' : 'days'}</div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Monthly Summary */}
                            <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-2">
                                    <BarChart3 className="w-4 h-4 text-[var(--text-muted)]" />
                                    <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">This Month</span>
                                </div>
                                {(() => {
                                    const thisMonth = moodHistory.filter(entry => {
                                        const entryDate = new Date(entry.created_at);
                                        const now = new Date();
                                        return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
                                    });
                                    const avgIntensity = thisMonth.length > 0
                                        ? (thisMonth.reduce((sum, m) => sum + m.intensity, 0) / thisMonth.length).toFixed(1)
                                        : 0;
                                    return (
                                        <div>
                                            <div className="text-2xl font-bold text-[var(--text-primary)]">{thisMonth.length}</div>
                                            <div className="text-xs text-[var(--text-muted)]">Avg: {avgIntensity}/5</div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Calendar Heatmap */}
                        <div className="bg-[var(--surface)] rounded-3xl p-6 border border-[var(--border)] shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[var(--text-muted)]" />
                                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h3>
                            </div>

                            {/* Calendar Grid */}
                            <div className="space-y-2">
                                {/* Weekday headers */}
                                <div className="grid grid-cols-7 gap-2 mb-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-center text-xs font-medium text-[var(--text-muted)] uppercase">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar days */}
                                {(() => {
                                    const now = new Date();
                                    const year = now.getFullYear();
                                    const month = now.getMonth();
                                    const firstDay = new Date(year, month, 1).getDay();
                                    const daysInMonth = new Date(year, month + 1, 0).getDate();

                                    const days = [];
                                    for (let i = 0; i < firstDay; i++) {
                                        days.push(<div key={`empty-${i}`} className="aspect-square" />);
                                    }

                                    for (let day = 1; day <= daysInMonth; day++) {
                                        const dateStr = new Date(year, month, day).toDateString();
                                        const dayEntries = moodHistory.filter(m => new Date(m.created_at).toDateString() === dateStr);
                                        const isToday = day === now.getDate();

                                        days.push(
                                            <div
                                                key={day}
                                                className={`aspect-square rounded-lg border-2 transition-all group relative ${isToday
                                                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                                                        : dayEntries.length > 0
                                                            ? 'border-[var(--border)] bg-[var(--surface-hover)] cursor-pointer hover:border-[var(--primary)] hover:scale-105'
                                                            : 'border-[var(--border-light)] opacity-30'
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center justify-center h-full p-1">
                                                    <div className={`text-xs font-medium mb-1 ${isToday ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                                                        {day}
                                                    </div>
                                                    {dayEntries.length > 0 && (
                                                        <div className="flex flex-wrap gap-0.5 justify-center">
                                                            {dayEntries.slice(0, 2).map((entry, i) => {
                                                                const mood = moodEmojis.find(m => m.type === entry.mood_type);
                                                                return (
                                                                    <span key={i} className="text-sm">
                                                                        {mood?.emoji || '😊'}
                                                                    </span>
                                                                );
                                                            })}
                                                            {dayEntries.length > 2 && (
                                                                <span className="text-[8px] text-[var(--text-muted)] font-bold">
                                                                    +{dayEntries.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {dayEntries.length > 0 && (
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                                        <div className="bg-[var(--text-primary)] text-white text-xs rounded-lg p-2 shadow-lg whitespace-nowrap">
                                                            <div className="font-semibold mb-1">{new Date(year, month, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                                            {dayEntries.map((entry, i) => {
                                                                const mood = moodEmojis.find(m => m.type === entry.mood_type);
                                                                return (
                                                                    <div key={i} className="flex items-center gap-1 text-[10px]">
                                                                        <span>{mood?.emoji}</span>
                                                                        <span className="capitalize">{entry.mood_type}</span>
                                                                        <span className="opacity-70">({entry.intensity}/5)</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    return <div className="grid grid-cols-7 gap-2">{days}</div>;
                                })()}
                            </div>
                        </div>

                        {/* Recent History List */}
                        <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] overflow-hidden">
                            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                                <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-[var(--text-muted)]" />
                                    {t('trackMood.history')}
                                </h3>
                            </div>

                            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="p-6 space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-16 bg-[var(--light-gray)] rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : moodHistory.length > 0 ? (
                                    <div className="divide-y divide-[var(--border-light)]">
                                        {moodHistory.map((entry) => {
                                            const mood = moodEmojis.find(m => m.type === entry.mood_type) || moodEmojis[0];
                                            return (
                                                <div
                                                    key={entry.id}
                                                    className="p-4 hover:bg-[var(--surface-hover)] transition-colors group cursor-default"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${mood.color.replace('border-', 'border-2 ')}`}>
                                                            {mood.emoji}
                                                        </div>
                                                        <div className="flex-1 min-w-0 pt-0.5">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="font-semibold text-[var(--text-primary)] capitalize">
                                                                    {entry.mood_type}
                                                                </h4>
                                                                <span className="text-xs text-[var(--text-muted)]">
                                                                    {new Date(entry.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="flex gap-0.5">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <div
                                                                            key={i}
                                                                            className={`w-1.5 h-1.5 rounded-full ${i < entry.intensity ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {entry.notes && (
                                                                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed bg-[var(--background)] p-3 rounded-lg">
                                                                    "{entry.notes}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-[var(--light-gray)] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl grayscale opacity-50">
                                            📝
                                        </div>
                                        <p className="text-[var(--text-secondary)]">Your history is empty.</p>
                                        <p className="text-sm text-[var(--text-muted)]">Start by logging your first mood!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
