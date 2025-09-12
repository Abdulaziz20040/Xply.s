"use client";
import { useEffect, useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";

export default function DevicesPage() {
    const [devices, setDevices] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(null);

    useEffect(() => {
        fetch("https://2921e26836d273ac.mokky.dev/devices")
            .then((res) => res.json())
            .then(setDevices);
    }, []);

    const deleteDevice = async (deviceId) => {
        await fetch(`https://2921e26836d273ac.mokky.dev/devices/${deviceId}`, {
            method: "DELETE",
        });

        setDevices((prev) => prev.filter((device) => device.id !== deviceId));
        setDropdownOpen(null);
    };

    const toggleDropdown = (id) => {
        setDropdownOpen(dropdownOpen === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-2xl font-bold mb-6">Devices</h1>

            <div className="space-y-3">
                {devices.map((device) => (
                    <div key={device.id} className="bg-gray-800 rounded-2xl flex items-center justify-between p-4">
                        <div>
                            <h3 className="font-medium text-white">{device.name || "Unknown Device"}</h3>
                            <p className="text-gray-400 text-sm">Device ID: {device.deviceId}</p>
                            <p className={`text-sm mt-1 ${device.approved ? "text-green-400" : "text-red-400"}`}>
                                {device.approved ? "Tasdiqlangan" : "Tasdiqlanmagan"}
                            </p>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => toggleDropdown(device.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors"
                            >
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>

                            {dropdownOpen === device.id && (
                                <div className="absolute right-0 top-full mt-1 bg-gray-800 rounded-lg border border-gray-700 shadow-lg z-10 min-w-[120px]">
                                    <button
                                        onClick={() => deleteDevice(device.id)}
                                        className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
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
