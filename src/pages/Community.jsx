import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Plus, User, Send, X, MoreHorizontal, Eye, EyeOff, MessageSquare, ChevronDown, ChevronUp, Reply, Trash2, Edit2, Users, UserCircle, Sparkles, Smile, PenTool } from 'lucide-react';
import api from '../api/axios';

export default function Community() {
    const { t } = useTranslation();
    const { isAuthenticated, user } = useAuth();
    const [posts, setPosts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', is_anonymous: false });
    const [creating, setCreating] = useState(false);


    // Comments state
    const [expandedPost, setExpandedPost] = useState(null);
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    // Edit/Delete state
    const [editingPost, setEditingPost] = useState(null);
    const [deletingPost, setDeletingPost] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);



    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            setPosts(res.data.data?.data || res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            // Mock data for demo
            setPosts([
                { id: 1, title: 'Finding peace in daily routines', content: 'I\'ve discovered that having a consistent morning routine really helps my mental health...', is_anonymous: false, user: { name: 'Sarah M.', id: 1 }, user_id: 1, likes_count: 12, comments_count: 5, created_at: new Date().toISOString() },
                { id: 2, title: 'Grateful for this community', content: 'Just wanted to say thank you to everyone here. Your support means a lot during difficult times.', is_anonymous: true, user_id: 2, likes_count: 24, comments_count: 8, created_at: new Date().toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (post) => {
        setEditingPost(post);
        setEditForm({ title: post.title, content: post.content });
    };

    const handleEditPost = async () => {
        if (!editingPost || !editForm.title || !editForm.content) return;
        setSaving(true);
        try {
            await api.put(`/posts/${editingPost.id}`, editForm);
            setEditingPost(null);
            fetchPosts();
            if (isAuthenticated) fetchMyPosts();
        } catch (error) {
            console.error('Failed to update post:', error);
            // For demo, update locally
            setPosts(prev => prev.map(p =>
                p.id === editingPost.id ? { ...p, ...editForm } : p
            ));

            setEditingPost(null);
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePost = async () => {
        if (!deletingPost) return;
        setSaving(true);
        try {
            await api.delete(`/posts/${deletingPost.id}`);
            setDeletingPost(null);
            fetchPosts();
            if (isAuthenticated) fetchMyPosts();
        } catch (error) {
            console.error('Failed to delete post:', error);
            alert('Failed to delete post. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const isOwnPost = (post) => {
        return user && (post.user_id === user.id || post.user?.id === user.id);
    };

    const fetchComments = async (postId) => {
        setCommentLoading(true);
        try {
            const res = await api.get(`/posts/${postId}`);
            const postData = res.data?.data || res.data;
            const postComments = postData?.comments || [];
            setComments(prev => ({ ...prev, [postId]: postComments }));
        } catch (error) {
            console.error('Failed to fetch comments:', error);
            setComments(prev => ({ ...prev, [postId]: [] }));
        } finally {
            setCommentLoading(false);
        }
    };

    const handleToggleComments = (postId) => {
        if (expandedPost === postId) {
            setExpandedPost(null);
        } else {
            setExpandedPost(postId);
            if (!comments[postId]) {
                fetchComments(postId);
            }
        }
    };

    const handleSubmitComment = async (postId) => {
        if (!newComment.trim() || !isAuthenticated) return;
        setSubmittingComment(true);
        try {
            await api.post('/comments', {
                commentable_type: 'post',
                commentable_id: postId,
                content: newComment,
            });
            setNewComment('');
            // Refresh comments and post
            fetchComments(postId);
            fetchPosts();
        } catch (error) {
            console.error('Failed to post comment:', error);
            alert('Failed to post comment. Please try again.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleLike = async (postId) => {
        if (!isAuthenticated) return;
        try {
            await api.post(`/posts/${postId}/like`);
            fetchPosts();
        } catch (error) {
            console.error('Failed to like post:', error);
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.title || !newPost.content) return;
        setCreating(true);
        try {
            await api.post('/posts', newPost);
            setNewPost({ title: '', content: '', is_anonymous: false });
            setShowCreateModal(false);
            fetchPosts();
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setCreating(false);
        }
    };



    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Hero Section - Calm & Welcoming */}
            <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 pt-28 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6 animate-fade-in-up">
                        <Sparkles className="w-4 h-4" />
                        <span>A Safe Space for Everyone</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-primary)] animate-fade-in-up delay-100">
                        {t('community.title', 'Community Feed')}
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
                        {t('community.subtitle', 'Connect, share, and support each other in a safe, judgment-free environment.')}
                    </p>

                    {/* Quick Action Trigger */}
                    {isAuthenticated && (
                        <div className="max-w-2xl mx-auto animate-fade-in-up delay-300">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-[var(--border)] text-left hover:shadow-md transition-all group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <PenTool className="w-5 h-5" />
                                    </div>
                                    <span className="text-[var(--text-secondary)] text-lg">Share your story...</span>
                                </div>
                                <div className="bg-[var(--primary)] text-white p-2 rounded-full group-hover:scale-110 transition-transform">
                                    <Plus className="w-6 h-6" />
                                </div>
                            </button>
                        </div>
                    )}
                </div>

                {/* Decorative background blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl -z-10 animate-pulse-slow delay-1000"></div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Posts Feed */}
                <div className="space-y-8">
                    {(() => {
                        const displayedPosts = posts;

                        if (loading) return (
                            <div className="space-y-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-white/20 dark:border-gray-700/50 animate-pulse">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full" />
                                            <div>
                                                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-32 mb-2" />
                                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-20" />
                                            </div>
                                        </div>
                                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4 mb-3" />
                                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        );

                        if (displayedPosts.length === 0) return (
                            <div className="text-center py-20 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-dashed border-[var(--border)]">
                                <div className="text-6xl mb-6 opacity-30 grayscale">💭</div>
                                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                                    Quiet here...
                                </h3>
                                <p className="text-[var(--text-secondary)]">
                                    Be the first to share your thoughts
                                </p>
                            </div>
                        );

                        return (
                            <div className="space-y-6">
                                {displayedPosts.map((post, index) => (
                                    <div
                                        key={post.id}
                                        className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-[2rem] p-6 sm:p-8 border border-white/50 dark:border-white/5 hover:shadow-lg transition-all duration-300 group hover:bg-white/80 dark:hover:bg-white/10"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Author */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md transform group-hover:rotate-3 transition-transform ${post.is_anonymous ? 'bg-gradient-to-br from-indigo-300 to-indigo-500' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                                                    {post.is_anonymous ? (
                                                        <EyeOff className="w-5 h-5" />
                                                    ) : (
                                                        <span>{post.user?.name?.charAt(0) || 'A'}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-[var(--text-primary)]">
                                                            {post.is_anonymous ? 'Anonymous Friend' : post.user?.name || 'User'}
                                                        </p>
                                                        {post.is_anonymous && (
                                                            <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-300 font-medium tracking-wide">
                                                                HIDDEN
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                                                        {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Edit/Delete buttons for own posts */}
                                            {isOwnPost(post) && (
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(post)}
                                                        className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors text-[var(--text-muted)] hover:text-indigo-600 dark:hover:text-indigo-400"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingPost(post)}
                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-[var(--text-muted)] hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="mb-6 pl-2">
                                            <h3 className="font-bold text-xl text-[var(--text-primary)] mb-3 leading-snug">{post.title}</h3>
                                            <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line text-lg opacity-90">{post.content}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-6 pt-6 border-t border-[var(--border-light)]">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className={`flex items-center gap-2 transition-all px-4 py-2 rounded-xl group/like ${post.likes_count > 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 text-[var(--text-muted)]'
                                                    }`}
                                            >
                                                <Heart className={`w-5 h-5 transition-transform group-active/like:scale-75 ${post.likes_count > 0 ? 'fill-current' : ''}`} />
                                                <span className="font-medium">{post.likes_count || 0}</span>
                                            </button>
                                            <button
                                                onClick={() => handleToggleComments(post.id)}
                                                className={`flex items-center gap-2 transition-all px-4 py-2 rounded-xl ${expandedPost === post.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 text-[var(--text-muted)]'
                                                    }`}
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                                <span className="font-medium">{post.comments_count || 0}</span>
                                                <span className="ml-1 text-sm opacity-70">Comments</span>
                                            </button>
                                        </div>

                                        {/* Comments Section */}
                                        {expandedPost === post.id && (
                                            <div className="mt-6 pt-6 border-t border-[var(--border-light)] bg-white/30 dark:bg-black/20 rounded-2xl mx-[-12px] p-6 animate-fade-in-down">
                                                {/* Comment Input */}
                                                {isAuthenticated ? (
                                                    <div className="flex gap-4 mb-8">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">
                                                            {user?.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div className="flex-1 relative">
                                                            <input
                                                                type="text"
                                                                value={newComment}
                                                                onChange={(e) => setNewComment(e.target.value)}
                                                                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                                                                placeholder={t('community.writeComment') || 'Write a supportive comment...'}
                                                                className="w-full px-6 py-3 bg-white dark:bg-gray-800 rounded-2xl text-sm border-none shadow-sm focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all pr-12 text-[var(--text-primary)]"
                                                            />
                                                            <button
                                                                onClick={() => handleSubmitComment(post.id)}
                                                                disabled={!newComment.trim() || submittingComment}
                                                                className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:bg-gray-300 dark:disabled:bg-gray-700"
                                                            >
                                                                <Send className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mb-6 p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl text-center border border-indigo-100 dark:border-indigo-900/50">
                                                        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                                                            {t('community.loginToComment') || 'Sign in to join the conversation'}
                                                        </Link>
                                                    </div>
                                                )}

                                                {/* Comments List */}
                                                {commentLoading ? (
                                                    <div className="space-y-4">
                                                        {[1, 2].map((i) => (
                                                            <div key={i} className="flex gap-4 animate-pulse">
                                                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                                                                <div className="flex-1">
                                                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
                                                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : comments[post.id]?.length > 0 ? (
                                                    <div className="space-y-6">
                                                        {comments[post.id].map((comment) => (
                                                            <div key={comment.id} className="flex gap-4 group/comment">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1 ${comment.is_anonymous ? 'bg-indigo-300' : 'bg-indigo-500'}`}>
                                                                    {comment.is_anonymous ? (
                                                                        <EyeOff className="w-3 h-3" />
                                                                    ) : (
                                                                        comment.user?.name?.charAt(0) || 'A'
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="bg-white/60 dark:bg-white/5 p-4 rounded-2xl rounded-tl-none inline-block max-w-[90%]">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="text-sm font-bold text-[var(--text-primary)]">
                                                                                {comment.is_anonymous ? 'Anonymous' : comment.user?.name || 'User'}
                                                                            </span>
                                                                            <span className="text-xs text-[var(--text-muted)]">
                                                                                {new Date(comment.created_at).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[var(--text-secondary)] text-sm">{comment.content}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 opacity-50">
                                                        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-indigo-300 dark:text-indigo-700" />
                                                        <p className="text-sm text-[var(--text-muted)]">No comments yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Create Post Modal - Journaling Style */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-[var(--background)]/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 dark:border-gray-800 animate-scale-in">
                        <div className="p-8 sm:p-10">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                                    <PenTool className="w-8 h-8 text-indigo-500" />
                                    New Entry
                                </h2>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Give your thought a title..."
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-xl font-semibold placeholder-gray-300 dark:placeholder-gray-600 focus:ring-0 focus:bg-white dark:focus:bg-gray-700 transition-all text-[var(--text-primary)]"
                                    />
                                </div>

                                <div className="relative">
                                    <textarea
                                        placeholder="What's on your mind today? This is a safe space..."
                                        value={newPost.content}
                                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                        className="w-full p-6 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl h-64 resize-none text-[var(--text-secondary)] placeholder-gray-400 dark:placeholder-gray-600 focus:ring-0 focus:bg-white dark:focus:bg-gray-700 transition-all text-lg leading-relaxed custom-scrollbar"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${newPost.is_anonymous ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${newPost.is_anonymous ? 'translate-x-7' : 'translate-x-1'}`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-[var(--text-primary)]">Post Anonymously</span>
                                            <span className="text-xs text-[var(--text-muted)]">Hide your identity</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={newPost.is_anonymous}
                                            onChange={(e) => setNewPost({ ...newPost, is_anonymous: e.target.checked })}
                                            className="sr-only"
                                        />
                                    </label>

                                    <button
                                        onClick={handleCreatePost}
                                        disabled={!newPost.title || !newPost.content || creating}
                                        className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-0.5"
                                    >
                                        <Send className="w-5 h-5" />
                                        {creating ? 'Publishing...' : 'Share with Community'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Post Modal */}
            {editingPost && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setEditingPost(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h3 className="font-bold text-xl text-[var(--text-primary)]">Edit Post</h3>
                            <button
                                onClick={() => setEditingPost(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                placeholder="Post title"
                                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl font-semibold focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all text-[var(--text-primary)]"
                            />
                            <textarea
                                value={editForm.content}
                                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                placeholder="What's on your mind?"
                                rows={5}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl resize-none focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all text-[var(--text-secondary)]"
                            />
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setEditingPost(null)}
                                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditPost}
                                    disabled={!editForm.title || !editForm.content || saving}
                                    className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingPost && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setDeletingPost(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-[2rem] max-w-sm w-full shadow-2xl p-6 text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Delete Post?</h3>
                        <p className="text-[var(--text-secondary)] mb-8">
                            This action cannot be undone. Are you sure you want to delete this post?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingPost(null)}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePost}
                                disabled={saving}
                                className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
