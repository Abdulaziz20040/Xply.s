"use client";
import React, { useEffect, useState } from "react";
import { Clock, CheckCircle2, Star, Trophy, Calendar } from "lucide-react";

const WorkPage = () => {
    const TASKS_API = "https://2921e26836d273ac.mokky.dev/tasks"; // Asosiy ishlar
    const DONE_API = "https://59159b0f4ee6c5cb.mokky.dev/Ishlar"; // Bajarilgan ishlar

    const [tasks, setTasks] = useState([]);
    const [doneTasks, setDoneTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalXP, setTotalXP] = useState(0);

    // XP ni ish qiyinligiga qarab belgilash
    const calculateXP = (taskName) => {
        if (taskName.length < 10) return 5; // Oson
        if (taskName.length < 20) return 10; // O‘rtacha
        return 15; // Qiyin
    };

    // API'dan ishlarni olish
    const fetchTasks = async () => {
        setLoading(true);
        try {
            const [tasksRes, doneRes] = await Promise.all([fetch(TASKS_API), fetch(DONE_API)]);
            const tasksData = await tasksRes.json();
            const doneData = await doneRes.json();

            // doneData ga XP qo'shish
            const doneWithXP = doneData.map(task => ({
                ...task,
                xp: calculateXP(task.name)
            }));

            setTasks(tasksData.map(task => ({ ...task, completed: false })));
            setDoneTasks(doneWithXP);

            const total = doneWithXP.reduce((sum, task) => sum + task.xp, 0);
            setTotalXP(total);
        } catch (error) {
            console.error("Xatolik:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Ishni bajarildi deb belgilash va API'larni yangilash
    const markCompleted = async (task) => {
        const xp = calculateXP(task.name);
        const completedTask = {
            ...task,
            completed: true,
            xp,
            completedDate: new Date().toISOString()
        };

        try {
            // 1️⃣ Asosiy API'dan o'chirish
            await fetch(`${TASKS_API}/${task.id}`, { method: "DELETE" });

            // 2️⃣ Done API'ga qo'shish
            await fetch(DONE_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(completedTask)
            });

            // Local state update
            setTasks(prev => prev.filter(t => t.id !== task.id));
            setDoneTasks(prev => [...prev, completedTask]);
            setTotalXP(prev => prev + xp);
        } catch (error) {
            console.error("API bilan ishlashda xatolik:", error);
        }
    };

    const completedCount = doneTasks.length;
    const minTasks = 2;

    if (loading) return <div className="text-white p-6">Yuklanmoqda...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 p-6 flex justify-between items-center">
                <h1 className="text-xl font-bold flex items-center">
                    <Clock size={20} className="mr-2" /> Ishlar Ro'yxati
                </h1>
                <Trophy size={28} className="text-yellow-400" />
            </div>

            {/* XP va Progress */}
            <div className="p-6">
                <div className="bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-900 rounded-3xl p-6 shadow-2xl mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-white flex items-center">
                                <Trophy className="mr-2 text-yellow-400" /> {totalXP} XP
                            </h2>
                            <p className="text-purple-200">
                                Bajarilgan ishlar: {completedCount}/{Math.max(tasks.length + doneTasks.length, minTasks)}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                                {Math.round((completedCount / Math.max(tasks.length + doneTasks.length, minTasks)) * 100)}%
                            </div>
                            <p className="text-purple-200 text-sm">Bajarildi</p>
                        </div>
                    </div>

                    <div className="mt-4 bg-purple-800/30 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-yellow-400 to-green-400 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${(completedCount / Math.max(tasks.length + doneTasks.length, minTasks)) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Barcha ishlar */}
                <div className="space-y-3">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                        <Calendar className="mr-2" size={24} /> Ishlar Ro'yxati
                    </h3>
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900/90 rounded-2xl p-4 flex justify-between items-center border border-gray-700/50 hover:scale-105 transition transform duration-300"
                        >
                            <div>
                                <h4 className="font-semibold text-white">{task.name}</h4>
                                <p className="text-gray-400">{calculateXP(task.name)} XP</p>
                            </div>
                            <button
                                onClick={() => markCompleted(task)}
                                className="p-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition-all duration-300"
                            >
                                <CheckCircle2 size={24} className="text-white" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Bajarilgan ishlar tarixi */}
                <div className="mt-12">
                    <h3 className="text-lg font-semibold mb-4">Bajarilgan ishlar tarixi</h3>
                    {doneTasks.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-xl font-semibold text-gray-300 mb-2">Tarix topilmadi</h3>
                            <p className="text-gray-400">Hali ish bajarilmadi</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {doneTasks.map(task => (
                                <div
                                    key={task.id}
                                    className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900/90 rounded-2xl p-4 flex justify-between items-center border border-gray-700/50 hover:scale-105 transition transform duration-300"
                                >
                                    <div>
                                        <h4 className="font-semibold text-white">{task.name}</h4>
                                        <p className="text-gray-400">{task.completedDate || task.createdDate}</p>
                                    </div>
                                    <div className="flex items-center text-yellow-400 font-semibold">
                                        <Star size={16} className="mr-1" />
                                        {task.xp} XP
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkPage;
