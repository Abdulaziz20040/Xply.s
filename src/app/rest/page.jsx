"use client";
import React, { useEffect, useState } from "react";
import { Clock, Trophy, X } from "lucide-react";
import Modal from "react-modal";

const MAX_HOURS = 3;

const DamOlishPage = () => {
    const DAM_API = "https://59159b0f4ee6c5cb.mokky.dev/dam";
    const DAM_TRIX_API = "https://59159b0f4ee6c5cb.mokky.dev/dam_trix";

    const [damTasks, setDamTasks] = useState([]);
    const [damHistory, setDamHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalXP, setTotalXP] = useState(0);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [hours, setHours] = useState(1);
    const [minutes, setMinutes] = useState(0);
    const [price, setPrice] = useState(0);
    const [xp, setXp] = useState(0);

    useEffect(() => {
        Modal.setAppElement("body");
    }, []);

    // Dam olish turlarini olish
    const fetchDamTasks = async () => {
        setLoading(true);
        try {
            const res = await fetch(DAM_API);
            const data = await res.json();
            setDamTasks(data.reverse());
        } catch (err) {
            console.error("Dam olish turlari yuklashda xatolik:", err);
        } finally {
            setLoading(false);
        }
    };

    // Tarixni olish
    const fetchDamHistory = async () => {
        try {
            const res = await fetch(DAM_TRIX_API);
            const data = await res.json();
            setDamHistory(data.reverse());

            const total = data.reduce((sum, t) => sum + (t.xp || 0), 0);
            setTotalXP(total);
        } catch (err) {
            console.error("Dam olish tarixi yuklashda xatolik:", err);
        }
    };

    useEffect(() => {
        fetchDamTasks();
        fetchDamHistory();
    }, []);

    // Modalni ochish
    const openModal = (task) => {
        setSelectedTask(task);
        setHours(1);
        setMinutes(0);
        // price va xp boshlang'ich qiymatlari
        setPrice(task.price || 1000); // default qiymat
        setXp(task.xp || 1); // default XP
        setModalOpen(true);
    };

    // Narx va XP ni hisoblash
    const calculatePriceXP = (totalHours) => {
        // Oddiy formula: 1 soat = boshlang'ich narx va XP, max 3 soatga yetadi
        const basePrice = selectedTask.price || 1000;
        const baseXP = selectedTask.xp || 1;
        const newPrice = Math.round(basePrice * totalHours);
        const newXP = Math.round(baseXP * totalHours);

        setPrice(newPrice);
        setXp(newXP);
    };

    // To'lovni amalga oshirish
    const payTask = async () => {
        if (!selectedTask) return;

        const totalHours = hours + minutes / 60;
        calculatePriceXP(totalHours);

        const newTask = {
            id: selectedTask.id,
            type: selectedTask.type,
            image: selectedTask.image,
            hours: totalHours,
            price: price,
            xp: xp,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
        };

        try {
            // 1️⃣ DAM_API dan o'chirish
            await fetch(`${DAM_API}/${selectedTask.id}`, { method: "DELETE" });

            // 2️⃣ DAM_TRIX_API ga qo'shish
            await fetch(DAM_TRIX_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask),
            });

            setModalOpen(false);
            fetchDamTasks();
            fetchDamHistory();
        } catch (err) {
            console.error("To‘lovda xatolik:", err);
        }
    };

    if (loading) return <div className="text-white p-6">Yuklanmoqda...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl p-6 flex justify-between items-center">
                <h1 className="text-xl font-bold flex items-center">
                    <Clock size={20} className="mr-2" /> Dam olish turlari
                </h1>
                <Trophy size={28} className="text-yellow-400" />
            </div>

            {/* XP Card */}
            <div className="p-6">
                <div className="bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-900 rounded-3xl p-6 shadow-2xl mb-6 flex justify-between items-center">
                    <div className="text-white text-2xl font-bold flex items-center">
                        <Trophy className="mr-2 text-yellow-400" /> {totalXP} XP
                    </div>
                </div>

                {/* Dam olish turlari */}
                <div className="space-y-4">
                    {damTasks.map(task => (
                        <div
                            key={task.id}
                            className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900/95 rounded-3xl p-4 flex justify-between items-center hover:scale-105 transition-transform shadow-2xl cursor-pointer"
                            onClick={() => openModal(task)}
                        >
                            <div>
                                <h3 className="text-lg font-semibold">{task.type}</h3>
                                <p className="text-gray-300 text-sm">
                                    Narx: {task.price || 1000} so‘m / XP: {task.xp || 1}
                                </p>
                            </div>
                            <img src={task.image} alt={task.type} className="w-20 h-20 object-cover rounded-2xl shadow-lg" />
                        </div>
                    ))}
                </div>

                {/* Tarix */}
                <div className="mt-12">
                    <h3 className="text-xl font-bold mb-4">Bajarilgan Dam olish tarixi</h3>
                    {damHistory.length === 0 ? (
                        <p className="text-gray-400">Hali hech narsa bajarilmadi</p>
                    ) : (
                        <div className="space-y-3">
                            {damHistory.map((task, index) => (
                                <div key={index} className="bg-gray-900/80 rounded-2xl p-4 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold">{task.type}</h4>
                                        <p className="text-gray-400 text-sm">{task.date || "—"} / {task.time || "—"}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-yellow-400 font-semibold">{task.xp || 1} XP</p>
                                        <Trophy className="text-yellow-400" size={20} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedTask && (
                <Modal
                    isOpen={modalOpen}
                    onRequestClose={() => setModalOpen(false)}
                    className="bg-gray-900 rounded-3xl p-6 text-white shadow-2xl absolute bottom-0 w-full max-w-md mx-auto h-[70vh] overflow-y-auto transform transition-transform"
                    overlayClassName="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
                >
                    <button
                        onClick={() => setModalOpen(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                    >
                        <X size={24} />
                    </button>

                    {/* Bank Card Image */}
                    <div className="relative w-full h-40 mb-6 rounded-2xl overflow-hidden shadow-xl">
                        <img src={"/card.png"} alt="Card" className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 w-full bg-black/50 p-3">
                            <p className="text-white font-bold text-lg">{selectedTask.type}</p>
                        </div>
                    </div>

                    {/* Hours & Minutes Slider */}
                    <div className="mb-4 space-y-2">
                        <label className="block font-semibold">Soat: {hours}h {minutes}m</label>
                        <input
                            type="range"
                            min={0}
                            max={MAX_HOURS * 60}
                            value={hours * 60 + minutes}
                            onChange={e => {
                                const totalMinutes = Number(e.target.value);
                                setHours(Math.floor(totalMinutes / 60));
                                setMinutes(totalMinutes % 60);
                                calculatePriceXP(totalMinutes / 60);
                            }}
                            className="w-full accent-purple-600"
                        />
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>0h 0m</span>
                            <span>{MAX_HOURS}h 0m</span>
                        </div>
                    </div>

                    {/* Price & XP */}
                    <div className="flex justify-between items-center bg-gray-800/70 rounded-xl p-4 mb-4">
                        <div>
                            <p className="text-gray-300 text-sm">Narx</p>
                            <p className="text-white font-bold">{price} so‘m</p>
                        </div>
                        <div>
                            <p className="text-gray-300 text-sm">XP</p>
                            <p className="text-white font-bold">{xp}</p>
                        </div>
                    </div>

                    {/* Pay Button */}
                    <button
                        onClick={payTask}
                        className="w-full bg-green-500 hover:bg-green-600 p-3 rounded-2xl font-bold shadow-lg transition-all"
                    >
                        To‘ladi
                    </button>
                </Modal>
            )}
        </div>
    );
};

export default DamOlishPage;
