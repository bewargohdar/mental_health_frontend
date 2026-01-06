import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            { label: 'About Us', href: '#' },
            { label: 'Our Team', href: '#' },
            { label: 'Careers', href: '#' },
            { label: 'Contact', href: '#' },
        ],
        resources: [
            { label: t('nav.learn'), href: '/learn' },
            { label: 'Blog', href: '#' },
            { label: 'FAQ', href: '#' },
            { label: 'Help Center', href: '#' },
        ],
        legal: [
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Cookie Policy', href: '#' },
        ],
    };

    const socialLinks = [
        { icon: Facebook, href: '#', label: 'Facebook' },
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Instagram, href: '#', label: 'Instagram' },
        { icon: Linkedin, href: '#', label: 'LinkedIn' },
    ];

    return (
        <footer className="bg-[var(--surface)] border-t border-[var(--border)] mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-xl flex items-center justify-center">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text">Nafas</span>
                        </Link>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                            Your trusted companion for mental wellness and emotional support.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-9 h-9 rounded-full bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold text-[var(--text-primary)] mb-4">Company</h4>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold text-[var(--text-primary)] mb-4">Resources</h4>
                        <ul className="space-y-2">
                            {footerLinks.resources.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-[var(--text-primary)] mb-4">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                <Mail className="w-4 h-4 text-[var(--primary)]" />
                                support@nafas.website
                            </li>
                            <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                <Phone className="w-4 h-4 text-[var(--primary)]" />
                                +964 (750) 370 95 86
                            </li>
                            <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                                <MapPin className="w-4 h-4 text-[var(--primary)] mt-0.5" />
                                Erbil, Kurdistan Region, Iraq
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-[var(--text-muted)]">
                        © {currentYear} Nafas. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        {footerLinks.legal.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
