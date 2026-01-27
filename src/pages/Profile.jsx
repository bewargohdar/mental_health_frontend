import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    User, Mail, Phone, Calendar, FileText, Camera, Save, ArrowLeft,
    LogOut, X, Bookmark, Settings, Shield, Globe, Lock, Eye, EyeOff,
    Check, AlertTriangle, ChevronRight
} from 'lucide-react';
import api from '../api/axios';

// Toast Component
function Toast({ message, type, show, onClose }) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => onClose(), 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    return (
        <div className={`toast toast-${type} ${show ? 'show' : ''}`}>
            {type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {message}
        </div>
    );
}

// Completion Ring Component
function CompletionRing({ percentage }) {
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="completion-ring-container">
            <svg className="completion-ring" width="64" height="64">
                <circle className="completion-ring-bg" cx="32" cy="32" r={radius} />
                <circle
                    className="completion-ring-progress"
                    cx="32"
                    cy="32"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />
            </svg>
            <div className="completion-ring-text">{percentage}%</div>
        </div>
    );
}

export default function Profile() {
    const { user, isAuthenticated, logout, fetchUser } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Tab state
    const [activeTab, setActiveTab] = useState('profile');

    // Loading states
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [deletingAvatar, setDeletingAvatar] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Toast state
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Password visibility
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date_of_birth: '',
        bio: '',
    });

    // Password form
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    // Privacy settings
    const [privacySettings, setPrivacySettings] = useState({
        show_mood: true,
        anonymous_posts: false,
    });

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
        { code: 'ku', name: 'کوردی', flag: '🇮🇶' },
    ];

    // Calculate profile completion percentage
    const calculateCompletion = () => {
        if (!user) return 0;
        let completed = 0;
        const fields = ['name', 'email', 'phone', 'date_of_birth', 'bio', 'avatar'];
        fields.forEach(field => {
            if (user[field]) completed++;
        });
        return Math.round((completed / fields.length) * 100);
    };

    // Helper function to format date for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        // Handle both "YYYY-MM-DD" and "YYYY-MM-DD HH:MM:SS" formats
        const datePart = dateString.split(' ')[0];
        // Validate date format
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            return datePart;
        }
        // Try to parse and format as YYYY-MM-DD
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
        return '';
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                date_of_birth: formatDateForInput(user.date_of_birth),
                bio: user.bio || '',
            });
            if (user.privacy_settings) {
                setPrivacySettings({
                    show_mood: user.privacy_settings.show_mood ?? true,
                    anonymous_posts: user.privacy_settings.anonymous_posts ?? false,
                });
            }
        }
    }, [user, isAuthenticated, navigate]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/profile', formData);
            if (fetchUser) await fetchUser();
            showToast(t('profile.profileUpdated') || 'Profile updated successfully');
        } catch (error) {
            console.error('Failed to update profile:', error);
            showToast(t('profile.updateFailed') || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            showToast(t('profile.passwordMismatch') || 'Passwords do not match', 'error');
            return;
        }
        setChangingPassword(true);
        try {
            await api.post('/profile/password', passwordForm);
            setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
            showToast(t('profile.passwordChanged') || 'Password changed successfully');
        } catch (error) {
            console.error('Failed to change password:', error);
            const message = error.response?.data?.message || 'Failed to change password';
            showToast(message, 'error');
        } finally {
            setChangingPassword(false);
        }
    };

    const handlePrivacyChange = async (key) => {
        const newSettings = { ...privacySettings, [key]: !privacySettings[key] };
        setPrivacySettings(newSettings);
        try {
            await api.put('/profile', { privacy_settings: newSettings });
            if (fetchUser) await fetchUser();
        } catch (error) {
            console.error('Failed to update privacy settings:', error);
            setPrivacySettings(privacySettings); // Revert on error
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleLogoutAll = async () => {
        try {
            await api.post('/auth/logout-all');
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to logout all devices:', error);
        }
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
            showToast(t('profile.avatarUploaded') || 'Avatar uploaded successfully');
        } catch (error) {
            console.error('Failed to upload avatar:', error);
            showToast(t('profile.avatarFailed') || 'Failed to upload avatar', 'error');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleDeleteAvatar = async () => {
        setDeletingAvatar(true);
        try {
            await api.delete('/profile/avatar');
            if (fetchUser) await fetchUser();
            showToast(t('profile.avatarDeleted') || 'Avatar deleted');
        } catch (error) {
            console.error('Failed to delete avatar:', error);
        } finally {
            setDeletingAvatar(false);
        }
    };

    const handleLanguageChange = async (langCode) => {
        try {
            i18n.changeLanguage(langCode);
            localStorage.setItem('language', langCode);
            document.documentElement.dir = langCode === 'ar' || langCode === 'ku' ? 'rtl' : 'ltr';
            await api.post(`/profile/language/${langCode}`);
        } catch (error) {
            console.error('Failed to sync language:', error);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    const currentLang = i18n.language;
    const completionPercentage = calculateCompletion();

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                show={toast.show}
                onClose={() => setToast({ ...toast, show: false })}
            />

            {/* Header */}
            <div className="profile-header text-white py-10 pb-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        {t('profile.backToHome') || 'Back to Home'}
                    </Link>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="profile-avatar-container">
                            <div className="profile-avatar-ring" />
                            <div className="profile-avatar">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar.startsWith('http') ? user.avatar : `/storage/${user.avatar}`}
                                        alt={user.name}
                                    />
                                ) : (
                                    <div className="profile-avatar-placeholder">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
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
                                className="profile-avatar-upload text-[var(--primary)]"
                            >
                                {uploadingAvatar ? (
                                    <div className="spinner" />
                                ) : (
                                    <Camera className="w-4 h-4" />
                                )}
                            </button>
                            {user?.avatar && (
                                <button
                                    onClick={handleDeleteAvatar}
                                    disabled={deletingAvatar}
                                    className="profile-avatar-delete"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* User Info & Stats */}
                        <div className="flex-1 text-center sm:text-start">
                            <h1 className="text-2xl font-bold mb-1">{user?.name}</h1>
                            <p className="text-white/80 mb-4">{user?.email}</p>

                            {/* Stats Row */}
                            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                                <div className="profile-stat">
                                    <div className="profile-stat-value">
                                        {completionPercentage}%
                                    </div>
                                    <div className="profile-stat-label">
                                        {t('profile.completion') || 'Complete'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Completion Ring - Desktop */}
                        <div className="hidden sm:block">
                            <CompletionRing percentage={completionPercentage} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-8 relative z-10">
                {/* Tabs */}
                <div className="profile-tabs mb-6">
                    <button
                        className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('profile.profileTab') || 'Profile'}</span>
                    </button>
                    <button
                        className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('profile.settingsTab') || 'Settings'}</span>
                    </button>
                    <button
                        className={`profile-tab ${activeTab === 'privacy' ? 'active' : ''}`}
                        onClick={() => setActiveTab('privacy')}
                    >
                        <Shield className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('profile.privacyTab') || 'Privacy'}</span>
                    </button>
                </div>

                {/* My Bookmarks Link */}
                <Link to="/bookmarks" className="profile-section flex items-center justify-between group hover:border-[var(--primary)]">
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
                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)]" />
                </Link>

                {/* Profile Tab Content */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <div className="profile-section">
                            <h3 className="profile-section-title">
                                <User className="w-5 h-5" />
                                {t('profile.personalInfo') || 'Personal Information'}
                            </h3>

                            <div className="profile-form-group">
                                <label className="profile-form-label">
                                    {t('profile.fullName') || 'Full Name'}
                                </label>
                                <div className="profile-form-input-wrapper">
                                    <User className="w-5 h-5 profile-form-input-icon" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="profile-form-input"
                                    />
                                </div>
                            </div>

                            <div className="profile-form-group">
                                <label className="profile-form-label">
                                    {t('profile.email') || 'Email'}
                                </label>
                                <div className="profile-form-input-wrapper">
                                    <Mail className="w-5 h-5 profile-form-input-icon" />
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="profile-form-input"
                                    />
                                </div>
                            </div>

                            <div className="profile-form-group">
                                <label className="profile-form-label">
                                    {t('profile.phone') || 'Phone'}
                                </label>
                                <div className="profile-form-input-wrapper">
                                    <Phone className="w-5 h-5 profile-form-input-icon" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder={t('profile.enterPhone') || 'Enter your phone number'}
                                        className="profile-form-input"
                                    />
                                </div>
                            </div>

                            <div className="profile-form-group">
                                <label className="profile-form-label">
                                    {t('profile.dateOfBirth') || 'Date of Birth'}
                                </label>
                                <div className="profile-form-input-wrapper">
                                    <Calendar className="w-5 h-5 profile-form-input-icon" />
                                    <input
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                        className="profile-form-input"
                                    />
                                </div>
                            </div>

                            <div className="profile-form-group">
                                <label className="profile-form-label">
                                    {t('profile.bio') || 'Bio'}
                                </label>
                                <div className="profile-form-input-wrapper">
                                    <FileText className="w-5 h-5 profile-form-input-icon" style={{ top: '1.25rem' }} />
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder={t('profile.tellUs') || 'Tell us about yourself...'}
                                        rows={4}
                                        className="profile-form-input resize-none"
                                        style={{ paddingTop: '0.875rem' }}
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={saving} className="btn-save mt-4">
                                {saving ? <div className="spinner" /> : <Save className="w-5 h-5" />}
                                {saving ? (t('profile.saving') || 'Saving...') : (t('profile.saveChanges') || 'Save Changes')}
                            </button>
                        </div>

                        {/* Change Password */}
                        <div className="profile-section">
                            <h3 className="profile-section-title">
                                <Lock className="w-5 h-5" />
                                {t('profile.changePassword') || 'Change Password'}
                            </h3>

                            <div className="profile-form-group">
                                <label className="profile-form-label">
                                    {t('profile.currentPassword') || 'Current Password'}
                                </label>
                                <div className="profile-form-input-wrapper">
                                    <Lock className="w-5 h-5 profile-form-input-icon" />
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={passwordForm.current_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                        className="profile-form-input"
                                        style={{ paddingRight: '3rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="profile-form-group">
                                <label className="profile-form-label">
                                    {t('profile.newPassword') || 'New Password'}
                                </label>
                                <div className="profile-form-input-wrapper">
                                    <Lock className="w-5 h-5 profile-form-input-icon" />
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordForm.new_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                        className="profile-form-input"
                                        style={{ paddingRight: '3rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="profile-form-group">
                                <label className="profile-form-label">
                                    {t('profile.confirmNewPassword') || 'Confirm New Password'}
                                </label>
                                <div className="profile-form-input-wrapper">
                                    <Lock className="w-5 h-5 profile-form-input-icon" />
                                    <input
                                        type="password"
                                        value={passwordForm.new_password_confirmation}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                                        className="profile-form-input"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handlePasswordChange}
                                disabled={changingPassword || !passwordForm.current_password || !passwordForm.new_password}
                                className="btn-save mt-4"
                            >
                                {changingPassword ? <div className="spinner" /> : <Lock className="w-5 h-5" />}
                                {changingPassword ? (t('profile.changing') || 'Changing...') : (t('profile.changePassword') || 'Change Password')}
                            </button>
                        </div>
                    </form>
                )}

                {/* Settings Tab Content */}
                {activeTab === 'settings' && (
                    <>
                        {/* Language */}
                        <div className="profile-section">
                            <h3 className="profile-section-title">
                                <Globe className="w-5 h-5" />
                                {t('profile.language') || 'Language'}
                            </h3>
                            <div className="language-selector">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        className={`language-option ${currentLang === lang.code ? 'active' : ''}`}
                                    >
                                        <span className="language-option-flag">{lang.flag}</span>
                                        <span>{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Account Actions */}
                        <div className="profile-section">
                            <h3 className="profile-section-title">
                                <LogOut className="w-5 h-5" />
                                {t('profile.accountActions') || 'Account'}
                            </h3>

                            <div className="flex flex-col gap-3">
                                <button onClick={handleLogout} className="btn-danger-outline w-full justify-center">
                                    <LogOut className="w-5 h-5" />
                                    {t('profile.logout') || 'Logout'}
                                </button>
                                <button onClick={handleLogoutAll} className="btn-danger w-full justify-center">
                                    <LogOut className="w-5 h-5" />
                                    {t('profile.logoutAllDevices') || 'Logout from All Devices'}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Privacy Tab Content */}
                {activeTab === 'privacy' && (
                    <div className="profile-section">
                        <h3 className="profile-section-title">
                            <Shield className="w-5 h-5" />
                            {t('profile.privacySettings') || 'Privacy Settings'}
                        </h3>

                        <div className="settings-toggle">
                            <div className="settings-toggle-info">
                                <div className="settings-toggle-label">
                                    {t('profile.showMood') || 'Show Mood Publicly'}
                                </div>
                                <div className="settings-toggle-desc">
                                    {t('profile.showMoodDesc') || 'Allow others to see your mood entries'}
                                </div>
                            </div>
                            <button
                                onClick={() => handlePrivacyChange('show_mood')}
                                className={`toggle-switch ${privacySettings.show_mood ? 'active' : ''}`}
                            />
                        </div>

                        <div className="settings-toggle">
                            <div className="settings-toggle-info">
                                <div className="settings-toggle-label">
                                    {t('profile.anonymousPosts') || 'Post Anonymously by Default'}
                                </div>
                                <div className="settings-toggle-desc">
                                    {t('profile.anonymousPostsDesc') || 'Your name will be hidden on new posts'}
                                </div>
                            </div>
                            <button
                                onClick={() => handlePrivacyChange('anonymous_posts')}
                                className={`toggle-switch ${privacySettings.anonymous_posts ? 'active' : ''}`}
                            />
                        </div>

                        {/* Danger Zone */}
                        <div className="danger-zone mt-6">
                            <div className="danger-zone-title">
                                <AlertTriangle className="w-4 h-4" />
                                {t('profile.dangerZone') || 'Danger Zone'}
                            </div>
                            <p className="danger-zone-desc">
                                {t('profile.dangerZoneDesc') || 'These actions are permanent and cannot be undone.'}
                            </p>
                            <button className="btn-danger-outline">
                                <AlertTriangle className="w-4 h-4" />
                                {t('profile.deleteAccount') || 'Delete Account'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
