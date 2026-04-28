import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProvinceSearch.css";
import provinces from "../data/provinces";
import {
  FaBuilding,
  FaChartBar,
  FaMapMarkerAlt,
  FaSearch,
  FaChartLine,
} from "react-icons/fa";


const investOptions = [
  { code: "HH", name: "Hàng hóa" },
  { code: "XL", name: "Xây lắp" },
  { code: "TV", name: "Tư vấn" },
  { code: "PTV", name: "Phi tư vấn" },
  { code:"HON_HOP", name:"Hỗn hợp"}
];

function ProvinceSearch() {
  const [totalBids, setTotalBids] = useState(0);
  const [provinceStats, setProvinceStats] = useState([]);
  const [search, setSearch] = useState("");
  const [investField, setInvestField] = useState("HH"); // ✅ state lĩnh vực

  // ✅ Load data theo lĩnh vực
  useEffect(() => {
    fetchData(investField);
  }, [investField]);

  const fetchData = async (field) => {
    try {
      const res = await axios.get("http://localhost:8000/data");
      let data = res.data;

      // ✅ FILTER THEO LĨNH VỰC
      if (field) {
        data = data.filter((item) => {
          const f = item.invest_field || item.investField;

          if (!f) return false;

          if (Array.isArray(f)) {
            return f.includes(field);
          }

          return f === field;
        });
      }

      const countMap = {};
      setTotalBids(data.length);

      // ✅ Đếm số gói theo tỉnh
      data.forEach((item) => {
        if (item.locations) {
          item.locations.forEach((loc) => {
            const code = loc.prov_code || loc.provCode;

            if (!countMap[code]) countMap[code] = 0;
            countMap[code]++;
          });
        }
      });

      // ✅ Map ra danh sách tỉnh
      const result = provinces.map((p) => ({
        name: p.name,
        code: p.code,
        total: countMap[p.code] || 0,
      }));

      setProvinceStats(result);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Search tỉnh
  const filteredProvinces = provinceStats.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="wrapper">
      {/* Header */}
      <div className="top-bar">
        <FaBuilding className="building-icon" />
      </div>

      <h1 className="title">Gói thầu theo tỉnh thành</h1>

      {/* ✅ Hiển thị lĩnh vực đang chọn */}
      <p className="subtitle">
        Lĩnh vực:{" "}
        <span>
          {investOptions.find((i) => i.code === investField)?.name}
        </span>
      </p>

      {/* ✅ Select lĩnh vực */}
      <div className="filter">
        <label>Chọn lĩnh vực:</label>

        <select
          value={investField}
          onChange={(e) => setInvestField(e.target.value)}
        >
          {investOptions.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      {/* Cards */}
      <div className="cards">
        <div className="card green">
          <FaChartBar className="icon" />
          <h2>{totalBids}</h2>
          <p>Tổng số gói thầu</p>
        </div>

        <div className="card dark">
          <FaMapMarkerAlt className="icon" />
          <h2>{provinces.length}</h2>
          <p>Tỉnh thành có dữ liệu</p>
        </div>

        <div className="card orange">
          <FaChartLine className="icon" />
          <h2>{Math.floor(totalBids / provinces.length)}</h2>
          <p>Trung bình/tỉnh</p>
        </div>
      </div>

      {/* Search */}
      <div className="search-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm tỉnh thành..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Province list */}
      <div className="province-list">
        {filteredProvinces.map((p) => (
          <div
            key={p.code}
            className="province-card"
            onClick={() => {
              if (p.total > 0) {
                window.location.href = `/search?province=${p.code}`;
              } else {
                alert("Hiện tại chưa có gói thầu cho tỉnh này!");
              }
            }}
            style={{ cursor: p.total > 0 ? "pointer" : "default" }}
          >
            <div className="province-left">
              <FaMapMarkerAlt
                className={`province-icon ${p.total > 0 ? "active" : ""}`}
              />
              <span className="province-name">{p.name}</span>
            </div>

            <div
              className={`province-badge ${
                p.total === 0 ? "no-data" : p.total > 15 ? "high" : "medium"
              }`}
            >
              {p.total === 0 ? "Chưa có dữ liệu" : `${p.total} gói thầu`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProvinceSearch;