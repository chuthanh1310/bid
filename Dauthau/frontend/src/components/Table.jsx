import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
function Table({ data, currentPage, itemsPerPage, setCurrentPage }) {
  const [followed, setFollowed] = useState({});

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = data.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:8000/my-follow", {
        headers: { Authorization: token },
      })
      .then((res) => {
        const map = {};
        res.data.forEach((f) => {
          map[f.bid_id] = true;
        });
        setFollowed(map);
      });
  }, []);

  const handleFollow = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Bạn cần đăng nhập!");
      window.location.href = "/login";
      return;
    }

    const isFollowed = followed[id];

    try {
      if (isFollowed) {
        await axios.post(
          "http://localhost:8000/unfollow",
          { bid_id: id },
          { headers: { Authorization: token } },
        );
      } else {
        await axios.post(
          "http://localhost:8000/follow",
          { bid_id: id },
          { headers: { Authorization: token } },
        );
      }

      setFollowed((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const getPageNumbers = () => {
    const pages = new Set();

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.add(1);

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage > 3) {
      pages.add("...left");
    } else {
      for (let i = 2; i <= 3; i++) pages.add(i);
    }

    for (let i = start; i <= end; i++) {
      pages.add(i);
    }

    if (currentPage < totalPages - 2) {
      pages.add("...right");
    } else {
      for (let i = totalPages - 2; i < totalPages; i++) pages.add(i);
    }

    pages.add(totalPages);

    return Array.from(pages).map((p) => {
      if (typeof p === "string" && p.startsWith("...")) return "...";
      return p;
    });
  };

  const convert = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  return (
    <div className="result-table">
      <table>
        <thead>
          <tr>
            <th>Số TBMT</th>
            <th>Tên gói thầu</th>
            <th>Địa điểm</th>
            <th>Bên mời thầu</th>
            <th>Đóng thầu</th>
            <th>Giá</th>
            <th>Đăng tải</th>
            <th>Theo dõi</th> {/* 👈 thêm */}
          </tr>
        </thead>

        <tbody>
          {currentData.map((item, idx) => {
            const name = item.bid_name?.[0] || item.bidName?.[0] || "";
            const investor = item.investor_name || item.investorName || "";
            const province =
              item.locations?.[0]?.prov_name ||
              item.locations?.[0]?.provName ||
              "";
            const district =
              item.locations?.[0]?.district_name ||
              item.locations?.[0]?.districtName ||
              "";
            const price = item.bid_price?.[0] || item.bidPrice?.[0] || 0;

            return (
              <tr key={item.id || idx}>
                <td>{item.notify_no || item.notifyNo}</td>

                <td className="name">
                  <span className="dot"></span>
                  <a
                    href={`/bid/${convert(name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bid-link"
                  >
                    {name}
                  </a>
                </td>

                <td>
                  {district}, {province}
                </td>

                <td className="blue">{investor}</td>

                <td>{formatDate(item.bid_close_date || item.bidCloseDate)}</td>

                <td>{price.toLocaleString("vi-VN")} VND</td>

                <td>{formatDate(item.public_date || item.publicDate)}</td>

                <td>
                  <span
                    onClick={() => handleFollow(item.bid_id || item.id)}
                    className={`follow-btn ${
                      followed[item.bid_id || item.id] ? "followed" : ""
                    }`}
                  >
                    {followed[item.bid_id || item.id] ? (
                      <FaHeart />
                    ) : (
                      <FaRegHeart />
                    )}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          ◀
        </button>

        {getPageNumbers().map((num, idx) =>
          num === "..." ? (
            <span key={`dots-${idx}`}>...</span>
          ) : (
            <button
              key={`page-${num}`}
              className={currentPage === num ? "active-page" : ""}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </button>
          ),
        )}

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

export default Table;
