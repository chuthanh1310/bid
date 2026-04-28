import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Timeline.css";
import {
  FaRegClock,
  FaMapMarkerAlt,
  FaBuilding,
  FaMoneyBillWave,
  FaFileAlt,
} from "react-icons/fa";

function Timeline() {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
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
  useEffect(() => {
    const fetchFollowedBids = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const followRes = await axios.get("http://localhost:8000/my-follow", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const followIds = followRes.data.map((f) => f.bid_id);

        const dataRes = await axios.get("http://localhost:8000/data");
        
        const filtered = dataRes.data.filter((item) =>
          followIds.includes(item.bid_id),
        );
        setBids(filtered);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFollowedBids();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  return (
    <div className="timeline">
      <div className="timeline-header">
        <button className="tab active">Gói thầu & Dự án</button>
      </div>

      <div className="timeline-list">
        {bids.length === 0 && (
          <p className="empty">Chưa theo dõi gói thầu nào</p>
        )}

        {bids.map((item, index) => {
          const name = item.bid_name?.[0] || "";
          const investor = item.investor_name || "";
          const province = item.locations?.[0]?.prov_name || "";
          const district = item.locations?.[0]?.district_name || "";
          const price = item.bid_price?.[0] || 0;

          return (
            <div className="timeline-item" key={index}>
              <div className="timeline-dot"></div>

              <div className="timeline-card">
                <div className="badge">THÔNG BÁO MỜI THẦU</div>

                <h3
                  className="title clickable"
                  onClick={() => navigate(`/bid/${convert(name)}`)}
                >
                  {name}
                </h3>

                <div className="time">
                  {formatDate(item.public_date)}
                  <span className="status">Chưa đóng thầu</span>
                </div>

                <hr />

                <div className="info-line">
                  <div className="icons">
                    <FaBuilding />
                  </div>
                  <div>
                    <b>Bên mời thầu:</b> {investor}
                  </div>
                </div>

                <div className="info-line">
                  <div className="icons">
                    <FaRegClock />
                  </div>
                  <div>
                    <b>Đóng thầu:</b> {formatDate(item.bid_close_date)}
                  </div>
                </div>

                <div className="info-line">
                  <div className="icons">
                    <FaMoneyBillWave />
                  </div>
                  <div>
                    <p>
                      Giá trị:{" "}
                      <span className="price">
                        {price.toLocaleString("vi-VN")} VND
                      </span>
                    </p>
                  </div>
                </div>

                <div className="info-line">
                  <div className="icons">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    {district}, {province}
                  </div>
                </div>

                <span
                  className="detail clickable"
                  onClick={() => navigate(`/bid/${convert(name)}`)}
                >
                  Xem chi tiết
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Timeline;
