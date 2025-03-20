import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";  // Ensure Axios is installed

export const BetaAccessContext = createContext();

export const BetaAccessProvider = ({ children }) => {
  const [isBetaVerified, setIsBetaVerified] = useState(false);
  const [betaToken, setBetaToken] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("betaAccessToken");
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const res = await axios.post("http://localhost:5000/verify-token", { token });
      if (res.data.success) {
        setIsBetaVerified(true);
        setBetaToken(token);
      } else {
        localStorage.removeItem("betaAccessToken");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("betaAccessToken");
    }
  };

  const requestOtp = async (phone) => {
    try {
      const res = await axios.post("http://localhost:5000/request-otp", { phone });
      if (res.data.success) {
        setOtpSent(true);
        setPhone(phone);
      } else {
        alert("Phone number not registered for beta access.");
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const res = await axios.post("http://localhost:5000/verify-otp", { phone, otp });
      if (res.data.success) {
        localStorage.setItem("betaAccessToken", res.data.token);
        setIsBetaVerified(true);
        setBetaToken(res.data.token);
      } else {
        alert("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
    }
  };

  return (
    <BetaAccessContext.Provider
      value={{
        isBetaVerified,
        requestOtp,
        verifyOtp,
        otpSent,
        setOtp,
      }}
    >
      {children}
    </BetaAccessContext.Provider>
  );
};

BetaAccessProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

