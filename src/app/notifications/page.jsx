"use client";
import { useEffect, useState } from "react";
import { MoreVertical, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";

export default function NotificationsPage() {
    const [requests, setRequests] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [openItem, setOpenItem] = useState(null); // ochilgan item ID

    useEffect(() => {
        fetch("https://2921e26836d273ac.mokky.dev/notifications")
            .then((res) => res.json())
            .then(setRequests);
    }, []);

    const approveDevice = async (deviceId, notifId) => {
        await fetch("https://2921e26836d273ac.mokky.dev/devices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deviceId, approved: true }),
        });

        await fetch(
            `https://2921e26836d273ac.mokky.dev/notifications/${notifId}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "approved" }),
            }
        );

        setRequests((prev) =>
            prev.map((req) =>
                req.id === notifId ? { ...req, status: "approved" } : req
            )
        );
    };

    const rejectDevice = async (notifId) => {
        await fetch(
            `https://2921e26836d273ac.mokky.dev/notifications/${notifId}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "rejected" }),
            }
        );

        setRequests((prev) =>
            prev.map((req) =>
                req.id === notifId ? { ...req, status: "rejected" } : req
            )
        );
        setDropdownOpen(null);
    };

    const deleteNotification = async (notifId) => {
        await fetch(`https://2921e26836d273ac.mokky.dev/notifications/${notifId}`, {
            method: "DELETE",
        });

        setRequests((prev) => prev.filter((req) => req.id !== notifId));
        setDropdownOpen(null);
    };

    const toggleDropdown = (notifId) => {
        setDropdownOpen(dropdownOpen === notifId ? null : notifId);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString || Date.now());
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        if (isToday) {
            return date.toLocaleTimeString("uz-UZ", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } else {
            return date.toLocaleDateString("uz-UZ", {
                month: "2-digit",
                day: "2-digit",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                        </div>
                    </div>
                    <h1 className="text-lg sm:text-xl font-semibold">Xabarlar</h1>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Stats Card */}
                <div className="bg-green-500 rounded-2xl p-4 sm:p-6 mb-6 text-start sm:text-left">
                    <div className="text-white text-2xl sm:text-3xl font-bold mb-1">
                        {requests.length} ta xabar
                    </div>
                    <div className="text-green-100 text-sm">Jami barcha xabarlar</div>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-gray-800 rounded-2xl">
                            {/* Main Row */}
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer"
                                onClick={() => setOpenItem(openItem === req.id ? null : req.id)}
                            >
                                <div>
                                    <h3 className="font-medium text-sm sm:text-base text-white">
                                        Qurilma ulash so'rovi
                                    </h3>
                                    <p className="text-gray-400 text-xs sm:text-sm">
                                        {formatDate(req.createdAt)} · {req.deviceName || "Unknown Device"}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {req.status === "approved" && (
                                        <span className="flex items-center gap-1 text-green-400 text-xs sm:text-sm font-medium">
                                            <CheckCircle className="w-4 h-4" /> Tasdiqlangan
                                        </span>
                                    )}
                                    {req.status === "pending" && (
                                        <span className="flex items-center gap-1 text-yellow-400 text-xs sm:text-sm font-medium">
                                            <Clock className="w-4 h-4" /> Kutilmoqda
                                        </span>
                                    )}
                                    {req.status === "rejected" && (
                                        <span className="flex items-center gap-1 text-red-400 text-xs sm:text-sm font-medium">
                                            <XCircle className="w-4 h-4" /> Bekor qilingan
                                        </span>
                                    )}

                                    {/* Dot menu */}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleDropdown(req.id);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors"
                                        >
                                            <MoreVertical className="w-4 h-4 text-gray-400" />
                                        </button>

                                        {dropdownOpen === req.id && (
                                            <div className="absolute right-0 top-full mt-1 bg-gray-800 rounded-lg border border-gray-700 shadow-lg z-10 min-w-[140px]">
                                                {req.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => approveDevice(req.deviceId, req.id)}
                                                            className="w-full px-4 py-2 text-left text-green-400 hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm"
                                                        >
                                                            ✅ Tasdiqlash
                                                        </button>
                                                        <button
                                                            onClick={() => rejectDevice(req.id)}
                                                            className="w-full px-4 py-2 text-left text-yellow-400 hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm"
                                                        >
                                                            ❌ Bekor qilish
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(req.id)}
                                                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    O'chirish
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Expand Section */}
                            {openItem === req.id && (
                                <div className="px-4 pb-4 text-sm text-gray-300 border-t border-gray-700">
                                    <p>
                                        <span className="text-gray-400">Device ID:</span> {req.deviceId}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {dropdownOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setDropdownOpen(null)}
                ></div>
            )}
        </div>
    );
}
