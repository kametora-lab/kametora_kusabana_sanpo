import React, { useEffect, useMemo, useState } from 'react';

interface Plant {
    id: string;
    slug: string;
    title: string;
    description: string;
    images: string[];
    colors?: string[];
    months?: string[];
    meta?: {
        scientificName?: string;
        family?: string;
    };
}

interface Color {
    id: string;
    name: string;
    value: string;
}

interface AdminPanelProps {
    initialPlants: Plant[];
    colors: Color[];
}

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const STORAGE_KEY = 'amami-admin-auth';
const PASSWORD_HASH = '34a2baceb2b9d74e70b7afa96d58285abe448922c5ff3312f53090494550994b';

const hashText = async (value: string) => {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ initialPlants, colors }) => {
    const [plants, setPlants] = useState<Plant[]>(initialPlants);
    const [selectedId, setSelectedId] = useState<string>(initialPlants[0]?.id ?? '');
    const [searchQuery, setSearchQuery] = useState('');
    const [auth, setAuth] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [authError, setAuthError] = useState('');
    const [idError, setIdError] = useState('');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        setAuth(window.localStorage.getItem(STORAGE_KEY) === '1');
    }, []);

    useEffect(() => {
        setIdError('');
    }, [selectedId]);

    const selectedPlant = useMemo(
        () => plants.find((plant) => plant.id === selectedId),
        [plants, selectedId]
    );

    const filteredPlants = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return plants
            .filter((plant) => {
                return (
                    plant.title.toLowerCase().includes(query) ||
                    plant.id.toLowerCase().includes(query) ||
                    plant.description.toLowerCase().includes(query)
                );
            })
            .sort((a, b) => a.id.localeCompare(b.id));
    }, [plants, searchQuery]);

    const toggleColor = (colorId: string) => {
        if (!selectedPlant) return;
        const current = selectedPlant.colors ?? [];
        const next = current.includes(colorId)
            ? current.filter((id) => id !== colorId)
            : [...current, colorId];
        updateSelected({ colors: next });
    };

    const toggleMonth = (month: string) => {
        if (!selectedPlant) return;
        const current = selectedPlant.months ?? [];
        const next = current.includes(month)
            ? current.filter((value) => value !== month)
            : [...current, month];
        updateSelected({ months: next });
    };

    const updateSelected = (updates: Partial<Plant>) => {
        if (!selectedPlant) return;
        setPlants((prev) =>
            prev.map((plant) => (plant.id === selectedId ? { ...plant, ...updates } : plant))
        );
    };

    const handleIdChange = (value: string) => {
        if (!selectedPlant) return;
        const nextId = value.trim();
        if (!nextId) {
            setIdError('IDを入力してください');
            return;
        }
        const duplicate = plants.some((plant) => plant.id === nextId && plant.id !== selectedId);
        if (duplicate) {
            setIdError('同じIDが既に存在します');
            return;
        }
        setIdError('');
        setPlants((prev) =>
            prev.map((plant) =>
                plant.id === selectedId ? { ...plant, id: nextId, slug: nextId } : plant
            )
        );
        setSelectedId(nextId);
    };

    const addPlant = () => {
        let index = 1;
        let nextId = `new-${index}`;
        while (plants.some((plant) => plant.id === nextId)) {
            index += 1;
            nextId = `new-${index}`;
        }
        const nextPlant: Plant = {
            id: nextId,
            slug: nextId,
            title: '新規植物',
            description: '',
            images: [],
            colors: [],
            months: [],
            meta: { scientificName: '', family: '' }
        };
        setPlants((prev) => [...prev, nextPlant]);
        setSelectedId(nextId);
    };

    const deletePlant = () => {
        if (!selectedPlant) return;
        const ok = window.confirm(`${selectedPlant.title} を削除しますか？`);
        if (!ok) return;
        setPlants((prev) => prev.filter((plant) => plant.id !== selectedPlant.id));
        setSelectedId((prev) => {
            const remaining = plants.filter((plant) => plant.id !== selectedPlant.id);
            return remaining[0]?.id ?? '';
        });
    };

    const downloadJson = () => {
        const normalized = [...plants]
            .map((plant) => ({
                ...plant,
                slug: plant.slug?.trim() || plant.id,
                colors: plant.colors ?? [],
                months: plant.months ?? [],
                images: plant.images ?? [],
                meta: {
                    scientificName: plant.meta?.scientificName ?? '',
                    family: plant.meta?.family ?? ''
                }
            }))
            .sort((a, b) => a.id.localeCompare(b.id));
        const blob = new Blob([JSON.stringify(normalized, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'plants.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const handleLogin = async () => {
        setAuthError('');
        const hash = await hashText(passwordInput);
        if (hash !== PASSWORD_HASH) {
            setAuth(false);
            setAuthError('パスワードが違います');
            return;
        }
        setAuth(true);
        window.localStorage.setItem(STORAGE_KEY, '1');
        setPasswordInput('');
    };

    const handleLogout = () => {
        window.localStorage.removeItem(STORAGE_KEY);
        setAuth(false);
    };

    if (!auth) {
        return (
            <div className="max-w-md mx-auto glass-panel p-6 border border-neon-cyan/40">
                <h2 className="font-display text-2xl text-white mb-4">ADMIN ACCESS</h2>
                <p className="text-gray-400 text-sm mb-6">
                    パスワードを入力して管理画面を開いてください。
                </p>
                <input
                    type="password"
                    value={passwordInput}
                    onChange={(event) => setPasswordInput(event.target.value)}
                    placeholder="Password"
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-neon-pink focus:outline-none focus:shadow-[0_0_10px_rgba(255,45,149,0.3)] transition-all"
                />
                {authError && <p className="mt-3 text-sm text-neon-pink">{authError}</p>}
                <button
                    onClick={handleLogin}
                    className="mt-6 w-full py-2 font-display tracking-wide text-sm bg-neon-cyan/20 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/40 transition"
                >
                    UNLOCK
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
            <aside className="space-y-6">
                <div className="glass-panel p-4 space-y-3">
                    <label className="text-neon-cyan font-display text-xs uppercase tracking-wider">Search</label>
                    <input
                        type="text"
                        placeholder="ID / name / description..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-neon-pink focus:outline-none focus:shadow-[0_0_10px_rgba(255,45,149,0.3)] transition-all"
                    />
                    <button
                        onClick={addPlant}
                        className="w-full py-2 text-xs font-display tracking-wider border border-neon-pink text-neon-pink hover:bg-neon-pink/10 transition"
                    >
                        + 新規追加
                    </button>
                </div>
                <div className="glass-panel p-4 max-h-[70vh] overflow-auto space-y-2">
                    {filteredPlants.map((plant) => (
                        <button
                            key={plant.id}
                            onClick={() => setSelectedId(plant.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${
                                plant.id === selectedId
                                    ? 'border-neon-cyan text-white bg-white/5'
                                    : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200'
                            }`}
                        >
                            <div className="font-display text-sm truncate">{plant.title}</div>
                            <div className="font-mono text-[10px] text-gray-500">{plant.id}</div>
                        </button>
                    ))}
                </div>
            </aside>

            <section className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-display text-2xl text-white">管理編集</h2>
                        <p className="text-gray-500 text-xs mt-1">
                            変更後は「JSONを書き出し」で `plants.json` を置き換えてください。
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={downloadJson}
                            disabled={!!idError}
                            className={`px-4 py-2 text-xs font-display tracking-wider border transition ${
                                idError
                                    ? 'border-white/10 text-gray-600 cursor-not-allowed'
                                    : 'border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10'
                            }`}
                        >
                            JSONを書き出し
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-xs font-display tracking-wider border border-white/10 text-gray-400 hover:text-white hover:border-white/40 transition"
                        >
                            LOG OUT
                        </button>
                    </div>
                </div>

                {!selectedPlant ? (
                    <div className="glass-panel p-6 text-gray-400 text-sm">
                        左のリストから植物を選択してください。
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="glass-panel p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="text-xs text-gray-400 uppercase tracking-wider">
                                    ID
                                    <input
                                        type="text"
                                        value={selectedPlant.id}
                                        onChange={(event) => handleIdChange(event.target.value)}
                                        className="mt-2 w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-neon-cyan focus:outline-none"
                                    />
                                    {idError && <span className="text-neon-pink text-xs">{idError}</span>}
                                </label>
                                <label className="text-xs text-gray-400 uppercase tracking-wider">
                                    表示名
                                    <input
                                        type="text"
                                        value={selectedPlant.title}
                                        onChange={(event) => updateSelected({ title: event.target.value })}
                                        className="mt-2 w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-neon-cyan focus:outline-none"
                                    />
                                </label>
                            </div>

                            <label className="text-xs text-gray-400 uppercase tracking-wider">
                                説明文
                                <textarea
                                    value={selectedPlant.description}
                                    onChange={(event) => updateSelected({ description: event.target.value })}
                                    className="mt-2 w-full min-h-[120px] bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-neon-cyan focus:outline-none"
                                />
                            </label>

                            <label className="text-xs text-gray-400 uppercase tracking-wider">
                                画像パス（1行1枚）
                                <textarea
                                    value={selectedPlant.images?.join('\n') ?? ''}
                                    onChange={(event) =>
                                        updateSelected({
                                            images: event.target.value
                                                .split('\n')
                                                .map((line) => line.trim())
                                                .filter(Boolean)
                                        })
                                    }
                                    className="mt-2 w-full min-h-[120px] bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-neon-cyan focus:outline-none"
                                />
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="text-xs text-gray-400 uppercase tracking-wider">
                                    学名
                                    <input
                                        type="text"
                                        value={selectedPlant.meta?.scientificName ?? ''}
                                        onChange={(event) =>
                                            updateSelected({
                                                meta: { ...selectedPlant.meta, scientificName: event.target.value }
                                            })
                                        }
                                        className="mt-2 w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-neon-cyan focus:outline-none"
                                    />
                                </label>
                                <label className="text-xs text-gray-400 uppercase tracking-wider">
                                    科名
                                    <input
                                        type="text"
                                        value={selectedPlant.meta?.family ?? ''}
                                        onChange={(event) =>
                                            updateSelected({
                                                meta: { ...selectedPlant.meta, family: event.target.value }
                                            })
                                        }
                                        className="mt-2 w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-neon-cyan focus:outline-none"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="glass-panel p-6 space-y-4">
                            <div>
                                <h3 className="font-display text-sm text-neon-cyan uppercase tracking-widest">花色</h3>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {colors.map((color) => (
                                        <button
                                            key={color.id}
                                            onClick={() => toggleColor(color.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300 ${
                                                selectedPlant.colors?.includes(color.id)
                                                    ? 'border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                                                    : 'border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                            style={{
                                                backgroundColor: selectedPlant.colors?.includes(color.id)
                                                    ? color.value
                                                    : 'transparent',
                                                color:
                                                    selectedPlant.colors?.includes(color.id) &&
                                                    ['white', 'yellow'].includes(color.id)
                                                        ? 'black'
                                                        : undefined
                                            }}
                                        >
                                            {color.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-display text-sm text-neon-cyan uppercase tracking-widest">観察月</h3>
                                <div className="grid grid-cols-6 gap-2 mt-3">
                                    {MONTHS.map((month) => (
                                        <button
                                            key={month}
                                            onClick={() => toggleMonth(month)}
                                            className={`text-xs py-1 rounded border transition-all ${
                                                selectedPlant.months?.includes(month)
                                                    ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                                                    : 'border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/30'
                                            }`}
                                        >
                                            {month}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={deletePlant}
                                className="px-4 py-2 text-xs font-display tracking-wider border border-neon-pink text-neon-pink hover:bg-neon-pink/10 transition"
                            >
                                削除
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};
