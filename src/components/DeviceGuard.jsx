"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "../utils/device";
import { Loader2 } from "lucide-react";
import "../app/globals.css"

export default function DeviceGuard({ children }) {
    const [allowed, setAllowed] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [requestStatus, setRequestStatus] = useState(null);
    const [requestTime, setRequestTime] = useState(null);
    const [attempts, setAttempts] = useState(0);
    const [lastRejectedAt, setLastRejectedAt] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkDevice = async () => {
            const id = await getDeviceId();
            setDeviceId(id);

            try {
                const res = await fetch(
                    `https://2921e26836d273ac.mokky.dev/devices?deviceId=${id}`
                );
                const data = await res.json();

                if (data.length && data[0].approved) {
                    setAllowed(true);
                } else {
                    setAllowed(false);

                    const notifRes = await fetch(
                        `https://2921e26836d273ac.mokky.dev/notifications?deviceId=${id}`
                    );
                    const notifData = await notifRes.json();
                    if (notifData.length) {
                        const notif = notifData[0];
                        setRequestStatus(notif.status);
                        setRequestTime(new Date(notif.createdAt));
                        setAttempts(notif.attempts || 0);
                        setLastRejectedAt(notif.lastRejectedAt || null);
                    }
                }
            } catch (err) {
                console.error("Device check error:", err);
                setAllowed(false);
            }
        };

        checkDevice();
    }, []);

    function getDeviceName() {
        const ua = navigator.userAgent;
        const androidMatch = ua.match(/\((?:Linux; Android [^;]+; )([^;]+)\)/i);
        if (androidMatch && androidMatch[1]) return androidMatch[1].trim();
        if (/iPhone/i.test(ua)) return "iPhone";
        if (/iPad/i.test(ua)) return "iPad";
        if (/Windows/i.test(ua)) return "Windows PC";
        if (/Macintosh/i.test(ua)) return "Mac";
        return "Unknown Device";
    }

    const requestAccess = async () => {
        try {
            const now = new Date();
            const deviceName = getDeviceName();

            await fetch("https://2921e26836d273ac.mokky.dev/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    deviceId,
                    deviceName,
                    message: "Yangi qurilma ruxsat so'ramoqda",
                    status: "pending",
                    createdAt: now.toISOString(),
                    date: now.toLocaleDateString("uz-UZ"),
                    time: now.toLocaleTimeString("uz-UZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    attempts,
                }),
            });

            setRequestStatus("pending");
            setRequestTime(now);
        } catch (err) {
            console.error("Error sending request:", err);
        }
    };

    const checkStatus = async () => {
        try {
            setLoading(true);
            const res = await fetch(
                `https://2921e26836d273ac.mokky.dev/notifications?deviceId=${deviceId}`
            );
            const data = await res.json();
            if (data.length) {
                const notif = data[0];
                setRequestStatus(notif.status);
                setAttempts(notif.attempts || 0);
                setLastRejectedAt(notif.lastRejectedAt || null);

                if (notif.status === "approved") {
                    setAllowed(true);
                }
            }
        } catch (err) {
            console.error("Error checking status:", err);
        } finally {
            setLoading(false);
        }
    };

    const oneHourPassed =
        requestTime && new Date() - new Date(requestTime) > 3600 * 1000;
    const oneDayPassed =
        lastRejectedAt && new Date() - new Date(lastRejectedAt) > 24 * 3600 * 1000;

    const isBlocked = attempts >= 3 && !oneDayPassed;

    if (allowed === null) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-emerald-400 flex-col space-y-2 overflow-hidden">
                <div className="w-8 h-8 border-4 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin"></div>
                <p className="text-emerald-300">Qurilma tekshirilmoqda...</p>
            </div>
        );
    }

    if (!allowed) {
        return (
            <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-900 via-emerald-900/20 to-gray-900 flex items-center justify-center px-4">

                {/* Main Card */}
                <div className="relative max-w-md w-full rounded-3xl">
                    {/* Content */}
                    <div className="relative z-10 p-6 text-center space-y-6">
                        {/* Anime Image */}
                        <div className="flex justify-center">
                            <div className="relative group perspective-1000">
                                {/* Glow Background */}
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>

                                {/* Character Image */}
                                <img
                                    src="/hikari.png"
                                    alt="Character"
                                    className="relative w-28 h-28 rounded-2xl shadow-2xl border-2 border-emerald-500/30 
                 transform transition-transform duration-500
                 group-hover:rotate-y-6 group-hover:-rotate-x-3 group-hover:scale-110
                 animate-floating"
                                />
                            </div>
                        </div>


                        {/* Warning Icon & Title */}
                        <div className="space-y-3">
                            <h1 className="text-2xl font-bold text-white">
                                Qurilmangiz hali tasdiqlanmagan
                            </h1>

                            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                                <p className="text-emerald-300 text-sm font-medium">
                                    "Senpai tasdiqlashi kerak nya~"
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                    Iltimos biroz sabr qiling...
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {deviceId && (
                            <div className="space-y-4">
                                {!isBlocked ? (
                                    <button
                                        onClick={
                                            requestStatus === "pending"
                                                ? async () => {
                                                    setLoading(true);
                                                    await checkStatus();
                                                    setLoading(false);
                                                    window.location.reload();
                                                }
                                                : requestAccess
                                        }
                                        disabled={
                                            loading || (requestStatus === "rejected" && !oneHourPassed)
                                        }
                                        className={`w-full px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${requestStatus === "pending"
                                            ? "bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300"
                                            : requestStatus === "rejected"
                                                ? oneHourPassed
                                                    ? "bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300"
                                                    : "bg-red-500/20 border border-red-400/30 text-red-300 cursor-not-allowed"
                                                : "bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300"
                                            }`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Tekshirish...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-lg">
                                                    {requestStatus === "pending"
                                                        ? "🔄"
                                                        : requestStatus === "rejected"
                                                            ? oneHourPassed
                                                                ? "📬"
                                                                : "❌"
                                                            : "📬"}
                                                </span>
                                                <span>
                                                    {requestStatus === "pending"
                                                        ? "Javobni tekshirish"
                                                        : requestStatus === "rejected"
                                                            ? oneHourPassed
                                                                ? "Ruxsat so'rash"
                                                                : "So'rov bekor qilindi"
                                                            : "Ruxsat so'rash"}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="bg-red-500/10 border border-red-400/30 rounded-2xl p-4">
                                        <div className="text-red-400 font-semibold text-lg flex items-center justify-center space-x-2">
                                            <span>🔒</span>
                                            <span>1 kunga bloklandi</span>
                                        </div>
                                    </div>
                                )}

                                {/* Status Messages */}
                                {requestStatus === "pending" && !loading && (
                                    <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-3">
                                        <p className="text-yellow-300 text-sm">
                                            ⏳ So'rov yuborildi, javobni kutmoqda...
                                        </p>
                                    </div>
                                )}

                                {requestStatus === "rejected" && !oneHourPassed && (
                                    <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-3">
                                        <p className="text-red-300 text-sm">
                                            💔 So'rov rad etildi. 1 soatdan keyin qayta urining.
                                        </p>
                                    </div>
                                )}

                                {isBlocked && !oneDayPassed && (
                                    <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-3">
                                        <p className="text-red-300 text-sm">
                                            ⛔ Ertaga qayta urinib ko'ring.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                        <div className="bg-gray-800/90 rounded-2xl p-6 border border-emerald-500/20">
                            <div className="flex items-center space-x-3">
                                <Loader2 className="animate-spin text-emerald-400" size={24} />
                                <span className="text-emerald-300">Tekshirilmoqda...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return children;
}
