import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * PaymentResultPage — Trang ket qua thanh toan VNPAY
 *
 * Flow:
 *   1. VNPAY redirect user ve: /payment/result?vnp_ResponseCode=00&vnp_TxnRef=BKxxx&...
 *   2. Lay tat ca query params tu URL
 *   3. Goi API GET /api/payment/vnpay/return?... de verify checksum va lay ket qua
 *   4. Hien thi trang success hoac fail
 *
 * Su dung:
 *   <Route path="/payment/result" element={<PaymentResultPage />} />
 *
 * Luu y:
 *   - vnpay.return-url trong application.properties phai la: http://localhost:5173/payment/result
 *   - Trang nay KHONG can JWT (VNPAY redirect truc tiep)
 */
const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        verifyPaymentResult();
    }, []);

    const verifyPaymentResult = async () => {
        try {
            // Lay tat ca query params tu URL (VNPAY gui ve)
            const queryString = searchParams.toString();

            if (!queryString) {
                setError("Khong co thong tin thanh toan.");
                setLoading(false);
                return;
            }

            // Goi backend de verify checksum va lay ket qua chinh thuc
            const res = await fetch(`/api/payment/vnpay/return?${queryString}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                throw new Error("Khong the xac minh ket qua thanh toan");
            }

            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error("Loi xac minh ket qua:", err);
            setError(err.message || "Co loi xay ra khi xac minh ket qua thanh toan.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoHome = () => {
        navigate("/");
    };

    const handleViewBooking = () => {
        if (result?.bookingCode) {
            navigate(`/bookings/${result.bookingCode}`);
        } else {
            navigate("/bookings");
        }
    };

    const handleRetryPayment = () => {
        navigate(-2);
    };

    // ============================================================
    // Loading state
    // ============================================================
    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.loadingSpinner}>⏳</div>
                    <h3 style={styles.loadingText}>Dang xac minh ket qua thanh toan...</h3>
                    <p style={styles.loadingSubText}>Vui long doi trong giay lat</p>
                </div>
            </div>
        );
    }

    // ============================================================
    // Error state
    // ============================================================
    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.iconError}>❌</div>
                    <h2 style={styles.titleError}>Co Loi Xay Ra</h2>
                    <p style={styles.message}>{error}</p>
                    <div style={styles.buttonGroup}>
                        <button onClick={handleGoHome} style={styles.primaryButton}>
                            Ve Trang Chu
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isSuccess = result?.status === "COMPLETED";

    // ============================================================
    // Success state
    // ============================================================
    if (isSuccess) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    {/* Icon thanh cong */}
                    <div style={styles.iconSuccess}>✅</div>

                    <h2 style={styles.titleSuccess}>Thanh Toan Thanh Cong!</h2>
                    <p style={styles.message}>
                        Cam on ban da dat ve. Ve cua ban da duoc xac nhan.
                    </p>

                    {/* Chi tiet giao dich */}
                    <div style={styles.detailBox}>
                        <h4 style={styles.detailTitle}>Chi Tiet Giao Dich</h4>

                        {result.bookingCode && (
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Ma dat ve:</span>
                                <span style={styles.detailValue}>{result.bookingCode}</span>
                            </div>
                        )}

                        {result.transactionId && (
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Ma giao dich VNPAY:</span>
                                <span style={styles.detailValue}>{result.transactionId}</span>
                            </div>
                        )}

                        {result.amount && (
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>So tien:</span>
                                <span style={styles.detailValueBold}>
                                    {result.amount?.toLocaleString("vi-VN")} VND
                                </span>
                            </div>
                        )}

                        {result.bankCode && (
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Ngan hang:</span>
                                <span style={styles.detailValue}>{result.bankCode}</span>
                            </div>
                        )}

                        {result.cardType && (
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Loai the:</span>
                                <span style={styles.detailValue}>{result.cardType}</span>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div style={styles.buttonGroup}>
                        <button onClick={handleGoHome} style={styles.secondaryButton}>
                            Ve Trang Chu
                        </button>
                        <button onClick={handleViewBooking} style={styles.primaryButton}>
                            Xem Ve Cua Toi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================
    // Failed state
    // ============================================================
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Icon that bai */}
                <div style={styles.iconFailed}>❌</div>

                <h2 style={styles.titleError}>Thanh Toan That Bai</h2>
                <p style={styles.message}>
                    {result?.message || "Giao dich khong thanh cong. Vui long thu lai."}
                </p>

                {/* Chi tiet loi */}
                {result?.responseCode && result.responseCode !== "00" && (
                    <div style={styles.errorDetailBox}>
                        <div style={styles.detailRow}>
                            <span style={styles.detailLabel}>Ma loi:</span>
                            <span style={styles.detailValue}>{result.responseCode}</span>
                        </div>
                        {result.bookingCode && (
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Ma dat ve:</span>
                                <span style={styles.detailValue}>{result.bookingCode}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Buttons */}
                <div style={styles.buttonGroup}>
                    <button onClick={handleGoHome} style={styles.secondaryButton}>
                        Ve Trang Chu
                    </button>
                    <button onClick={handleRetryPayment} style={styles.retryButton}>
                        Thu Lai
                    </button>
                </div>

                <p style={styles.supportNote}>
                    Can ho tro? Lien he hotline: <strong>1900 5555 77</strong>
                </p>
            </div>
        </div>
    );
};

// ============================================================
// Inline styles
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
        padding: "40px 32px",
        width: "100%",
        maxWidth: "480px",
        textAlign: "center",
    },
    loadingSpinner: {
        fontSize: "48px",
        marginBottom: "16px",
        animation: "spin 1s linear infinite",
    },
    loadingText: {
        fontSize: "18px",
        color: "#1a1a1a",
        margin: "0 0 8px 0",
    },
    loadingSubText: {
        color: "#718096",
        fontSize: "14px",
    },
    iconSuccess: {
        fontSize: "64px",
        marginBottom: "16px",
    },
    iconFailed: {
        fontSize: "64px",
        marginBottom: "16px",
    },
    iconError: {
        fontSize: "64px",
        marginBottom: "16px",
    },
    titleSuccess: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#276749",
        margin: "0 0 8px 0",
    },
    titleError: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#c53030",
        margin: "0 0 8px 0",
    },
    message: {
        color: "#4a5568",
        fontSize: "15px",
        marginBottom: "24px",
        lineHeight: "1.5",
    },
    detailBox: {
        backgroundColor: "#f0fff4",
        border: "1px solid #9ae6b4",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "24px",
        textAlign: "left",
    },
    errorDetailBox: {
        backgroundColor: "#fff5f5",
        border: "1px solid #fc8181",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "24px",
        textAlign: "left",
    },
    detailTitle: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#276749",
        margin: "0 0 12px 0",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    detailRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
    },
    detailLabel: {
        color: "#718096",
        fontSize: "13px",
    },
    detailValue: {
        color: "#1a1a1a",
        fontSize: "13px",
        fontWeight: "500",
    },
    detailValueBold: {
        color: "#276749",
        fontSize: "16px",
        fontWeight: "700",
    },
    buttonGroup: {
        display: "flex",
        gap: "12px",
        marginBottom: "16px",
    },
    primaryButton: {
        flex: 1,
        padding: "12px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#0066cc",
        color: "#fff",
        fontSize: "15px",
        cursor: "pointer",
        fontWeight: "600",
    },
    secondaryButton: {
        flex: 1,
        padding: "12px",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        backgroundColor: "#fff",
        color: "#4a5568",
        fontSize: "15px",
        cursor: "pointer",
        fontWeight: "500",
    },
    retryButton: {
        flex: 1,
        padding: "12px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#e53e3e",
        color: "#fff",
        fontSize: "15px",
        cursor: "pointer",
        fontWeight: "600",
    },
    supportNote: {
        color: "#718096",
        fontSize: "13px",
        marginTop: "8px",
    },
};

export default PaymentResultPage;
