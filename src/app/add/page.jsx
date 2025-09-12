"use client";
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
            <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
                <div className="flex items-center p-4">
                    <button onClick={() => router.back()} className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="ml-4 text-lg font-bold">Qo'shish</h1>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center flex-grow text-center p-6">
                <div className="text-6xl mb-4">➕</div>
                <h2 className="text-xl font-bold mb-2">Qo'shish sahifasi</h2>
                <p className="text-gray-400 text-sm">Bu sahifa hozircha ishlab chiqilmoqda...</p>
            </div>
        </div>
    );
}
