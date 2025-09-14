"use client"
import React, { useState, useEffect } from "react";
import {
    CheckSquare,
    Plus,
    Play,
    X,
    Loader2,
    MoreVertical,
    Trash2,
    Clock,
    Calendar,
    Pause,
} from "lucide-react";

const TasksPage = () => {
    const DAILY_TASKS_API = "https://2921e26836d273ac.mokky.dev/daystasks";
    const SCHEDULED_TASKS_API = "https://2921e26836d273ac.mokky.dev/tasks";

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("kundalik");
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add");

    // Kundalik ishlar
    const [newDailyTask, setNewDailyTask] = useState({
        name: "",
        days: [],
        time: ""
    });

    // Rejalashtirilgan ishlar
    const [newScheduledTask, setNewScheduledTask] = useState({
        name: "",
        date: "",
        difficulty: ""
    });

    const [openMenuId, setOpenMenuId] = useState(null);
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const [runningTasks, setRunningTasks] = useState(new Map());
    const [notifications, setNotifications] = useState([]);

    const weekDays = [
        { key: "monday", label: "Dushanba" },
        { key: "tuesday", label: "Seshanba" },
        { key: "wednesday", label: "Chorshanba" },
        { key: "thursday", label: "Payshanba" },
        { key: "friday", label: "Juma" },
        { key: "saturday", label: "Shanba" },
        { key: "sunday", label: "Yakshanba" }
    ];

    // Ma'lumotlarni olish
    const fetchTasks = async () => {
        setLoading(true);
        try {
            const api = tab === "kundalik" ? DAILY_TASKS_API : SCHEDULED_TASKS_API;
            const res = await fetch(api);
            const data = await res.json();
            setTasks(data.reverse());
        } catch (error) {
            console.error("Ishlarni olishda xatolik:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [tab]);

    // Kundalik ish qo'shish
    const handleAddDailyTask = async () => {
        if (!newDailyTask.name || !newDailyTask.time || newDailyTask.days.length === 0) return;

        const task = {
            name: newDailyTask.name,
            days: newDailyTask.days,
            time: newDailyTask.time,
            createdDate: new Date().toISOString().split("T")[0]
        };

        try {
            await fetch(DAILY_TASKS_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(task)
            });
            fetchTasks();
            setNewDailyTask({ name: "", days: [], time: "" });
            setShowModal(false);
        } catch (error) {
            console.error("Kundalik ish qo'shishda xatolik:", error);
        }
    };

    // Rejalashtirilgan ish qo'shish
    const handleAddScheduledTask = async () => {
        if (!newScheduledTask.name || !newScheduledTask.difficulty) return;

        const task = {
            name: newScheduledTask.name,
            completed: false,
            createdDate: new Date().toISOString().split("T")[0],
            date: newScheduledTask.date,
            difficulty: newScheduledTask.difficulty
        };

        try {
            await fetch(SCHEDULED_TASKS_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(task)
            });
            fetchTasks();
            setNewScheduledTask({ name: "", date: "", difficulty: "" });
            setShowModal(false);
        } catch (error) {
            console.error("Rejalashtirilgan ish qo'shishda xatolik:", error);
        }
    };

    // Rejalashtirilgan ishni bajarilgan deb belgilash
    const handleCompleteScheduledTask = async (taskId) => {
        try {
            await fetch(`${SCHEDULED_TASKS_API}/${taskId}`, { method: "DELETE" });
            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (error) {
            console.error("Ishni bajarishda xatolik:", error);
        }
    };

    // Ish o'chirish
    const handleDeleteTask = async (id) => {
        try {
            const api = tab === "kundalik" ? DAILY_TASKS_API : SCHEDULED_TASKS_API;
            await fetch(`${api}/${id}`, { method: "DELETE" });
            setTasks(tasks.filter((t) => t.id !== id));
            setOpenMenuId(null);
        } catch (error) {
            console.error("Ishni o'chirishda xatolik:", error);
        }
    };

    // Kun nomi
    const getDayName = (dayKey) => {
        const day = weekDays.find(d => d.key === dayKey);
        return day ? day.label : dayKey;
    };

    // Kun toggle
    const toggleDay = (dayKey) => {
        const updatedDays = newDailyTask.days.includes(dayKey)
            ? newDailyTask.days.filter(d => d !== dayKey)
            : [...newDailyTask.days, dayKey];
        setNewDailyTask({ ...newDailyTask, days: updatedDays });
    };

    // Vaqtni boshlash
    const startTask = (taskId, timeInMinutes) => {
        const endTime = Date.now() + (timeInMinutes * 60 * 1000);
        setRunningTasks(new Map(runningTasks.set(taskId, { endTime, timeInMinutes })));

        setTimeout(() => {
            setRunningTasks(prev => {
                const newMap = new Map(prev);
                newMap.delete(taskId);
                return newMap;
            });

            setNotifications(prev => [...prev, {
                id: Date.now(),
                message: `"${tasks.find(t => t.id === taskId)?.name}" tugadi!`,
                time: new Date().toLocaleTimeString()
            }]);
        }, timeInMinutes * 60 * 1000);
    };

    // To'xtatish
    const stopTask = (taskId) => {
        setRunningTasks(prev => {
            const newMap = new Map(prev);
            newMap.delete(taskId);
            return newMap;
        });
    };

    // Time format
    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        return timeStr;
    };

    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const getRemainingTime = (taskId) => {
        const taskInfo = runningTasks.get(taskId);
        if (!taskInfo) return null;

        const remaining = Math.max(0, taskInfo.endTime - Date.now());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setRunningTasks(prev => new Map(prev));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0f1f] to-[#1a1f3c] text-white pb-20 relative">
            {/* Bildirishnomalar */}
            {notifications.map(notification => (
                <div key={notification.id} className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-xl shadow-lg z-50 animate-bounce">
                    <div className="font-bold tracking-wide">{notification.message}</div>
                    <div className="text-xs opacity-80">{notification.time}</div>
                </div>
            ))}

            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50">
                    <Loader2 className="animate-spin text-purple-400" size={48} />
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 bg-black/40 backdrop-blur-lg border-b border-purple-800 z-40">
                <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
                            <CheckSquare size={22} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-wider">🎮 Questlar</h1>
                    </div>
                    <button
                        onClick={() => {
                            setModalType("add");
                            setShowModal(true);
                        }}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-2xl hover:scale-110 transition-transform shadow-lg shadow-purple-500/30"
                    >
                        <Plus size={22} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex justify-center space-x-4 border-t border-purple-900 bg-black/50">
                    <button
                        className={`flex-1 py-3 font-semibold tracking-wide ${tab === "kundalik"
                            ? "border-b-2 border-pink-500 text-pink-400"
                            : "text-gray-400 hover:text-gray-200"}`}
                        onClick={() => setTab("kundalik")}
                    >
                        🗓️ Kundalik
                    </button>
                    <button
                        className={`flex-1 py-3 font-semibold tracking-wide ${tab === "rejalashtirilgan"
                            ? "border-b-2 border-green-500 text-green-400"
                            : "text-gray-400 hover:text-gray-200"}`}
                        onClick={() => setTab("rejalashtirilgan")}
                    >
                        📌 Rejalashtirilgan
                    </button>
                </div>
            </div>

            {/* Tasks List */}
            <div className="px-6 mt-4 space-y-3">
                {tasks.length === 0 ? (
                    <div className="text-center py-12 opacity-80">
                        <div className="text-6xl mb-4">🚀</div>
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">Hech narsa yo‘q</h3>
                        <p className="text-gray-400">
                            {tab === "kundalik" ? "Bugun senga vazifalar berilmagan" : "Rejalashtirilgan vazifalar yo‘q"}
                        </p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="relative">
                            <div className="bg-[#151530]/80 rounded-2xl p-4 hover:bg-[#1e1e3c] transition-all shadow-md shadow-purple-900/40">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        {tab === "rejalashtirilgan" && (
                                            <div className="flex items-center space-x-3 mb-2">
                                                <button
                                                    onClick={() => handleCompleteScheduledTask(task.id)}
                                                    className="w-7 h-7 border-2 border-green-400 rounded-md hover:bg-green-500 flex items-center justify-center transition-colors"
                                                >
                                                    <CheckSquare size={16} className="text-green-300" />
                                                </button>
                                            </div>
                                        )}

                                        <h4 className="font-bold text-lg text-white mb-1">{task.name}</h4>

                                        {tab === "kundalik" && (
                                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                <div className="flex items-center space-x-1">
                                                    <Clock size={14} className="text-pink-400" />
                                                    <span>{formatTime(task.time)}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {task.days?.map(day => (
                                                        <span key={day} className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded-lg text-xs">
                                                            {getDayName(day)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {tab === "rejalashtirilgan" && (
                                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                <Calendar size={14} className="text-green-400" />
                                                <span>{task.date || "Sana belgilanmagan"}</span>
                                            </div>
                                        )}

                                        {runningTasks.has(task.id) && (
                                            <div className="mt-2 flex items-center space-x-2 text-green-400">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                                                <span className="text-sm font-semibold">
                                                    ⏳ {getRemainingTime(task.id)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {tab === "kundalik" && (
                                            <button
                                                onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                                                className="p-2 bg-purple-600/20 text-purple-400 rounded-xl hover:bg-purple-600/40 transition-colors"
                                            >
                                                <Play size={16} />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                                            className="p-2 rounded-xl hover:bg-gray-700/50"
                                        >
                                            <MoreVertical size={20} className="text-gray-300" />
                                        </button>
                                    </div>
                                </div>

                                {tab === "kundalik" && expandedTaskId === task.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <div className="flex space-x-3">
                                            {!runningTasks.has(task.id) ? (
                                                <button
                                                    onClick={() => {
                                                        const minutes = timeToMinutes(task.time);
                                                        startTask(task.id, minutes);
                                                    }}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                                                >
                                                    <Play size={16} />
                                                    <span>Start</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => stopTask(task.id)}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                                                >
                                                    <Pause size={16} />
                                                    <span>Stop</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {openMenuId === task.id && (
                                    <div className="absolute right-4 bottom-full mb-2 bg-black/80 border border-gray-700 rounded-xl shadow-lg w-40 z-50">
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="flex items-center space-x-2 w-full px-4 py-2 text-red-400 hover:bg-red-600/20 rounded-xl"
                                        >
                                            <Trash2 size={16} />
                                            <span>O‘chirish</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end pb-22">
                    <div className="w-full bg-[#12122b] rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto relative border-t-2 border-purple-600 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-purple-300">
                                {tab === "kundalik" ? "➕ Kundalik vazifa" : "➕ Rejalashtirilgan vazifa"}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setNewDailyTask({ name: "", days: [], time: "" });
                                    setNewScheduledTask({ name: "", date: "", difficulty: "" });
                                }}
                                className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
                            >
                                <X size={20} className="text-gray-300" />
                            </button>
                        </div>

                        {/* Kundalik */}
                        {tab === "kundalik" && (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Vazifa nomi"
                                    value={newDailyTask.name}
                                    onChange={(e) => setNewDailyTask({ ...newDailyTask, name: e.target.value })}
                                    className="w-full p-3 bg-gray-800 rounded-xl text-white placeholder-gray-500 border border-purple-500/30"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-purple-300 mb-2">Kunlar</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {weekDays.map(day => (

                                            <button
                                                key={day.key}
                                                onClick={() => toggleDay(day.key)}
                                                className={`p-2 rounded-xl text-sm font-semibold transition-all ${newDailyTask.days.includes(day.key)
                                                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/30"
                                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                    }`}
                                            >
                                                {day.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-purple-300 mb-2">
                                        Vaqt
                                    </label>
                                    <input
                                        type="time"
                                        value={newDailyTask.time}
                                        onChange={(e) =>
                                            setNewDailyTask({ ...newDailyTask, time: e.target.value })
                                        }
                                        className="w-full p-3 bg-gray-800 rounded-xl text-white"
                                    />
                                </div>

                                <button
                                    onClick={handleAddDailyTask}
                                    disabled={!newDailyTask.name || !newDailyTask.time || newDailyTask.days.length === 0}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-xl font-bold text-white hover:scale-105 transition-transform disabled:opacity-50"
                                >
                                    Vazifa qo‘shish
                                </button>
                            </div>
                        )}

                        {/* Rejalashtirilgan ish qo'shish modali */}
                        {tab === "rejalashtirilgan" && (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Ish nomi"
                                    value={newScheduledTask.name}
                                    onChange={(e) => setNewScheduledTask({ ...newScheduledTask, name: e.target.value })}
                                    className="w-full p-3 bg-gray-800 rounded-xl text-white placeholder-gray-400"
                                />

                                {/* Sana tanlash */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Sana (ixtiyoriy)
                                    </label>
                                    <input
                                        type="date"
                                        value={newScheduledTask.date}
                                        onChange={(e) => setNewScheduledTask({ ...newScheduledTask, date: e.target.value })}
                                        className="w-full p-3 bg-gray-800 rounded-xl text-white"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>


                                {/* Qiyinlik darajasi tanlash 🔥 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Qiyinlik darajasi
                                    </label>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setNewScheduledTask({ ...newScheduledTask, difficulty: "easy" })}
                                            className={`flex-1 py-2 rounded-xl font-semibold transition-colors ${newScheduledTask.difficulty === "easy"
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                                }`}
                                        >
                                            Oson
                                        </button>
                                        <button
                                            onClick={() => setNewScheduledTask({ ...newScheduledTask, difficulty: "medium" })}
                                            className={`flex-1 py-2 rounded-xl font-semibold transition-colors ${newScheduledTask.difficulty === "medium"
                                                ? "bg-yellow-500 text-white"
                                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                                }`}
                                        >
                                            O‘rtacha
                                        </button>
                                        <button
                                            onClick={() => setNewScheduledTask({ ...newScheduledTask, difficulty: "hard" })}
                                            className={`flex-1 py-2 rounded-xl font-semibold transition-colors ${newScheduledTask.difficulty === "hard"
                                                ? "bg-red-500 text-white"
                                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                                }`}
                                        >
                                            Qiyin
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddScheduledTask}
                                    disabled={!newScheduledTask.name || !newScheduledTask.difficulty}
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl font-semibold text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
                                >
                                    Rejalashtirilgan ish qo'shish
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TasksPage;
