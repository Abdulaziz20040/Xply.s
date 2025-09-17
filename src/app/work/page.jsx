"use client";
import React, { useEffect, useState } from "react";
import { Clock, CheckCircle2, Star, Trophy, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

const WorkPage = () => {
    const router = useRouter();
    const TASKS_API = "https://2921e26836d273ac.mokky.dev/tasks";
    const DONE_API = "https://59159b0f4ee6c5cb.mokky.dev/Ishlar";

    const [tasks, setTasks] = useState([]);
    const [doneTasks, setDoneTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalXP, setTotalXP] = useState(0);

    const calculateXP = (task) => {
        if (typeof task.xp === "number") return task.xp;
        if (task.difficulty === "easy") return 5;
        if (task.difficulty === "medium") return 10;
        if (task.difficulty === "hard") return 20;
        return 5;
    };

    const getTaskDate = (task) => {
        if (!task) return null;
        if (task.completedDate) {
            // ✅ Agar completedDate faqat sana bo‘lsa uni qaytar, aks holda T bo‘yicha ajrat
            return task.completedDate.includes("T")
                ? task.completedDate.split("T")[0]
                : task.completedDate;
        }
        if (task.date) return task.date;
        if (task.createdDate) {
            return task.createdDate.includes("T")
                ? task.createdDate.split("T")[0]
                : task.createdDate;
        }
        return null;
    };

    const getTaskTime = (task) => {
        if (!task) return "";
        if (task.time) return task.time;
        if (task.completedDate && task.completedDate.includes("T")) {
            return task.completedDate.split("T")[1]?.split(".")[0] || "";
        }
        return "";
    };

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const [tasksRes, doneRes] = await Promise.all([
                fetch(TASKS_API),
                fetch(DONE_API),
            ]);

            const tasksData = tasksRes.ok ? await tasksRes.json() : [];
            const doneDataRaw = doneRes.ok ? await doneRes.json() : [];

            const doneWithXP = doneDataRaw.map((task) => ({
                ...task,
                xp: task.xp !== undefined ? task.xp : calculateXP(task),
            }));

            // Eng yangi tepada bo‘lsin
            doneWithXP.sort(
                (a, b) =>
                    new Date(getTaskDate(b) || 0) -
                    new Date(getTaskDate(a) || 0)
            );

            setTasks(tasksData.map((task) => ({ ...task, completed: false })));
            setDoneTasks(doneWithXP);
        } catch (error) {
            console.error("Xatolik:", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ XP ni doneTasks o‘zgarganda hisoblash
    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        const todaysXP = doneTasks
            .filter((t) => getTaskDate(t) === today)
            .reduce((sum, t) => sum + calculateXP(t), 0);
        setTotalXP(todaysXP);
    }, [doneTasks]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const markCompleted = async (task) => {
        const xp = calculateXP(task);
        const completedTask = {
            ...task,
            completed: true,
            xp,
            completedDate: new Date().toISOString(),
        };

        try {
            await fetch(`${TASKS_API}/${task.id}`, { method: "DELETE" });

            const res = await fetch(DONE_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(completedTask),
            });

            if (!res.ok) console.error("DONE API xato:", res.status);

            setTasks((prev) => prev.filter((t) => t.id !== task.id));
            setDoneTasks((prev) => [completedTask, ...prev]);
        } catch (error) {
            console.error("API bilan xatolik:", error);
        }
    };

    const today = new Date().toISOString().split("T")[0];
    const todayTasks = doneTasks.filter((t) => getTaskDate(t) === today);
    const completedTodayCount = todayTasks.length;
    const totalTodayCount = Math.max(tasks.length + todayTasks.length, 2);
    const progressPercent = Math.round(
        (completedTodayCount / totalTodayCount) * 100
    );

    if (loading)
        return <div className="text-white p-6">Yuklanmoqda...</div>;

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
                                <Trophy className="mr-2 text-yellow-400" />{" "}
                                {totalXP} XP
                            </h2>
                            <p className="text-purple-200">
                                Bugungi ishlar: {completedTodayCount}/
                                {totalTodayCount}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                                {progressPercent}%
                            </div>
                            <p className="text-purple-200 text-sm">Bajarildi</p>
                        </div>
                    </div>

                    <div className="mt-4 bg-purple-800/30 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-yellow-400 to-green-400 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
                {/* Ishlar ro‘yxati */}
                <div className="space-y-3">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                        <Calendar className="mr-2" size={24} /> Ishlar Ro'yxati
                    </h3>
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() =>
                                router.push(
                                    `/time?id=${task.id}&name=${encodeURIComponent(
                                        task.name
                                    )}`
                                )
                            }
                            className="cursor-pointer bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900/90 rounded-2xl p-4 flex justify-between items-center border border-gray-700/50 hover:scale-105 transition transform duration-300"
                        >
                            <div>
                                <h4 className="font-semibold text-white">
                                    {task.name}
                                </h4>
                                <p className="text-gray-400">
                                    {calculateXP(task)} XP
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    markCompleted(task);
                                }}
                                className="p-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition-all duration-300"
                            >
                                <CheckCircle2
                                    size={24}
                                    className="text-white"
                                />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Bajarilgan ishlar */}
                <div className="mt-12">
                    <h3 className="text-lg font-semibold mb-4">
                        Bajarilgan ishlar tarixi
                    </h3>
                    {doneTasks.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-xl font-semibold text-gray-300 mb-2">
                                Tarix topilmadi
                            </h3>
                            <p className="text-gray-400">Hali ish bajarilmadi</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {doneTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`bg-gradient-to-br ${task.xp < 0
                                            ? "from-red-900 via-red-800 to-red-900"
                                            : "from-gray-900 via-gray-800 to-gray-900/90"
                                        } rounded-2xl p-4 flex justify-between items-center border border-gray-700/50 hover:scale-105 transition transform duration-300`}
                                >
                                    <div>
                                        <h4 className="font-semibold text-white">
                                            {task.name}
                                        </h4>
                                        <p className="text-gray-400 text-sm">
                                            🗓 {getTaskDate(task) || ""}{" "}
                                            {getTaskTime(task)
                                                ? `· ${getTaskTime(task)}`
                                                : ""}
                                        </p>
                                    </div>
                                    <div
                                        className={`flex items-center font-semibold ${task.xp < 0
                                                ? "text-red-400"
                                                : "text-yellow-400"
                                            }`}
                                    >
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
