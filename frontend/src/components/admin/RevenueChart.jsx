import { useState, useEffect } from 'react';
import bookingApi from '../../api/bookingApi';

const formatCurrencyShort = (amount) =>
    new Intl.NumberFormat('vi-VN', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(amount || 0);

const RevenueChart = () => {
    const [range, setRange] = useState(7);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        bookingApi.getAllBookings()
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);

                // Build last N days
                const days = [];
                for (let i = range - 1; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    days.push(d.toISOString().split('T')[0]);
                }

                // Aggregate revenue per day
                const revenueMap = {};
                days.forEach(d => { revenueMap[d] = 0; });
                data.forEach(b => {
                    if (b.status === 'CANCELLED') return;
                    const dateKey = (b.bookingDate || b.createdAt || '').split('T')[0];
                    if (revenueMap[dateKey] !== undefined) {
                        revenueMap[dateKey] += b.finalAmount || 0;
                    }
                });

                const result = days.map(d => ({
                    date: d,
                    label: new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                    revenue: revenueMap[d],
                }));
                setChartData(result);
            })
            .catch(() => setChartData([]))
            .finally(() => setLoading(false));
    }, [range]);

    // Build SVG path from data
    const buildPath = () => {
        if (!chartData.length) return { line: '', area: '' };
        const maxRev = Math.max(...chartData.map(d => d.revenue), 1);
        const W = 400;
        const H = 220;
        const padX = 20;
        const padY = 20;
        const chartW = W - padX * 2;
        const chartH = H - padY * 2;

        const points = chartData.map((d, i) => ({
            x: padX + (i / (chartData.length - 1 || 1)) * chartW,
            y: padY + chartH - (d.revenue / maxRev) * chartH,
        }));

        // Smooth curve using cubic bezier
        let line = `M${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpX = (prev.x + curr.x) / 2;
            line += ` C${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
        }

        const area = `${line} L${points[points.length - 1].x},${H} L${points[0].x},${H} Z`;

        return { line, area, points, maxRev, H, padY, chartH };
    };

    const { line, area, points, maxRev, H, padY, chartH } = buildPath();

    // Y-axis labels
    const yLabels = [0, 0.25, 0.5, 0.75, 1].map(f => ({
        value: maxRev * f,
        y: H - (f * (chartH || 1)) - (padY || 0),
    }));

    return (
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl shadow-black/10 flex-1">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-white">Doanh thu theo ngày</h2>
                <select
                    value={range}
                    onChange={e => { setRange(Number(e.target.value)); setLoading(true); }}
                    className="bg-slate-800 border border-white/20 rounded-xl text-xs font-semibold py-2 px-3 outline-none text-white"
                >
                    <option value={7}>7 ngày</option>
                    <option value={14}>14 ngày</option>
                    <option value={30}>30 ngày</option>
                </select>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="relative">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-slate-500 w-12">
                        {[...yLabels].reverse().map((l, i) => (
                            <span key={i}>{formatCurrencyShort(l.value)}</span>
                        ))}
                    </div>

                    {/* SVG Chart */}
                    <div className="ml-12">
                        <svg className="w-full" viewBox="0 0 400 240" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="rgba(59,130,246,0.5)" />
                                    <stop offset="100%" stopColor="rgba(59,130,246,0.0)" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Grid lines */}
                            {[0, 55, 110, 165, 220].map(y => (
                                <line key={y} x1="0" y1={y} x2="400" y2={y}
                                    stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                            ))}

                            {/* Area fill */}
                            {area && (
                                <path d={area} fill="url(#revenueGrad)" />
                            )}

                            {/* Line */}
                            {line && (
                                <path
                                    d={line}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    filter="url(#glow)"
                                />
                            )}

                            {/* Data points */}
                            {points && points.map((p, i) => (
                                <g key={i}>
                                    <circle cx={p.x} cy={p.y} r="5" fill="#0b1220" stroke="#3b82f6" strokeWidth="2.5" />
                                    <circle cx={p.x} cy={p.y} r="2" fill="#3b82f6" />
                                </g>
                            ))}
                        </svg>

                        {/* X-axis labels */}
                        <div className="flex justify-between mt-2 px-1">
                            {chartData.map((d, i) => (
                                <span key={i} className="text-xs text-slate-500 text-center"
                                    style={{ width: `${100 / chartData.length}%` }}>
                                    {d.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevenueChart;
