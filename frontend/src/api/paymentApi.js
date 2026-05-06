import axiosClient from './axiosClient';

const paymentApi = {
    // Tao VNPAY payment URL
    // POST /api/payment/vnpay/create?bookingId=X
    createVNPayUrl: (bookingId) =>
        axiosClient.post('/payment/vnpay/create', null, { params: { bookingId } }),

    // Xu ly VNPAY return (verify ket qua)
    // GET /api/payment/vnpay/return?vnp_ResponseCode=...&vnp_TxnRef=...
    handleVNPayReturn: (params) =>
        axiosClient.get('/payment/vnpay/return', { params }),

    // Kiem tra trang thai thanh toan theo bookingCode
    // GET /api/payment/status?bookingCode=X
    getPaymentStatus: (bookingCode) =>
        axiosClient.get('/payment/status', { params: { bookingCode } }),
};

export default paymentApi;
