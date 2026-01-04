import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    BookOpen, Video, FileText, Dumbbell, Search,
    Brain, Heart, Shield, Zap, RefreshCw, Apple, Activity,
    Play, ExternalLink, Clock, Eye
} from 'lucide-react';
import api from '../api/axios';

// Category icons mapping
const categoryIcons = {
    depression: Heart,
    anxiety: Zap,
    ptsd: Shield,
    bipolar: RefreshCw,
    ocd: Brain,
    eatingDisorders: Apple,
    adhd: Activity,
};

// Category colors
const categoryColors = {
    depression: 'from-blue-500 to-blue-600',
    anxiety: 'from-amber-500 to-orange-500',
    ptsd: 'from-purple-500 to-purple-600',
    bipolar: 'from-teal-500 to-cyan-500',
    ocd: 'from-pink-500 to-rose-500',
    eatingDisorders: 'from-green-500 to-emerald-500',
    adhd: 'from-indigo-500 to-violet-500',
};

// Static content for Information tab
const categoryInfo = {
    depression: `## Understanding Depression

Depression is more than just feeling sad. It's a serious mental health condition that affects how you feel, think, and handle daily activities.

### Common Symptoms
- Persistent sad, anxious, or "empty" mood
- Feelings of hopelessness or pessimism
- Loss of interest in hobbies and activities
- Decreased energy or fatigue
- Difficulty concentrating or making decisions

### When to Seek Help
If you've been experiencing symptoms for more than two weeks, it's important to reach out to a mental health professional.`,
    anxiety: `## Understanding Anxiety

Anxiety disorders are the most common mental health disorders, characterized by excessive fear or anxiety.

### Common Symptoms
- Feeling nervous, restless or tense
- Having a sense of impending danger, panic or doom
- Having an increased heart rate
- Breathing rapidly (hyperventilation)
- Sweating, trembling`,
    // Add default info for other categories if needed or handle generic
};

export default function Learn() {
    const { t } = useTranslation();
    const { category, tab } = useParams();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [playingVideo, setPlayingVideo] = useState(null);

    const selectedCategory = category || 'depression';
    const activeTab = tab || 'information';

    const categories = [
        { key: 'depression', label: t('learn.categories.depression') },
        { key: 'anxiety', label: t('learn.categories.anxiety') },
        { key: 'ptsd', label: t('learn.categories.ptsd') },
        { key: 'bipolar', label: t('learn.categories.bipolar') },
        { key: 'ocd', label: t('learn.categories.ocd') },
        { key: 'eatingDisorders', label: t('learn.categories.eatingDisorders') },
        { key: 'adhd', label: t('learn.categories.adhd') },
    ];

    const contentTabs = [
        { key: 'information', label: t('learn.contentTypes.information'), icon: BookOpen },
        { key: 'videos', label: t('learn.contentTypes.videos'), icon: Video },
        { key: 'articles', label: t('learn.contentTypes.articles'), icon: FileText },
        { key: 'exercises', label: t('learn.contentTypes.exercises'), icon: Dumbbell },
    ];

    useEffect(() => {
        const fetchContent = async () => {
            if (activeTab === 'information') return;

            setLoading(true);
            setError(null);
            try {
                let endpoint = '';
                switch (activeTab) {
                    case 'videos':
                        endpoint = `/content/videos`;
                        break;
                    case 'articles':
                        endpoint = `/content/articles`;
                        break;
                    case 'exercises':
                        endpoint = `/content/exercises`;
                        break;
                    default:
                        return;
                }

                const res = await api.get(endpoint, {
                    params: { category: selectedCategory }
                });
                console.log(`Fetch ${activeTab} response:`, res.data);

                // Handle different response structures
                let content = [];
                if (res.data && Array.isArray(res.data)) {
                    content = res.data;
                } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                    content = res.data.data;
                } else if (res.data && res.data.data && res.data.data.data && Array.isArray(res.data.data.data)) {
                    // Handle Laravel Pagination wrapped in API resource
                    content = res.data.data.data;
                } else {
                    console.warn('Unexpected response format:', res.data);
                }

                setData(content);
            } catch (error) {
                console.error(`Failed to fetch ${activeTab}:`, error);
                setError(error.message || 'Failed to load content');
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [selectedCategory, activeTab]);

    const renderContent = () => {
        if (activeTab === 'information') {
            const infoText = categoryInfo[selectedCategory] || categoryInfo['depression']; // Fallback
            return (
                <div className="prose prose-lg max-w-none dark:prose-invert">
                    <div className="card p-6 sm:p-8">
                        {infoText.split('\n').map((line, idx) => {
                            if (line.startsWith('## ')) {
                                return <h2 key={idx} className="text-2xl font-bold text-[var(--text-primary)] mt-0 mb-4">{line.replace('## ', '')}</h2>;
                            } else if (line.startsWith('### ')) {
                                return <h3 key={idx} className="text-lg font-semibold text-[var(--text-primary)] mt-6 mb-3">{line.replace('### ', '')}</h3>;
                            } else if (line.startsWith('- ')) {
                                return <li key={idx} className="text-[var(--text-secondary)] ml-4">{line.replace('- ', '')}</li>;
                            } else if (line.trim()) {
                                return <p key={idx} className="text-[var(--text-secondary)] mb-4">{line}</p>;
                            }
                            return null;
                        })}
                    </div>
                </div>
            );
        }

        if (loading) {
            return (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-4 animate-pulse">
                            <div className="aspect-video bg-[var(--light-gray)] rounded-lg mb-4" />
                            <div className="h-4 bg-[var(--light-gray)] rounded w-3/4 mb-2" />
                            <div className="h-3 bg-[var(--light-gray)] rounded w-1/2" />
                        </div>
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Connection Error</h3>
                    <p className="text-[var(--text-secondary)] mb-4">{error}</p>
                    <p className="text-sm text-[var(--text-muted)]">Please ensure the backend server is running.</p>
                </div>
            );
        }

        if (!data || data.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">📭</div>
                    <p className="text-[var(--text-secondary)]">No content found for this category.</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'videos':
                return (
                    <div className="space-y-6">
                        {playingVideo ? (
                            <div className="card overflow-hidden">
                                <div className="aspect-video">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1`}
                                        title="Video player"
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                                <div className="p-4">
                                    <button
                                        onClick={() => setPlayingVideo(null)}
                                        className="text-sm text-[var(--primary)] hover:underline"
                                    >
                                        ← Back to videos
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-6">
                                {data.map((video) => (
                                    <div
                                        key={video.id}
                                        className="card card-hover overflow-hidden cursor-pointer group"
                                        onClick={() => {
                                            let videoId = video.youtube_id || video.youtubeId;
                                            // Extract from URL if ID is not directly available
                                            if (!videoId && video.url) {
                                                const match = video.url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
                                                if (match && match[2].length === 11) {
                                                    videoId = match[2];
                                                }
                                            }

                                            console.log('Clicking video:', videoId, video);
                                            if (videoId) setPlayingVideo(videoId);
                                        }}
                                    >
                                        <div className="aspect-video relative">
                                            <img
                                                src={video.thumbnail_url || video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                                                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Play className="w-8 h-8 text-[var(--primary)] fill-[var(--primary)] ms-1" />
                                                </div>
                                            </div>
                                            <span className="absolute bottom-3 end-3 px-2 py-1 bg-black/70 text-white text-xs rounded">
                                                {video.duration}
                                            </span>
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-semibold text-[var(--text-primary)]">{video.title}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'articles':
                return (
                    <div className="grid gap-4">
                        {data.map((article) => (
                            <div key={article.id} className="card card-hover p-6 cursor-pointer group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                                            {article.title}
                                        </h4>
                                        <p className="text-sm text-[var(--text-secondary)] mb-3">
                                            {article.excerpt || article.summary}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {article.read_time || article.readTime}
                                            </span>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'exercises':
                return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.map((exercise) => {
                            // Build the full image URL - handle relative paths from backend
                            let imageUrl = exercise.image_url || exercise.image;
                            if (imageUrl && !imageUrl.startsWith('http')) {
                                // Prepend backend storage URL for relative paths
                                imageUrl = `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/storage/${imageUrl}`;
                            }
                            // Fallback placeholder if no image
                            if (!imageUrl) {
                                imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(exercise.title)}&size=400&background=6366f1&color=ffffff&font-size=0.33`;
                            }

                            return (
                                <div key={exercise.id} className="card card-hover overflow-hidden cursor-pointer group">
                                    <div className="aspect-square relative">
                                        <img
                                            src={imageUrl}
                                            alt={exercise.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                // Fallback if image fails to load
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(exercise.title)}&size=400&background=6366f1&color=ffffff&font-size=0.33`;
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-0 start-0 end-0 p-4">
                                            <h4 className="font-semibold text-white text-sm">{exercise.title}</h4>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-2">{t('learn.title')}</h1>
                    <p className="opacity-90">{t('learn.subtitle')}</p>

                    {/* Search */}
                    <div className="mt-6 max-w-xl">
                        <div className="relative">
                            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                            <input
                                type="text"
                                placeholder={t('learn.search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full ps-12 pe-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Categories Sidebar */}
                    <div className="lg:w-72 flex-shrink-0">
                        <div className="card p-4 sticky top-20">
                            <h3 className="font-semibold text-[var(--text-primary)] mb-4 px-2">Categories</h3>
                            <div className="space-y-1">
                                {categories.map((cat) => {
                                    const Icon = categoryIcons[cat.key];
                                    return (
                                        <button
                                            key={cat.key}
                                            onClick={() => navigate(`/learn/${cat.key}/${activeTab}`)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-start transition-all ${selectedCategory === cat.key
                                                ? 'bg-[var(--primary)] text-white'
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedCategory === cat.key
                                                ? 'bg-white/20'
                                                : `bg-gradient-to-br ${categoryColors[cat.key]} text-white`
                                                }`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium">{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* Content Type Tabs */}
                        <div className="card mb-6 p-2 flex flex-wrap gap-2">
                            {contentTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => navigate(`/learn/${selectedCategory}/${tab.key}`)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === tab.key
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}
