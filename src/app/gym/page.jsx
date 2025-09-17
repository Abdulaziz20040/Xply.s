"use client"
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Calendar, Filter, Trophy, Star } from 'lucide-react';

const GymPage = () => {
    const API_URL = "https://59159b0f4ee6c5cb.mokky.dev/Gym";

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({
        dateRange: 'Bugun',
        task: 'Barchasi'
    });
    const [totalXP, setTotalXP] = useState(0);

    // Boshlang‘ich kunlik topshiriqlar
    const baseTasks = [
        { id: 1, key: 'anjuman', title: 'Anjumaniya', baseCount: 100, baseXP: 10, color: 'from-gray-900 to-indigo-900', icon: <Star className="text-yellow-400" size={24} /> },
        { id: 2, key: 'tosh', title: 'Tosh ko‘tarish', baseCount: 100, baseXP: 10, color: 'from-indigo-800 via-purple-800 to-indigo-900', icon: <Star className="text-blue-400" size={24} /> },
        { id: 3, key: 'prish', title: 'Prish mashqi', baseCount: 40, baseXP: 8, color: 'from-gray-900 via-gray-800 to-gray-900', icon: <Star className="text-red-400" size={24} /> }
    ];

    // Bugungi sana bo‘yicha kunlar sonini hisoblash
    const getDayIndex = () => {
        const startDate = new Date('2025-09-12'); // boshlang‘ich sana
        const today = new Date();
        const diffTime = today - startDate;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // 1-kundan boshlash
    };

    // Har kungi topshiriqlarni hisoblash
    const dailyTasks = baseTasks.map(task => {
        const dayIndex = getDayIndex();
        const count = Math.round(task.baseCount * Math.pow(1.1, dayIndex - 1)); // har kuni 10% oshadi
        const xp = Math.round(task.baseXP * Math.pow(1.1, dayIndex - 1));
        return { ...task, count, xp };
    });

    const dateRanges = ['Bugun', 'Kecha', 'Bu hafta', 'Bu oy', 'Barchasi'];

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setTasks(data.reverse());

            const total = data.reduce((sum, task) => sum + (task.xp || 0), 0);
            setTotalXP(total);
        } catch (error) {
            console.error("Ma'lumot olishda xatolik:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const markTaskCompleted = async (task) => {
        const today = new Date();
        const completedTask = {
            title: task.title,
            key: task.key,
            date: today.toISOString().split('T')[0],
            time: today.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
            status: 'bajarildi',
            xp: task.xp,
            id: task.id
        };

        try {
            await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(completedTask)
            });
            fetchTasks();
        } catch (error) {
            console.error("Vazifa qo'shishda xatolik:", error);
        }
    };

    const isTaskCompletedToday = (taskKey) => {
        const today = new Date().toISOString().split('T')[0];
        return tasks.some(task =>
            task.key === taskKey &&
            task.date === today &&
            task.status === 'bajarildi'
        );
    };

    const getDateFilter = (task, range) => {
        const today = new Date();
        const taskDate = new Date(task.date);

        switch (range) {
            case 'Bugun':
                return taskDate.toDateString() === today.toDateString();
            case 'Kecha':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                return taskDate.toDateString() === yesterday.toDateString();
            case 'Bu hafta':
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                return taskDate >= startOfWeek;
            case 'Bu oy':
                return taskDate.getMonth() === today.getMonth() &&
                    taskDate.getFullYear() === today.getFullYear();
            default:
                return true;
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchDate = getDateFilter(task, filters.dateRange);
        const matchTask = filters.task === 'Barchasi' || task.key === filters.task;
        return matchDate && matchTask;
    });

    const todayCompletedCount = tasks.filter(task => {
        const today = new Date().toISOString().split('T')[0];
        return task.date === today && task.status === 'bajarildi';
    }).length;


    useEffect(() => {
        const checkUncompletedTasks = () => {
            const now = new Date();
            const today = now.toISOString().split('T')[0];

            // Agar soat 23:00 dan keyin bo'lsa
            if (now.getHours() === 23 && now.getMinutes() === 0) {
                dailyTasks.forEach(async (task) => {
                    const alreadyCompleted = tasks.some(
                        (t) => t.key === task.key && t.date === today
                    );

                    if (!alreadyCompleted) {
                        const missedTask = {
                            title: task.title,
                            key: task.key,
                            date: today,
                            time: "23:00",
                            status: "bajarilmadi",
                            xp: -task.xp // ❌ minus XP
                        };

                        try {
                            await fetch(API_URL, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(missedTask),
                            });
                            console.log(`❌ ${task.title} bajarilmadi, -${task.xp} XP qo‘shildi`);
                            fetchTasks(); // yangilash
                        } catch (error) {
                            console.error("Bajarilmagan mashqni yozishda xatolik:", error);
                        }
                    }
                });
            }
        };

        const interval = setInterval(checkUncompletedTasks, 60000); // har 1 daqiqada tekshiradi
        return () => clearInterval(interval);
    }, [tasks, dailyTasks]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
                <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-800 via-purple-800 to-indigo-900 rounded-full flex items-center justify-center">
                            <Clock size={20} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold">Gym Kunlik Vazifalar</h1>
                    </div>
                    <button onClick={() => setShowFilterModal(true)} className="bg-gray-800 p-3 rounded-xl hover:bg-gray-700 transition-colors">
                        <Filter size={20} className="text-gray-300" />
                    </button>
                </div>
            </div>

            {/* XP va Progress */}
            <div className="p-6">
                <div className="bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-900 rounded-3xl p-6 shadow-2xl mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                                <Trophy className="mr-2 text-yellow-400" size={32} />
                                {totalXP} XP
                            </h2>
                            <p className="text-purple-200">
                                Bugun bajarilgan: {todayCompletedCount}/{dailyTasks.length} topshiriq
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                                {Math.round((todayCompletedCount / dailyTasks.length) * 100)}%
                            </div>
                            <p className="text-purple-200 text-sm">Bajarildi</p>
                        </div>
                    </div>

                    <div className="mt-4 bg-purple-800/30 rounded-full h-3">
                        <div className="bg-gradient-to-r from-yellow-400 to-green-400 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${(todayCompletedCount / dailyTasks.length) * 100}%` }}></div>
                    </div>
                </div>

                {/* Bugungi Topshiriqlar */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <Calendar className="mr-2" size={24} />
                        Bugungi Topshiriqlar
                    </h3>

                    <div className="space-y-3">
                        {dailyTasks.map((task) => {
                            const isCompleted = isTaskCompletedToday(task.key);
                            return (
                                <div key={task.id} className={`bg-gradient-to-br ${task.color} rounded-2xl border border-indigo-500/30 p-4 hover:scale-105 transition transform duration-300 ${isCompleted ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 rounded-xl bg-black/30">
                                                {task.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white text-lg">{task.title} ({task.count} ta)</h4>
                                                <p className="text-gray-300">{task.xp} XP</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => !isCompleted && markTaskCompleted(task)}
                                            disabled={isCompleted}
                                            className={`p-3 rounded-xl transition-all duration-300 ${isCompleted ? 'bg-green-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 active:scale-95'}`}>
                                            <CheckCircle2 size={24} className="text-white" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bajarilgan Gym Tarixi (Namoz o‘rniga Gym bo‘limi) */}
                <div className=" mt-12">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Bajarilgan Gym Mashqlar Tarixi</h3>
                        <span className="text-sm text-gray-400">{tasks.length} ta</span>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🏋️‍♂️</div>
                            <h3 className="text-xl font-semibold text-gray-300 mb-2">Tarix topilmadi</h3>
                            <p className="text-gray-400">Hali mashqlar bajarilmadi</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tasks.map((task, index) => (
                                <div key={index} className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900/90 rounded-2xl p-4 border border-gray-700/50 hover:scale-105 transition transform duration-300">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-3 rounded-xl bg-black/30">
                                                {dailyTasks.find(t => t.key === task.key)?.icon || <Clock size={20} className="text-white" />}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white text-lg">{task.title}</h4>
                                                <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                    <span>{task.date}</span>
                                                    <span>{task.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center text-yellow-400 font-semibold">
                                                <Star size={16} className="mr-1" />
                                                +{task.xp} XP
                                            </div>
                                            <CheckCircle2 size={24} className="text-green-500" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
                                <label className="block text-sm font-medium text-gray-300 mb-3">Topshiriq turi</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setFilters({ ...filters, task: 'Barchasi' })}
                                        className={`p-3 rounded-xl text-sm font-medium transition-all ${filters.task === 'Barchasi' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                                        Barchasi
                                    </button>
                                    {dailyTasks.map((task) => (
                                        <button key={task.id} onClick={() => setFilters({ ...filters, task: task.key })}
                                            className={`p-3 rounded-xl text-sm font-medium transition-all ${filters.task === task.key ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                                            {task.title}
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

export default GymPage;
