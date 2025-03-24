import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

export const BetaAccessContext = createContext();

export const BetaAccessProvider = ({ children }) => {
  const [isBetaVerified, setIsBetaVerified] = useState(false);
  const [betaToken, setBetaToken] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("betaAccessToken");
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const res = await axios.post("https://atozmap.com/verify-token", { token });
      if (res.data.success) {
        setIsBetaVerified(true);
        setBetaToken(token);
        setUsername(res.data.username || "User");
      } else {
        localStorage.removeItem("betaAccessToken");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("betaAccessToken");
    }
  };

  const requestOtp = async (phoneNumber) => {
    try {
      const res = await axios.post("https://atozmap.com/request-otp", { phone: phoneNumber });
      if (res.data.success) {
        setOtpSent(true);
        setPhone(phoneNumber);
      } else {
        alert("Phone number not registered for beta access.");
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
      alert("Error requesting OTP. Phone number may not be registered.");
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const res = await axios.post("https://atozmap.com/verify-otp", { 
        phone, 
        otp,
        isRegistering,
        username: tempUsername
      });
      
      if (res.data.success) {
        localStorage.setItem("betaAccessToken", res.data.token);
        setIsBetaVerified(true);
        setBetaToken(res.data.token);
        setUsername(res.data.username || "User");
        
        // Reset registration state if needed
        if (isRegistering) {
          setIsRegistering(false);
          setTempUsername("");
        }
      } else {
        alert("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      alert("OTP verification failed. Please try again.");
    }
  };

  const registerUser = async (username, phoneNumber) => {
    try {
      const res = await axios.post("https://atozmap.com/register", { 
        username, 
        phone: phoneNumber 
      });
      
      if (res.data.success) {
        setOtpSent(true);
        setPhone(phoneNumber);
        setIsRegistering(true);
        setTempUsername(username);
      } else {
        alert(res.data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. This phone number might already be registered.");
    }
  };

  const logoutUser = () => {
    // Remove token from local storage
    localStorage.removeItem("betaAccessToken");
    
    // Reset all state
    setIsBetaVerified(false);
    setBetaToken("");
    setPhone("");
    setOtpSent(false);
    setIsRegistering(false);
    setTempUsername("");
    setUsername("");
    
    // Optional: Redirect to home page if needed
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
  };

  return (
    <BetaAccessContext.Provider
      value={{
        isBetaVerified,
        betaToken,
        username,
        requestOtp,
        verifyOtp,
        registerUser,
        logoutUser,
        otpSent,
        isRegistering,
      }}
    >
      {children}
    </BetaAccessContext.Provider>
  );
};

BetaAccessProvider.propTypes = {
  children: PropTypes.node.isRequired,
};