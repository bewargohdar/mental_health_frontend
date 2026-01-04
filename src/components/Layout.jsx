import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { isRTL } from '../i18n';

export default function Layout() {
    const { i18n } = useTranslation();

    // Set RTL direction based on language
    useEffect(() => {
        document.documentElement.dir = isRTL(i18n.language) ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    return (
        <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-300">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
