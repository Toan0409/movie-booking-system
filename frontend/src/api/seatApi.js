import axiosClient from './axiosClient';

const seatApi = {
    // Client endpoints
    getSeatAvailability: (showtimeId) =>
        axiosClient.get(`/seats/showtimes/${showtimeId}/availability`),

    // Admin endpoints
    getSeatsByTheater: (theaterId) =>
        axiosClient.get(`/admin/seats/theaters/${theaterId}`),

    getSeatById: (seatId) =>
        axiosClient.get(`/admin/seats/${seatId}`),

    updateSeatType: (seatId, seatTypeName) =>
        axiosClient.patch(`/admin/seats/${seatId}/type`, null, { params: { seatTypeName } }),

    disableSeat: (seatId) =>
        axiosClient.patch(`/admin/seats/${seatId}/disable`),

    enableSeat: (seatId) =>
        axiosClient.patch(`/admin/seats/${seatId}/enable`),

    regenerateSeats: (theaterId) =>
        axiosClient.post(`/admin/seats/theaters/${theaterId}/regenerate`),
};

export default seatApi;
