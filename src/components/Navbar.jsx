import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Heart } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const { t } = useTranslation();

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
