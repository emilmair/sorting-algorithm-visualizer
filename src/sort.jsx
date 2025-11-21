import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';

// Sorting Algorithm API
const sortingAPI = {
    bubbleSort: async (array, callbacks) => {
        const arr = [...array];
        const n = arr.length;
        const sorted = new Set();

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                callbacks.onCompare([j, j + 1]);
                await callbacks.sleep();

                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    callbacks.onSwap(arr);
                }
            }
            sorted.add(n - 1 - i);
            callbacks.onSorted(Array.from(sorted));
        }

        callbacks.onComplete();
        return arr;
    },

    mergeSort: async (array, callbacks) => {
        const arr = [...array];
        const auxArray = [...arr];

        const merge = async (start, mid, end) => {
            let i = start;
            let j = mid + 1;
            let k = start;

            while (i <= mid && j <= end) {
                callbacks.onCompare([i, j]);
                await callbacks.sleep();

                if (auxArray[i] <= auxArray[j]) {
                    arr[k] = auxArray[i];
                    i++;
                } else {
                    arr[k] = auxArray[j];
                    j++;
                }

                callbacks.onMerge([k]);
                callbacks.onSwap(arr);
                await callbacks.sleep();
                k++;
            }

            while (i <= mid) {
                callbacks.onCompare([i]);
                arr[k] = auxArray[i];
                callbacks.onMerge([k]);
                callbacks.onSwap(arr);
                await callbacks.sleep();
                i++;
                k++;
            }

            while (j <= end) {
                callbacks.onCompare([j]);
                arr[k] = auxArray[j];
                callbacks.onMerge([k]);
                callbacks.onSwap(arr);
                await callbacks.sleep();
                j++;
                k++;
            }

            for (let idx = start; idx <= end; idx++) {
                auxArray[idx] = arr[idx];
            }
        };

        const mergeRecursive = async (start, end) => {
            if (start >= end) return;
            const mid = Math.floor((start + end) / 2);
            await mergeRecursive(start, mid);
            await mergeRecursive(mid + 1, end);
            await merge(start, mid, end);
        };

        await mergeRecursive(0, arr.length - 1);
        callbacks.onComplete();
        return arr;
    },
};

const SortVisualizer = () => {
    const [array, setArray] = useState([]);
    const [sorting, setSorting] = useState(false);
    const [speed, setSpeed] = useState(50);
    const [arraySize, setArraySize] = useState(30);
    const [algorithm, setAlgorithm] = useState('mergeSort');
    const [comparingIndices, setComparingIndices] = useState([]);
    const [mergingIndices, setMergingIndices] = useState([]);
    const [sortedIndices, setSortedIndices] = useState([]);
    const [showNumbers, setShowNumbers] = useState(false);

    useEffect(() => {
        generateArray();
    }, [arraySize]);

    const generateArray = () => {
        const newArray = Array.from({ length: arraySize }, () =>
            Math.floor(Math.random() * 100) + 10
        );
        setArray(newArray);
        setComparingIndices([]);
        setMergingIndices([]);
        setSortedIndices([]);
    };

    const startSorting = async () => {
        if (sorting) return;
        setSorting(true);
        setComparingIndices([]);
        setMergingIndices([]);
        setSortedIndices([]);

        const callbacks = {
            sleep: () => new Promise(resolve => setTimeout(resolve, 101 - speed)),
            onCompare: (indices) => setComparingIndices(indices),
            onSwap: (newArray) => setArray([...newArray]),
            onMerge: (indices) => setMergingIndices(indices),
            onSorted: (indices) => setSortedIndices(indices),
            onComplete: () => {
                setSortedIndices([...Array.from({ length: array.length }, (_, i) => i)]);
            },
        };

        await sortingAPI[algorithm]([...array], callbacks);
        setSorting(false);
    };

    const stopSorting = () => {
        setSorting(false);
    };

    const getBarColor = (idx) => {
        if (sortedIndices.includes(idx)) return '#10b981'; // green - sorted
        if (mergingIndices.includes(idx)) return '#f59e0b'; // amber - merging
        if (comparingIndices.includes(idx)) return '#ef4444'; // red - comparing
        return '#3b82f6'; // blue - default
    };

    const maxValue = array.length > 0 ? Math.max(...array) : 100;

    return (
        <div className="w-full h-screen bg-gray-700 p-6 flex flex-col">
            <div className="mb-6">
                <h1 className="text-4xl font-bold text-white mb-2">Sorting Algorithm Visualizer</h1>
                <p className="text-slate-300">Watch different sorting algorithms in action</p>
            </div>

            {/* Visualization */}
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6" style={{ height: '400px' }}>
                <div className="flex items-end justify-center gap-1 h-full">
                    {array.map((value, idx) => (
                        <div
                            key={idx}
                            className="flex-1 transition-all duration-75 flex flex-col items-center justify-end relative"
                            style={{
                                height: `${(value / maxValue) * 100}%`,
                                backgroundColor: getBarColor(idx),
                                minHeight: '4px',
                            }}
                            title={`Value: ${value}`}
                        >
                            {showNumbers && (
                                <span className="text-black opacity-40 text-xs mb-1" style={{ fontSize: '20px' }}>
                                    {value}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
                <div className="flex flex-wrap gap-6 items-center justify-between">
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={sorting ? stopSorting : startSorting}
                            disabled={sorting}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${sorting
                                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {sorting ? <Pause size={20} /> : <Play size={20} />}
                            {sorting ? 'Sorting...' : 'Start Sort'}
                        </button>

                        <button
                            onClick={() => {
                                stopSorting();
                                generateArray();
                            }}
                            disabled={sorting}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-400 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                        >
                            <RotateCcw size={20} />
                            Reset
                        </button>
                    </div>

                    {/* Algorithm Selector */}
                    <div className="flex items-center gap-4">
                        <label className="text-white font-semibold">Algorithm:</label>
                        <select
                            value={algorithm}
                            onChange={(e) => {
                                stopSorting();
                                setAlgorithm(e.target.value);
                            }}
                            disabled={sorting}
                            className="px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold disabled:bg-slate-600"
                        >
                            <option value="bubbleSort">Bubble Sort</option>
                            <option value="mergeSort">Merge Sort</option>
                        </select>
                    </div>

                    {/* Show Numbers Toggle */}
                    <div className="flex items-center gap-3">
                        <label className="text-white font-semibold">Show Numbers:</label>
                        <input
                            type="checkbox"
                            checked={showNumbers}
                            onChange={(e) => setShowNumbers(e.target.checked)}
                            className="w-5 h-5 cursor-pointer"
                        />
                    </div>

                    {/* Settings */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <label className="text-white font-semibold min-w-24">Speed:</label>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={speed}
                                onChange={(e) => setSpeed(Number(e.target.value))}
                                disabled={sorting}
                                className="w-48"
                            />
                            <span className="text-white min-w-12">{speed}%</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="text-white font-semibold min-w-24">Size:</label>
                            <button
                                onClick={() => setArraySize(Math.max(5, arraySize - 5))}
                                disabled={sorting}
                                className="p-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:text-slate-500 text-white rounded"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="text-white min-w-12 text-center">{arraySize}</span>
                            <button
                                onClick={() => setArraySize(Math.min(100, arraySize + 5))}
                                disabled={sorting}
                                className="p-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:text-slate-500 text-white rounded"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                            <span className="text-slate-300">Unsorted</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                            <span className="text-slate-300">Comparing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-amber-500 rounded"></div>
                            <span className="text-slate-300">Merging</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-slate-300">Sorted</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortVisualizer;