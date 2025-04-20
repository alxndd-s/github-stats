'use client'

import { useEffect, useState } from "react";
import { ResponsiveContainer } from "recharts";
import { Loader2 } from 'lucide-react';
import { WithContext as ReactTags, Tag, SEPARATORS } from 'react-tag-input';
import AlertPopup from "@/app/components/AlertPopup";

type LangProps = {
    lang: string;
    bytes: number;
};

interface StatsProps {
    total_bytes: number;
    langs: LangProps[];
}

interface RepoName {
    name: string;
    selected: boolean;
}

const COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042",
    "#8dd1e1", "#a4de6c", "#d0ed57", "#ffbb28", "#ff6666"
];


export default function Dashboard() {
    const [stats, setStats] = useState<StatsProps | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [tags, setTags] = useState<Tag[]>([]);
    const [repoNames, setRepoNames] = useState<RepoName[]>([]);
    const [showRepoList, setShowRepoList] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const fetchStats = async () => {
        setLoading(true);
        try {
            const ignoredRepos = tags.map(tag => tag.text).join(',');
            const url = `/api/size?ignore=${encodeURIComponent(ignoredRepos)}`;
            
            const response = await fetch(url);
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchNames = async () => {
            try {
                const url = `/api/name`;
                const response = await fetch(url);
                const data = await response.json();
                setRepoNames(data.map((name: string) => ({ name, selected: false })));
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchNames();
    }, []);

    useEffect(() => {

        const selectedRepos = repoNames.filter(repo => repo.selected);
        setTags(
            selectedRepos.map(repo => ({
              id: repo.name,
              text: repo.name,
              className: ''
            }))
          );
    }, [repoNames]);

    const handleDelete = (i: number) => {
        const tagToRemove = tags[i].text;
        setRepoNames(repoNames.map(repo => 
            repo.name === tagToRemove ? { ...repo, selected: false } : repo
        ));
    };

    const handleAddition = (tag: Tag) => {
        const repoExists = repoNames.some(repo => repo.name === tag.text);
    
        if (!repoExists) {
            setAlertMessage(`Não possui um repositório com nome '${tag.text}' nos seus repositórios.'`);
            setShowAlert(true);
            return;
        }
    
        setRepoNames(repoNames.map(repo => 
            repo.name === tag.text ? { ...repo, selected: true } : repo
        ));
    };

    const handleDrag = (tag: Tag, currPos: number, newPos: number) => {
        const newTags = tags.slice();
        newTags.splice(currPos, 1);
        newTags.splice(newPos, 0, { ...tag, className: 'tag-padrao' });
        setTags(newTags);
    };

    const toggleRepoSelection = (repoName: string) => {
        setRepoNames(repoNames.map(repo => 
            repo.name === repoName ? { ...repo, selected: !repo.selected } : repo
        ));
    };

    const selectAllRepos = () => {
        setRepoNames(repoNames.map(repo => ({ ...repo, selected: true })));
    };

    const deselectAllRepos = () => {
        setRepoNames(repoNames.map(repo => ({ ...repo, selected: false })));
    };

    const getPercentageData = () => {
        if (!stats) return [];
        return stats.langs.map(lang => ({
            name: lang.lang,
            value: (lang.bytes / stats.total_bytes) * 100
        }));
    };

    const InitialLoadingIndicator = () => (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-purple-500 animate-spin h-16 w-16"></div>
                <Loader2 className="h-16 w-16 animate-spin text-purple-400/30" />
            </div>
            <p className="text-xl font-light text-gray-300 animate-pulse">Buscando repositórios...</p>
            <p className="text-sm text-gray-500 max-w-md text-center">
                Carregando lista de repositórios disponíveis
            </p>
        </div>
    );

    const AnalysisLoadingIndicator = () => (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin h-16 w-16"></div>
                <Loader2 className="h-16 w-16 animate-spin text-blue-400/30" />
            </div>
            <p className="text-xl font-light text-gray-300 animate-pulse">Analisando seus códigos...</p>
            <p className="text-sm text-gray-500 max-w-md text-center">
                Isso pode levar alguns segundos dependendo do número de repositórios
            </p>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950 p-4 font-sans">
            {initialLoading ? (
                <InitialLoadingIndicator />
            ) : !stats && !loading ? (
                <div className="w-full max-w-6xl space-y-6 bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-800/50 hover:border-gray-700/70 transition-all duration-300">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-wide mb-2">
                            GitHub Language Analyzer
                        </h1>
                        <p className="text-gray-400 text-sm">Descubra as linguagens mais usadas nos seus repositórios</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-300">
                                Repositórios para ignorar
                                <span className="text-xs text-gray-500 ml-1">(opcional)</span>
                            </label>
                            
                            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 hover:border-gray-600/70 transition-all duration-200">
                                <ReactTags
                                    tags={tags}
                                    handleDelete={handleDelete}
                                    handleAddition={handleAddition}
                                    handleDrag={handleDrag}
                                    separators={[SEPARATORS.ENTER, SEPARATORS.COMMA,SEPARATORS.TAB]}
                                    inputFieldPosition="bottom"
                                    autocomplete
                                    placeholder="Digite e pressione Enter"
                                    classNames={{
                                        tags: 'tags-container space-y-3',
                                        tagInput: 'tag-input w-full',
                                        tag: 'tag bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-full flex items-center text-sm shadow-md',
                                        remove: 'tag-remove ml-2 cursor-pointer text-xs hover:text-red-300 transition-colors',
                                        tagInputField: 'w-full px-4 py-3 bg-gray-800/30 border border-gray-700/30 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent placeholder-gray-500 text-sm',
                                        selected: 'selected-tags flex flex-wrap gap-2.5 mt-3',
                                        suggestions: 'suggestions bg-gray-800 border border-gray-700 rounded-lg mt-2 shadow-lg py-1 z-20',
                                        activeSuggestion: 'active-suggestion bg-gradient-to-r from-blue-600 to-indigo-700 text-white',
                                    }}
                                />
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => setShowRepoList(!showRepoList)}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                >
                                    {showRepoList ? 'Ocultar lista' : 'Mostrar lista de repositórios'}
                                </button>
                                
                                {showRepoList && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={selectAllRepos}
                                            className="text-xs text-green-400 hover:text-green-300 transition-colors cursor-pointer"
                                        >
                                            Selecionar todos
                                        </button>
                                        <button
                                            onClick={deselectAllRepos}
                                            className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                        >
                                            Remover todos
                                        </button>
                                    </div>
                                )}
                            </div>

                            {showRepoList && (
                                <div className="max-h-60 overflow-y-auto bg-gray-800/30 rounded-lg p-2 border border-gray-700/50 mt-2">
                                    {repoNames.map((repo) => (
                                        <div 
                                            key={repo.name} 
                                            className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-700/50 transition-colors ${repo.selected ? 'bg-gray-700/70' : ''}`}
                                            onClick={() => toggleRepoSelection(repo.name)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={repo.selected}
                                                onChange={() => toggleRepoSelection(repo.name)}
                                                className="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <span className="text-sm text-gray-200 truncate">{repo.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-xs text-gray-500 mt-1.5">Separe múltiplos repositórios com vírgula</p>
                        </div>

                        <button
                            onClick={fetchStats}
                            disabled={loading}
                            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-blue-500/20 disabled:opacity-70 group cursor-pointer"
                        >
                            {loading && <Loader2 className="h-5 w-5 animate-spin mr-2" /> }
                            Analisar Repositórios
                        </button>
                    </div>
                </div>
            ) : loading ? (
                <AnalysisLoadingIndicator />
            ) : stats ? (
                <div className="w-full max-w-4xl space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-wide">
                                Most Used Languages
                            </h1>
                            <p className="text-sm text-gray-400">Distribuição por bytes de código</p>
                        </div>
                        <button
                            onClick={() => {
                                setStats(null);
                                setLoading(false);
                            }}
                            className="text-sm bg-gray-800 hover:bg-gray-700/80 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center cursor-pointer"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Nova Análise
                        </button>
                    </div>

                    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-800/50">
                        <ResponsiveContainer width="100%" height={230}>
                            <>
                                <div className="relative">
                                    <div className="bg-gray-800/50 rounded-full overflow-hidden h-6 w-full shadow-inner flex border border-gray-700/30">
                                        {getPercentageData()
                                            .sort((a, b) => b.value - a.value)
                                            .map((lang, index) => (
                                                <div
                                                    key={index}
                                                    title={`${lang.name}: ${lang.value.toFixed(2)}%`}
                                                    style={{
                                                        width: `${lang.value}%`,
                                                        backgroundColor: COLORS[index % COLORS.length], // Cor sólida
                                                    }}
                                                    className="h-full transition-all duration-500 ease-out"
                                                />
                                            ))}
                                    </div>
                                    
                                </div>

                                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {getPercentageData()
                                        .sort((a, b) => b.value - a.value)
                                        .map((lang, index) => (
                                            <div key={index} className="flex items-center space-x-3 bg-gray-800/30 p-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-200">
                                                <div
                                                    className="w-4 h-4 rounded-full flex-shrink-0 shadow"
                                                    style={{ 
                                                        background: COLORS[index % COLORS.length] 
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-200 truncate">{lang.name}</p>
                                                    <p className="text-xs text-gray-400">{((lang.value / 100) * stats.total_bytes).toLocaleString()} bytes</p>
                                                </div>
                                                <span className="text-sm font-bold text-blue-400">
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
            {showAlert && <AlertPopup message={alertMessage} onClose={() => setShowAlert(false)} type="info" />}
        </div>
    );
}