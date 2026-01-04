import { Link, NavLink } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Menu, X, User, LogOut, Heart, Bell, Check, CheckCheck, MessageCircle, Calendar, TrendingUp } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

// Notification type icons
const notificationIcons = {
    appointment: Calendar,
    mood: TrendingUp,
    comment: MessageCircle,
    default: Bell,
};

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const { user, isAuthenticated, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
    const { t } = useTranslation();

    // Close notification dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = [
        { path: '/', label: t('nav.home') },
        { path: '/learn', label: t('nav.learn') },
        { path: '/track-mood', label: t('nav.trackMood') },
        { path: '/community', label: t('nav.community') },
        { path: '/doctors', label: t('nav.doctors') },
        { path: '/dashboard', label: t('nav.dashboard') },
    ];

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)] transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-xl flex items-center justify-center shadow-lg">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text">PeaceHub</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface-hover)]'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right side controls */}
                    <div className="hidden md:flex items-center gap-2">
                        <LanguageSwitcher />
                        <ThemeToggle />

                        {/* Notifications Bell */}
                        {isAuthenticated && (
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -end-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {showNotifications && (
                                    <div className="absolute end-0 top-full mt-2 w-80 bg-[var(--surface)] rounded-xl shadow-xl border border-[var(--border)] overflow-hidden z-50">
                                        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                                            <h3 className="font-semibold text-[var(--text-primary)]">
                                                {t('nav.notifications') || 'Notifications'}
                                            </h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
                                                >
                                                    <CheckCheck className="w-3 h-3" />
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {loading ? (
                                                <div className="p-4 text-center text-[var(--text-muted)]">
                                                    Loading...
                                                </div>
                                            ) : notifications.length === 0 ? (
                                                <div className="p-8 text-center">
                                                    <Bell className="w-12 h-12 mx-auto text-[var(--text-muted)] opacity-50 mb-3" />
                                                    <p className="text-sm text-[var(--text-muted)]">No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.slice(0, 10).map((notification) => {
                                                    const IconComponent = notificationIcons[notification.type] || notificationIcons.default;
                                                    const isUnread = !notification.read_at;
                                                    return (
                                                        <div
                                                            key={notification.id}
                                                            onClick={() => {
                                                                if (isUnread) markAsRead(notification.id);
                                                            }}
                                                            className={`p-4 border-b border-[var(--border)] hover:bg-[var(--surface-hover)] cursor-pointer transition-colors ${isUnread ? 'bg-[var(--primary)]/5' : ''}`}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isUnread ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'bg-[var(--light-gray)] text-[var(--text-muted)]'}`}>
                                                                    <IconComponent className="w-5 h-5" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-sm ${isUnread ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                                                        {notification.data?.message || notification.message || 'New notification'}
                                                                    </p>
                                                                    <p className="text-xs text-[var(--text-muted)] mt-1">
                                                                        {new Date(notification.created_at).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                                {isUnread && (
                                                                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full flex-shrink-0 mt-2"></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                        {notifications.length > 10 && (
                                            <div className="p-3 border-t border-[var(--border)] text-center">
                                                <Link
                                                    to="/notifications"
                                                    onClick={() => setShowNotifications(false)}
                                                    className="text-sm text-[var(--primary)] hover:underline"
                                                >
                                                    View all notifications
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="w-px h-6 bg-[var(--border)] mx-2"></div>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    {user?.name}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    {t('nav.logout')}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                                >
                                    {t('nav.signIn')}
                                </Link>
                                <Link to="/register" className="btn-primary text-sm">
                                    {t('nav.getStarted')}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile: Theme & Language + Menu */}
                    <div className="flex md:hidden items-center gap-2">
                        <LanguageSwitcher />
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-[var(--border)]">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                            ? 'bg-[var(--primary)] text-white'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                                        }`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                            <div className="pt-4 mt-2 border-t border-[var(--border)]">
                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[var(--text-secondary)]"
                                        >
                                            <User className="w-4 h-4" />
                                            {user?.name}
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-500 w-full"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            {t('nav.logout')}
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-2 px-4">
                                        <Link
                                            to="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="py-3 text-center text-sm font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-full"
                                        >
                                            {t('nav.signIn')}
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setIsOpen(false)}
                                            className="btn-primary text-center text-sm"
                                        >
                                            {t('nav.getStarted')}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
