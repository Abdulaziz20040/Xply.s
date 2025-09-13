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
    Square
} from "lucide-react";

const TasksPage = () => {
    const DAILY_TASKS_API = "https://2921e26836d273ac.mokky.dev/daystasks";
    const SCHEDULED_TASKS_API = "https://2921e26836d273ac.mokky.dev/tasks";

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("kundalik"); // "kundalik" yoki "rejalashtirilgan"ot
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add");

    // Kundalik ishlar uchun
    const [newDailyTask, setNewDailyTask] = useState({
        name: "",
        days: [],
        time: ""
    });

    // Rejalashtirilgan ishlar uchun
    const [newScheduledTask, setNewScheduledTask] = useState({
        name: "",
        date: ""
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
        if (!newScheduledTask.name || !newScheduledTask.date) return;

        const task = {
            name: newScheduledTask.name,
            date: newScheduledTask.date,
            completed: false,
            createdDate: new Date().toISOString().split("T")[0]
        };

        try {
            await fetch(SCHEDULED_TASKS_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(task)
            });
            fetchTasks();
            setNewScheduledTask({ name: "", date: "" });
            setShowModal(false);
        } catch (error) {
            console.error("Rejalashtirilgan ish qo'shishda xatolik:", error);
        }
    };

    // Rejalashtirilgan ishni bajarilgan deb belgilash
    const handleCompleteScheduledTask = async (taskId) => {
        try {
            await fetch(`${SCHEDULED_TASKS_API}/${taskId}`, {
                method: "DELETE"
            });
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

    // Kun nomini olish
    const getDayName = (dayKey) => {
        const day = weekDays.find(d => d.key === dayKey);
        return day ? day.label : dayKey;
    };

    // Kunni tanlash/bekor qilish
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

        // Timer
        const timer = setTimeout(() => {
            setRunningTasks(prev => {
                const newMap = new Map(prev);
                newMap.delete(taskId);
                return newMap;
            });

            // Bildirishnoma
            setNotifications(prev => [...prev, {
                id: Date.now(),
                message: `"${tasks.find(t => t.id === taskId)?.name}" ishi tugadi!`,
                time: new Date().toLocaleTimeString()
            }]);

            // 5 soniyadan keyin bildirishnomani o'chirish
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== Date.now()));
            }, 5000);

        }, timeInMinutes * 60 * 1000);

        return timer;
    };

    // Vaqtni to'xtatish
    const stopTask = (taskId) => {
        setRunningTasks(prev => {
            const newMap = new Map(prev);
            newMap.delete(taskId);
            return newMap;
        });
    };

    // Vaqtni formatlash
    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        return timeStr;
    };

    // Vaqt konvertatsiyasi (HH:MM -> minutes)
    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // Qolgan vaqtni hisoblash
    const getRemainingTime = (taskId) => {
        const taskInfo = runningTasks.get(taskId);
        if (!taskInfo) return null;

        const remaining = Math.max(0, taskInfo.endTime - Date.now());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Har soniyada qolgan vaqtni yangilash
    useEffect(() => {
        const interval = setInterval(() => {
            setRunningTasks(prev => new Map(prev));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-20 relative">
            {/* Bildirishnomalar */}
            {notifications.map(notification => (
                <div key={notification.id} className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-xl shadow-lg z-50 animate-pulse">
                    <div className="font-semibold">{notification.message}</div>
                    <div className="text-sm opacity-80">{notification.time}</div>
                </div>
            ))}

            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50">
                    <Loader2 className="animate-spin text-blue-500" size={48} />
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 z-40">
                <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <CheckSquare size={20} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold">Ishlar</h1>
                    </div>
                    <button
                        onClick={() => {
                            setModalType("add");
                            setShowModal(true);
                        }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex justify-center space-x-4 border-t border-gray-800 bg-gray-900/90">
                    <button
                        className={`flex-1 py-3 ${tab === "kundalik" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400"}`}
                        onClick={() => setTab("kundalik")}
                    >
                        Kundalik ishlar
                    </button>
                    <button
                        className={`flex-1 py-3 ${tab === "rejalashtirilgan" ? "border-b-2 border-green-500 text-green-400" : "text-gray-400"}`}
                        onClick={() => setTab("rejalashtirilgan")}
                    >
                        Rejalashtirilgan
                    </button>
                </div>
            </div>

            {/* Tasks List */}
            <div className="px-6 mt-4 space-y-3">
                {tasks.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">Ish topilmadi</h3>
                        <p className="text-gray-400">
                            {tab === "kundalik" ? "Kundalik ishlar ro'yxati bo'sh" : "Rejalashtirilgan ishlar yo'q"}
                        </p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="relative">
                            <div className="bg-gray-800/50 rounded-2xl p-4 hover:bg-gray-800/70 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        {/* Rejalashtirilgan ishlar uchun checkbox */}
                                        {tab === "rejalashtirilgan" && (
                                            <div className="flex items-center space-x-3 mb-2">
                                                <button
                                                    onClick={() => handleCompleteScheduledTask(task.id)}
                                                    className="w-6 h-6 border-2 border-green-400 rounded-md hover:bg-green-400 transition-colors flex items-center justify-center"
                                                >
                                                    <CheckSquare size={16} className="text-green-400" />
                                                </button>
                                            </div>
                                        )}

                                        <h4 className="font-medium text-white mb-1">{task.name}</h4>

                                        {/* Kundalik ishlar ma'lumotlari */}
                                        {tab === "kundalik" && (
                                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                <div className="flex items-center space-x-1">
                                                    <Clock size={14} />
                                                    <span>{formatTime(task.time)}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {task.days?.map(day => (
                                                        <span key={day} className="px-2 py-1 bg-blue-500/30 text-blue-400 rounded-lg text-xs">
                                                            {getDayName(day)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Rejalashtirilgan ishlar ma'lumotlari */}
                                        {tab === "rejalashtirilgan" && (
                                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                <Calendar size={14} />
                                                <span>{task.date}</span>
                                            </div>
                                        )}

                                        {/* Ishlamoqda ko'rsatkichi */}
                                        {runningTasks.has(task.id) && (
                                            <div className="mt-2 flex items-center space-x-2 text-green-400">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                <span className="text-sm">
                                                    Qolgan vaqt: {getRemainingTime(task.id)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {/* Kundalik ishlar uchun boshqaruv tugmalari */}
                                        {tab === "kundalik" && (
                                            <>
                                                <button
                                                    onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                                                    className="p-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors"
                                                >
                                                    <Play size={16} />
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                                            className="p-2 rounded-xl hover:bg-gray-700"
                                        >
                                            <MoreVertical size={20} className="text-gray-300" />
                                        </button>
                                    </div>
                                </div>

                                {/* Kengaytirilgan kundalik ish boshqaruvi */}
                                {tab === "kundalik" && expandedTaskId === task.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <div className="flex space-x-3">
                                            {!runningTasks.has(task.id) ? (
                                                <button
                                                    onClick={() => {
                                                        const minutes = timeToMinutes(task.time);
                                                        startTask(task.id, minutes);
                                                    }}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                                                >
                                                    <Play size={16} />
                                                    <span>Boshlash</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => stopTask(task.id)}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                                                >
                                                    <Pause size={16} />
                                                    <span>To'xtatish</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Dropdown menyu */}
                                {openMenuId === task.id && (
                                    <div className="absolute right-4 bottom-full mb-2 bg-gray-900 border border-gray-700 rounded-xl shadow-lg w-40 z-50">
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="flex items-center space-x-2 w-full px-4 py-2 text-red-500 hover:bg-gray-800 rounded-xl"
                                        >
                                            <Trash2 size={16} />
                                            <span>O'chirish</span>
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end pb-25">
                    <div className="w-full bg-gray-900 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto relative">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">
                                {tab === "kundalik" ? "Kundalik ish qo'shish" : "Rejalashtirilgan ish qo'shish"}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setNewDailyTask({ name: "", days: [], time: "" });
                                    setNewScheduledTask({ name: "", date: "" });
                                }}
                                className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
                            >
                                <X size={20} className="text-gray-300" />
                            </button>
                        </div>

                        {/* Kundalik ish qo'shish modali */}
                        {tab === "kundalik" && (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Ish nomi"
                                    value={newDailyTask.name}
                                    onChange={(e) => setNewDailyTask({ ...newDailyTask, name: e.target.value })}
                                    className="w-full p-3 bg-gray-800 rounded-xl text-white placeholder-gray-400"
                                />

                                {/* Kunlarni tanlash */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Kunlar
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {weekDays.map(day => (
                                            <button
                                                key={day.key}
                                                onClick={() => toggleDay(day.key)}
                                                className={`p-3 rounded-xl transition-colors ${newDailyTask.days.includes(day.key)
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                                    }`}
                                            >
                                                {day.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Vaqt tanlash */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Vaqt (soat:daqiqa)
                                    </label>
                                    <input
                                        type="time"
                                        value={newDailyTask.time}
                                        onChange={(e) => setNewDailyTask({ ...newDailyTask, time: e.target.value })}
                                        className="w-full p-3 bg-gray-800 rounded-xl text-white"
                                    />
                                </div>

                                <button
                                    onClick={handleAddDailyTask}
                                    disabled={!newDailyTask.name || !newDailyTask.time || newDailyTask.days.length === 0}
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl font-semibold text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
                                >
                                    Kundalik ish qo'shish
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
                                        Sana
                                    </label>
                                    <input
                                        type="date"
                                        value={newScheduledTask.date}
                                        onChange={(e) => setNewScheduledTask({ ...newScheduledTask, date: e.target.value })}
                                        className="w-full p-3 bg-gray-800 rounded-xl text-white"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                <button
                                    onClick={handleAddScheduledTask}
                                    disabled={!newScheduledTask.name || !newScheduledTask.date}
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