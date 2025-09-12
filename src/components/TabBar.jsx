"use client";

import React from "react";
import {
    Home,
    BookOpen,
    Dumbbell,
    Briefcase,
    Rocket,
    Brain,
    FileText,
    Gamepad2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";


const TabBar = () => {
    const router = useRouter();
    const pathname = usePathname();


    const tabs = [
        { path: "/", icon: Home, label: "Xply", color: "from-blue-400 to-cyan-400" },
        { path: "/namaz", icon: BookOpen, label: "Namoz", color: "from-emerald-400 to-green-400" },
        { path: "/gym", icon: Dumbbell, label: "Gym", color: "from-lime-400 to-teal-400" },
        { path: "/work", icon: Briefcase, label: "Ish", color: "from-purple-400 to-indigo-400" },
        { path: "/rest", icon: Gamepad2, label: "Dam", color: "from-pink-400 to-rose-400" },
        { path: "/categories/learning", icon: Brain, label: "O‘rganish", color: "from-orange-400 to-yellow-400" },
        { path: "/reports", icon: FileText, label: "Hisobot", color: "from-yellow-400 to-amber-400" },
    ];


    return (
        <div className="fixed bottom-0 left-0 right-0 
      bg-gradient-to-t from-gray-900 via-gray-900/95 to-gray-800/80 
      backdrop-blur-xl border-t border-gray-700 z-50 shadow-2xl">

            <div className="flex justify-around items-center py-3 px-3 max-w-lg mx-auto">
                {tabs.map(({ path, icon: Icon, label, color }) => {
                    const isActive = pathname === path;
                    return (
                        <button
                            key={path}
                            onClick={() => router.push(path)}
                            className={`flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-300
                ${isActive
                                    ? `text-white shadow-[0_0_12px_rgba(255,255,255,0.6)]`
                                    : "text-gray-400 hover:text-gray-200"}`}
                        >
                            <div
                                className={`p-2 rounded-xl transition-all duration-500 
                  ${isActive
                                        ? `bg-gradient-to-br ${color} shadow-[0_0_15px_rgba(255,255,255,0.7)] scale-110`
                                        : "bg-gray-800/70"}`}
                            >
                                <Icon size={24} />
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium tracking-wide">
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TabBar;
