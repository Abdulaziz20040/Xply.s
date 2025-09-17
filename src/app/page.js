"use client";

import React, { useEffect, useState } from "react";
import {
  Swords,
  Scroll,
  Store,
  EyeOff,
  Heart,
  Droplet,
} from "lucide-react";
import { motion } from "framer-motion";
import TabBar from "../components/TabBar";
import { FcMoneyTransfer } from "react-icons/fc";

const MobileHomePage = () => {
  const [showGold, setShowGold] = useState(true);
  const [hero, setHero] = useState({
    name: "",
    title: "",
    level: 1,
    xp: 0,
    xpNeeded: 100,
    gold: 0,
    hp: 100,
    mana: 100,
    energy: 100,
    streak: 1,
    lastLogin: null,
  });
  const [todayStats, setTodayStats] = useState({ xp: 0, totalXP: 0 });
  const [allQuests, setAllQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const quickActions = [
    { icon: Swords, label: "Inventar", color: "bg-red-500" },
    { icon: Scroll, label: "Topshiriqlar", color: "bg-blue-500" },
    { icon: FcMoneyTransfer, label: "Moliya", color: "bg-green-500" },
    { icon: Store, label: "Do'kon", color: "bg-yellow-500" },
  ];

  // XP oshganida level up qiluvchi funksiya
  const checkLevelUp = (currentXP, currentLevel) => {
    let xp = currentXP;
    let level = currentLevel;
    let xpNeeded = 100 + (level - 1) * 50;
    while (xp >= xpNeeded) {
      xp -= xpNeeded;
      level += 1;
      xpNeeded = 100 + (level - 1) * 50;
    }
    return { xp, level, xpNeeded };
  };

  // Fisher-Yates shuffle (aralashtirish)
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [statusRes, namozRes, gymRes, ishRes, damRes] = await Promise.all([
        fetch("https://59159b0f4ee6c5cb.mokky.dev/status"),
        fetch("https://59159b0f4ee6c5cb.mokky.dev/Namoz"),
        fetch("https://59159b0f4ee6c5cb.mokky.dev/Gym"),
        fetch("https://59159b0f4ee6c5cb.mokky.dev/Ishlar"),
        fetch("https://59159b0f4ee6c5cb.mokky.dev/dam_trix"),
      ]);

      const [statusData, namozData, gymData, ishData, damData] =
        await Promise.all([
          statusRes.json(),
          namozRes.json(),
          gymRes.json(),
          ishRes.json(),
          damRes.json(),
        ]);

      let updatedHero = {
        name: statusData.name || "Senpai",
        title: statusData.title || "Silver Hunter",
        level: statusData.level || 1,
        xp: statusData.xp || 0,
        xpNeeded: statusData.xpNeeded || 100,
        gold: statusData.gold || 0,
        hp: statusData.hp || 100,
        mana: statusData.mana || 100,
        energy: statusData.energy || 100,
        streak: statusData.streak || 0,
        lastLogin: statusData.lastLogin || null,
      };

      const today = new Date().toISOString().split("T")[0];

      // seriya hisoblash
      let lastLoginDate = null;
      if (updatedHero.lastLogin) {
        lastLoginDate = new Date(updatedHero.lastLogin);
        lastLoginDate.setHours(0, 0, 0, 0);
      }
      if (!lastLoginDate) {
        updatedHero.streak = 1;
        updatedHero.lastLogin = new Date().toISOString();
      } else if (lastLoginDate.getTime() < new Date(today).getTime()) {
        updatedHero.streak += 1;
        updatedHero.lastLogin = new Date().toISOString();
      }

      let totalXP = 0;
      let todayXP = 0;
      let totalGold = 0;
      const quests = [];

      const processData = (data, getTitle, getStatus) => {
        data.forEach((item) => {
          const xp = item.xp || 0;
          totalXP += xp;
          if (item.completedDate && item.completedDate.startsWith(today)) {
            todayXP += xp;
          }
          quests.push({
            id: item.id,
            title: getTitle(item),
            status: getStatus(item),
            reward: `${xp >= 0 ? "+" : ""}${xp} XP${item.price ? `, +${item.price} 💰` : ""
              }`,
            date: item.completedDate || new Date().toISOString(),
          });
        });
      };

      processData(namozData, (item) => item.title, () => "Jarayonda");
      processData(gymData, (item) => item.title, () => "Jarayonda");
      processData(ishData, (item) => item.name, (item) =>
        item.completed ? "Bajarildi" : "Jarayonda"
      );
      processData(damData, (item) => item.type, () => "Bajarildi");

      const leveled = checkLevelUp(totalXP + updatedHero.xp, updatedHero.level);
      updatedHero = {
        ...updatedHero,
        xp: leveled.xp,
        level: leveled.level,
        xpNeeded: leveled.xpNeeded,
        gold: updatedHero.gold + totalGold,
      };

      await fetch("https://59159b0f4ee6c5cb.mokky.dev/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedHero),
      });

      // 📌 eng oxirgi questni tepaga chiqarish
      const sortedQuests = quests.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      const lastQuest = sortedQuests[0];
      const otherQuests = shuffleArray(sortedQuests.slice(1));

      setAllQuests([lastQuest, ...otherQuests]);

      // 📌 bugungi XP va barcha XP
      setTodayStats({
        xp: `${todayXP >= 0 ? "+" : ""}${todayXP}`,
        totalXP: totalXP,
      });

      setHero(updatedHero);
    } catch (error) {
      console.error("API xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return <div className="text-white p-6 text-center">Yuklanmoqda...</div>;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-indigo-900/80 via-purple-900/70 to-indigo-900/80 backdrop-blur-md border-b border-indigo-700/40 shadow-md">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-md border border-indigo-400/50">
              <span className="font-bold text-yellow-300">
                {hero.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-indigo-100">{hero.name}</h1>
              <p className="text-xs text-indigo-400">{hero.title}</p>
            </div>
          </div>
          <button
            onClick={() => setShowGold(!showGold)}
            className="px-3 py-2 bg-yellow-400/20 rounded-xl hover:bg-yellow-400/30 transition"
          >
            {showGold ? (
              <span className="font-bold text-yellow-300">
                {hero.gold} 💰
              </span>
            ) : (
              <EyeOff size={18} className="text-yellow-200" />
            )}
          </button>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 pb-28 overflow-y-auto">
        {/* Hero Status Card */}
        <div className="p-4 sm:p-6 max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-indigo-800 via-purple-800 to-indigo-900 rounded-3xl p-6 shadow-[0_0_20px_rgba(99,102,241,0.6)] border border-indigo-500/40 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-600/30 rounded-full blur-2xl" />
            <div className="mb-3 text-center">
              <h2 className="text-lg font-bold text-indigo-100">
                Level {hero.level}
              </h2>
              <p className="text-xs text-indigo-400">
                {hero.streak} kunlik seriya 🔥
              </p>
            </div>

            <div className="w-full h-3 bg-indigo-900/60 rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(hero.xp / hero.xpNeeded) * 100}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
              />
            </div>
            <p className="text-xs text-indigo-200 text-center mb-4">
              {hero.xp} / {hero.xpNeeded} XP —{" "}
              {Math.round((hero.xp / hero.xpNeeded) * 100)}% to next level
            </p>

            <div className="flex justify-around">
              <div className="flex items-center space-x-2">
                <Heart size={18} className="text-red-400" />
                <span>{hero.hp}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Droplet size={18} className="text-blue-400" />
                <span>{hero.mana}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-bold">⚡</span>
                <span>{hero.energy}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bugungi statistika */}
        <div className="px-4 sm:px-6 m-4 max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-indigo-800 via-purple-800 to-indigo-900 rounded-2xl p-4 flex justify-around items-center border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <div className="text-center">
              <p className="text-xs text-indigo-300">Bugungi XP</p>
              <p className="text-yellow-300 font-bold">{todayStats.xp}</p>
            </div>
            <div className="w-px h-8 bg-indigo-600/40"></div>
            <div className="text-center">
              <p className="text-xs text-indigo-300">Barcha XP</p>
              <p className="text-green-300 font-bold">{todayStats.totalXP}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 sm:px-6 mb-6 max-w-lg mx-auto">
          <h3 className="text-base sm:text-lg font-bold mb-4 text-indigo-200 flex items-center">
            ⚔️ O‘yin menyusi
          </h3>
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  className="flex flex-col items-center space-y-2 p-3 bg-gradient-to-br from-gray-900 to-indigo-900 rounded-2xl border border-indigo-500/30 hover:scale-105 transition transform duration-300"
                >
                  <div
                    className={`p-2 sm:p-3 ${action.color} rounded-xl shadow-lg`}
                  >
                    <IconComponent size={20} className="text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-indigo-100">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quest Log */}
        <div className="px-4 sm:px-6 mb-8 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-indigo-200">
              📜 Vazifalar tarixi
            </h3>
            <button className="text-yellow-400 text-xs sm:text-sm font-medium hover:text-yellow-300">
              Barchasi →
            </button>
          </div>
          <div className="space-y-3">
            {allQuests
              .filter((quest) => {
                const today = new Date();
                const yesterday = new Date();
                yesterday.setDate(today.getDate() - 1);

                const questDate = new Date(quest.date);
                const questDay = questDate.toISOString().split("T")[0];
                const todayStr = today.toISOString().split("T")[0];
                const yesterdayStr = yesterday.toISOString().split("T")[0];

                return questDay === todayStr || questDay === yesterdayStr;
              })
              .slice(0, 10) // faqat oxirgi 10 ta
              .map((quest) => (
                <div
                  key={quest.id}
                  className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-2xl p-4 border border-indigo-600/40 hover:bg-indigo-800/60"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm sm:text-base text-indigo-100">
                        {quest.title}
                      </h4>
                      <span className="text-xs text-indigo-400">
                        {quest.status}
                      </span>
                    </div>
                    <span className="text-yellow-300 font-bold text-sm">
                      {quest.reward}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* TabBar fixed */}
      <div className="fixed bottom-0 left-0 w-full z-50">
        <TabBar />
      </div>
    </div>
  );
};

export default MobileHomePage;
