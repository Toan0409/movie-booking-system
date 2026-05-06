import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import KPICard from './KPICard';
import TodayOverview from './TodayOverview';
import RevenueChart from './RevenueChart';
import TopMovies from './TopMovies';
import RecentBookings from './RecentBookings';
import { DollarSign, Ticket, Users, Film } from 'lucide-react';
import bookingApi from '../../api/bookingApi';
import userApi from '../../api/userApi';
import movieApi from '../../api/movieApi';

const Dashboard = () => {
    const [kpi, setKpi] = useState({
        revenue: 0,
        revenueChange: null,
        bookings: 0,
        bookingsChange: null,
        users: 0,
        usersChange: null,
        movies: 0,
        moviesChange: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKPI = async () => {
            try {
                const [bookingsRes, usersRes, moviesRes] = await Promise.allSettled([
                    bookingApi.getAllBookings(),
                    userApi.getAllUsers(0, 200),
                    movieApi.getAllMoviesAdmin(0, 200),
                ]);

                // Bookings & Revenue
                let totalRevenue = 0;
                let totalBookings = 0;
                if (bookingsRes.status === 'fulfilled') {
                    const data = Array.isArray(bookingsRes.value?.data)
                        ? bookingsRes.value.data
                        : (bookingsRes.value?.data?.data || []);
                    totalBookings = data.length;
                    totalRevenue = data
                        .filter(b => b.status === 'PAID' || b.status === 'COMPLETED')
                        .reduce((sum, b) => sum + (b.finalAmount || 0), 0);
                }

                // Users
                let totalUsers = 0;
                if (usersRes.status === 'fulfilled') {
                    const uData = usersRes.value?.data?.content || usersRes.value?.data || [];
                    totalUsers = Array.isArray(uData)
                        ? uData.length
                        : (usersRes.value?.data?.totalElements || 0);
                }

                // Movies
                let totalMovies = 0;
                if (moviesRes.status === 'fulfilled') {
                    const mData = moviesRes.value?.data.data.content || moviesRes.value?.data || [];
                    totalMovies = Array.isArray(mData)
                        ? mData.length
                        : (moviesRes.value?.data?.totalElements || 0);
                }


                setKpi({
                    revenue: totalRevenue,
                    bookings: totalBookings,
                    users: totalUsers,
                    movies: totalMovies,
                });
            } catch (err) {
                console.error('Dashboard KPI fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchKPI();
    }, []);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            notation: amount >= 1_000_000 ? 'compact' : 'standard',
            maximumFractionDigits: 1,
        }).format(amount);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#0b1220] via-[#0b1220]/90 to-[#0b1220] text-white overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col ml-0 lg:ml-64 min-w-0">
                {/* Header */}
                <Header title="Dashboard" />

                {/* Dashboard Content */}
                <div className="p-6 lg:p-8 space-y-8 overflow-auto">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <KPICard
                            title="Doanh thu"
                            value={loading ? '...' : formatCurrency(kpi.revenue)}
                            change="+12.5%"
                            trend="up"
                            icon={DollarSign}
                            color="blue"
                        />
                        <KPICard
                            title="Đặt vé"
                            value={loading ? '...' : kpi.bookings.toLocaleString('vi-VN')}
                            change="+8.2%"
                            trend="up"
                            icon={Ticket}
                            color="rose"
                        />
                        <KPICard
                            title="Người dùng"
                            value={loading ? '...' : kpi.users.toLocaleString('vi-VN')}
                            change="+5.1%"
                            trend="up"
                            icon={Users}
                            color="emerald"
                        />
                        <KPICard
                            title="Phim"
                            value={loading ? '...' : kpi.movies.toLocaleString('vi-VN')}
                            change="+2"
                            trend="up"
                            icon={Film}
                            color="purple"
                        />
                    </div>

                    {/* Today Overview & Charts */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <TodayOverview />
                        <div className="xl:col-span-2 flex flex-col xl:flex-row gap-6">
                            <RevenueChart />
                            <TopMovies />
                        </div>
                    </div>

                    {/* Recent Bookings */}
                    <RecentBookings />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
