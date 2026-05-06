import axiosClient from './axiosClient';

const bookingApi = {
    // Client: create booking
    createBooking: (userId, data) =>
        axiosClient.post('/bookings', data, { params: { userId } }),


    // Admin: get all bookings
    getAllBookings: () =>
        axiosClient.get('/admin/bookings'),

    updateStatus: (bookingId, status) =>
        axiosClient.patch(`/admin/bookings/${bookingId}/status`, { status }),
};

// Get bookings for a specific user (filter from admin endpoint)
bookingApi.getBookingsByUser = async (userId) => {
    const res = await axiosClient.get('/bookings/my-bookings', { params: { userId } });
    const allBookings = res.data?.data || res.data || [];
    const bookings = Array.isArray(allBookings)
        ? allBookings.filter(
            (b) =>
                String(b.userId) === String(userId) ||
                String(b.user?.userId) === String(userId)
        )
        : [];
    return { data: { data: bookings } };
};

export default bookingApi;
