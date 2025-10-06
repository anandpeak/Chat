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

  // Subdomain detection and local toggle
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isUzbekistanSubdomain = window.location.hostname.startsWith("uz.oneplace.hr");
  const isKazakhstanSubdomain = window.location.hostname.startsWith("kz.oneplace.hr");
  const [localMode, setLocalMode] = useState("MN"); // "MN", "UZ", or "KZ"

  const currentCountry = isUzbekistanSubdomain ? "UZ" :
                        isKazakhstanSubdomain ? "KZ" :
                        (isLocalhost ? localMode : "MN");

  const isUzbekistan = currentCountry === "UZ";
  const isKazakhstan = currentCountry === "KZ";

  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step, countdown]);

  // Clear phone number when switching between modes
  useEffect(() => {
    setPhoneNumber("");
    setShowPhoneError(false);
    if (step === 2) {
      setStep(1);
      setOtp(Array(6).fill(""));
    }
  }, [currentCountry]);

  const formatPhone = (value) => {
    if (isUzbekistan) {
      // Uzbekistan format: XX XXX-XX-XX (9 digits)
      const digits = value.replace(/\D/g, "").substring(0, 9);
      const first = digits.substring(0, 2);
      const second = digits.substring(2, 5);
      const third = digits.substring(5, 7);
      const fourth = digits.substring(7, 9);

      if (digits.length > 7) return `${first} ${second}-${third}-${fourth}`;
      if (digits.length > 5) return `${first} ${second}-${third}`;
      if (digits.length > 2) return `${first} ${second}`;
      return first;
    } else if (isKazakhstan) {
      // Kazakhstan format: XXX XXX-XX-XX (10 digits)
      const digits = value.replace(/\D/g, "").substring(0, 10);
      const first = digits.substring(0, 3);
      const second = digits.substring(3, 6);
      const third = digits.substring(6, 8);
      const fourth = digits.substring(8, 10);

      if (digits.length > 8) return `${first} ${second}-${third}-${fourth}`;
      if (digits.length > 6) return `${first} ${second}-${third}`;
      if (digits.length > 3) return `${first} ${second}`;
      return first;
    } else {
      // Mongolia format: XXXX-XXXX (8 digits)
      const digits = value.replace(/\D/g, "").substring(0, 8);
      const first = digits.substring(0, 4);
      const second = digits.substring(4, 8);

      if (digits.length > 4) return `${first}-${second}`;
      return first;
    }
  };

  const resendCode = () => {
    setCountdown(500);
    handleSendCode();
  };

  const handleSendCode = () => {
    const requiredLength = isUzbekistan ? 9 : (isKazakhstan ? 10 : 8);

    console.log("Phone number (raw digits):", phoneNumber);
    console.log("Length:", phoneNumber.length);
    console.log("Required length:", requiredLength);

    if (phoneNumber.length !== requiredLength) {
      setShowPhoneError(true);
      console.log("Validation failed: wrong length");
      return;
    }

    setLoading(true);

    if (isUzbekistan) {
      // Uzbekistan: Direct authentication with bearer token
      axios
        .post(
          "https://aichatbot-326159028339.us-central1.run.app/user/otp/send",
          {
            phone: phoneNumber,
            country: "UZ",
          }
        )
        .then((response) => {
          if (response.data.token) {
            // Direct login with bearer token
            const { token } = response.data;
            Cookies.set("chatToken", token, { expires: 7 });
            const redirectPath = localStorage.getItem("redirectPath") || "/chat";
            localStorage.removeItem("redirectPath");
            navigate(redirectPath);
          } else {
            toast.error("Xatolik yuz berdi");
            setShowPhoneError(true);
          }
        })
        .catch((error) => {
          console.error("Error authenticating:", error);
          toast.error("Xatolik yuz berdi");
          setShowPhoneError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (isKazakhstan) {
      // Kazakhstan: Direct authentication with bearer token
      axios
        .post(
          "https://aichatbot-326159028339.us-central1.run.app/user/otp/send",
          {
            phone: phoneNumber,
            country: "KZ",
          }
        )
        .then((response) => {
          if (response.data.token) {
            // Direct login with bearer token
            const { token } = response.data;
            Cookies.set("chatToken", token, { expires: 7 });
            const redirectPath = localStorage.getItem("redirectPath") || "/chat";
            localStorage.removeItem("redirectPath");
            navigate(redirectPath);
          } else {
            toast.error("Произошла ошибка");
            setShowPhoneError(true);
          }
        })
        .catch((error) => {
          console.error("Error authenticating:", error);
          toast.error("Произошла ошибка");
          setShowPhoneError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Mongolia: OTP flow
      axios
        .post(
          "https://aichatbot-326159028339.us-central1.run.app/user/otp/send",
          {
            phone: phoneNumber,
            country: "MN",
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
    }
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      document.getElementById("otp-error").classList.remove("hidden");
      return;
    }

    setLoading(true);

    axios
      .post(
        "https://aichatbot-326159028339.us-central1.run.app/user/otp/verify",
        {
          phone: phoneNumber,
          code: enteredOtp,
          country: currentCountry,
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
          toast.error(isKazakhstan ? "Срок действия истек" : (isUzbekistan ? "Muddati tugagan" : "Expired"));
        }
      })
      .catch((error) => {
        console.error("Error verifying OTP:", error);
        toast.error(isKazakhstan ? "Срок действия OTP истек. Вы можете получить код снова." : (isUzbekistan ? "OTP muddati tugagan. Qaytadan kod oling." : "OTP-ийн хугацаа дууссан. Та дахин код авах боломжтой."));
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
              <h1 className="text-2xl font-bold">
                {isKazakhstan ? "Добро пожаловать" : (isUzbekistan ? "Xush kelibsiz" : "Тавтай морилно уу")}
              </h1>
              <p className="text-blue-100">
                {isKazakhstan ? "Вход по номеру телефона" : (isUzbekistan ? "Telefon raqami orqali kirish" : "Утасны дугаараар нэвтрэх")}
              </p>
            </div>
            {isLocalhost && (
              <button
                onClick={() => {
                  const modes = ["MN", "UZ", "KZ"];
                  const currentIndex = modes.indexOf(localMode);
                  setLocalMode(modes[(currentIndex + 1) % modes.length]);
                }}
                className="text-xs bg-white text-black px-3 py-1 rounded-full hover:bg-gray-200 transition"
                title="Toggle between Mongolia, Uzbekistan, and Kazakhstan mode (localhost only)"
              >
                {localMode === "UZ" ? "🇺🇿 UZ" : (localMode === "KZ" ? "🇰🇿 KZ" : "🇲🇳 MN")}
              </button>
            )}
          </div>
        </div>
        <div className="p-6">
          {step === 1 && (
            <div className="fade-in">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {isKazakhstan ? "Введите номер телефона" : (isUzbekistan ? "Telefon raqamingizni kiriting" : "Утасны дугаараа оруулна уу")}
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                {isKazakhstan ? "Отправим код подтверждения" : (isUzbekistan ? "Tasdiqlash kodini yuboramiz" : "Баталгаажуулах код илгээнэ")}
              </p>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  {isKazakhstan ? "Номер телефона" : (isUzbekistan ? "Telefon raqami" : "Утасны дугаар")}
                </label>
                <div className="phone-input-container flex items-center border border-gray-300 rounded-lg px-3 py-2">
                  <FaPhoneAlt className="text-[#000]" />
                  <span className="text-gray-600 ml-2 mr-1">
                    {isUzbekistan ? "+998" : (isKazakhstan ? "+7" : "")}
                  </span>
                  <input
                    type="tel"
                    className="flex-1 border-0 focus:ring-0 focus:outline-none px-3 py-1"
                    value={formatPhone(phoneNumber)}
                    onChange={(e) => {
                      const rawDigits = e.target.value.replace(/\D/g, "");
                      setPhoneNumber(rawDigits);
                      setShowPhoneError(false);
                    }}
                    placeholder={isKazakhstan ? "701 234-56-78" : (isUzbekistan ? "90 123-45-67" : "1234-5678")}
                    disabled={loading}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                  />
                </div>
                {showPhoneError && (
                  <p className="text-red-500 text-xs mt-1">
                    {isKazakhstan ? "Введите правильный номер телефона" : (isUzbekistan ? "To'g'ri telefon raqamini kiriting" : "Зөв утасны дугаар оруулна уу")}
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
                    {isKazakhstan ? "Загрузка..." : (isUzbekistan ? "Yuklanmoqda..." : "Уншиж байна ...")}
                  </>
                ) : (
                  isKazakhstan ? "Войти" : (isUzbekistan ? "Kirish" : "Баталгаажуулах код авах")
                )}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  {isKazakhstan ? "Подтвердите номер телефона" : (isUzbekistan ? "Telefon raqamingizni tasdiqlang" : "Утасны дугаараа баталгаажуулна уу")}
                </h2>
                <p className="text-gray-500 text-sm">
                  {isKazakhstan ? "Введите 6-значный код: " : (isUzbekistan ? "Yuborilgan 6 raqamli kodni kiriting: " : "Илгээсэн 6 оронтой кодыг оруулна уу: ")}
                  <span className="font-medium">
                    {isUzbekistan ? "+998 " : (isKazakhstan ? "+7 " : "")}{formatPhone(phoneNumber)}
                  </span>
                </p>
                <button
                  className="text-[#000] text-sm mt-1 hover:underline"
                  onClick={() => setStep(1)}
                >
                  {isKazakhstan ? "Изменить номер" : (isUzbekistan ? "Raqamni o'zgartirish" : "Дугаар өөрчлөх")}
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
                  {isKazakhstan ? "Неверный код. Попробуйте снова." : (isUzbekistan ? "Kod noto'g'ri. Qaytadan urinib ko'ring." : "Код буруу байна. Дахин оролдоно уу.")}
                </p>
                <button
                  onClick={resendCode}
                  className="text-[#000] text-sm hover:underline"
                  disabled={countdown > 0}
                >
                  {countdown > 0
                    ? (isKazakhstan ? `Повторить через ${countdown} секунд` : (isUzbekistan ? `${countdown} soniyadan keyin qayta yuborish` : `${countdown} секундын дараа дахин илгээнэ`))
                    : (isKazakhstan ? "Отправить код повторно" : (isUzbekistan ? "Kodni qayta yuborish" : "Код дахин илгээх"))}
                </button>
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full bg-[#000] hover:bg-opacity-60 text-white font-medium py-2.5 px-4 rounded-lg transition duration-300"
              >
                {isKazakhstan ? "Войти" : (isUzbekistan ? "Kirish" : "нэвтрэх")}
              </button>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
