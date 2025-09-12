"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

const CustomSelect = ({ options, selected, onChange, label }) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && <span className="text-sm text-gray-400">{label}</span>}

            <div className="relative w-full">
                <select
                    value={selected}
                    onChange={(e) => onChange(e.target.value)}
                    className="
            appearance-none w-full rounded-xl bg-gradient-to-br from-gray-800 to-gray-900
            text-white text-sm px-4 py-3 pr-10
            border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500
            transition-all duration-200
            cursor-pointer
          "
                >
                    {options.map((opt, idx) => (
                        <option key={idx} value={opt.value} className="bg-gray-900">
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* Chevron Icon */}
                <ChevronDown className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
        </div>
    );
};

export default CustomSelect;
