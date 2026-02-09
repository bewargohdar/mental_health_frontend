import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Calendar, Clock, Award, Phone, Video, X, ChevronLeft, ChevronRight, Check, User, FileText, Sparkles, Filter } from 'lucide-react';
import api from '../api/axios';

export default function Doctors() {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');

    // Booking modal state
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingStep, setBookingStep] = useState(1); // 1: info, 2: date, 3: time, 4: confirm
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [bookingNote, setBookingNote] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const specialties = ['all', 'Psychiatrist', 'Psychologist', 'Therapist', 'Counselor'];

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/doctors');
            const data = res.data.data?.data || res.data.data || [];

            // Map backend data to frontend structure
            const mappedDoctors = (Array.isArray(data) ? data : []).map(doc => ({
                ...doc,
                specialty: doc.doctor_profile?.specialization || 'Mental Health Professional',
                bio: doc.doctor_profile?.bio || doc.bio,
                experience: doc.doctor_profile?.experience_years,
                image: doc.avatar || doc.image,
            }));

            setDoctors(mappedDoctors);
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSlots = async (doctorId, date) => {
        setLoadingSlots(true);
        try {
            const res = await api.get(`/doctors/${doctorId}/slots`, {
                params: { date: date.toISOString().split('T')[0] }
            });
            const slots = res.data?.data?.slots || res.data?.slots || [];

            const formattedSlots = Array.isArray(slots) ? slots.map(slot => ({
                time: slot.time,
                available: slot.available !== false
            })) : [];
            setAvailableSlots(formattedSlots);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const getAvailableDates = () => {
        const dates = [];
        for (let i = 0; i < 14; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const handleBookAppointment = async () => {
        if (!selectedDoctor || !selectedDate || !selectedSlot) return;
        setSubmitting(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const scheduledAt = `${dateStr} ${selectedSlot}:00`;

            await api.post('/appointments', {
                doctor_id: selectedDoctor.id,
                scheduled_at: scheduledAt,
                patient_notes: bookingNote,
            });
            setBookingSuccess(true);
            setBookingStep(5);
        } catch (error) {
            console.error('Failed to book appointment:', error);
            const errorMsg = error.response?.data?.message || 'Failed to book appointment. Please try again.';
            alert(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const openBookingModal = (doctor) => {
        setSelectedDoctor(doctor);
        setBookingStep(1);
        setSelectedDate(null);
        setSelectedSlot(null);
        setBookingNote('');
        setBookingSuccess(false);
    };

    const closeBookingModal = () => {
        setSelectedDoctor(null);
        setBookingStep(1);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedSlot(null);
        if (selectedDoctor) {
            fetchAvailableSlots(selectedDoctor.id, date);
        }
    };

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.specialty?.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesSpecialty = selectedSpecialty === 'all';

        if (!matchesSpecialty && doc.specialty) {
            const specialty = doc.specialty.toLowerCase();
            const selected = selectedSpecialty.toLowerCase();

            if (selected.includes('psychologist')) {
                matchesSpecialty = specialty.includes('psychologist') || specialty.includes('psychology');
            } else if (selected.includes('therapist')) {
                matchesSpecialty = specialty.includes('therapist') || specialty.includes('therapy');
            } else if (selected.includes('counselor')) {
                matchesSpecialty = specialty.includes('counselor') || specialty.includes('counseling');
            } else if (selected.includes('psychiatrist')) {
                matchesSpecialty = specialty.includes('psychiatrist') || specialty.includes('psychiatry');
            } else {
                matchesSpecialty = specialty.includes(selected);
            }
        }

        return matchesSearch && matchesSpecialty;
    });

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Find Your Guide Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 pb-12 pt-28">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 animate-fade-in-up shadow-sm">
                            <Sparkles className="w-4 h-4" />
                            <span>Expert Care, Just for You</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6 animate-fade-in-up delay-100 leading-tight">
                            Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Guide</span>
                        </h1>
                        <p className="text-xl text-[var(--text-secondary)] animate-fade-in-up delay-200">
                            Connect with empathetic professionals ready to support your unique journey.
                        </p>
                    </div>

                    {/* Search & Filter Bar - Floating */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-none p-2 flex flex-col md:flex-row gap-2 max-w-4xl mx-auto animate-fade-in-up delay-300 border border-blue-50/50 dark:border-gray-700">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or specialty..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 font-medium"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 px-2 md:px-0 scrollbar-hide">
                            {specialties.map((spec) => (
                                <button
                                    key={spec}
                                    onClick={() => setSelectedSpecialty(spec)}
                                    className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${selectedSpecialty === spec
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                                        : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700'
                                        }`}
                                >
                                    {spec === 'all' ? 'All' : spec}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Doctors Grid */}
                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700 h-96 animate-pulse">
                                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-6" />
                                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-32 mx-auto mb-3" />
                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-24 mx-auto mb-6" />
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-full" />
                                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-5/6 mx-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredDoctors.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {filteredDoctors.map((doctor) => (
                            <div key={doctor.id} className="group bg-white dark:bg-gray-800 rounded-[2rem] p-6 lg:p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 dark:hover:shadow-black/20 transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center">
                                {/* Availability Indicator */}
                                <div className={`absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${doctor.doctor_profile?.availabilities?.length > 0
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900'
                                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-400 border-gray-100 dark:border-gray-700'
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full ${doctor.doctor_profile?.availabilities?.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    {doctor.doctor_profile?.availabilities?.length > 0 ? 'Accepting' : 'Full'}
                                </div>

                                {/* Avatar */}
                                <div className="relative mb-6 group-hover:scale-105 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                                    <img
                                        src={(() => { const img = doctor.image || doctor.avatar; if (!img) return `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&size=140&background=e0e7ef&color=1f2937`; return img.startsWith('http') ? img : `/storage/${img}`; })()}
                                        alt={doctor.name}
                                        className="w-28 h-28 rounded-full object-cover relative z-10 border-4 border-white dark:border-gray-700 shadow-lg"
                                    />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{doctor.name}</h3>
                                <p className="text-blue-500 dark:text-blue-400 font-medium text-sm mb-4 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg inline-block">
                                    {doctor.specialty || 'Mental Health Professional'}
                                </p>

                                <p className="text-[var(--text-muted)] text-sm mb-8 line-clamp-3 leading-relaxed">
                                    {doctor.bio || `${doctor.experience || 5}+ years of experience helping people navigation life's challenges. Committed to providing a safe space.`}
                                </p>

                                <button
                                    onClick={() => openBookingModal(doctor)}
                                    className={`mt-auto w-full py-3.5 px-6 rounded-xl font-bold transition-all transform active:scale-95 ${doctor.doctor_profile?.availabilities?.length > 0
                                        ? 'bg-[var(--primary)] text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-none'
                                        : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 cursor-not-allowed'
                                        }`}
                                    disabled={!doctor.doctor_profile?.availabilities?.length}
                                >
                                    {doctor.doctor_profile?.availabilities?.length > 0 ? 'Book Session' : 'Unavailable'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="text-6xl mb-6 opacity-30">🔍</div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No professionals found</h3>
                        <p className="text-[var(--text-secondary)]">Try adjusting your search terms or speciality filter.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedSpecialty('all'); }}
                            className="mt-6 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>

            {/* Booking Modal - Polished */}
            {selectedDoctor && (
                <div
                    className="fixed inset-0 z-50 bg-[var(--background)]/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
                    onClick={closeBookingModal}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-[2.5rem] max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl border border-white/50 dark:border-gray-800 animate-scale-in flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-3">
                                {bookingStep > 1 && bookingStep < 5 && (
                                    <button
                                        onClick={() => setBookingStep(bookingStep - 1)}
                                        className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </button>
                                )}
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                        {bookingStep === 5 ? 'Confirmed!' : 'Book Session'}
                                    </h3>
                                    {bookingStep < 5 && <p className="text-xs text-[var(--text-muted)] font-medium">Step {bookingStep} of 4</p>}
                                </div>
                            </div>
                            <button
                                onClick={closeBookingModal}
                                className="p-2 hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                            {/* Step 1: Doctor Info */}
                            {bookingStep === 1 && (
                                <div className="space-y-8 text-center">
                                    <div className="relative inline-block">
                                        <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-xl opacity-50"></div>
                                        <img
                                            src={(() => { const img = selectedDoctor.image || selectedDoctor.avatar; if (!img) return `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&size=128`; return img.startsWith('http') ? img : `/storage/${img}`; })()}
                                            alt={selectedDoctor.name}
                                            className="w-24 h-24 rounded-full object-cover relative z-10 border-4 border-white dark:border-gray-800 shadow-md mx-auto"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedDoctor.name}</h2>
                                        <p className="text-teal-600 dark:text-teal-400 font-medium bg-teal-50 dark:bg-teal-900/20 inline-block px-3 py-1 rounded-lg text-sm">{selectedDoctor.specialty}</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-center text-sm py-4 border-y border-gray-100 dark:border-gray-800">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">15+</p>
                                            <p className="text-[var(--text-muted)] text-xs">Years</p>
                                        </div>
                                        <div className="border-x border-gray-100 dark:border-gray-800">
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">{selectedDoctor.rating || '4.9'}</p>
                                            <p className="text-[var(--text-muted)] text-xs">Rating</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">100+</p>
                                            <p className="text-[var(--text-muted)] text-xs">Patients</p>
                                        </div>
                                    </div>

                                    {!isAuthenticated ? (
                                        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                            <p className="text-[var(--text-secondary)] mb-4 font-medium">Sign in to book a session</p>
                                            <Link to="/login" className="btn-primary w-full block py-3">
                                                Sign In / Sign Up
                                            </Link>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setBookingStep(2)}
                                            className="w-full btn-primary py-4 text-lg shadow-xl shadow-blue-100 dark:shadow-none hover:shadow-blue-200"
                                        >
                                            Check Availability
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Select Date */}
                            {bookingStep === 2 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-2">
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">Pick a Date</h4>
                                        <p className="text-[var(--text-secondary)] text-sm">When works best for you?</p>
                                    </div>

                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {getAvailableDates().map((date, idx) => {
                                            const isSelected = selectedDate?.toDateString() === date.toDateString();
                                            const isToday = new Date().toDateString() === date.toDateString();

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleDateSelect(date)}
                                                    className={`p-3 rounded-2xl text-center transition-all border-2 ${isSelected
                                                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                                                        : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm'
                                                        }`}
                                                >
                                                    <div className="text-xs font-bold uppercase opacity-60 mb-1">
                                                        {isToday ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' })}
                                                    </div>
                                                    <div className="text-xl font-bold">{date.getDate()}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setBookingStep(3)}
                                        disabled={!selectedDate}
                                        className="w-full btn-primary py-3.5 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continue
                                    </button>
                                </div>
                            )}

                            {/* Step 3: Select Time */}
                            {bookingStep === 3 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-2">
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">Select Time</h4>
                                        <p className="text-[var(--text-secondary)] text-sm">{selectedDate?.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                    </div>

                                    {loadingSlots ? (
                                        <div className="grid grid-cols-3 gap-3">
                                            {[1, 2, 3, 4, 5, 6].map(i => (
                                                <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : availableSlots.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                            <Clock className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                            <p className="text-[var(--text-muted)] font-medium">No slots available on this date.</p>
                                            <button
                                                onClick={() => setBookingStep(2)}
                                                className="mt-4 text-teal-600 dark:text-teal-400 font-bold hover:underline text-sm"
                                            >
                                                Change Date
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-3">
                                            {availableSlots.map((slot, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => slot.available && setSelectedSlot(slot.time)}
                                                    disabled={!slot.available}
                                                    className={`py-3 px-2 rounded-xl text-center transition-all font-medium text-sm border ${selectedSlot === slot.time
                                                        ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200 dark:shadow-none'
                                                        : slot.available
                                                            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-teal-300 dark:hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400'
                                                            : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-300 dark:text-gray-700 cursor-not-allowed line-through'
                                                        }`}
                                                >
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setBookingStep(4)}
                                        disabled={!selectedSlot}
                                        className="w-full btn-primary py-3.5 mt-4 disabled:opacity-50"
                                    >
                                        Review Booking
                                    </button>
                                </div>
                            )}

                            {/* Step 4: Confirm */}
                            {bookingStep === 4 && (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-6 rounded-3xl border border-teal-100 dark:border-teal-900">
                                        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                            Summary
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">Professional</span>
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedDoctor.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">Date</span>
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedDate?.toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">Time</span>
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedSlot}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 pl-1">
                                            Add a note for {selectedDoctor.name.split(' ')[0]} (Optional)
                                        </label>
                                        <textarea
                                            value={bookingNote}
                                            onChange={(e) => setBookingNote(e.target.value)}
                                            placeholder="What's on your mind? Briefly describe what you'd like to discuss..."
                                            className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl resize-none h-32 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 focus:bg-white dark:focus:bg-gray-700 transition-all custom-scrollbar text-[var(--text-primary)]"
                                        />
                                    </div>

                                    <button
                                        onClick={handleBookAppointment}
                                        disabled={submitting}
                                        className="w-full btn-primary bg-teal-600 hover:bg-teal-700 py-4 text-lg shadow-xl shadow-teal-100 dark:shadow-none hover:shadow-teal-200 disabled:opacity-70"
                                    >
                                        {submitting ? 'Confirming...' : 'Confirm Appointment'}
                                    </button>
                                </div>
                            )}

                            {/* Step 5: Success */}
                            {bookingStep === 5 && (
                                <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-scale-in">
                                        <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">You're All Set!</h4>
                                    <p className="text-[var(--text-secondary)] mb-8 max-w-xs mx-auto">
                                        Your session with <span className="font-bold text-gray-900 dark:text-white">{selectedDoctor.name}</span> has been confirmed.
                                    </p>
                                    <div className="flex flex-col gap-3 w-full">
                                        <Link to="/appointments" className="btn-primary w-full py-3.5">
                                            View My Appointments
                                        </Link>
                                        <button
                                            onClick={closeBookingModal}
                                            className="w-full py-3.5 font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                        >
                                            Back to Doctors
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
