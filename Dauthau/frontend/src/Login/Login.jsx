import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";
import { FaUserAlt, FaLock } from "react-icons/fa";
import { useAuth } from "../components/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const success = query.get("success");

  // ================= LOGIN =================
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:8000/api/login", {
        email,
        password,
      });

      login(res.data.token, {
        username: res.data.username,
        fullName: res.data.fullName,
      });
      console.log("LOGIN RESPONSE:", res.data);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Sai tài khoản hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:8000/api/google-login", {
        credential: credentialResponse.credential,
      });

      login(res.data.token, {
        username: res.data.username,
        fullName: res.data.fullName,
      });

      navigate("/");
    } catch (err) {
      console.error("Google login error:", err);
      alert("Đăng nhập Google thất bại");
    }
  };

  return (
    <>
    
      <div className="login-page">
      
      <div className="login-box">
        {success && (
        <div className="success-banner">
          Bạn vừa đăng ký thành công tài khoản bidwinner. Mời bạn đăng nhập!
        </div>
      )}
        <h2>Đăng nhập bidwinner.info</h2>
        <div className="input-group">
          <FaUserAlt className="input-icon" />
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="remember">
          <input type="checkbox" />
          <span>Nhớ đăng nhập</span>
        </div>
        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
        </button>

        <p className="or">Hoặc đăng nhập bằng Gmail</p>
        <div className="google-btn">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google login failed")}
          />
        </div>
        <p className="register">
          Bạn chưa có tài khoản?{" "}
          <span onClick={() => navigate("/register")}>Đăng ký</span>
        </p>
      </div>
    </div>
    </>
    
  );
}

export default Login;
