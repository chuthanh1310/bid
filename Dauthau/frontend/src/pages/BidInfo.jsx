import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./BidInfo.css";

function BidInfo() {
  const { bidSlug } = useParams();
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const convertToSlug = (str) => {
    let text = Array.isArray(str) ? str[0] : str;
    if (!text || typeof text !== "string") return "";
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  useEffect(() => {
    if (!bidSlug) return;

    setLoading(true);
    axios
      .get("http://localhost:8000/data")
      .then((res) => {
        const item = res.data.find((d) => {
          let name = Array.isArray(d.bid_name[0])
            ? d.bid_name[0]
            : d.bid_name ;

          if (!name) return false;

          const currentSlug = convertToSlug(name.toString().trim());
          return currentSlug === bidSlug;
        });

        setBid(item || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [bidSlug]);

  if (loading) return <div>Đang tải thông tin gói thầu...</div>;
  if (!bid) return <div>Không tìm thấy thông tin gói thầu.</div>;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN");
  };

  return (
    <div className="bid-info">
      <h2>
        {Array.isArray(bid.bid_name)
          ? bid.bid_name[0]
          : bid.bid_name || bid.bidName}
      </h2>

      <table className="bid-table">
        <tbody>
          <tr>
            <td className="label">Số TBMT:</td>
            <td>{bid.notify_no || bid.notifyNo}</td>
          </tr>
          <tr>
            <td className="label">Thời điểm đóng thầu:</td>
            <td>{formatDate(bid.bid_close_date || bid.bidCloseDate)}</td>
          </tr>
          <tr>
            <td className="label">Chủ đầu tư:</td>
            <td>{bid.investor_name || bid.investorName}</td>
          </tr>
          <tr>
            <td className="label">Tên gói thầu:</td>
            <td>
              {Array.isArray(bid.bid_name)
                ? bid.bid_name[0]
                : bid.bid_name || bid.bidName}
            </td>
          </tr>
          <tr>
            <td className="label">Số hiệu KHLCNT:</td>
            <td>{bid.plan_no}</td>
          </tr>
          <tr>
            <td className="label">Địa điểm thực hiện:</td>
            <td>
              {bid.locations
                ?.map(
                  (loc) =>
                    `${loc.districtName || loc.district_name}, ${
                      loc.provName || loc.prov_name
                    }`,
                )
                .join("; ")}
            </td>
          </tr>
          <tr>
            <td className="label">Giá gói thầu:</td>
            <td>
              {(bid.bid_price?.[0] || bid.bidPrice?.[0] || 0).toLocaleString(
                "vi-VN",
              )}{" "}
              VND
            </td>
          </tr>
          <tr>
            <td className="label">Ngày đăng:</td>
            <td>{formatDate(bid.public_date || bid.publicDate)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default BidInfo;
