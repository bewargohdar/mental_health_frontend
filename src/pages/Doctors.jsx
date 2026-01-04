import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Star, Calendar, Clock, Award, Phone, Video } from 'lucide-react';
import api from '../api/axios';

const mockDoctors = [
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Clinical Psychologist', experience: 12, rating: 4.9, reviews: 128, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face', available: true },
    { id: 2, name: 'Dr. Michael Chen', specialty: 'Psychiatrist', experience: 15, rating: 4.8, reviews: 96, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face', available: true },
    { id: 3, name: 'Dr. Emily Brown', specialty: 'Therapist', experience: 8, rating: 4.9, reviews: 74, image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face', available: false },
    { id: 4, name: 'Dr. James Wilson', specialty: 'Counselor', experience: 10, rating: 4.7, reviews: 85, image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face', available: true },
];

export default function Doctors() {
    const { t } = useTranslation();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');

    const specialties = ['all', 'Psychiatrist', 'Psychologist', 'Therapist', 'Counselor'];

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/doctors');
            setDoctors(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
            setDoctors(mockDoctors);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'all' || doc.specialty.includes(selectedSpecialty);
        return matchesSearch && matchesSpecialty;
    });

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="bg-gradient-to-br from-[var(--pink)] to-rose-500 text-white py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-2">{t('doctors.title')}</h1>
                    <p className="opacity-90 mb-6">{t('doctors.subtitle')}</p>

                    {/* Search */}
                    <div className="max-w-xl">
                        <div className="relative">
                            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                            <input
                                type="text"
                                placeholder={t('doctors.search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full ps-12 pe-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                {/* Specialty Filter */}
                <div className="card p-4 mb-8 flex flex-wrap gap-2">
                    {specialties.map((spec) => (
                        <button
                            key={spec}
                            onClick={() => setSelectedSpecialty(spec)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSpecialty === spec
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--light-gray)]'
                                }`}
                        >
                            {spec === 'all' ? 'All Specialties' : spec}
                        </button>
                    ))}
                </div>

                {/* Doctors Grid */}
                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="card p-6 animate-pulse">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-[var(--light-gray)]" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-[var(--light-gray)] rounded w-32 mb-2" />
                                        <div className="h-3 bg-[var(--light-gray)] rounded w-24" />
                                    </div>
                                </div>
                                <div className="h-10 bg-[var(--light-gray)] rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : filteredDoctors.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDoctors.map((doctor) => (
                            <div key={doctor.id} className="card card-hover p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <img
                                        src={doctor.image}
                                        alt={doctor.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-[var(--text-primary)] truncate">{doctor.name}</h3>
                                        <p className="text-sm text-[var(--primary)]">{doctor.specialty}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                                            <span className="flex items-center gap-1">
                                                <Award className="w-3 h-3" />
                                                {doctor.experience} {t('doctors.years')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                {doctor.rating}
                                            </span>
                                        </div>
                                    </div>
                                    {doctor.available && (
                                        <span className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-green-500/30"></span>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {t('doctors.bookAppointment')}
                                    </button>
                                    <button className="p-2.5 rounded-full bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--light-gray)] transition-colors">
                                        <Video className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 card">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No doctors found</h3>
                        <p className="text-[var(--text-secondary)]">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
