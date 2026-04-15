import React from "react";
import { FaSearch, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./Header.css";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="header">
      {/* SEARCH */}
      <div className="search-box">
        <FaSearch />
        <input placeholder="Nhập số TBMT" />
      </div>

      {/* RIGHT */}
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