"use client"
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Calendar, Filter, Trophy, Star, Sun, Sunset, Moon, Sunrise } from 'lucide-react';

const NamazPage = () => {
    const API_URL = "https://59159b0f4ee6c5cb.mokky.dev/Namoz";

    const [completedPrayers, setCompletedPrayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({
        dateRange: 'Bugun',
        prayer: 'Barchasi'
    });
    const [totalXP, setTotalXP] = useState(0);

    const prayers = [
        { id: 1, key: 'bomdod', name: 'Bomdod', time: '05:30', xp: 20, icon: <Sunrise className="text-orange-400" size={24} />, color: 'from-orange-500 to-yellow-500' },
        { id: 2, key: 'peshin', name: 'Peshin', time: '12:30', xp: 15, icon: <Sun className="text-yellow-400" size={24} />, color: 'from-yellow-500 to-orange-500' },
        { id: 3, key: 'asr', name: 'Asr', time: '16:00', xp: 15, icon: <Sun className="text-amber-400" size={24} />, color: 'from-amber-500 to-yellow-500' },
        { id: 4, key: 'shom', name: 'Shom', time: '18:45', xp: 20, icon: <Sunset className="text-red-400" size={24} />, color: 'from-red-500 to-pink-500' },
        { id: 5, key: 'xufton', name: 'Xufton', time: '20:15', xp: 25, icon: <Moon className="text-blue-400" size={24} />, color: 'from-blue-500 to-indigo-500' }
    ];

    const dateRanges = ['Bugun', 'Kecha', 'Bu hafta', 'Bu oy', 'Barchasi'];

    const fetchCompletedPrayers = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setCompletedPrayers(data.reverse());

            const total = data.reduce((sum, prayer) => sum + (prayer.xp || 0), 0);
            setTotalXP(total);
        } catch (error) {
            console.error("Ma'lumot olishda xatolik:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompletedPrayers();
    }, []);

    const markPrayerCompleted = async (prayer) => {
        const today = new Date();
        const completedPrayer = {
            title: prayer.name,
            key: prayer.key, // ✅ id emas, key saqlaymiz
            date: today.toISOString().split('T')[0],
            time: today.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
            status: 'bajarildi',
            xp: prayer.xp
        };

        try {
            await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(completedPrayer)
            });

            fetchCompletedPrayers();
        } catch (error) {
            console.error("Namoz qo'shishda xatolik:", error);
        }
    };

    const isPrayerCompletedToday = (prayerKey) => {
        const today = new Date().toISOString().split('T')[0];
        return completedPrayers.some(prayer =>
            prayer.key === prayerKey && // ✅ key bo‘yicha tekshiramiz
            prayer.date === today &&
            prayer.status === 'bajarildi'
        );
    };

    const getDateFilter = (prayer, range) => {
        const today = new Date();
        const prayerDate = new Date(prayer.date);

        switch (range) {
            case 'Bugun':
                return prayerDate.toDateString() === today.toDateString();
            case 'Kecha':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                return prayerDate.toDateString() === yesterday.toDateString();
            case 'Bu hafta':
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                return prayerDate >= startOfWeek;
            case 'Bu oy':
                return prayerDate.getMonth() === today.getMonth() &&
                    prayerDate.getFullYear() === today.getFullYear();
            default:
                return true;
        }
    };

    const filteredPrayers = completedPrayers.filter(prayer => {
        const matchDate = getDateFilter(prayer, filters.dateRange);
        const matchPrayer = filters.prayer === 'Barchasi' || prayer.key === filters.prayer; // ✅ key bo‘yicha
        return matchDate && matchPrayer;
    });

    const todayCompletedCount = completedPrayers.filter(prayer => {
        const today = new Date().toISOString().split('T')[0];
        return prayer.date === today && prayer.status === 'bajarildi';
    }).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-indigo-900/80 backdrop-blur-xl border-b border-indigo-800">
                <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <Clock size={20} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold">Namaz Vaqtlari</h1>
                    </div>
                    <button onClick={() => setShowFilterModal(true)} className="bg-gray-800 p-3 rounded-xl hover:bg-gray-700 transition-colors">
                        <Filter size={20} className="text-gray-300" />
                    </button>
                </div>
            </div>

            {/* XP va Progress */}
            <div className="p-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 shadow-2xl mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                                <Trophy className="mr-2 text-yellow-400" size={32} />
                                {totalXP} XP
                            </h2>
                            <p className="text-purple-200">
                                Bugun: {todayCompletedCount}/5 namoz o'qildi
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                                {Math.round((todayCompletedCount / 5) * 100)}%
                            </div>
                            <p className="text-purple-200 text-sm">Bajarildi</p>
                        </div>
                    </div>

                    <div className="mt-4 bg-purple-800/30 rounded-full h-3">
                        <div className="bg-gradient-to-r from-yellow-400 to-green-400 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${(todayCompletedCount / 5) * 100}%` }}></div>
                    </div>
                </div>

                {/* Bugungi Namozlar */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <Calendar className="mr-2" size={24} />
                        Bugungi Namozlar
                    </h3>

                    <div className="space-y-3">
                        {prayers.map((prayer) => {
                            const isCompleted = isPrayerCompletedToday(prayer.key); // ✅ key bilan tekshiramiz
                            return (
                                <div key={prayer.id} className={`bg-gray-800/50 rounded-2xl p-4 transition-all duration-300 ${isCompleted ? 'bg-green-800/30 border border-green-500/50' : 'hover:bg-gray-800/70'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-3 rounded-xl bg-gradient-to-r ${prayer.color}`}>
                                                {prayer.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white text-lg">{prayer.name}</h4>
                                                <p className="text-gray-400">{prayer.time}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <div className="text-right">
                                                <div className="flex items-center text-yellow-400 font-semibold">
                                                    <Star size={16} className="mr-1" />
                                                    {prayer.xp} XP
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => !isCompleted && markPrayerCompleted(prayer)}
                                                disabled={isCompleted}
                                                className={`p-3 rounded-xl transition-all duration-300 ${isCompleted ? 'bg-green-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 active:scale-95'}`}>
                                                <CheckCircle2 size={24} className="text-white" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bajarilgan Namozlar Tarixi */}
            <div className="px-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-200">Namozlar tarixi</h3>
                    <span className="text-sm text-gray-400">{filteredPrayers.length} ta</span>
                </div>

                {filteredPrayers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🕌</div>
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">Tarix topilmadi</h3>
                        <p className="text-gray-400">Tanlangan filtr bo'yicha namozlar topilmadi</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredPrayers.map((prayer, index) => {
                            const prayerInfo = prayers.find(p => p.key === prayer.key); // ✅ key bilan topamiz

                            return (
                                <div key={index} className="bg-gray-800/50 rounded-2xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-xl bg-gradient-to-r ${prayerInfo?.color || 'from-gray-500 to-gray-600'}`}>
                                                {prayerInfo?.icon || <Clock size={20} className="text-white" />}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white">{prayer.title}</h4>
                                                <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                    <span>{prayer.date}</span>
                                                    <span>{prayer.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center text-yellow-400 font-semibold">
                                                <Star size={16} className="mr-1" />
                                                +{prayer.xp} XP
                                            </div>
                                            <CheckCircle2 size={24} className="text-green-500" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
                    <div className="w-full bg-gray-900 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Filtr</h3>
                            <button onClick={() => setShowFilterModal(false)} className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">✕</button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">Sana bo'yicha</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {dateRanges.map((range) => (
                                        <button key={range} onClick={() => setFilters({ ...filters, dateRange: range })}
                                            className={`p-3 rounded-xl text-sm font-medium transition-all ${filters.dateRange === range ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">Namoz turi</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setFilters({ ...filters, prayer: 'Barchasi' })}
                                        className={`p-3 rounded-xl text-sm font-medium transition-all ${filters.prayer === 'Barchasi' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                                        Barchasi
                                    </button>
                                    {prayers.map((prayer) => (
                                        <button key={prayer.id} onClick={() => setFilters({ ...filters, prayer: prayer.key })} // ✅ key bilan filterlaymiz
                                            className={`p-3 rounded-xl text-sm font-medium transition-all ${filters.prayer === prayer.key ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                                            {prayer.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button onClick={() => setShowFilterModal(false)} className="w-full bg-blue-500 p-4 rounded-xl font-semibold text-white hover:bg-blue-600 transition-colors mt-6">Qo'llash</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NamazPage;
