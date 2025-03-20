import { useContext, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { BetaAccessContext } from "../context/BetaAccessContext";

const BetaAccessRoute = () => {
  const { isBetaVerified, requestOtp, verifyOtp, otpSent, setOtp } = useContext(BetaAccessContext);
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");

  if (isBetaVerified) {
    return <Outlet />;
  }

  return (
    <div className="BetaAccessContainer">
      {!otpSent ? (
        <div>
          <h2>Enter your phone number for beta access</h2>
          <input
            type="text"
            placeholder="Enter phone number"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
          />
          <button onClick={() => requestOtp(phoneInput)}>Request OTP</button>
        </div>
      ) : (
        <div>
          <h2>Enter the OTP sent to your phone</h2>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
          />
          <button onClick={() => verifyOtp(otpInput)}>Verify OTP</button>
        </div>
      )}
    </div>
  );
};

export default BetaAccessRoute;

