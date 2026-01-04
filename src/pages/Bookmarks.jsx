import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import { Link } from 'react-router-dom';
import { Bookmark, BookOpen, Video, Dumbbell, Trash2, ExternalLink, Clock, Eye } from 'lucide-react';

export default function Bookmarks() {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();
    const { bookmarks, loading, fetchBookmarks, toggleBookmark } = useBookmarks();
    const [filter, setFilter] = useState('all');
    const [removing, setRemoving] = useState(null);

    const filters = [
        { key: 'all', label: 'All', icon: Bookmark },
        { key: 'article', label: 'Articles', icon: BookOpen },
        { key: 'video', label: 'Videos', icon: Video },
        { key: 'exercise', label: 'Exercises', icon: Dumbbell },
    ];

    const filteredBookmarks = bookmarks.filter(b =>
        filter === 'all' || b.content_type === filter
    );

    const handleRemove = async (bookmark) => {
        setRemoving(bookmark.id);
        await toggleBookmark(bookmark.content_type, bookmark.content_id);
        setRemoving(null);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'article': return <BookOpen className="w-5 h-5" />;
            case 'video': return <Video className="w-5 h-5" />;
            case 'exercise': return <Dumbbell className="w-5 h-5" />;
            default: return <Bookmark className="w-5 h-5" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'article': return 'bg-blue-100 text-blue-600';
            case 'video': return 'bg-red-100 text-red-600';
            case 'exercise': return 'bg-green-100 text-green-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="card p-8 sm:p-12 text-center max-w-md w-full">
                    <div className="text-6xl mb-6">🔖</div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                        Your Bookmarks
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-8">
                        Sign in to view and manage your saved content.
                    </p>
                    <Link to="/login" className="btn-primary inline-block">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="bg-gradient-to-br from-[var(--secondary)] to-emerald-600 text-white py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-2">Your Bookmarks</h1>
                    <p className="opacity-90">All your saved articles, videos, and exercises in one place.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                {/* Filters */}
                <div className="card p-4 mb-8 flex flex-wrap gap-2">
                    {filters.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === key
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--light-gray)]'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                            {key !== 'all' && (
                                <span className="text-xs opacity-70">
                                    ({bookmarks.filter(b => b.content_type === key).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Bookmarks List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card p-6 animate-pulse">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-[var(--light-gray)] rounded-xl" />
                                    <div className="flex-1">
                                        <div className="h-5 bg-[var(--light-gray)] rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-[var(--light-gray)] rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredBookmarks.length > 0 ? (
                    <div className="space-y-4">
                        {filteredBookmarks.map((bookmark) => (
                            <div key={bookmark.id} className="card p-6 card-hover">
                                <div className="flex items-start gap-4">
                                    {/* Type Icon */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(bookmark.content_type)}`}>
                                        {getIcon(bookmark.content_type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold text-[var(--text-primary)] mb-1 line-clamp-1">
                                                    {bookmark.content?.title || bookmark.title || 'Untitled'}
                                                </h3>
                                                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-2">
                                                    {bookmark.content?.description || bookmark.description || 'No description available.'}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                                                    <span className={`px-2 py-0.5 rounded-full ${getTypeColor(bookmark.content_type)}`}>
                                                        {bookmark.content_type}
                                                    </span>
                                                    {bookmark.content?.read_time && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {bookmark.content.read_time} min
                                                        </span>
                                                    )}
                                                    {bookmark.created_at && (
                                                        <span>
                                                            Saved {new Date(bookmark.created_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Link
                                                    to={`/learn/${bookmark.content?.category || 'depression'}/${bookmark.content_type}s`}
                                                    className="p-2 rounded-lg bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleRemove(bookmark)}
                                                    disabled={removing === bookmark.id}
                                                    className="p-2 rounded-lg bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 card">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                            {filter === 'all' ? 'No bookmarks yet' : `No ${filter}s bookmarked`}
                        </h3>
                        <p className="text-[var(--text-secondary)] mb-6">
                            Save articles, videos, and exercises to access them later.
                        </p>
                        <Link to="/learn" className="btn-primary inline-block">
                            Explore Content
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
