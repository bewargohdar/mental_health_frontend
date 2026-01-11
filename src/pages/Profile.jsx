import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Calendar, FileText, Camera, Save, ArrowLeft, LogOut, Trash2, Globe, Upload, X, AlertTriangle, Bookmark } from 'lucide-react';
import api from '../api/axios';

export default function Profile() {
    const { user, isAuthenticated, logout, fetchUser } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [deletingAvatar, setDeletingAvatar] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date_of_birth: '',
        bio: '',
    });

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
        { code: 'ku', name: 'کوردی', flag: '🇮🇶' },
    ];

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                date_of_birth: user.date_of_birth || '',
                bio: user.bio || '',
            });
        }
    }, [user, isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/profile', formData);
            if (fetchUser) await fetchUser();
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };



    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setUploadingAvatar(true);
        try {
            await api.post('/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (fetchUser) await fetchUser();
        } catch (error) {
            console.error('Failed to upload avatar:', error);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleDeleteAvatar = async () => {
        setDeletingAvatar(true);
        try {
            await api.delete('/profile/avatar');
            if (fetchUser) await fetchUser();
        } catch (error) {
            console.error('Failed to delete avatar:', error);
        } finally {
            setDeletingAvatar(false);
        }
    };

    const handleLanguageChange = async (langCode) => {
        try {
            // Update i18n immediately
            i18n.changeLanguage(langCode);
            localStorage.setItem('language', langCode);

            // Update document direction
            document.documentElement.dir = langCode === 'ar' || langCode === 'ku' ? 'rtl' : 'ltr';

            // Sync with backend
            await api.post(`/profile/language/${langCode}`);
        } catch (error) {
            console.error('Failed to sync language:', error);
            // Language is already changed locally, so just log error
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Header */}
            <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
                        <ArrowLeft className="w-5 h-5" />
                        {t('profile.backToHome') || 'Back to Home'}
                    </Link>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar.startsWith('http') ? user.avatar : `http://127.0.0.1:8000/storage/${user.avatar}`}
                                    alt={user.name}
                                    className="w-24 h-24 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                className="absolute bottom-0 end-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[var(--primary)] shadow-lg hover:bg-gray-100 disabled:opacity-50"
                            >
                                {uploadingAvatar ? (
                                    <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4" />
                                )}
                            </button>
                            {user?.avatar && (
                                <button
                                    onClick={handleDeleteAvatar}
                                    disabled={deletingAvatar}
                                    className="absolute top-0 end-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 disabled:opacity-50"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{user?.name}</h1>
                            <p className="opacity-90">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* My Bookmarks */}
                <Link to="/bookmarks" className="card p-6 mb-6 flex items-center justify-between group hover:border-[var(--primary)] transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                            <Bookmark className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                {t('profile.myBookmarks') || 'My Bookmarks'}
                            </h2>
                            <p className="text-[var(--text-secondary)] text-sm">
                                {t('profile.viewSaved') || 'View your saved content'}
                            </p>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                    </div>
                </Link>



                {/* Edit Profile Form */}
                <form onSubmit={handleSubmit} className="card p-6 mb-6">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
                        {t('profile.editProfile') || 'Edit Profile'}
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                {t('profile.fullName') || 'Full Name'}
                            </label>
                            <div className="relative">
                                <User className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full ps-12 pe-4 py-3 input-field rounded-xl"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                {t('profile.email') || 'Email'}
                            </label>
                            <div className="relative">
                                <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full ps-12 pe-4 py-3 input-field rounded-xl bg-[var(--surface-hover)] text-[var(--text-muted)]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                {t('profile.phone') || 'Phone'}
                            </label>
                            <div className="relative">
                                <Phone className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder={t('profile.enterPhone') || 'Enter your phone number'}
                                    className="w-full ps-12 pe-4 py-3 input-field rounded-xl"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                {t('profile.dateOfBirth') || 'Date of Birth'}
                            </label>
                            <div className="relative">
                                <Calendar className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                <input
                                    type="date"
                                    value={formData.date_of_birth}
                                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                    className="w-full ps-12 pe-4 py-3 input-field rounded-xl"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                {t('profile.bio') || 'Bio'}
                            </label>
                            <div className="relative">
                                <FileText className="absolute start-4 top-4 w-5 h-5 text-[var(--text-muted)]" />
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder={t('profile.tellUs') || 'Tell us about yourself...'}
                                    rows={4}
                                    className="w-full ps-12 pe-4 py-3 input-field rounded-xl resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? (t('profile.saving') || 'Saving...') : (t('profile.saveChanges') || 'Save Changes')}
                        </button>
                    </div>
                </form>


            </div>


        </div>
    );
}
