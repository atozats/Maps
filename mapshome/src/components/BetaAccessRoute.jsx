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

// Updated CSS Styles (Inline using JavaScript objects)
const styles = {
  betaAccessContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#0f111c", // Dark background
    fontFamily: "'Poppins', sans-serif",
  },
  formContainer: {
    background: "#171b2d",
    padding: "2.5rem",
    borderRadius: "20px",
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.7)",
    width: "100%",
    maxWidth: "400px",
    color: "#e5e7eb",
  },
  heading: {
    marginBottom: "2rem",
    fontSize: "1.8rem",
    fontWeight: "600",
    color: "#a3ffb7", // Green accent
    textAlign: "center",
  },
  inputField: {
    width: "100%",
    padding: "1rem",
    margin: "1rem 0",
    border: "none",
    borderRadius: "12px",
    background: "#232742",
    color: "#e5e7eb",
    fontSize: "1rem",
    outline: "none",
    transition: "background 0.3s ease",
  },
  submitButton: {
    width: "100%",
    padding: "1rem",
    border: "none",
    borderRadius: "12px",
    background: "#a3ffb7", // Green button
    color: "#0f111c",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
  toggleText: {
    marginTop: "1.5rem",
    fontSize: "0.9rem",
    cursor: "pointer",
    textDecoration: "underline",
    color: "#8e95a9",
    textAlign: "center",
  },
};
