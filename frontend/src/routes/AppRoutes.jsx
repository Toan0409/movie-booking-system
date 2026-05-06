import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

// Client Pages
import HomePage from '../pages/HomePage';
import NowShowingPage from '../pages/NowShowingPage';
import ComingSoonPage from '../pages/ComingSoonPage';
import MovieDetailPage from '../pages/MovieDetailPage';
import ShowtimePage from '../pages/ShowtimePage';
import SeatSelectionPage from '../pages/SeatSelectionPage';
import BookingSuccessPage from '../pages/BookingSuccessPage';
import PaymentPage from '../pages/PaymentPage';
import PaymentResultPage from '../pages/PaymentResultPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProfilePage from '../pages/ProfilePage';

// Admin Pages
import AdminDashboardPage from '../pages/AdminDashboardPage';
import MoviesPage from '../pages/admin/MoviesPage';
import ShowtimesPage from '../pages/admin/ShowtimesPage';
import CinemasPage from '../pages/admin/CinemasPage';
import TheatersPage from '../pages/admin/TheatersPage';
import SeatsPage from '../pages/admin/SeatsPage';
import BookingsPage from '../pages/admin/BookingsPage';
import UsersPage from '../pages/admin/UsersPage';
import ActorsPage from '../pages/admin/ActorsPage';
import DirectorsPage from '../pages/admin/DirectorsPage';
import GenresPage from '../pages/admin/GenresPage';

const AppRoutes = () => {
    return (
        <Routes>
            {/* ===== CLIENT ROUTES (with Navbar + Footer) ===== */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/movies" element={<NowShowingPage />} />
                <Route path="/movies/now-showing" element={<NowShowingPage />} />
                <Route path="/movies/coming-soon" element={<ComingSoonPage />} />
                <Route path="/movies/:id" element={<MovieDetailPage />} />
                <Route path="/showtimes/:id" element={<ShowtimePage />} />
                <Route path="/booking/success" element={<BookingSuccessPage />} />
                <Route path="/booking/:id" element={<SeatSelectionPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/payment/result" element={<PaymentResultPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* ===== ADMIN ROUTES (with own Sidebar layout) ===== */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/movies" element={<MoviesPage />} />
            <Route path="/admin/showtimes" element={<ShowtimesPage />} />
            <Route path="/admin/cinemas" element={<CinemasPage />} />
            <Route path="/admin/theaters" element={<TheatersPage />} />
            <Route path="/admin/seats" element={<SeatsPage />} />
            <Route path="/admin/bookings" element={<BookingsPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/actors" element={<ActorsPage />} />
            <Route path="/admin/directors" element={<DirectorsPage />} />
            <Route path="/admin/genres" element={<GenresPage />} />

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
