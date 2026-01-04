import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, FileText, Camera, Save, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

export default function Profile() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date_of_birth: '',
        bio: '',
    });

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
            // Refresh page to get updated user data
            window.location.reload();
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

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-lg hover:bg-blue-50">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{user?.name}</h1>
                            <p className="opacity-90">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Enter your phone number"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Birth
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={formData.date_of_birth}
                                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bio
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
                    <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
