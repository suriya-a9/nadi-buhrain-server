import { useNavigate } from "react-router-dom";

const PRIMARY = "rgb(13, 95, 72)";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.code}>404</h1>

                <h2 style={styles.title}>You’re Off the Map</h2>

                <p style={styles.text}>
                    The page you’re looking for doesn’t exist or has been moved.
                </p>

                <div style={styles.actions}>
                    <button style={styles.primaryBtn} onClick={() => navigate("/")}>
                        Take Me Home
                    </button>
                    <button style={styles.secondaryBtn} onClick={() => navigate(-1)}>
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: "100vh",
        background: `linear-gradient(135deg, ${PRIMARY}, #022c22)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
    },
    card: {
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)",
        padding: "3rem",
        borderRadius: "18px",
        textAlign: "center",
        boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
        color: "#fff",
    },
    code: {
        fontSize: "6rem",
        margin: 0,
        letterSpacing: "0.2rem",
        color: "#eafff8",
    },
    title: {
        marginTop: "0.5rem",
        fontSize: "1.8rem",
        fontWeight: 600,
    },
    text: {
        marginTop: "1rem",
        opacity: 0.85,
        lineHeight: 1.6,
    },
    actions: {
        marginTop: "2.2rem",
        display: "flex",
        gap: "1rem",
        justifyContent: "center",
        flexWrap: "wrap",
    },
    primaryBtn: {
        padding: "0.8rem 1.8rem",
        borderRadius: "10px",
        border: "none",
        background: "#eafff8",
        color: PRIMARY,
        fontWeight: 600,
        cursor: "pointer",
        transition: "transform 0.2s ease",
    },
    secondaryBtn: {
        padding: "0.8rem 1.8rem",
        borderRadius: "10px",
        border: `1px solid rgba(255,255,255,0.5)`,
        background: "transparent",
        color: "#fff",
        cursor: "pointer",
    },
};

export default NotFound;