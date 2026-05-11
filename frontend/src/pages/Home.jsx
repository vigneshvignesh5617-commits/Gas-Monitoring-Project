import React, { useEffect, useMemo, useState, useRef } from 'react';
import { AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { io } from 'socket.io-client';

// LPG Dashboard Home - UI and telemetry
const EMPTY_WEIGHT_KG = 15.8; // empty cylinder weight (approx)
const FULL_WEIGHT_KG = 30.0; // full cylinder weight
const CONTENT_KG = Number((FULL_WEIGHT_KG - EMPTY_WEIGHT_KG).toFixed(2)); // 14.2

function CylinderIcon({ percent, pulse }) {
    const fill = Math.max(0, Math.min(100, percent));
    const fillHeight = (100 - fill);
    const color = fill >= 80 ? '#059669' : fill >= 20 ? '#f59e0b' : '#dc2626';
    const pulseStyle = pulse ? { animation: 'pulse 1.6s infinite' } : {};
    return (
        <div style={{ width: 120 }}>
            <style>{`@keyframes pulse { 0% { opacity: 1 } 50% { opacity: 0.4 } 100% { opacity: 1 } }`}</style>
            <svg width="120" height="220" viewBox="0 0 120 220" role="img" aria-label="Cylinder level">
                <defs>
                    <clipPath id="cyl-clip">
                        <rect x="20" y="40" width="80" height="140" rx="12" />
                    </clipPath>
                </defs>
                <rect x="20" y="40" width="80" height="140" rx="12" fill="#e6eef8" stroke="#cfe3ff" />
                <g clipPath="url(#cyl-clip)">
                    <rect x="20" y={40 + (fillHeight * 1.4)} width="80" height={140 - (fillHeight * 1.4)} fill={color} style={{ transition: 'all 700ms ease' }} />
                </g>
                <rect x="20" y="20" width="80" height="30" rx="8" fill="#f3f6fb" stroke="#cfe3ff" />
            </svg>
            <div style={{ textAlign: 'center', marginTop: -10, fontSize: 12, color: '#334155', fontWeight: 600 }}>{Math.round(fill)}%</div>
        </div>
    );
}

function Gauge({ percent, size = 120 }) {
    const normalized = Math.max(0, Math.min(100, percent));
    const radius = 48;
    const stroke = 10;
    const c = 2 * Math.PI * radius;
    const dash = (c * normalized) / 100;
    const dashOffset = c - dash;
    const color = normalized >= 80 ? '#059669' : normalized >= 20 ? '#f59e0b' : '#dc2626';
    return (
        <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden>
            <g transform="translate(60,60)">
                <circle r={radius} stroke="#e6eef8" strokeWidth={stroke} fill="none" />
                <circle r={radius} stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="none"
                    strokeDasharray={`${dash} ${c - dash}`} transform="rotate(-90)" />
                <text x="0" y="6" textAnchor="middle" fontSize="18" fill="#0f172a">{Math.round(normalized)}%</text>
            </g>
        </svg>
    );
}

function Sparkline({ data = [], width = 300, height = 60 }) {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = Math.max(1, max - min);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <polyline fill="none" stroke="#2563eb" strokeWidth="2" points={points} />
        </svg>
    );
}

const Home = () => {
    const [weight, setWeight] = useState(() => EMPTY_WEIGHT_KG + CONTENT_KG * 0.6); // start at ~60% full (total weight)
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [history, setHistory] = useState(() => {
        // generate 7 days of sample history
        const arr = [];
        const now = Date.now();
        // produce decreasing historic total weights over 7 days (consumption trend)
        for (let i = 6; i >= 0; i--) {
            const pct = 0.6 - (i * 0.03); // gradually decreasing
            arr.push(Number((EMPTY_WEIGHT_KG + CONTENT_KG * Math.max(0, pct)).toFixed(2)));
        }
        return arr;
    });
    const [alerts, setAlerts] = useState([
        { id: 1, text: 'WhatsApp alert sent', time: new Date(Date.now() - 3600 * 1000) },
        { id: 2, text: 'SMS reminder sent', time: new Date(Date.now() - 86400 * 1000 * 2) }
    ]);
    const [leakStatus, setLeakStatus] = useState('No Leak Detected');
    const timerRef = useRef(null);
    const socketRef = useRef(null);
    const audioRef = useRef(null);

    // simulate live telemetry: small random walk downward
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setWeight(prev => {
                // decrease slowly with small random variation on content portion only
                const delta = 0.01 + Math.random() * 0.03; // kg per tick (content)
                const content = Math.max(0, prev - EMPTY_WEIGHT_KG - delta);
                const next = Number((EMPTY_WEIGHT_KG + content).toFixed(3));
                setLastUpdated(new Date());
                setHistory(h => {
                    const copy = h.slice();
                    copy.shift();
                    copy.push(next);
                    return copy;
                });
                return next;
            });
        }, 3000);
        return () => clearInterval(timerRef.current);
    }, []);

    // Socket.io connection to receive real-time updates from backend
    useEffect(() => {
        try {
            // Prefer explicit backend URL set in index.html (window.BACKEND_URL).
            // If empty, io() will connect to same origin.
            const backend = (window && window.BACKEND_URL) ? window.BACKEND_URL : undefined;
            const socket = backend ? io(backend) : io();
            socketRef.current = socket;
            socket.on('connect', () => {
                // stop local simulator when real socket connected
                if (timerRef.current) clearInterval(timerRef.current);
            });

            socket.on('update-weight', (data) => {
                if (data && typeof data.weight !== 'undefined') {
                    const w = Number(data.weight);
                    // assume phone may send total weight or content; normalize: if value looks small (< 40) treat as content? we'll assume total weight here
                    setWeight(w);
                    setLastUpdated(new Date());
                    setHistory(h => {
                        const copy = h.slice();
                        copy.shift();
                        copy.push(w);
                        return copy;
                    });
                    // if critical, add alert to log
                    const pct = ((w - EMPTY_WEIGHT_KG) / CONTENT_KG) * 100;
                    if (pct < 15) {
                        setAlerts(a => [{ id: Date.now(), text: 'WhatsApp alert sent', time: new Date() }, ...a].slice(0, 10));
                    }
                }
            });

            socket.on('leak', () => {
                setLeakStatus('LEAK DETECTED!');
                setAlerts(a => [{ id: Date.now(), text: 'Leak detected — Broadcast alert sent', time: new Date() }, ...a].slice(0, 10));
                // play siren (short)
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = 'sine';
                    o.frequency.setValueAtTime(1000, ctx.currentTime);
                    o.connect(g);
                    g.connect(ctx.destination);
                    g.gain.setValueAtTime(0.0001, ctx.currentTime);
                    g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.05);
                    o.start();
                    // frequency sweep
                    o.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1.5);
                    setTimeout(() => { o.stop(); ctx.close(); }, 1600);
                } catch (e) {
                    console.warn('Audio failed', e);
                }
            });

            return () => {
                socket.disconnect();
            };
        } catch (e) {
            console.warn('Socket.io connection failed', e);
        }
    }, []);

    const percent = useMemo(() => ((weight - EMPTY_WEIGHT_KG) / CONTENT_KG) * 100, [weight]);

    // analytics
    const dailyAverage = useMemo(() => {
        // approximate average usage per day from history differences
        const diffs = [];
        for (let i = 1; i < history.length; i++) diffs.push(history[i - 1] - history[i]);
        // estimate daily usage from first and last over 7 days
        const spanDays = 7;
        const totalUsed = Math.max(0, history[0] - history[history.length - 1]);
        return Number((totalUsed / spanDays).toFixed(3));
    }, [history]);

    const daysToEmpty = useMemo(() => {
        if (dailyAverage <= 0) return Infinity;
        const remainingContent = Math.max(0, weight - EMPTY_WEIGHT_KG);
        return Math.max(0, Math.round(remainingContent / dailyAverage));
    }, [weight, dailyAverage]);

    const statusTag = percent >= 80 ? { text: 'Healthy', color: 'bg-emerald-100 text-emerald-800' }
        : percent >= 20 ? { text: 'Warning', color: 'bg-orange-100 text-orange-800' }
            : { text: 'Critical', color: 'bg-red-100 text-red-800' };

    const isCritical = weight < 17; // user-specified threshold

    return (
        <div className="page-container py-10">
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
                {/* Hero */}
                <div className="flex-1 card">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <CylinderIcon percent={percent} />
                        </div>
                        <div>
                            <h2 className="text-2xl hero-title">Smart LPG Monitor</h2>
                            <p className="text-sm text-slate-500 mt-1">Visual gas level with live telemetry and analytics</p>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <Gauge percent={percent} />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500">Current Weight</div>
                                    <div className="text-3xl font-bold text-slate-900">{weight.toFixed(2)} kg</div>
                                    <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${statusTag.color}`}>{isCritical ? 'Critical' : statusTag.text}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Telemetry Panel */}
                <div className="w-full lg:w-96 card">
                    <h3 className="text-lg font-semibold text-slate-800">Live Telemetry</h3>
                    <div className="mt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-slate-500">Current Weight</div>
                                <div className="text-2xl font-bold">{weight.toFixed(2)} kg</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-slate-500">Battery</div>
                                <div className="text-sm font-semibold">92% 🔋</div>
                                <div className="text-xs text-slate-400">Device ID: <span className="font-medium">GG-IND-104</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                        <div>Last Updated</div>
                        <div className="flex items-center gap-2"><Clock size={14} /> <span>{Math.floor((Date.now() - new Date(lastUpdated)) / 1000)}s ago</span></div>
                    </div>
                    <div className="mt-4">
                        <div className="text-sm text-slate-500">Gas Percentage</div>
                        <div className="text-xl font-semibold">{Math.max(0, Math.min(100, percent)).toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            {/* Analytics & Safety */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-2 card">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800">Usage Analytics (7 days)</h3>
                        <div className="text-sm text-slate-500">Daily Average: <span className="font-semibold">{dailyAverage} kg/day</span></div>
                    </div>
                    <div className="mt-4">
                        <Sparkline data={history} width={680} height={120} />
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                            {(() => {
                                const labels = [];
                                const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                                for (let i = 6; i >= 0; i--) {
                                    const d = new Date(); d.setDate(d.getDate() - i);
                                    labels.push(days[d.getDay()]);
                                }
                                return labels.map((l, idx) => <div key={idx}>{l}</div>);
                            })()}
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-slate-500">Prediction</div>
                            <div className="text-lg font-bold mt-1">Based on your average use of <span className="font-semibold">{dailyAverage} kg/day</span>, your cylinder will last for <span className="text-indigo-600">{isFinite(daysToEmpty) ? `${daysToEmpty} more days` : 'unknown'}</span>.</div>
                        </div>
                        <div>
                            <a target="_blank" rel="noreferrer" href="https://indane.co.in/" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg">
                                Book Now <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold text-slate-800">Safety & Alerts</h3>
                    <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-slate-500">Gas Leakage Indicator</div>
                                <div className={`text-sm font-semibold mt-1 ${leakStatus.includes('LEAK') ? 'text-red-700' : 'text-green-700'}`}>{leakStatus} {leakStatus.includes('LEAK') ? '⚠️' : '✅'}</div>
                            </div>
                            <div className="text-sm text-slate-500">Safety Status</div>
                        </div>

                        <div>
                            <div className="text-sm text-slate-500">Alert Log</div>
                            <div className="mt-2 max-h-40 overflow-auto">
                                <table className="w-full text-sm">
                                    <tbody>
                                        {alerts.map(a => (
                                            <tr key={a.id} className="border-b">
                                                <td className="py-2 text-slate-700">{a.text}</td>
                                                <td className="py-2 text-right text-slate-500">{a.time.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                            <div className="pt-2 space-y-2">
                            <button onClick={async () => {
                                // send a test alert (locally simulate)
                                setAlerts(a => [{ id: Date.now(), text: 'Manual test alert sent', time: new Date() }, ...a].slice(0, 10));
                            }} className={`w-full ${leakStatus.includes('LEAK') ? 'bg-yellow-400 animate-pulse' : 'bg-red-600'} text-white px-4 py-2 rounded-lg font-semibold`}>Send Test Alert</button>

                            <button onClick={async () => {
                                // call backend simulate-leak which broadcasts to all clients
                                try { await fetch(`${window.BACKEND_URL || ''}/simulate-leak`); } catch (e) { console.warn(e); }
                            }} className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">Simulate Leak</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
