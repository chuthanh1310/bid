import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./BidInfo.css";

function BidInfo() {
  const { slug } = useParams(); // 🔥 đổi bidSlug -> slug
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= FETCH DATA =================
  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    axios
      .get(`http://localhost:8000/bid/${slug}`)
      .then((res) => {
        setBid(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setBid(null);
        setLoading(false);
      });
  }, [slug]);

  // ================= LOADING =================
  if (loading) return <div>Đang tải...</div>;
  if (!bid) return <div>Không tìm thấy</div>;

  // ================= FORMAT =================
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  const isOpen = new Date() < new Date(bid.bid_close_date);

  const getBidModeText = (mode) => {
    switch (mode) {
      case "1_MTHS":
        return "Một giai đoạn một túi hồ sơ";
      case "1_HTHS":
        return "Một giai đoạn hai túi hồ sơ";
      default:
        return mode || "";
    }
  };

  const getInvestField = (fields) => {
    if (!fields || fields.length === 0) return "";

    if (fields.includes("XL")) return "Xây lắp";
    if (fields.includes("TV")) return "Tư vấn";
    if (fields.includes("HH")) return "Hàng hóa";

    return fields.join(", ");
  };

  // ================= RENDER =================
  return (
    <div className="bid-container">
      {/* HEADER */}
      <h2 className="bid-title">
        {Array.isArray(bid.bid_name)
          ? bid.bid_name[0]
          : bid.bid_name}
      </h2>

      <div className="bid-grid">
        {/* LEFT */}
        <div className="bid-left">
          <p>Số TBMT</p>
          <p>Thời điểm đóng/mở thầu</p>
          <p>Bên mời thầu</p>
          <p>Chủ đầu tư</p>
          <p>Quy trình áp dụng</p>
          <p>Tên gói thầu</p>
          <p>Số hiệu KHLCNT</p>
          <p>Lĩnh vực</p>
          <p>Hình thức LCNT</p>
          <p>Phương thức LCNT</p>
          <p>Thời gian thực hiện</p>
          <p>Địa điểm</p>
          <p>Giá gói thầu</p>
        </div>

        {/* RIGHT */}
        <div className="bid-right">
          <p>{bid.notify_no}</p>

          <p>
            {formatDate(bid.bid_close_date)}
            <span className="status-badge">
              {isOpen ? "Chưa đóng thầu" : "Đã đóng thầu"}
            </span>
          </p>

          <p>{bid.investor_name}</p>

          <p>{bid.investor_name}</p>

          <p>{bid.process_apply}</p>

          <p className="highlight">
            {Array.isArray(bid.bid_name)
              ? bid.bid_name[0]
              : bid.bid_name}
          </p>

          <p>{bid.plan_no}</p>

          <p>{getInvestField(bid.invest_field)}</p>

          <p>
            {bid.bid_form === "DTRR"
              ? "Đấu thầu rộng rãi"
              : bid.bid_form}
          </p>

          <p>{getBidModeText(bid.bid_mode)}</p>

          <p className="highlight-red">270 ngày</p>

          <p className="highlight-red">
            {bid.locations
              ?.map(
                (l) =>
                  `${l.district_name || ""} ${l.prov_name || ""}`
              )
              .join(", ")}
          </p>

          <p>
            {(bid.bid_price?.[0] || 0).toLocaleString("vi-VN")} VND
          </p>
        </div>
      </div>
    </div>
  );
}

export default BidInfo;