import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import "./Register.css";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      alert("Mật khẩu không khớp");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:8000/api/register", {
        fullName,
        email,
        password,
      });

      navigate(`/verify?email=${email}`);
    } catch (err) {
      console.log("REGISTER ERROR:", err.response?.data);
      alert(err.response?.data?.error || err.response?.data?.message || "Lỗi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-box">
        <h2 className="title">Đăng ký tài khoản bidwinner</h2>

        <p className="sub">
          Nếu bạn có tài khoản Gmail hãy chọn đăng ký và đăng nhập ngay bằng 1
          click:
        </p>
        <div className="input-group">
          <FaUser className="icon" />
          <input
            type="text"
            placeholder="Họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {/* EMAIL */}
        <div className="input-group">
          <FaEnvelope className="icon" />
          <input
            type="email"
            placeholder="Địa chỉ email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="input-group">
          <FaLock className="icon" />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="input-group">
          <FaLock className="icon" />
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          className="register-btn"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Đang đăng ký..." : "Đăng Ký Sử Dụng"}
        </button>

        <p className="login-link">
          Bạn đã có tài khoản bidwinner?{" "}
          <span onClick={() => navigate("/login")}>Đăng nhập!</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
