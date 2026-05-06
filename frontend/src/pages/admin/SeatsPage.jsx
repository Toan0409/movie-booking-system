import { useState, useEffect } from 'react';
import { RefreshCw, ToggleLeft, ToggleRight, ChevronDown } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import seatApi from '../../api/seatApi';
import theaterApi from '../../api/theaterApi';
import cinemaApi from '../../api/cinemaApi';

const SEAT_TYPES = ['STANDARD', 'VIP', 'COUPLE'];

const SeatsPage = () => {
    const [cinemas, setCinemas] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [seats, setSeats] = useState([]);
    const [selectedCinema, setSelectedCinema] = useState('');
    const [selectedTheater, setSelectedTheater] = useState('');
    const [loading, setLoading] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    useEffect(() => {
        fetchCinemas();
    }, []);

    useEffect(() => {
        if (selectedCinema) {
            fetchTheatersByCinema(selectedCinema);
            setSelectedTheater('');
            setSeats([]);
        }
    }, [selectedCinema]);

    useEffect(() => {
        if (selectedTheater) {
            fetchSeats(selectedTheater);
        }
    }, [selectedTheater]);

    const fetchCinemas = async () => {
        try {
            const res = await cinemaApi.getAllCinemas();
            if (res.data?.success) setCinemas(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTheatersByCinema = async (cinemaId) => {
        try {
            const res = await theaterApi.getAllTheaters(0, 100);
            if (res.data?.success) {
                const all = res.data.data.content || [];
                setTheaters(all.filter(t => t.cinemaId === parseInt(cinemaId)));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSeats = async (theaterId) => {
        try {
            setLoading(true);
            const res = await seatApi.getSeatsByTheater(theaterId);
            if (res.data?.success) {
                setSeats(res.data.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSeat = async (seat) => {
        try {
            if (seat.isActive) {
                await seatApi.disableSeat(seat.seatId);
            } else {
                await seatApi.enableSeat(seat.seatId);
            }
            fetchSeats(selectedTheater);
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleChangeSeatType = async (seatId, seatTypeName) => {
        try {
            await seatApi.updateSeatType(seatId, seatTypeName);
            fetchSeats(selectedTheater);
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleRegenerate = async () => {
        if (!selectedTheater) return;
        if (!window.confirm('Tạo lại ghế sẽ xóa tất cả ghế hiện tại. Bạn có chắc không?')) return;
        try {
            setRegenerating(true);
            await seatApi.regenerateSeats(selectedTheater);
            fetchSeats(selectedTheater);
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setRegenerating(false);
        }
    };

    // Group seats by row
    const seatsByRow = seats.reduce((acc, seat) => {
        const row = seat.seatRow;
        if (!acc[row]) acc[row] = [];
        acc[row].push(seat);
        return acc;
    }, {});
    const sortedRows = Object.keys(seatsByRow).sort();

    const getSeatColor = (seat) => {
        if (!seat.isActive) return 'bg-red-500/20 border-red-500/30 text-red-400';
        if (seat.seatType === 'VIP') return 'bg-amber-500/20 border-amber-500/40 text-amber-400';
        if (seat.seatType === 'COUPLE') return 'bg-pink-500/20 border-pink-500/40 text-pink-400';
        return 'bg-white/5 border-white/10 text-slate-300';
    };

    const stats = {
        total: seats.length,
        standard: seats.filter(s => s.seatType === 'STANDARD').length,
        vip: seats.filter(s => s.seatType === 'VIP').length,
        couple: seats.filter(s => s.seatType === 'COUPLE').length,
        disabled: seats.filter(s => !s.isActive).length,
    };

    return (
        <div className="flex min-h-screen bg-[#0b1220] text-white">
            <Sidebar />
            <main className="flex-1 flex flex-col lg:ml-64 min-w-0">
                <Header title="Quản lý ghế ngồi" />
                <div className="p-6 space-y-6">
                    {/* Filters */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-white text-xs block mb-1">Chọn rạp</label>
                                <select
                                    value={selectedCinema}
                                    onChange={e => setSelectedCinema(e.target.value)}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="">-- Chọn rạp --</option>
                                    {cinemas.map(c => <option key={c.cinemaId} value={c.cinemaId}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-white text-xs block mb-1">Chọn phòng chiếu</label>
                                <select
                                    value={selectedTheater}
                                    onChange={e => setSelectedTheater(e.target.value)}
                                    disabled={!selectedCinema}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                                >
                                    <option value="">-- Chọn phòng --</option>
                                    {theaters.map(t => <option key={t.theaterId} value={t.theaterId}>{t.name} ({t.theaterType})</option>)}
                                </select>
                            </div>
                            {selectedTheater && (
                                <button
                                    onClick={handleRegenerate}
                                    disabled={regenerating}
                                    className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                                    Tạo lại ghế
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    {seats.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                                { label: 'Tổng ghế', value: stats.total, color: 'text-white' },
                                { label: 'Thường', value: stats.standard, color: 'text-slate-400' },
                                { label: 'VIP', value: stats.vip, color: 'text-amber-400' },
                                { label: 'Đôi', value: stats.couple, color: 'text-pink-400' },
                                { label: 'Vô hiệu', value: stats.disabled, color: 'text-red-400' },
                            ].map(stat => (
                                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                    <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                    <p className="text-slate-400 text-xs">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Seat Map */}
                    {!selectedTheater ? (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                            <p className="text-slate-400">Vui lòng chọn rạp và phòng chiếu để xem sơ đồ ghế</p>
                        </div>
                    ) : loading ? (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                            <p className="text-slate-400">Đang tải...</p>
                        </div>
                    ) : seats.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                            <p className="text-slate-400 mb-4">Phòng chiếu chưa có ghế</p>
                            <button onClick={handleRegenerate} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold">
                                Tạo ghế tự động
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            {/* Legend */}
                            <div className="flex flex-wrap gap-4 mb-6 text-xs">
                                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-white/5 border border-white/10"></div><span className="text-slate-400">Thường</span></div>
                                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-amber-500/20 border border-amber-500/40"></div><span className="text-slate-400">VIP</span></div>
                                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-pink-500/20 border border-pink-500/40"></div><span className="text-slate-400">Đôi</span></div>
                                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-red-500/20 border border-red-500/30"></div><span className="text-slate-400">Vô hiệu</span></div>
                            </div>

                            {/* Screen */}
                            <div className="mb-6">
                                <div className="h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full w-3/4 mx-auto mb-1 opacity-60"></div>
                                <p className="text-center text-slate-500 text-xs uppercase tracking-widest">Màn hình</p>
                            </div>

                            {/* Rows */}
                            <div className="overflow-x-auto">
                                <div className="min-w-[400px] space-y-1.5">
                                    {sortedRows.map(row => (
                                        <div key={row} className="flex items-center gap-1">
                                            <span className="w-6 text-slate-500 text-xs text-center shrink-0">{row}</span>
                                            <div className="flex gap-1 flex-wrap">
                                                {seatsByRow[row]
                                                    .sort((a, b) => a.seatNumber - b.seatNumber)
                                                    .map(seat => (
                                                        <div key={seat.seatId} className="relative group">
                                                            <button
                                                                className={`w-8 h-8 rounded-t-lg text-[10px] font-medium border transition-all ${getSeatColor(seat)}`}
                                                                title={`${seat.seatLabel} - ${seat.seatType}`}
                                                            >
                                                                {seat.seatNumber}
                                                            </button>
                                                            {/* Hover menu */}
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 bg-[#0f1a2e] border border-white/10 rounded-lg shadow-xl p-1 min-w-[120px]">
                                                                <p className="text-white text-xs font-bold px-2 py-1 border-b border-white/10 mb-1">{seat.seatLabel}</p>
                                                                {SEAT_TYPES.map(type => (
                                                                    <button
                                                                        key={type}
                                                                        onClick={() => handleChangeSeatType(seat.seatId, type)}
                                                                        className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-white/10 transition-colors ${seat.seatType === type ? 'text-primary font-bold' : 'text-slate-400'}`}
                                                                    >
                                                                        {type === seat.seatType ? '✓ ' : ''}{type}
                                                                    </button>
                                                                ))}
                                                                <div className="border-t border-white/10 mt-1 pt-1">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedSeat(seat);
                                                                            setEditSeatType(seat.seatType);
                                                                            setEditIsActive(seat.isActive);
                                                                        }}
                                                                        className={`w-8 h-8 rounded-t-lg text-[10px] font-medium border transition-all ${getSeatColor(seat)}`}
                                                                    >
                                                                        {seat.seatNumber}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-500 text-xs mt-4 text-center">Hover vào ghế để thay đổi loại hoặc trạng thái</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SeatsPage;
