'use client'

import { useEffect, useState } from "react";
import { ResponsiveContainer } from "recharts";
import { Loader2 } from 'lucide-react';

type LangProps = {
    lang: string;
    bytes: number;
};

interface StatsProps {
    total_bytes: number;
    langs: LangProps[];
}

const COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042",
    "#8dd1e1", "#a4de6c", "#d0ed57", "#ffbb28", "#ff6666"
];

export default function Dashboard() {
    const [stats, setStats] = useState<StatsProps | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`/api`);
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const getPercentageData = () => {
        if (!stats) return [];
        return stats.langs.map(lang => ({
            name: lang.lang,
            value: (lang.bytes / stats.total_bytes) * 100
        }));
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-4 font-sans">
            {loading ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
                    </div>
                    <p className="text-xl font-light text-gray-300 animate-pulse">Analisando seus códigos...</p>
                </div>
            ) : stats ? (
                <div className="w-full max-w-2xl space-y-6">
                    <h1 className="text-2xl font-light text-center text-gray-200 tracking-wide">
                        Most Used Languages
                    </h1>


                    <div className="bg-gray-800 rounded-xl shadow-lg p-4">
                        <ResponsiveContainer width="100%" height={100}>
                            
                           <>
                            <div className="bg-gray-700 rounded-full overflow-hidden h-5 w-full shadow-inner flex">
                                    {getPercentageData()
                                        .sort((a, b) => b.value - a.value)
                                        .map((lang, index) => (
                                            <div
                                                key={index}
                                                title={`${lang.name}: ${lang.value.toFixed(2)}%`}
                                                style={{
                                                    width: `${lang.value}%`,
                                                    backgroundColor: COLORS[index % COLORS.length],
                                                }}
                                                className="h-full"
                                            />
                                        ))}
                                </div>

                                {/* Legenda */}
                                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                                    {getPercentageData()
                                        .sort((a, b) => b.value - a.value)
                                        .map((lang, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                />
                                                <span className="text-sm text-gray-300">{lang.name}</span>
                                                <span className="text-sm text-blue-400 font-medium">
                                                    {lang.value.toFixed(1)}%
                                                </span>
                                            </div>
                                        ))}
                                </div>
                           </>
                        </ResponsiveContainer>
                    </div>

                </div>
            ) : (
                <p className="text-gray-400">Nenhum dado encontrado.</p>
            )}
        </div>
    );
}