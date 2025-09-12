"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

const MusicModal = ({ song, onClose }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - offset.x,
            y: e.clientY - offset.y,
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={(e) => {
                if (!isDragging) return;
                const touch = e.touches[0];
                setPosition({
                    x: touch.clientX - offset.x,
                    y: touch.clientY - offset.y,
                });
            }}
            onTouchEnd={handleMouseUp}
        >
            <div
                className="bg-[#1e293b] text-white rounded-xl shadow-lg w-[300px] md:w-[400px] p-4 cursor-move"
                style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
                onMouseDown={handleMouseDown}
                onTouchStart={(e) => {
                    setIsDragging(true);
                    const touch = e.touches[0];
                    setOffset({
                        x: touch.clientX - position.x,
                        y: touch.clientY - position.y,
                    });
                }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg">{song.title}</h2>
                    <button onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Artist */}
                <p className="text-sm text-gray-300 mb-4">{song.artist}</p>

                {/* YouTube iframe */}
                <div className="relative pb-[56.25%] h-0">
                    <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${song.videoId}?autoplay=1&controls=1&mute=0&playsinline=1`}
                        title={song.title}
                        allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
};

export default MusicModal;
