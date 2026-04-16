import React, { useState } from "react";
import axios from "axios";
import Toast from "./Toast";
import { FaSearch, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./Header.css";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const toSlug = (str) => {
    return str
      .toLowerCase()
      .normalize("NFD") // bỏ dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };
  const handleSearch = async () => {
    if (!keyword) return;

    try {
      const res = await axios.get("http://localhost:8000/data");

      const found = res.data.find(
        (item) => String(item.notify_no) === keyword.trim(),
      );

      if (found) {
        const slug = toSlug(found.bid_name[0]);
        navigate(`/bid/${slug}`);
      } else {
        setToastMessage("Không tìm thấy TBMT");
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="header">
      <div className="search-box">
        <FaSearch />
        <input
          placeholder="Nhập số TBMT"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
      </div>
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      <div className="header-right">
        {!user ? (
          <>
            <span onClick={() => navigate("/login")}>Đăng nhập</span>
            <span onClick={() => navigate("/register")}>Đăng ký</span>
          </>
        ) : (
          <>
            <FaBell />
            <span>Hi, {user?.fullName}</span>
            <span
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Đăng xuất
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
