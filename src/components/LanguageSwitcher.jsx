import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { LANGUAGES, isRTL } from '../i18n';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);
        // Update document direction for RTL languages
        document.documentElement.dir = isRTL(langCode) ? 'rtl' : 'ltr';
        document.documentElement.lang = langCode;
        setIsOpen(false);
    };

    // Set initial direction on mount
    useEffect(() => {
        document.documentElement.dir = isRTL(i18n.language) ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                aria-label="Change language"
            >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">{currentLang.nativeName}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 end-0 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border)] py-2 min-w-[140px] z-50">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full px-4 py-2.5 text-start text-sm hover:bg-[var(--surface-hover)] transition-colors flex items-center justify-between ${i18n.language === lang.code
                                    ? 'text-[var(--primary)] font-semibold'
                                    : 'text-[var(--text-primary)]'
                                }`}
                        >
                            <span>{lang.nativeName}</span>
                            {i18n.language === lang.code && (
                                <span className="w-2 h-2 rounded-full bg-[var(--primary)]"></span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
