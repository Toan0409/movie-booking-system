import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Home, Ticket } from 'lucide-react';
import paymentApi from '../api/paymentApi';

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState('loading'); // loading | success | failed
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Lay tat ca query params tu VNPAY redirect
                const params = {};
                searchParams.forEach((value, key) => {
                    params[key] = value;
                });

                // Kiem tra co params VNPAY khong
                if (!params.vnp_ResponseCode) {
                    setStatus('failed');
                    setError('Khong nhan duoc thong tin thanh toan tu VNPAY.');
                    return;
                }

                // Goi backend de verify checksum va lay ket qua
                const response = await paymentApi.handleVNPayReturn(params);
                const data = response.data?.data || response.data;

                setResult(data);

                // Xac dinh trang thai dua tren responseCode
                const responseCode = params.vnp_ResponseCode;
                if (responseCode === '00') {
                    setStatus('success');
                } else {
                    setStatus('failed');
                }
            } catch (err) {
                console.error('Verify payment error:', err);
                // Neu backend tra ve loi, van hien thi ket qua dua tren vnp_ResponseCode
                const responseCode = searchParams.get('vnp_ResponseCode');
                if (responseCode === '00') {
                    setStatus('success');
                    setResult({
                        bookingCode: searchParams.get('vnp_TxnRef'),
                        transactionId: searchParams.get('vnp_TransactionNo'),
                        amount: parseInt(searchParams.get('vnp_Amount') || '0') / 100,
                        bankCode: searchParams.get('vnp_BankCode'),
                    });
                } else {
                    setStatus('failed');
                    setError(err.response?.data?.message || 'Xac minh thanh toan that bai.');
                }
            }
        };

        verifyPayment();
    }, [searchParams]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const getErrorMessage = (code) => {
        const messages = {
            '07': 'Giao dich bi nghi ngo gian lan.',
            '09': 'The/Tai khoan chua dang ky dich vu InternetBanking.',
            '10': 'Xac thuc the/tai khoan qua 3 lan.',
            '11': 'Da het han cho thanh toan.',
            '12': 'The/Tai khoan bi khoa.',
            '13': 'Sai mat khau OTP.',
            '24': 'Khach hang huy giao dich.',
            '51': 'Tai khoan khong du so du.',
            '65': 'Vuot han muc giao dich trong ngay.',
            '75': 'Ngan hang thanh toan dang bao tri.',
            '79': 'Sai mat khau thanh toan qua so lan quy dinh.',
            '99': 'Loi khong xac dinh.',
        };
        return messages[code] || 'Thanh toan that bai. Vui long thu lai.';
    };

    // Loading state
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-white font-bold text-lg mb-2">Dang xac minh thanh toan...</p>
                    <p className="text-slate-400 text-sm">Vui long doi trong giay lat</p>
                </div>
            </div>
        );
    }

    // Success state
    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4">
                <div className="max-w-[480px] w-full">

                    {/* Success card */}
                    <div className="bg-white/5 border border-green-500/30 rounded-2xl p-8 text-center mb-6">

                        {/* Icon */}
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>

                        <h1 className="text-2xl font-black text-white mb-2">Thanh toan thanh cong!</h1>
                        <p className="text-slate-400 text-sm mb-8">
                            Ve cua ban da duoc xac nhan. Chuc ban xem phim vui ve!
                        </p>

                        {/* Transaction details */}
                        {result && (
                            <div className="bg-white/5 rounded-xl p-4 text-left space-y-3 mb-6">
                                {result.bookingCode && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">Ma dat ve</span>
                                        <span className="text-white font-mono font-bold text-sm">
                                            {result.bookingCode}
                                        </span>
                                    </div>
                                )}
                                {result.transactionId && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">Ma giao dich</span>
                                        <span className="text-white font-mono text-sm">
                                            {result.transactionId}
                                        </span>
                                    </div>
                                )}
                                {result.amount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">So tien</span>
                                        <span className="text-green-400 font-bold">
                                            {formatCurrency(result.amount)}
                                        </span>
                                    </div>
                                )}
                                {result.bankCode && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">Ngan hang</span>
                                        <span className="text-white text-sm">{result.bankCode}</span>
                                    </div>
                                )}
                                {result.cardType && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">Loai the</span>
                                        <span className="text-white text-sm">{result.cardType}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Status badge */}
                        <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Da thanh toan
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Ticket className="w-4 h-4" />
                            Xem ve cua toi
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Ve trang chu
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Failed state
    const responseCode = searchParams.get('vnp_ResponseCode');
    const failMessage = error || getErrorMessage(responseCode);

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <div className="max-w-[480px] w-full">

                {/* Failed card */}
                <div className="bg-white/5 border border-red-500/30 rounded-2xl p-8 text-center mb-6">

                    {/* Icon */}
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10 text-red-400" />
                    </div>

                    <h1 className="text-2xl font-black text-white mb-2">Thanh toan that bai</h1>
                    <p className="text-slate-400 text-sm mb-6">{failMessage}</p>

                    {/* Error details */}
                    {result?.bookingCode && (
                        <div className="bg-white/5 rounded-xl p-4 text-left mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Ma dat ve</span>
                                <span className="text-white font-mono font-bold text-sm">
                                    {result.bookingCode}
                                </span>
                            </div>
                        </div>
                    )}

                    {responseCode && responseCode !== '00' && (
                        <div className="bg-red-500/10 rounded-xl px-4 py-3 mb-4">
                            <p className="text-red-400 text-xs">
                                Ma loi VNPAY: <span className="font-mono font-bold">{responseCode}</span>
                            </p>
                        </div>
                    )}

                    {/* Status badge */}
                    <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        That bai
                    </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate(-2)}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all"
                    >
                        Thu lai
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Ve trang chu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentResultPage;
