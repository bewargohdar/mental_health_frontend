import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, Plus, TrendingUp, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const moodEmojis = [
    { type: 'happy', emoji: '😊', label: 'happy', color: 'from-green-400 to-emerald-500' },
    { type: 'calm', emoji: '😌', label: 'calm', color: 'from-blue-400 to-cyan-500' },
    { type: 'hopeful', emoji: '🌟', label: 'hopeful', color: 'from-yellow-400 to-amber-500' },
    { type: 'sad', emoji: '😢', label: 'sad', color: 'from-indigo-400 to-blue-500' },
    { type: 'anxious', emoji: '😰', label: 'anxious', color: 'from-orange-400 to-red-500' },
    { type: 'angry', emoji: '😠', label: 'angry', color: 'from-red-400 to-rose-500' },
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
            // Handle pagination: res.data.data is the pagination object, .data is the array
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
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="card p-8 sm:p-12 text-center max-w-md w-full">
                    <div className="text-6xl mb-6">🌿</div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                        {t('trackMood.title')}
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-8">
                        Sign in to start tracking your emotional journey and gain insights into your mental wellness.
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
            <div className="bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-dark)] text-white py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">{t('trackMood.title')}</h1>
                    <p className="opacity-90">{t('trackMood.subtitle')}</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                {/* Mood Selection Card */}
                <div className="card p-6 sm:p-8 mb-8">
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">✨</div>
                            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                                Mood Saved!
                            </h3>
                            <p className="text-[var(--text-secondary)]">
                                Great job tracking your emotions today.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Mood Selection */}
                            <div className="mb-8">
                                <h3 className="font-semibold text-[var(--text-primary)] mb-4 text-center">
                                    {t('trackMood.selectMood')}
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
                                    {moodEmojis.map((mood) => (
                                        <button
                                            key={mood.type}
                                            onClick={() => setSelectedMood(mood)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${selectedMood?.type === mood.type
                                                ? 'border-[var(--primary)] bg-[var(--primary)]/10 scale-105'
                                                : 'border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--surface-hover)]'
                                                }`}
                                        >
                                            <span className={`text-4xl sm:text-5xl mood-emoji ${selectedMood?.type === mood.type ? 'selected' : ''}`}>
                                                {mood.emoji}
                                            </span>
                                            <span className={`text-xs font-medium ${selectedMood?.type === mood.type
                                                ? 'text-[var(--primary)]'
                                                : 'text-[var(--text-secondary)]'
                                                }`}>
                                                {t(`trackMood.moods.${mood.label}`)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Intensity Scale */}
                            {selectedMood && (
                                <div className="mb-8 animate-fadeIn">
                                    <h3 className="font-semibold text-[var(--text-primary)] mb-4 text-center">
                                        {t('trackMood.moodScale')}
                                    </h3>
                                    <div className="max-w-sm mx-auto">
                                        <div className="flex justify-between gap-2 mb-3">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setMoodIntensity(level)}
                                                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${moodIntensity === level
                                                        ? `bg-gradient-to-br ${selectedMood.color} text-white scale-110 shadow-lg`
                                                        : 'bg-[var(--light-gray)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                                                        }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-xs text-[var(--text-muted)]">
                                            <span>Mild</span>
                                            <span>Intense</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Note */}
                            {selectedMood && (
                                <div className="mb-8 animate-fadeIn">
                                    <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                                        {t('trackMood.note')}
                                    </h3>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder={t('trackMood.notePlaceholder')}
                                        className="w-full p-4 input-field rounded-xl resize-none h-32"
                                    />
                                </div>
                            )}

                            {/* Submit Button */}
                            {selectedMood && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 animate-fadeIn"
                                >
                                    <Plus className="w-5 h-5" />
                                    {submitting ? t('common.loading') : t('trackMood.submit')}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Mood History */}
                <div className="card p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[var(--primary)]" />
                            {t('trackMood.history')}
                        </h3>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-[var(--light-gray)] rounded-xl animate-pulse">
                                    <div className="w-12 h-12 bg-[var(--border)] rounded-full" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-[var(--border)] rounded w-24 mb-2" />
                                        <div className="h-3 bg-[var(--border)] rounded w-32" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : moodHistory.length > 0 ? (
                        <div className="space-y-3">
                            {moodHistory.slice(0, 7).map((entry) => {
                                const mood = moodEmojis.find(m => m.type === entry.mood_type) || moodEmojis[0];
                                return (
                                    <div
                                        key={entry.id}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--light-gray)] transition-colors"
                                    >
                                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${mood.color} flex items-center justify-center text-2xl`}>
                                            {mood.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-[var(--text-primary)] capitalize">
                                                    {entry.mood_type}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                                                    Level {entry.intensity}
                                                </span>
                                            </div>
                                            {entry.notes && (
                                                <p className="text-sm text-[var(--text-secondary)] truncate mt-1">
                                                    {entry.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(entry.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4">📝</div>
                            <p className="text-[var(--text-secondary)]">
                                No mood entries yet. Start tracking above!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
