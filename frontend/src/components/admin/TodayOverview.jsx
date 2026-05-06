import { useState, useEffect } from 'react';
import { Clock, Film, Ticket, Users } from 'lucide-react';
import showtimeApi from '../../api/showtimeApi';
import bookingApi from '../../api/bookingApi';
import userApi from '../../api/userApi';

const TodayOverview = () => {
    const [stats, setStats] = useState({
        todayShowtimes: 0,
        todayTickets: 0,
        newUsers: 0,
        upcomingShowtimes: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const now = new Date();

                // Fetch today's showtimes
                const showtimesRes = await showtimeApi.getAllShowtimes(0, 200);
                const allShowtimes = showtimesRes?.data.data.content || showtimesRes?.data || [];
                console.log("showtimesRes:", showtimesRes);
                console.log("showtimesRes.data:", showtimesRes?.data);
                const todayShowtimes = allShowtimes.filter(s => {
                    const st = s.startTime || s.showDate;
                    return st && st.startsWith(today);
                });
                const upcomingShowtimes = todayShowtimes.filter(s => {
                    const st = s.startTime;
                    return st && new Date(st) > now;
                });

                // Fetch bookings for today's ticket count
                const bookingsRes = await bookingApi.getAllBookings();
                const allBookings = Array.isArray(bookingsRes.data)
                    ? bookingsRes.data
                    : (bookingsRes.data?.data || []);
                const todayBookings = allBookings.filter(b => {
                    const bd = b.bookingDate || b.createdAt;
                    return bd && bd.startsWith(today);
                });
                const todayTickets = todayBookings.reduce(
                    (sum, b) => sum + (b.bookingDetails?.length || 0), 0
                );

                // Fetch users for new users today
                const usersRes = await userApi.getAllUsers(0, 200);
                const allUsers = usersRes?.data?.content || usersRes?.data || [];
                const newUsers = allUsers.filter(u => {
                    const cd = u.createdAt;
                    return cd && cd.startsWith(today);
                });

                setStats({
                    todayShowtimes: todayShowtimes.length,
                    todayTickets,
                    newUsers: newUsers.length,
                    upcomingShowtimes: upcomingShowtimes.length,
                });
            } catch (err) {
                console.error('TodayOverview fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const items = [
        {
            label: 'Suất chiếu hôm nay',
            value: stats.todayShowtimes,
            icon: Film,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
        },
        {
            label: 'Vé đã bán hôm nay',
            value: stats.todayTickets,
            icon: Ticket,
            color: 'text-green-400',
            bg: 'bg-green-400/10',
        },
        {
            label: 'Khách hàng mới',
            value: stats.newUsers,
            icon: Users,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
        },
        {
            label: 'Suất chiếu sắp tới',
            value: stats.upcomingShowtimes,
            icon: Clock,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
        },
    ];

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-6">Tổng quan hôm nay</h3>
            <div className="space-y-4">
                {items.map((stat, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-400 text-sm">{stat.label}</p>
                            {loading ? (
                                <div className="h-6 w-12 bg-white/10 rounded animate-pulse mt-1"></div>
                            ) : (
                                <p className="text-white font-bold text-xl">{stat.value}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodayOverview;
