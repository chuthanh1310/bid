import React, { useState, useEffect } from "react";
import axios from "axios";
import InvestBox from "../components/InvestBox";
import FilterPrice from "../components/FilterPrice";
import "./SearchPage.css"; 

function Lcnt() {
  const [allData, setAllData] = useState([]);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [keywords, setKeywords] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const itemsPerPage = 5;

 
  useEffect(() => {
    axios.get("http://localhost:8000/data")
      .then((res) => {
        setAllData(res.data);
        setResults(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const applyFilters = (fieldCode = "", price = minPrice, kws = keywords) => {
    let filtered = [...allData];

    if (fieldCode) {
      filtered = filtered.filter(item => {
        const f = item.invest_field || item.investField;
        return Array.isArray(f) ? f.includes(fieldCode) : f === fieldCode;
      });
    }

    if (price) {
      filtered = filtered.filter(item => {
        const p = item.bid_price?.[0] || item.bidPrice?.[0] || 0;
        return p >= parseInt(price);
      });
    }

    if (kws.length > 0) {
      filtered = filtered.filter(item => {
        const name = (item.bid_name?.[0] || "").toLowerCase();
        return kws.some(kw => name.includes(kw.toLowerCase()));
      });
    }

    setResults(filtered);
    setCurrentPage(1);
  };

  // Hàm tạo Slug cho URL
  const convertToSlug = (str) => {
    if (!str) return "";
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/([^0-9a-z-\s])/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  };

  // Tính toán phân trang
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = results.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(results.length / itemsPerPage);

  return (
    <div className="search-container">
      {/* KHỐI BỘ LỌC */}
      <div className="filter-box">
        <h3 className="filter-title">LỰA CHỌN NHÀ THẦU</h3>
        
        <InvestBox 
          allData={allData} 
          setResults={setResults} 
          setCurrentPage={setCurrentPage} 
          keywords={keywords} 
        />

        <FilterPrice 
          minPrice={minPrice} 
          setMinPrice={(p) => { setMinPrice(p); applyFilters(undefined, p, keywords); }} 
        />

        <div className="keyword-box">
          <p className="keyword-label">Tìm kiếm theo tên gói thầu</p>
          <input
            className="keyword-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Nhập nội dung..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const newKws = keyword.trim() ? [keyword.trim()] : [];
                setKeywords(newKws);
                applyFilters(undefined, minPrice, newKws);
                setKeyword("");
              }
            }}
          />
        </div>
      </div>

      {/* KHỐI BẢNG (THAY THẾ <TABLE />) */}
      <div className="result-table-wrapper">
        <h2 className="main-title">DANH SÁCH CÁC GÓI THẦU MỚI NHẤT</h2>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Số KHLCNT</th>
              <th>Tên gói thầu</th>
              <th>Tên KHLCNT</th>
              <th>Hình thức LCNT</th>
              <th>Địa điểm thực hiện</th>
              <th>Bên mời thầu/Chủ đầu tư</th>
              <th>Dự toán (VNĐ)</th>
              <th>Tổ chức LCNT</th>
              <th>Theo dõi</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, idx) => {
              const name = item.bid_name?.[0] || "";
              const price = item.bid_price?.[0] || 0;
              const rawPlanNo = item.plan_no || "";
              const formattedPlanNo = rawPlanNo.length > 2 ? rawPlanNo.slice(2) : rawPlanNo;
              return (
                <tr key={item.id || idx}>
                  <td className="text-cyan">{formattedPlanNo || "---"}</td>
                  <td>
                    <a href={`/bid/${convertToSlug(name)}`} className="text-cyan link-hover">
                      {name}
                    </a>
                  </td>
                  <td className="text-cyan">{item.plan_name?.[0] || name}</td>
                  <td>Đấu thầu rộng rãi</td>
                  <td>{item.locations?.[0]?.prov_name || "Toàn quốc"}</td>
                  <td className="text-cyan">{item.investor_name || "---"}</td>
                  <td className="text-bold">{price.toLocaleString("vi-VN")}</td>
                  <td>Quý II, 2026</td>
                  <td className="text-center">🤍</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Phân trang */}
        <div className="pagination-bar">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(v => v - 1)}>Trước</button>
          <span>Trang {currentPage} / {totalPages || 1}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(v => v + 1)}>Sau</button>
        </div>
      </div>
    </div>
  );
}

export default Lcnt;