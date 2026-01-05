import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Plus, User, Send, X, MoreHorizontal, Eye, EyeOff, MessageSquare, ChevronDown, ChevronUp, Reply, Trash2, Edit2, Users, UserCircle } from 'lucide-react';
import api from '../api/axios';

export default function Community() {
    const { t } = useTranslation();
    const { isAuthenticated, user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', is_anonymous: false });
    const [creating, setCreating] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'
    const [chatMessages, setChatMessages] = useState([
        { id: 1, user: 'Anonymous', message: 'Welcome to the community chat! 👋', own: false, time: '10:30 AM' },
        { id: 2, user: 'You', message: 'Thanks! Happy to be here.', own: true, time: '10:32 AM' },
    ]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

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
        if (isAuthenticated) {
            fetchMyPosts();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

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

    const fetchMyPosts = async () => {
        try {
            const res = await api.get('/posts/my-posts');
            setMyPosts(res.data.data?.data || res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch my posts:', error);
            // For demo, filter posts by current user
            setMyPosts([]);
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
            setMyPosts(prev => prev.map(p =>
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

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        setChatMessages([...chatMessages, {
            id: Date.now(),
            user: 'You',
            message: newMessage,
            own: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setNewMessage('');
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Header */}
            <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] text-white py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{t('community.title')}</h1>
                            <p className="opacity-90">{t('community.subtitle')}</p>
                        </div>
                        <div className="flex gap-3">
                            {isAuthenticated && (
                                <button
                                    onClick={() => setShowChat(!showChat)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-colors ${showChat
                                        ? 'bg-white/20 text-white'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    {t('community.chat')}
                                </button>
                            )}
                            {isAuthenticated && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 bg-white text-[var(--accent-dark)] px-6 py-2.5 rounded-full font-semibold hover:bg-white/90 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    {t('community.newPost')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Switcher */}
                {isAuthenticated && (
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'all'
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--light-gray)]'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            All Posts
                        </button>
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'my'
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--light-gray)]'
                                }`}
                        >
                            <UserCircle className="w-4 h-4" />
                            My Posts ({myPosts.length})
                        </button>
                    </div>
                )}

                <div className="flex gap-8">
                    {/* Posts Feed */}
                    <div className={`flex-1 ${showChat ? 'hidden lg:block' : ''}`}>
                        {(() => {
                            const displayedPosts = activeTab === 'my' ? myPosts : posts;

                            if (loading) return (
                                <div className="space-y-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="card p-6 animate-pulse">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 bg-[var(--light-gray)] rounded-full" />
                                                <div>
                                                    <div className="h-4 bg-[var(--light-gray)] rounded w-32 mb-2" />
                                                    <div className="h-3 bg-[var(--light-gray)] rounded w-20" />
                                                </div>
                                            </div>
                                            <div className="h-4 bg-[var(--light-gray)] rounded w-3/4 mb-2" />
                                            <div className="h-4 bg-[var(--light-gray)] rounded w-1/2" />
                                        </div>
                                    ))}
                                </div>
                            );

                            if (displayedPosts.length === 0) return (
                                <div className="text-center py-16 card">
                                    <div className="text-6xl mb-4">📝</div>
                                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                                        {activeTab === 'my' ? 'No posts yet' : 'No posts in community'}
                                    </h3>
                                    <p className="text-[var(--text-secondary)]">
                                        {activeTab === 'my' ? 'Share your thoughts with the community' : 'Be the first to share'}
                                    </p>
                                </div>
                            );

                            return (
                                <div className="space-y-6">
                                    {displayedPosts.map((post) => (
                                        <div key={post.id} className="card p-6">
                                            {/* Author */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-full flex items-center justify-center text-white">
                                                        {post.is_anonymous ? (
                                                            <EyeOff className="w-5 h-5" />
                                                        ) : (
                                                            <span className="text-lg font-semibold">
                                                                {post.user?.name?.charAt(0) || 'A'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-[var(--text-primary)]">
                                                                {post.is_anonymous ? 'Anonymous' : post.user?.name || 'User'}
                                                            </p>
                                                            {post.is_anonymous && (
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--light-gray)] text-[var(--text-muted)]">
                                                                    Anonymous
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-[var(--text-muted)]">
                                                            {new Date(post.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Edit/Delete buttons for own posts */}
                                                {isOwnPost(post) && (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => openEditModal(post)}
                                                            className="p-2 hover:bg-[var(--surface-hover)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--primary)]"
                                                            title="Edit post"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingPost(post)}
                                                            className="p-2 hover:bg-red-50 rounded-full transition-colors text-[var(--text-muted)] hover:text-red-500"
                                                            title="Delete post"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-2">{post.title}</h3>
                                            <p className="text-[var(--text-secondary)] mb-4">{post.content}</p>

                                            {/* Actions */}
                                            <div className="flex items-center gap-6 pt-4 border-t border-[var(--border)]">
                                                <button
                                                    onClick={() => handleLike(post.id)}
                                                    className="flex items-center gap-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                                >
                                                    <Heart className={`w-5 h-5 ${post.likes_count > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                                                    <span className="text-sm">{post.likes_count || 0}</span>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleComments(post.id)}
                                                    className={`flex items-center gap-2 transition-colors ${expandedPost === post.id ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--primary)]'}`}
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                    <span className="text-sm">{post.comments_count || 0}</span>
                                                    {expandedPost === post.id ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Comments Section */}
                                            {expandedPost === post.id && (
                                                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                                                    {/* Comment Input */}
                                                    {isAuthenticated ? (
                                                        <div className="flex gap-3 mb-4">
                                                            <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                                                                {user?.name?.charAt(0) || 'U'}
                                                            </div>
                                                            <div className="flex-1 flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={newComment}
                                                                    onChange={(e) => setNewComment(e.target.value)}
                                                                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                                                                    placeholder={t('community.writeComment') || 'Write a comment...'}
                                                                    className="flex-1 px-4 py-2 input-field rounded-full text-sm"
                                                                />
                                                                <button
                                                                    onClick={() => handleSubmitComment(post.id)}
                                                                    disabled={!newComment.trim() || submittingComment}
                                                                    className="p-2 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
                                                                >
                                                                    <Send className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mb-4 p-3 bg-[var(--surface-hover)] rounded-lg text-center">
                                                            <Link to="/login" className="text-[var(--primary)] hover:underline text-sm">
                                                                {t('community.loginToComment') || 'Log in to comment'}
                                                            </Link>
                                                        </div>
                                                    )}

                                                    {/* Comments List */}
                                                    {commentLoading ? (
                                                        <div className="space-y-3">
                                                            {[1, 2].map((i) => (
                                                                <div key={i} className="flex gap-3 animate-pulse">
                                                                    <div className="w-8 h-8 bg-[var(--light-gray)] rounded-full" />
                                                                    <div className="flex-1">
                                                                        <div className="h-3 bg-[var(--light-gray)] rounded w-24 mb-2" />
                                                                        <div className="h-3 bg-[var(--light-gray)] rounded w-3/4" />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : comments[post.id]?.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {comments[post.id].map((comment) => (
                                                                <div key={comment.id} className="flex gap-3">
                                                                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                                                                        {comment.is_anonymous ? (
                                                                            <EyeOff className="w-3 h-3" />
                                                                        ) : (
                                                                            comment.user?.name?.charAt(0) || 'A'
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="text-sm font-medium text-[var(--text-primary)]">
                                                                                {comment.is_anonymous ? 'Anonymous' : comment.user?.name || 'User'}
                                                                            </span>
                                                                            <span className="text-xs text-[var(--text-muted)]">
                                                                                {new Date(comment.created_at).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm text-[var(--text-secondary)]">{comment.content}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-[var(--text-muted)] text-center py-4">
                                                            {t('community.noComments') || 'No comments yet. Be the first to comment!'}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Chat Window */}
                    {showChat && isAuthenticated && (
                        <div className="w-full lg:w-80 flex-shrink-0">
                            <div className="card h-[500px] flex flex-col sticky top-20">
                                {/* Chat Header */}
                                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                                    <h3 className="font-semibold text-[var(--text-primary)]">{t('community.chat')}</h3>
                                    <button
                                        onClick={() => setShowChat(false)}
                                        className="p-1 hover:bg-[var(--surface-hover)] rounded lg:hidden"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {chatMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.own ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`chat-bubble ${msg.own ? 'own' : ''} max-w-[85%]`}>
                                                {!msg.own && (
                                                    <p className="text-xs font-medium mb-1 opacity-70">{msg.user}</p>
                                                )}
                                                <p className="text-sm">{msg.message}</p>
                                                <p className={`text-xs mt-1 ${msg.own ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                                                    {msg.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-4 border-t border-[var(--border)]">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder={t('community.typeMesage')}
                                            className="flex-1 px-4 py-2 input-field rounded-full text-sm"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            className="p-2.5 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="card p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('community.createPost')}</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-[var(--surface-hover)] rounded-full">
                                <X className="w-6 h-6 text-[var(--text-muted)]" />
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder={t('community.postTitle')}
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                            className="w-full p-4 input-field rounded-xl mb-4"
                        />

                        <textarea
                            placeholder={t('community.postContent')}
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            className="w-full p-4 input-field rounded-xl resize-none h-32 mb-4"
                        />

                        {/* Anonymous Toggle */}
                        <label className="flex items-center gap-3 mb-6 cursor-pointer p-4 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--light-gray)] transition-colors">
                            <div className={`relative w-12 h-7 rounded-full transition-colors ${newPost.is_anonymous ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}>
                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${newPost.is_anonymous ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                            <div className="flex items-center gap-2">
                                {newPost.is_anonymous ? <EyeOff className="w-5 h-5 text-[var(--primary)]" /> : <Eye className="w-5 h-5 text-[var(--text-muted)]" />}
                                <span className="text-[var(--text-primary)] font-medium">{t('community.postAnonymously')}</span>
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
                            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                            {creating ? t('community.posting') : t('community.post')}
                        </button>
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
                        className="bg-[var(--surface)] rounded-2xl max-w-lg w-full shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                            <h3 className="font-semibold text-[var(--text-primary)]">Edit Post</h3>
                            <button
                                onClick={() => setEditingPost(null)}
                                className="p-2 hover:bg-[var(--surface-hover)] rounded-full"
                            >
                                <X className="w-5 h-5 text-[var(--text-secondary)]" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                placeholder="Post title"
                                className="w-full p-4 input-field rounded-xl"
                            />
                            <textarea
                                value={editForm.content}
                                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                placeholder="What's on your mind?"
                                rows={5}
                                className="w-full p-4 input-field rounded-xl resize-none"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditingPost(null)}
                                    className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditPost}
                                    disabled={!editForm.title || !editForm.content || saving}
                                    className="flex-1 btn-primary disabled:opacity-50"
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
                        className="bg-[var(--surface)] rounded-2xl max-w-sm w-full shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Delete Post?</h3>
                            <p className="text-[var(--text-secondary)] mb-6">
                                This action cannot be undone. Are you sure you want to delete this post?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeletingPost(null)}
                                    className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeletePost}
                                    disabled={saving}
                                    className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
