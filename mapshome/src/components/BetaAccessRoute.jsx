
import { useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { BetaAccessContext } from "../context/BetaAccessContext";

const BetaAccessRoute = () => {
  const { isBetaVerified, requestOtp, verifyOtp, otpSent, setOtp } = useContext(BetaAccessContext);
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");

  if (isBetaVerified) {
    return <Outlet />;
  }

  return (
    <div style={styles.betaAccessContainer}>
      {!otpSent ? (
        <div style={styles.phoneForm}>
          <h2 style={styles.heading}>Enter your phone number for beta access</h2>
          <input
            type="text"
            placeholder="Enter phone number"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            style={styles.inputField}
          />
          <button onClick={() => requestOtp(phoneInput)} style={styles.submitButton}>
            Request OTP
          </button>
        </div>
      ) : (
        <div style={styles.otpForm}>
          <h2 style={styles.heading}>Enter the OTP sent to your phone</h2>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            style={styles.inputField}
          />
          <button onClick={() => verifyOtp(otpInput)} style={styles.submitButton}>
            Verify OTP
          </button>
        </div>
      )}
    </div>
  );
};

export default BetaAccessRoute;

// CSS Styles (Inline using JavaScript objects)
const styles = {
  betaAccessContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #6a11cb, #2575fc)",
    color: "white",
    fontFamily: "'Arial', sans-serif",
  },
  phoneForm: {
    background: "rgba(255, 255, 255, 0.1)",
    padding: "2rem",
    borderRadius: "15px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(10px)",
    textAlign: "center",
    width: "100%",
    maxWidth: "400px",
  },
  otpForm: {
    background: "rgba(255, 255, 255, 0.1)",
    padding: "2rem",
    borderRadius: "15px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(10px)",
    textAlign: "center",
    width: "100%",
    maxWidth: "400px",
  },
  inputField: {
    width: "100%",
    padding: "0.75rem",
    margin: "1rem 0",
    border: "none",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    fontSize: "1rem",
    outline: "none",
    transition: "background 0.3s ease",
  },
  inputFieldPlaceholder: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  inputFieldFocus: {
    background: "rgba(255, 255, 255, 0.3)",
  },
  submitButton: {
    width: "100%",
    padding: "0.75rem",
    border: "none",
    borderRadius: "8px",
    background: "#2575fc",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
  submitButtonHover: {
    background: "#1b5fd9",
  },
  heading: {
    marginBottom: "1.5rem",
    fontSize: "1.5rem",
    fontWeight: "600",
  },
};