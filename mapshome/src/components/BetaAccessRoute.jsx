

import { useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { BetaAccessContext } from "../context/BetaAccessContext";

const BetaAccessRoute = () => {
  const { isBetaVerified, requestOtp, verifyOtp, registerUser, otpSent, isRegistering } = useContext(BetaAccessContext);
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [username, setUsername] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  if (isBetaVerified) {
    return <Outlet />;
  }

  const handleAuthAction = () => {
    if (showRegister) {
      if (!isRegistering) {
        registerUser(username, phoneInput);
      } else {
        verifyOtp(otpInput);
      }
    } else {
      if (!otpSent) {
        requestOtp(phoneInput);
      } else {
        verifyOtp(otpInput);
      }
    }
  };

  const toggleForm = () => {
    setShowRegister(!showRegister);
    setPhoneInput("");
    setOtpInput("");
    setUsername("");
  };

  return (
    <div style={styles.betaAccessContainer}>
      <div style={styles.formContainer}>
        <h2 style={styles.heading}>
          {showRegister
            ? isRegistering && otpSent
              ? "Verify OTP to Complete Registration"
              : "Register for Beta Access"
            : !otpSent
            ? "Login to Beta Access"
            : "Enter OTP to Login"}
        </h2>

        {showRegister && !isRegistering && (
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.inputField}
          />
        )}

        {(!otpSent || showRegister) && !isRegistering && (
          <input
            type="text"
            placeholder="Enter phone number"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            style={styles.inputField}
          />
        )}

        {(otpSent || isRegistering) && (
          <input
            type="text"
            placeholder="Enter OTP"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            style={styles.inputField}
          />
        )}

        <button onClick={handleAuthAction} style={styles.submitButton}>
          {showRegister
            ? isRegistering && otpSent
              ? "Complete Registration"
              : "Register"
            : !otpSent
            ? "Request OTP"
            : "Login"}
        </button>

        <p style={styles.toggleText} onClick={toggleForm}>
          {showRegister
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </p>
      </div>
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
  formContainer: {
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
    marginTop: "1rem",
  },
  heading: {
    marginBottom: "1.5rem",
    fontSize: "1.5rem",
    fontWeight: "600",
  },
  toggleText: {
    marginTop: "1.5rem",
    fontSize: "0.9rem",
    cursor: "pointer",
    textDecoration: "underline",
  },
};