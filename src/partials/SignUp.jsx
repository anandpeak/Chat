import React, { useState, useEffect, useRef } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";

export default function PhoneLogin() {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [countdown, setCountdown] = useState(500);
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step, countdown]);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "").substring(0, 8);
    const first = digits.substring(0, 4);
    const second = digits.substring(4, 8);

    if (digits.length > 4) return `${first}-${second}`;
    return first;
  };

  const resendCode = () => {
    setCountdown(500);
    handleSendCode();
  };

  const handleSendCode = () => {
    const digits = phoneNumber.replace(/\D/g, "");
    if (digits.length !== 8) {
      setShowPhoneError(true);
      return;
    }

    setLoading(true);

    axios
      .post(
        "https://aichatbot-326159028339.us-central1.run.app/user/otp/send",
        {
          phone: digits,
        }
      )
      .then((response) => {
        if (response.data.success) {
          setStep(2);
        } else {
          toast.error("OTP илгээхэд алдаа гарлаа");
          setShowPhoneError(true);
        }
      })
      .catch((error) => {
        console.error("Error sending code:", error);
        toast.error("Алдаа гарлаа");
        setShowPhoneError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join("");
    const digits = phoneNumber.replace(/\D/g, "");

    if (enteredOtp.length !== 6) {
      document.getElementById("otp-error").classList.remove("hidden");
      return;
    }

    setLoading(true);

    axios
      .post(
        "https://aichatbot-326159028339.us-central1.run.app/user/otp/verify",
        {
          phone: digits,
          code: enteredOtp,
        }
      )
      .then((response) => {
        if (response.data.token) {
          const { token } = response.data;
          Cookies.set("chatToken", token, { expires: 7 });
          const redirectPath = localStorage.getItem("redirectPath") || "/chat";
          localStorage.removeItem("redirectPath");
          navigate(redirectPath);
        } else {
          toast.error("Expired");
        }
      })
      .catch((error) => {
        console.error("Error verifying OTP:", error);
        toast.error(`OTP-ийн хугацаа дууссан. Та дахин код авах боломжтой.`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Enter") {
      handleVerifyOtp();
      return;
    }

    if (e.key === "Backspace") {
      const newOtp = [...otp];

      if (!newOtp[index] && index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpRefs.current[index - 1].focus();
      } else {
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md">
        <div className=" bg-[#000] p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Тавтай морилно уу</h1>
              <p className="text-blue-100">Утасны дугаараар нэвтрэх</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {step === 1 && (
            <div className="fade-in">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Утасны дугаараа оруулна уу
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Баталгаажуулах код илгээнэ
              </p>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Утасны дугаар
                </label>
                <div className="phone-input-container flex items-center border border-gray-300 rounded-lg px-3 py-2">
                  <FaPhoneAlt className="text-[#000]" />
                  <input
                    type="tel"
                    className="flex-1 border-0 focus:ring-0 focus:outline-none px-3 py-1 ml-2"
                    value={formatPhone(phoneNumber)}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="1234-5678"
                    disabled={loading}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                  />
                </div>
                {showPhoneError && (
                  <p className="text-red-500 text-xs mt-1">
                    Зөв утасны дугаар оруулна уу
                  </p>
                )}
              </div>

              <button
                onClick={handleSendCode}
                onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                className="w-full bg-[#000] hover:bg-opacity-60 text-white font-medium py-2.5 px-4 rounded-lg transition duration-300"
              >
                {loading ? (
                  <>
                    <div className="animate-spin border-4 border-t-4 rounded-full border-gray-300 border-t-gray-800 w-5 h-5 inline-block mr-2"></div>
                    Уншиж байна ...
                  </>
                ) : (
                  "Баталгаажуулах код авах"
                )}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Утасны дугаараа баталгаажуулна уу
                </h2>
                <p className="text-gray-500 text-sm">
                  Илгээсэн 6 оронтой кодыг оруулна уу:{" "}
                  <span className="font-medium">
                    {formatPhone(phoneNumber)}
                  </span>
                </p>
                <button
                  className="text-[#000] text-sm mt-1 hover:underline"
                  onClick={() => setStep(1)}
                >
                  Дугаар өөрчлөх
                </button>
              </div>

              <div className="mb-6 flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="number"
                    maxLength="1"
                    className="w-12 h-12 text-center border border-gray-300 rounded-lg shadow-sm text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  />
                ))}
              </div>

              <div className="text-center mb-6">
                <p className="text-red-500 text-sm hidden" id="otp-error">
                  Код буруу байна. Дахин оролдоно уу.
                </p>
                <button
                  onClick={resendCode}
                  className="text-[#000] text-sm hover:underline"
                  disabled={countdown > 0}
                >
                  {countdown > 0
                    ? `${countdown} секундын дараа дахин илгээнэ`
                    : "Код дахин илгээх"}
                </button>
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full bg-[#000] hover:bg-opacity-60 text-white font-medium py-2.5 px-4 rounded-lg transition duration-300"
              >
                нэвтрэх
              </button>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
