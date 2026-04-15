import { useLocation } from "react-router-dom";
import "./Verify.css";

function Verify() {
  const query = new URLSearchParams(useLocation().search);
  const email = query.get("email");

  return (
    <div className="verify-page">
      <div className="verify-box">
        <div className="success-banner">
          Bạn vào hộp thư của mình để kích hoạt tài khoản vừa đăng ký.
        </div>

        <h2>Xác nhận địa chỉ email của bạn</h2>

        <p>
          Để kích hoạt tài khoản bidwinner, bạn cần kiểm tra hộp thư để xác nhận
          địa chỉ email: <span className="email">{email}</span>
        </p>

        <p>
          Nếu không thấy email, hãy kiểm tra <b>SPAM</b> hoặc <b>Junk Email</b>.
        </p>

        <p className="note">
          Sau khi xác nhận, hệ thống sẽ tự động chuyển tới trang đăng nhập.
        </p>
      </div>
    </div>
  );
}

export default Verify;