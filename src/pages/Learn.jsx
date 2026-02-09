import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBookmarks } from '../context/BookmarkContext';
import { useAuth } from '../context/AuthContext';
import {
    BookOpen, Video, FileText, Dumbbell, Search,
    Brain, Heart, Shield, Zap, RefreshCw, Apple, Activity,
    Play, ExternalLink, Clock, Eye, X, ArrowLeft, User, Calendar, Bookmark,
    Sparkles, ChevronRight, Star, Lightbulb
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

// Enhanced Category colors with gradients and accents
const categoryThemes = {
    depression: {
        gradient: 'from-blue-500 to-blue-600',
        light: 'bg-blue-50 text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-50',
        icon: 'text-blue-500'
    },
    anxiety: {
        gradient: 'from-amber-500 to-orange-500',
        light: 'bg-orange-50 text-orange-600',
        border: 'border-orange-200',
        hover: 'hover:bg-orange-50',
        icon: 'text-orange-500'
    },
    ptsd: {
        gradient: 'from-purple-500 to-purple-600',
        light: 'bg-purple-50 text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-50',
        icon: 'text-purple-500'
    },
    bipolar: {
        gradient: 'from-teal-500 to-cyan-500',
        light: 'bg-cyan-50 text-cyan-600',
        border: 'border-cyan-200',
        hover: 'hover:bg-cyan-50',
        icon: 'text-cyan-500'
    },
    ocd: {
        gradient: 'from-pink-500 to-rose-500',
        light: 'bg-rose-50 text-rose-600',
        border: 'border-rose-200',
        hover: 'hover:bg-rose-50',
        icon: 'text-rose-500'
    },
    eatingDisorders: {
        gradient: 'from-green-500 to-emerald-500',
        light: 'bg-emerald-50 text-emerald-600',
        border: 'border-emerald-200',
        hover: 'hover:bg-emerald-50',
        icon: 'text-emerald-500'
    },
    adhd: {
        gradient: 'from-indigo-500 to-violet-500',
        light: 'bg-violet-50 text-violet-600',
        border: 'border-violet-200',
        hover: 'hover:bg-violet-50',
        icon: 'text-violet-500'
    },
};

export default function Learn() {
    const { t } = useTranslation();
    const { category, tab } = useParams();
    const navigate = useNavigate();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { isAuthenticated } = useAuth();
    // const [searchQuery, setSearchQuery] = useState('');

    // Data states
    const [contentData, setContentData] = useState([]);
    const [wellnessTip, setWellnessTip] = useState(null);
    const [featuredVideo, setFeaturedVideo] = useState(null);

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [playingVideo, setPlayingVideo] = useState(null);
    const [selectedArticle, setSelectedArticle] = useState(null);

    const selectedCategory = category || 'depression';
    const activeTab = tab || 'overview'; // Default to overview now

    const theme = categoryThemes[selectedCategory] || categoryThemes.depression;

    const categories = [
        { key: 'depression', label: t('learn.categories.depression'), description: "Understanding and managing depression." },
        { key: 'anxiety', label: t('learn.categories.anxiety'), description: "Coping strategies for anxiety relief." },
        { key: 'ptsd', label: t('learn.categories.ptsd'), description: "Healing and recovery from trauma." },
        { key: 'bipolar', label: t('learn.categories.bipolar'), description: "Navigating highs and lows." },
        { key: 'ocd', label: t('learn.categories.ocd'), description: "Managing obsessive thoughts." },
        { key: 'eatingDisorders', label: t('learn.categories.eatingDisorders'), description: "Building a healthy relationship with food." },
        { key: 'adhd', label: t('learn.categories.adhd'), description: "Focus and attention strategies." },
    ];

    const contentTabs = [
        { key: 'overview', label: 'Overview', icon: BookOpen },
        { key: 'videos', label: t('learn.contentTypes.videos'), icon: Video },
        { key: 'articles', label: t('learn.contentTypes.articles'), icon: FileText },
        // { key: 'exercises', label: t('learn.contentTypes.exercises'), icon: Dumbbell },
    ];

    // Validate Tab
    useEffect(() => {
        const validTabs = contentTabs.map(t => t.key);
        if (!validTabs.includes(activeTab)) {
            navigate(`/learn/${selectedCategory}/overview`, { replace: true });
        }
    }, [activeTab, selectedCategory, navigate]);

    // Fetch Content
    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            setError(null);
            try {
                // If overview, we fetch a few things in parallel to build the dashboard
                if (activeTab === 'overview') {
                    // Fetch tip and one video for featured logic
                    const [tipRes, videoRes] = await Promise.all([
                        api.get(`/wellness-tips/category/${selectedCategory}`),
                        api.get(`/content/videos`, { params: { category: selectedCategory, limit: 1 } })
                    ]);

                    const tipData = tipRes.data?.data || tipRes.data;
                    setWellnessTip(Array.isArray(tipData) ? tipData[0] : tipData);

                    const videoData = videoRes.data?.data || videoRes.data;
                    const videosList = Array.isArray(videoData) ? videoData : (videoData?.data || []);
                    setFeaturedVideo(videosList.length > 0 ? videosList[0] : null);

                    // We don't really need "contentData" list for overview unless we want latest articles
                    // Let's fetch latest 3 articles too
                    const articlesRes = await api.get(`/content/articles`, { params: { category: selectedCategory, limit: 3 } });
                    const articleData = articlesRes.data?.data || articlesRes.data;
                    const articlesList = Array.isArray(articleData) ? articleData : (articleData?.data || []);
                    setContentData(articlesList);

                } else {
                    // Standard list fetching for other tabs
                    let endpoint = `/content/${activeTab}`;
                    const res = await api.get(endpoint, { params: { category: selectedCategory } });

                    const rawData = res.data;
                    let content = [];

                    if (Array.isArray(rawData)) {
                        content = rawData;
                    } else if (rawData?.data && Array.isArray(rawData.data)) {
                        content = rawData.data;
                    } else if (rawData?.data?.data && Array.isArray(rawData.data.data)) { // Pagination
                        content = rawData.data.data;
                    }

                    setContentData(content);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setContentData([]); // Safety fallback
                // Don't error hard on overview, just show partial data
                if (activeTab !== 'overview') {
                    setError('Failed to load content. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [selectedCategory, activeTab]);

    // Filter content based on search query
    // const filteredContent = contentData.filter(item => {
    //     if (!searchQuery) return true;
    //     const query = searchQuery.toLowerCase();
    //     return (
    //         (item.title && item.title.toLowerCase().includes(query)) ||
    //         (item.description && item.description.toLowerCase().includes(query)) ||
    //         (item.summary && item.summary.toLowerCase().includes(query))
    //     );
    // });

    const renderOverview = () => {
        const categoryInfo = categories.find(c => c.key === selectedCategory);

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Introduction & Daily Tip Row */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Welcome / Description Card */}
                    <div className="lg:col-span-2 card p-8 bg-gradient-to-br from-white to-[var(--surface-hover)] dark:from-[var(--surface)] dark:to-[var(--surface)] text-[var(--text-primary)]">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Understanding {categoryInfo?.label}</h2>
                                <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                                    {categoryInfo?.description || "Explore our curated resources designed to help you understand, copm, and thrive."}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl bg-opacity-10 ${theme.light.split(' ')[0]}`}>
                                {categoryIcons[selectedCategory] && (() => {
                                    const Icon = categoryIcons[selectedCategory];
                                    return <Icon className={`w-8 h-8 ${theme.icon}`} />;
                                })()}
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => navigate(`/learn/${selectedCategory}/articles`)}
                                className="btn-primary flex items-center gap-2 text-sm"
                            >
                                Start Reading <ChevronRight className="w-4 h-4" />
                            </button>
                            {/* <button
                                onClick={() => navigate(`/learn/${selectedCategory}/exercises`)}
                                className="px-5 py-2.5 rounded-full border border-[var(--border)] font-medium hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-primary)] text-sm"
                            >
                                View Exercises
                            </button> */}
                        </div>
                    </div>

                    {/* Daily Wellness Tip */}
                    <div className="card p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-900/20 border-l-4 border-indigo-400">
                        <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400 font-semibold">
                            <Lightbulb className="w-5 h-5" />
                            <span>Wellness Tip</span>
                        </div>
                        {wellnessTip ? (
                            <>
                                <h3 className="font-bold text-[var(--text-primary)] mb-2">{wellnessTip.title}</h3>
                                <p className="text-[var(--text-secondary)] text-sm italic">
                                    "{wellnessTip.content}"
                                </p>
                            </>
                        ) : (
                            <p className="text-[var(--text-secondary)] text-sm">
                                Taking small steps every day can lead to big changes. Be kind to yourself today.
                            </p>
                        )}
                    </div>
                </div>

                {/* Featured Video Section */}
                {featuredVideo && (
                    <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Video className="w-5 h-5 text-[var(--primary)]" /> Featured Video
                        </h3>
                        <div className="card overflow-hidden grid md:grid-cols-5 bg-black rounded-2xl">
                            <div className="md:col-span-3 relative aspect-video md:aspect-auto">
                                <img
                                    src={featuredVideo.thumbnail_url || (featuredVideo.thumbnail && !featuredVideo.thumbnail.startsWith('http') ? `/storage/${featuredVideo.thumbnail}` : featuredVideo.thumbnail)}
                                    alt={featuredVideo.title}
                                    className="w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button
                                        onClick={() => navigate(`/learn/${selectedCategory}/videos`)}
                                        className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                    >
                                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-2 p-6 md:p-8 bg-[var(--surface)] flex flex-col justify-center">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="inline-block px-3 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                                        MUST WATCH
                                    </div>
                                    {isAuthenticated && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleBookmark('video', featuredVideo.id);
                                            }}
                                            className={`transition-colors ${isBookmarked('video', featuredVideo.id)
                                                ? 'text-[var(--primary)]'
                                                : 'text-[var(--text-muted)] hover:text-[var(--primary)]'
                                                }`}
                                        >
                                            <Bookmark className={`w-6 h-6 ${isBookmarked('video', featuredVideo.id) ? 'fill-current' : ''}`} />
                                        </button>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 line-clamp-2">
                                    {featuredVideo.title}
                                </h3>
                                <p className="text-[var(--text-secondary)] text-sm mb-6 line-clamp-3">
                                    {featuredVideo.description || "Watch this helpful video guide to learn more about key concepts and strategies."}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mt-auto">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(featuredVideo.duration)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        // Check if it's already formatted (contains :)
        if (typeof seconds === 'string' && seconds.includes(':')) return seconds;

        const num = parseInt(seconds, 10);
        if (isNaN(num)) return '0:00';

        const minutes = Math.floor(num / 60);
        const remainingSeconds = num % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const renderVideos = () => {
        if (playingVideo) {
            return (
                <div className="card overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    <div className="aspect-video">
                        <iframe
                            src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1`}
                            title="Video player"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                    <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)]">
                        <button
                            onClick={() => setPlayingVideo(null)}
                            className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to videos
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {contentData.map((video) => (
                    <div
                        key={video.id}
                        className="group card overflow-hidden cursor-pointer hover:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)] transition-all duration-300"
                        onClick={() => {
                            let videoId = video.youtube_id || video.youtubeId;
                            if (!videoId && video.url) {
                                const match = video.url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
                                if (match && match[2].length === 11) videoId = match[2];
                            }
                            if (videoId) setPlayingVideo(videoId);
                        }}
                    >
                        <div className="aspect-video relative overflow-hidden">
                            <img
                                src={video.thumbnail_url || (video.thumbnail && !video.thumbnail.startsWith('http') ? `/storage/${video.thumbnail}` : video.thumbnail)}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:scale-110 transition-all">
                                    <Play className="w-5 h-5 text-white fill-white ms-1" />
                                </div>
                            </div>
                            <span className="absolute bottom-2 end-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded">
                                {formatDuration(video.duration)}
                            </span>
                            {isAuthenticated && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleBookmark('video', video.id);
                                    }}
                                    className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--primary)]"
                                >
                                    <Bookmark className={`w-4 h-4 ${isBookmarked('video', video.id) ? 'fill-current' : ''}`} />
                                </button>
                            )}
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                                {video.title}
                            </h4>
                            <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                                {video.description || "No description available"}
                            </p>
                        </div>
                    </div>
                ))
                }
            </div >
        );
    };

    const renderArticles = () => (
        <>
            <div className="grid gap-4">
                {contentData.map((article) => (
                    <div
                        key={article.id}
                        className="card p-0 overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
                        onClick={() => setSelectedArticle(article)}
                    >
                        <div className="flex flex-col sm:flex-row h-full">
                            {/* Decorative side strip */}
                            <div className={`w-full sm:w-2 h-2 sm:h-auto bg-gradient-to-b ${theme.gradient} opacity-5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2`} />

                            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h4 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                                            {article.title}
                                        </h4>
                                        {isAuthenticated && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleBookmark('article', article.id);
                                                }}
                                                className={`transition-colors ${isBookmarked('article', article.id)
                                                    ? 'text-[var(--primary)]'
                                                    : 'text-[var(--text-muted)] hover:text-[var(--primary)]'
                                                    }`}
                                            >
                                                <Bookmark className={`w-5 h-5 ${isBookmarked('article', article.id) ? 'fill-current' : ''}`} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2 leading-relaxed">
                                        {article.excerpt || article.summary}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-medium">
                                    <span className="flex items-center gap-1.5 bg-[var(--surface-hover)] px-2 py-1 rounded-md">
                                        <Clock className="w-3.5 h-3.5" />
                                        {article.read_time || article.readTime || "5 min read"}
                                    </span>
                                    {article.author && (
                                        <span className="flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            {article.author.name || article.author}
                                        </span>
                                    )}
                                    <span className="ms-auto flex items-center gap-1 text-[var(--primary)] group-hover:translate-x-1 transition-transform">
                                        Read Article <ChevronRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Simplified Modal Logic Reused */}
            {selectedArticle && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedArticle(null)}
                >
                    <div
                        className="bg-[var(--surface)] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-[var(--surface)] border-b border-[var(--border)] p-4 flex items-center justify-between z-10">
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to list
                            </button>
                            <button onClick={() => setSelectedArticle(null)} className="p-2 hover:bg-[var(--surface-hover)] rounded-full">
                                <X className="w-5 h-5 text-[var(--text-secondary)]" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto max-h-[calc(90vh-70px)]">
                            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">{selectedArticle.title}</h1>
                            <div className="prose prose-lg max-w-none dark:prose-invert text-[var(--text-secondary)]">
                                {selectedArticle.content ? (
                                    <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                                ) : (
                                    <p>{selectedArticle.excerpt || "Content loading..."}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    const renderExercises = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {contentData.map((exercise) => {
                let imageUrl = exercise.image_url || exercise.image;
                if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl = `/storage/${imageUrl}`;
                }
                if (!imageUrl) imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(exercise.title)}&size=400&background=6366f1&color=ffffff&font-size=0.33`;

                return (
                    <div key={exercise.id} className="group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all">
                        <img
                            src={imageUrl}
                            alt={exercise.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="absolute bottom-0 inset-x-0 p-4 transform transition-transform">
                            <h4 className="font-bold text-white text-lg leading-tight mb-1">{exercise.title}</h4>
                            <p className="text-white/80 text-xs line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                                {exercise.description}
                            </p>
                            <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75 transform translate-y-4 group-hover:translate-y-0">
                                <button className="w-full py-2 bg-white/20 backdrop-blur-md rounded-lg text-white text-xs font-semibold hover:bg-white/30 border border-white/30">
                                    Start Now
                                </button>
                            </div>
                        </div>

                        {isAuthenticated && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBookmark('exercise', exercise.id);
                                }}
                                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--primary)]"
                            >
                                <Bookmark className={`w-4 h-4 ${isBookmarked('exercise', exercise.id) ? 'fill-current' : ''}`} />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="min-h-screen pb-12 bg-[var(--background)]">
            {/* 1. Hero Header */}
            <div className="relative overflow-hidden bg-[var(--surface)] text-[var(--text-primary)] border-b border-[var(--border)]">
                {/* Decorative background gradients */}
                <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b ${theme.gradient} opacity-5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2`} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-hover)] text-xs font-medium text-[var(--primary)] mb-6 border border-[var(--border)]">
                            <Sparkles className="w-3 h-3" /> Mental Health Library
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-[var(--text-primary)]">
                            {t('learn.title')}
                        </h1>
                        {/* Search Removed */}

                        {/* Search Removed */}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* 2. Sidebar Navigation (Desktop) / Horizontal Scroll (Mobile) */}
                    <nav className="lg:w-64 flex-shrink-0">
                        <div className="lg:sticky lg:top-24 space-y-8">
                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 px-2">
                                    Categories
                                </h3>
                                <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-4 lg:pb-0 no-scrollbar">
                                    {categories.map((cat) => {
                                        const isActive = selectedCategory === cat.key;
                                        const CatIcon = categoryIcons[cat.key];
                                        const activeTheme = categoryThemes[cat.key];

                                        return (
                                            <button
                                                key={cat.key}
                                                onClick={() => navigate(`/learn/${cat.key}/overview`)} // Reset to overview on cat switch
                                                className={`
                                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap lg:whitespace-normal
                                                    ${isActive
                                                        ? `${activeTheme.light} border ${activeTheme.border} shadow-sm font-semibold`
                                                        : `text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]`
                                                    }
                                                `}
                                            >
                                                <CatIcon className={`w-5 h-5 ${isActive ? 'scale-110' : 'opacity-70'}`} />
                                                <span>{cat.label}</span>
                                                {isActive && <ChevronRight className="w-4 h-4 ms-auto hidden lg:block" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* 3. Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* Tabs */}
                        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar border-b border-[var(--border)]">
                            {contentTabs.map((currentTab) => {
                                const isActive = activeTab === currentTab.key;
                                return (
                                    <button
                                        key={currentTab.key}
                                        onClick={() => navigate(`/learn/${selectedCategory}/${currentTab.key}`)}
                                        className={`
                                            flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap mr-4
                                            ${isActive
                                                ? `border-[var(--primary)] text-[var(--primary)]`
                                                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border)]'
                                            }
                                        `}
                                    >
                                        <currentTab.icon className="w-4 h-4" />
                                        {currentTab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* View Content */}
                        <div className="min-h-[400px]">
                            {loading ? (
                                <div className="w-full h-64 flex items-center justify-center text-[var(--text-muted)]">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                                        <p className="text-sm">Loading resources...</p>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="card p-8 text-center border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30">
                                    <h3 className="text-red-600 font-semibold mb-2">Unavailable</h3>
                                    <p className="text-red-500 text-sm">{error}</p>
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'overview' && renderOverview()}
                                    {activeTab === 'videos' && renderVideos()}
                                    {activeTab === 'articles' && renderArticles()}
                                    {/* {activeTab === 'exercises' && renderExercises()} */}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add this to index.css if not present:
/* 
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
*/
