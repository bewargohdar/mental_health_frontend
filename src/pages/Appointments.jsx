import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Calendar,
    Clock,
    MapPin,
    Video,
    MessageSquare,
    CheckCircle,
    XCircle,
    AlertCircle,
    User,
    FileText
} from 'lucide-react';

export default function Appointments() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, cancelled

    const isDoctor = user?.roles?.some(r => r.name === 'doctor');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/appointments');
            const data = response.data?.data?.data || response.data?.data || [];
            if (Array.isArray(data)) {
                setAppointments(data);
            }
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.post(`/appointments/${id}/${status}`);
            fetchAppointments(); // Refresh list
        } catch (error) {
            console.error(`Failed to ${status} appointment:`, error);
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        const status = apt.status;
        const isPast = new Date(apt.scheduled_at) < new Date() && status !== 'cancelled';

        if (activeTab === 'upcoming') {
            return !isPast && status !== 'cancelled' && status !== 'completed';
        }
        if (activeTab === 'past') {
            return isPast || status === 'completed';
        }
        if (activeTab === 'cancelled') {
            return status === 'cancelled';
        }
        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-[var(--border)] py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        {t('dashboard.appointments') || 'My Appointments'}
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">
                        Manage your {isDoctor ? 'patient consultations' : 'scheduled sessions'}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex border-b border-[var(--border)] mb-8">
                    {['upcoming', 'past', 'cancelled'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                                    ? 'border-[var(--primary)] text-[var(--primary)]'
                                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-4">
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((apt) => (
                            <div key={apt.id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                        <img
                                            src={(() => {
                                                const avatar = isDoctor ? apt.patient?.avatar : apt.doctor?.avatar;
                                                if (!avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent((isDoctor ? apt.patient?.name : apt.doctor?.name) || 'User')}&background=random`;
                                                return avatar.startsWith('http') ? avatar : `/storage/${avatar}`;
                                            })()}
                                            alt={isDoctor ? apt.patient?.name : apt.doctor?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-semibold text-lg text-[var(--text-primary)]">
                                                {isDoctor ? apt.patient?.name : apt.doctor?.name}
                                            </h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(apt.status)}`}>
                                                {apt.status}
                                            </span>
                                        </div>

                                        <div className="space-y-1 text-sm text-[var(--text-secondary)]">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(apt.scheduled_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>{new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({apt.duration} min)</span>
                                            </div>
                                            <div className="flex items-center gap-2 capitalize">
                                                {apt.type === 'video' ? <Video className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                                                <span>{apt.type?.replace('_', ' ') || 'Consultation'}</span>
                                            </div>
                                        </div>

                                        {apt.patient_notes && (
                                            <div className="mt-3 p-3 bg-[var(--background)] rounded-lg text-sm text-[var(--text-muted)]">
                                                <span className="font-medium mr-1">Note:</span>
                                                {apt.patient_notes}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 min-w-[140px]">
                                    {isDoctor ? (
                                        <>
                                            {apt.status === 'pending' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(apt.id, 'confirm')}
                                                    className="btn-primary py-2 text-sm flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Accept
                                                </button>
                                            )}
                                            {apt.status === 'confirmed' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(apt.id, 'complete')}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Complete
                                                </button>
                                            )}
                                        </>
                                    ) : null}

                                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to cancel this appointment?')) {
                                                    handleStatusUpdate(apt.id, 'cancel');
                                                }
                                            }}
                                            className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-[var(--surface-hover)] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-[var(--text-muted)]" />
                            </div>
                            <h3 className="text-lg font-medium text-[var(--text-primary)]">No appointments found</h3>
                            <p className="text-[var(--text-secondary)] mt-1 mb-6">
                                You don't have any {activeTab} appointments.
                            </p>
                            {!isDoctor && activeTab === 'upcoming' && (
                                <Link to="/doctors" className="btn-primary inline-flex items-center gap-2">
                                    Book Consultation
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
