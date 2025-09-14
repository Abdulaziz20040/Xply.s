"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";

const DONE_API = "https://59159b0f4ee6c5cb.mokky.dev/Ishlar";

export default function TimePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const taskId = searchParams.get("id");
    const taskName = searchParams.get("name");

    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);

    // ⏳ LocalStorage'dan holatni yuklash
    useEffect(() => {
        const saved = localStorage.getItem("timerState");
        if (saved) {
            const { startTime, savedSeconds, isRunning } = JSON.parse(saved);
            if (startTime) {
                const now = Math.floor(Date.now() / 1000);
                const diff = now - startTime;
                setSeconds(savedSeconds + (isRunning ? diff : 0));
                setRunning(isRunning);
            } else {
                setSeconds(savedSeconds || 0);
            }
        }
    }, []);

    // ⏱ Interval ishga tushirish
    useEffect(() => {
        let interval;
        if (running) {
            interval = setInterval(() => {
                setSeconds((prev) => {
                    const newSec = prev + 1;
                    localStorage.setItem(
                        "timerState",
                        JSON.stringify({
                            startTime: Math.floor(Date.now() / 1000),
                            savedSeconds: newSec,
                            isRunning: true,
                        })
                    );
                    return newSec;
                });
            }, 1000);
        } else {
            localStorage.setItem(
                "timerState",
                JSON.stringify({
                    startTime: null,
                    savedSeconds: seconds,
                    isRunning: false,
                })
            );
        }
        return () => clearInterval(interval);
    }, [running]);

    const formatTime = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // 🪙 Har 2 minutga 1 XP
    const calculateXP = (sec) => Math.floor(sec / 120);

    const handleComplete = async () => {
        const xp = calculateXP(seconds);
        const today = new Date();

        const completedTask = {
            id: taskId,
            name: taskName,
            date: today.toISOString().split("T")[0],
            completed: true,
            createdDate: today.toISOString().split("T")[0],
            time: formatTime(seconds),
            xp,
            completedDate: today.toISOString().split("T")[0],
        };

        await fetch(DONE_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(completedTask),
        });

        localStorage.removeItem("timerState"); // tozalash
        router.push("/");
    };

    // 🔄 Reflesh qilish
    const handleRefresh = () => {
        setSeconds(0);
        setRunning(false);
        localStorage.removeItem("timerState");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center bg-black/40 border-b border-purple-800">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-purple-400 hover:text-white transition"
                >
                    <ArrowLeft size={22} className="mr-2" />
                    Orqaga
                </button>
            </div>

            {/* Timer UI */}
            <div className="flex-1 flex flex-col justify-center items-center text-center px-6">
                <h1 className="text-3xl font-extrabold mb-6 text-purple-300 drop-shadow-lg">
                    {taskName}
                </h1>
                <div className="text-6xl font-mono mb-4 text-yellow-400 neon">
                    {formatTime(seconds)}
                </div>
                <div className="text-2xl mb-8 text-green-400 font-bold">
                    XP: {calculateXP(seconds)}
                </div>

                {/* Buttons */}
                <div className="flex gap-4 flex-wrap justify-center">
                    {!running ? (
                        <button
                            onClick={() => setRunning(true)}
                            className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg shadow-green-500/50"
                        >
                            Boshlash
                        </button>
                    ) : (
                        <button
                            onClick={() => setRunning(false)}
                            className="px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-lg shadow-yellow-500/50"
                        >
                            Pauza
                        </button>
                    )}

                    <button
                        onClick={handleComplete}
                        className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/50"
                    >
                        Bajarildi
                    </button>

                    <button
                        onClick={handleRefresh}
                        className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-500/50 flex items-center"
                    >
                        <RotateCcw size={20} className="mr-2" />
                        Reflesh
                    </button>
                </div>
            </div>
        </div>
    );
}
