import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Calendar, Clock, Award, Phone, Video, X, ChevronLeft, ChevronRight, Check, User, FileText } from 'lucide-react';
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
            setDoctors(Array.isArray(data) ? data : []);
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
            // Backend returns { data: { slots: [...] } }
            const slots = res.data?.data?.slots || res.data?.slots || [];

            // Map slots from backend - use available flag from response
            const formattedSlots = Array.isArray(slots) ? slots.map(slot => ({
                time: slot.time,
                available: slot.available !== false // Default to true if not specified
            })) : [];
            setAvailableSlots(formattedSlots);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    // Generate default time slots (9 AM to 5 PM, every 30 mins)
    const generateDefaultSlots = () => {
        const slots = [];
        for (let hour = 9; hour < 17; hour++) {
            slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, available: true });
            slots.push({ time: `${hour.toString().padStart(2, '0')}:30`, available: true });
        }
        return slots;
    };

    const handleBookAppointment = async () => {
        if (!selectedDoctor || !selectedDate || !selectedSlot) return;
        setSubmitting(true);
        try {
            // Combine date and time into scheduled_at datetime
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

    // Generate next 14 days for date selection (including today)
    const getAvailableDates = () => {
        const dates = [];
        for (let i = 0; i < 14; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'all' || doc.specialty?.includes(selectedSpecialty);
        return matchesSearch && matchesSpecialty;
    });

    return (
        <div className="min-h-screen pb-12 bg-[var(--background)]">
            {/* Header - Simplified */}
            <div className="py-8 border-b border-[var(--border)]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{t('doctors.title')}</h1>
                    <p className="text-[var(--text-secondary)]">{t('doctors.subtitle')}</p>
                </div>
            </div>

            {/* Specialty Filter Tabs */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-wrap gap-1 border-b border-[var(--border)]">
                    {specialties.map((spec) => (
                        <button
                            key={spec}
                            onClick={() => setSelectedSpecialty(spec)}
                            className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${selectedSpecialty === spec
                                ? 'border-[#2563eb] text-[#2563eb]'
                                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {spec === 'all' ? 'All Specialties' : spec}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Doctors Grid - Figma style cards */}
                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="doctor-card animate-pulse">
                                <div className="doctor-photo-wrapper">
                                    <div className="doctor-photo-backdrop" />
                                </div>
                                <div className="h-5 bg-[var(--light-gray)] rounded w-32 mx-auto mb-2" />
                                <div className="h-4 bg-[var(--light-gray)] rounded w-24 mx-auto mb-3" />
                                <div className="h-3 bg-[var(--light-gray)] rounded w-40 mx-auto mb-1" />
                                <div className="h-3 bg-[var(--light-gray)] rounded w-36 mx-auto mb-4" />
                                <div className="h-10 bg-[var(--light-gray)] rounded-full w-28 mx-auto" />
                            </div>
                        ))}
                    </div>
                ) : filteredDoctors.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDoctors.map((doctor) => (
                            <div key={doctor.id} className="doctor-card">
                                {/* Photo with curved backdrop */}
                                <div className="doctor-photo-wrapper">
                                    <div className="doctor-photo-backdrop" />
                                    <img
                                        src={doctor.image || doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&size=140&background=e0e7ef&color=1f2937`}
                                        alt={doctor.name}
                                        className="doctor-photo"
                                    />
                                </div>

                                {/* Doctor Info */}
                                <h3 className="doctor-name">{doctor.name}</h3>
                                <p className="doctor-specialty">{doctor.specialty || 'Mental Health Professional'}</p>
                                <p className="doctor-description">
                                    {doctor.bio || `${doctor.experience || doctor.years_experience || '5'}+ years experience`}
                                    <br />
                                    {doctor.achievements || 'Excellence in Patient Care'}
                                </p>

                                {/* Availability Badge */}
                                {doctor.doctor_profile?.availabilities?.length > 0 ? (
                                    <div className="flex items-center justify-center gap-1 mb-3">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="text-xs text-green-600">Available</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-1 mb-3">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                        <span className="text-xs text-gray-500">No slots</span>
                                    </div>
                                )}

                                {/* Consult Button */}
                                <button
                                    onClick={() => openBookingModal(doctor)}
                                    className="btn-consult"
                                    disabled={!doctor.doctor_profile?.availabilities?.length}
                                >
                                    {doctor.doctor_profile?.availabilities?.length > 0 ? 'Consult Now' : 'Unavailable'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 doctor-card">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No doctors found</h3>
                        <p className="text-[var(--text-secondary)]">Try adjusting your search or filters</p>
                    </div>
                )}

                {/* CTA Section - Figma style */}
                <div className="cta-section mt-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Left side - Text */}
                        <div>
                            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
                                Ready to embark on the<br />journey of wellness?
                            </h2>
                            <p className="text-[var(--text-secondary)] mb-6">
                                Start your mental health transformation with our experienced therapists
                                today. Get to be in your ultimate inner peace and lasting well-being with
                                our programs, tailored special to your health needs.
                            </p>
                            <button className="btn-primary">
                                Get Started →
                            </button>
                        </div>

                        {/* Right side - Image and badges */}
                        <div className="relative">
                            <img
                                src="/wellness-hero.png"
                                alt="Wellness Journey"
                                className="rounded-2xl w-full h-auto object-cover"
                            />
                            {/* Badges */}
                            <div className="flex gap-3 mt-4 justify-center">
                                <div className="cta-badge">
                                    #LetsStayHealthy
                                </div>
                                <div className="cta-discount">
                                    <div className="text-xl font-bold">50%</div>
                                    <div className="text-xs">Discount</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal - Keep existing */}
            {selectedDoctor && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={closeBookingModal}
                >
                    <div
                        className="bg-[var(--surface)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {bookingStep > 1 && bookingStep < 5 && (
                                    <button
                                        onClick={() => setBookingStep(bookingStep - 1)}
                                        className="p-1 hover:bg-[var(--surface-hover)] rounded-full"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                                    </button>
                                )}
                                <h3 className="font-semibold text-[var(--text-primary)]">
                                    {bookingStep === 5 ? 'Booking Confirmed!' : `Book Appointment - Step ${bookingStep}/4`}
                                </h3>
                            </div>
                            <button
                                onClick={closeBookingModal}
                                className="p-2 hover:bg-[var(--surface-hover)] rounded-full"
                            >
                                <X className="w-5 h-5 text-[var(--text-secondary)]" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {/* Step 1: Doctor Info */}
                            {bookingStep === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={selectedDoctor.image || selectedDoctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&size=128`}
                                            alt={selectedDoctor.name}
                                            className="w-20 h-20 rounded-full object-cover"
                                        />
                                        <div>
                                            <h4 className="font-semibold text-lg text-[var(--text-primary)]">{selectedDoctor.name}</h4>
                                            <p className="text-[#2563eb]">{selectedDoctor.specialty}</p>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-[var(--text-muted)]">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span>{selectedDoctor.rating || '4.8'} ({selectedDoctor.reviews || '100'}+ reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[var(--text-secondary)]">
                                        {selectedDoctor.bio || 'Experienced mental health professional dedicated to helping patients achieve their wellness goals.'}
                                    </p>
                                    {!isAuthenticated ? (
                                        <div className="p-4 bg-[var(--surface-hover)] rounded-xl text-center">
                                            <p className="text-[var(--text-secondary)] mb-3">Please log in to book an appointment</p>
                                            <Link to="/login" className="btn-primary inline-block">
                                                Sign In
                                            </Link>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setBookingStep(2)}
                                            className="w-full btn-primary"
                                        >
                                            Select Date
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Select Date */}
                            {bookingStep === 2 && (
                                <div className="space-y-4">
                                    <h4 className="font-medium text-[var(--text-primary)]">Select a Date</h4>
                                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                        {getAvailableDates().map((date, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleDateSelect(date)}
                                                className={`p-3 rounded-xl text-center transition-all ${selectedDate?.toDateString() === date.toDateString()
                                                    ? 'bg-[#2563eb] text-white'
                                                    : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--light-gray)]'
                                                    }`}
                                            >
                                                <div className="text-xs opacity-70">
                                                    {date.toLocaleDateString('en', { weekday: 'short' })}
                                                </div>
                                                <div className="text-lg font-semibold">{date.getDate()}</div>
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setBookingStep(3)}
                                        disabled={!selectedDate}
                                        className="w-full btn-primary disabled:opacity-50"
                                    >
                                        Continue
                                    </button>
                                </div>
                            )}

                            {/* Step 3: Select Time */}
                            {bookingStep === 3 && (
                                <div className="space-y-4">
                                    <h4 className="font-medium text-[var(--text-primary)]">
                                        Select Time for {selectedDate?.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </h4>
                                    {loadingSlots ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {[1, 2, 3, 4, 5, 6].map(i => (
                                                <div key={i} className="h-12 bg-[var(--light-gray)] rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : availableSlots.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="text-4xl mb-3">📅</div>
                                            <p className="text-[var(--text-secondary)] mb-2">No available slots on this day</p>
                                            <p className="text-sm text-[var(--text-muted)]">Please select a different date</p>
                                            <button
                                                onClick={() => setBookingStep(2)}
                                                className="mt-4 text-[#2563eb] font-medium"
                                            >
                                                ← Choose another date
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableSlots.map((slot, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => slot.available && setSelectedSlot(slot.time)}
                                                    disabled={!slot.available}
                                                    className={`p-3 rounded-xl text-center transition-all ${selectedSlot === slot.time
                                                        ? 'bg-[#2563eb] text-white'
                                                        : slot.available
                                                            ? 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--light-gray)]'
                                                            : 'bg-[var(--light-gray)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <Clock className="w-4 h-4 mx-auto mb-1" />
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setBookingStep(4)}
                                        disabled={!selectedSlot}
                                        className="w-full btn-primary disabled:opacity-50"
                                    >
                                        Continue
                                    </button>
                                </div>
                            )}

                            {/* Step 4: Confirm */}
                            {bookingStep === 4 && (
                                <div className="space-y-4">
                                    <h4 className="font-medium text-[var(--text-primary)]">Confirm Your Appointment</h4>
                                    <div className="p-4 bg-[var(--surface-hover)] rounded-xl space-y-3">
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5 text-[#2563eb]" />
                                            <span className="text-[var(--text-secondary)]">{selectedDoctor.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-[#2563eb]" />
                                            <span className="text-[var(--text-secondary)]">
                                                {selectedDate?.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-[#2563eb]" />
                                            <span className="text-[var(--text-secondary)]">{selectedSlot}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                            Add a note (optional)
                                        </label>
                                        <textarea
                                            value={bookingNote}
                                            onChange={(e) => setBookingNote(e.target.value)}
                                            placeholder="Describe what you'd like to discuss..."
                                            className="w-full p-4 input-field rounded-xl resize-none h-24"
                                        />
                                    </div>
                                    <button
                                        onClick={handleBookAppointment}
                                        disabled={submitting}
                                        className="w-full btn-primary disabled:opacity-50"
                                    >
                                        {submitting ? 'Booking...' : 'Confirm Booking'}
                                    </button>
                                </div>
                            )}

                            {/* Step 5: Success */}
                            {bookingStep === 5 && (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h4 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Appointment Booked!</h4>
                                    <p className="text-[var(--text-secondary)] mb-6">
                                        Your appointment with {selectedDoctor.name} has been confirmed for {selectedDate?.toLocaleDateString()} at {selectedSlot}.
                                    </p>
                                    <button
                                        onClick={closeBookingModal}
                                        className="btn-primary"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
