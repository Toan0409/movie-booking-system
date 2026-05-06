import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * PaymentPage — Trang thanh toan VNPAY
 *
 * Flow:
 *   1. Nhan bookingId tu URL params hoac props
 *   2. Goi API POST /api/payment/vnpay/create?bookingId=X
 *   3. Nhan paymentUrl tu response
 *   4. Redirect user sang VNPAY
 *
 * Su dung:
 *   <Route path="/payment/:bookingId" element={<PaymentPage />} />
 */
const PaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [bookingInfo, setBookingInfo] = useState(null);

    // Lay thong tin booking truoc khi thanh toan
    useEffect(() => {
        if (!bookingId) return;
        fetchBookingInfo();
    }, [bookingId]);

    const fetchBookingInfo = async () => {
        try {
            // Lay JWT token tu localStorage (hoac context/redux)
            const token = localStorage.getItem("token");

            // Goi API lay thong tin booking (optional — de hien thi tong tien)
            // Thay bookingCode bang bookingId neu can
            const res = await fetch(`/api/bookings/id/${bookingId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setBookingInfo(data);
            }
        } catch (err) {
            console.error("Khong the lay thong tin booking:", err);
        }
    };

    // Goi API tao VNPAY URL va redirect
    const handlePayWithVNPay = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`/api/payment/vnpay/create?bookingId=${bookingId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Khong the tao URL thanh toan");
            }

            const data = await res.json();

            if (data.paymentUrl) {
                // Redirect sang VNPAY
                window.location.href = data.paymentUrl;
            } else {
                throw new Error("Khong nhan duoc URL thanh toan tu server");
            }
        } catch (err) {
            console.error("Loi tao payment URL:", err);
            setError(err.message || "Co loi xay ra. Vui long thu lai.");
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <img
                        src="https://sandbox.vnpayment.vn/paymentv2/Assets/Images/logoVNPAY.svg"
                        alt="VNPAY"
                        style={styles.logo}
                        onError={(e) => {
                            e.target.style.display = "none";
                        }}
                    />
                    <h2 style={styles.title}>Thanh Toan Ve Xem Phim</h2>
                </div>

                {/* Thong tin booking */}
                {bookingInfo && (
                    <div style={styles.bookingInfo}>
                        <div style={styles.infoRow}>
                            <span style={styles.label}>Ma dat ve:</span>
                            <span style={styles.value}>{bookingInfo.bookingCode}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.label}>Phim:</span>
                            <span style={styles.value}>{bookingInfo.movieTitle}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.label}>So ghe:</span>
                            <span style={styles.value}>{bookingInfo.quantity}</span>
                        </div>
                        <div style={styles.divider} />
                        <div style={styles.infoRow}>
                            <span style={styles.labelBold}>Tong tien:</span>
                            <span style={styles.amount}>
                                {bookingInfo.finalAmount?.toLocaleString("vi-VN")} VND
                            </span>
                        </div>
                    </div>
                )}

                {/* Phuong thuc thanh toan */}
                <div style={styles.paymentMethod}>
                    <div style={styles.methodCard}>
                        <span style={styles.methodIcon}>🏦</span>
                        <div>
                            <div style={styles.methodName}>VNPAY</div>
                            <div style={styles.methodDesc}>
                                Thanh toan qua Internet Banking, ATM, QR Code
                            </div>
                        </div>
                        <span style={styles.checkmark}>✓</span>
                    </div>
                </div>

                {/* Loi */}
                {error && (
                    <div style={styles.errorBox}>
                        <span>⚠️ {error}</span>
                    </div>
                )}

                {/* Buttons */}
                <div style={styles.buttonGroup}>
                    <button
                        onClick={handleCancel}
                        style={styles.cancelButton}
                        disabled={loading}
                    >
                        Huy
                    </button>
                    <button
                        onClick={handlePayWithVNPay}
                        style={styles.payButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <span>Dang xu ly...</span>
                        ) : (
                            <span>Thanh Toan Ngay</span>
                        )}
                    </button>
                </div>

                {/* Luu y bao mat */}
                <div style={styles.securityNote}>
                    <span>🔒</span>
                    <span>
                        Giao dich duoc bao mat boi VNPAY. Thong tin the cua ban duoc ma hoa
                        an toan.
                    </span>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// Inline styles (thay bang Tailwind / CSS module neu can)
// ============================================================
const styles = {
    container: {
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        padding: "32px",
        width: "100%",
        maxWidth: "480px",
    },
    header: {
        textAlign: "center",
        marginBottom: "24px",
    },
    logo: {
        height: "40px",
        marginBottom: "12px",
    },
    title: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#1a1a1a",
        margin: 0,
    },
    bookingInfo: {
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "20px",
    },
    infoRow: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "8px",
    },
    label: {
        color: "#666",
        fontSize: "14px",
    },
    labelBold: {
        color: "#1a1a1a",
        fontSize: "15px",
        fontWeight: "600",
    },
    value: {
        color: "#1a1a1a",
        fontSize: "14px",
        fontWeight: "500",
    },
    amount: {
        color: "#e53e3e",
        fontSize: "18px",
        fontWeight: "700",
    },
    divider: {
        height: "1px",
        backgroundColor: "#e2e8f0",
        margin: "12px 0",
    },
    paymentMethod: {
        marginBottom: "20px",
    },
    methodCard: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        border: "2px solid #0066cc",
        borderRadius: "8px",
        padding: "12px 16px",
        backgroundColor: "#f0f7ff",
    },
    methodIcon: {
        fontSize: "24px",
    },
    methodName: {
        fontWeight: "600",
        color: "#0066cc",
        fontSize: "15px",
    },
    methodDesc: {
        color: "#666",
        fontSize: "12px",
        marginTop: "2px",
    },
    checkmark: {
        marginLeft: "auto",
        color: "#0066cc",
        fontWeight: "700",
        fontSize: "18px",
    },
    errorBox: {
        backgroundColor: "#fff5f5",
        border: "1px solid #fc8181",
        borderRadius: "8px",
        padding: "12px 16px",
        color: "#c53030",
        fontSize: "14px",
        marginBottom: "16px",
    },
    buttonGroup: {
        display: "flex",
        gap: "12px",
        marginBottom: "16px",
    },
    cancelButton: {
        flex: 1,
        padding: "12px",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        backgroundColor: "#fff",
        color: "#666",
        fontSize: "15px",
        cursor: "pointer",
        fontWeight: "500",
    },
    payButton: {
        flex: 2,
        padding: "12px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#0066cc",
        color: "#fff",
        fontSize: "15px",
        cursor: "pointer",
        fontWeight: "600",
    },
    securityNote: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#718096",
        fontSize: "12px",
        textAlign: "center",
    },
};

export default PaymentPage;
