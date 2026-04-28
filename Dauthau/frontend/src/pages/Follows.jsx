import { useEffect, useState } from "react";
import axios from "axios";
import "./Follows.css";

function Follows() {
  const [tab, setTab] = useState("tbmt");
  const [timeFilter, setTimeFilter] = useState("all");
  const [data, setData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [formFilter, setFormFilter] = useState("all");

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      setLoading(true);

      const followRes = await axios.get("http://localhost:8000/my-follow", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const followIds = new Set(followRes.data.map((f) => String(f.bid_id)));

      const dataRes = await axios.get("http://localhost:8000/data");

      let filtered = dataRes.data.filter((item) =>
        followIds.has(String(item.bid_id)),
      );

      if (timeFilter !== "all") {
        const now = new Date();
        let limitDate = new Date();

        if (timeFilter === "3m") {
          limitDate.setMonth(now.getMonth() - 3);
        } else if (timeFilter === "6m") {
          limitDate.setMonth(now.getMonth() - 6);
        } else if (timeFilter === "1y") {
          limitDate.setFullYear(now.getFullYear() - 1);
        }

        const followMap = {};
        followRes.data.forEach((f) => {
          followMap[String(f.bid_id)] = f.created_at;
        });

        filtered = filtered.filter((item) => {
          const created = followMap[String(item.bid_id)];
          return created && new Date(created) >= limitDate;
        });
      }
      if (formFilter !== "all") {
        filtered = filtered.filter((item) => item.bid_form === formFilter);
      }
      if (statusFilter !== "all") {
        const now = new Date();

        filtered = filtered.filter((item) => {
          if (!item.bid_close_date) return false;

          const closeDate = new Date(item.bid_close_date);

          if (statusFilter === "open") {
            return closeDate > now;
          }

          if (statusFilter === "closed") {
            return closeDate <= now;
          }

          return true;
        });
      }
      setData(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeFilter, statusFilter,formFilter]);

  return (
    <div className="follows-page">
      {/* 🔵 FILTER TOP */}
      <div className="top-filter">
        <h3>Tải các gói thầu đang theo dõi của tôi:</h3>

        <label>
          <input
            type="radio"
            checked={timeFilter === "3m"}
            onChange={() => setTimeFilter("3m")}
          />
          Trong vòng 3 tháng trở lại đây
        </label>

        <label>
          <input
            type="radio"
            checked={timeFilter === "6m"}
            onChange={() => setTimeFilter("6m")}
          />
          Trong vòng 6 tháng trở lại đây
        </label>

        <label>
          <input
            type="radio"
            checked={timeFilter === "1y"}
            onChange={() => setTimeFilter("1y")}
          />
          Trong vòng 1 năm trở lại đây
        </label>

        <label>
          <input
            type="radio"
            checked={timeFilter === "all"}
            onChange={() => setTimeFilter("all")}
          />
          Tất cả
        </label>
      </div>

      {/* 🔵 TABS */}
      <div className="tabs">
        <button
          className={tab === "tbmt" ? "active" : ""}
          onClick={() => setTab("tbmt")}
        >
          THÔNG BÁO MỜI THẦU
        </button>

        <button
          className={tab === "lcnt" ? "active" : ""}
          onClick={() => setTab("lcnt")}
        >
          KẾ HOẠCH LCNT
        </button>

        <button
          className={tab === "dtpt" ? "active" : ""}
          onClick={() => setTab("dtpt")}
        >
          DỰ ÁN ĐTPT
        </button>
      </div>

      {tab === "tbmt" && (
        <div className="content">
          <h3>Danh sách gói thầu đang theo dõi</h3>

          <div className="status-filter">
            <label>
              <input
                type="radio"
                checked={statusFilter === "all"}
                onChange={() => setStatusFilter("all")}
              />
              Tất cả
            </label>

            <label>
              <input
                type="radio"
                checked={statusFilter === "open"}
                onChange={() => setStatusFilter("open")}
              />
              Chưa đóng thầu
            </label>

            <label>
              <input
                type="radio"
                checked={statusFilter === "closed"}
                onChange={() => setStatusFilter("closed")}
              />
              Đã đóng thầu
            </label>
          </div>
          <h3>Lọc theo hình thức lựa chọn nhà thầu</h3>

          <div className="form-filter">
            <label>
              <input
                type="radio"
                checked={formFilter === "all"}
                onChange={() => setFormFilter("all")}
              />
              Tất cả
            </label>

            <label>
              <input
                type="radio"
                checked={formFilter === "CGTTRG"}
                onChange={() => setFormFilter("CGTTRG")}
              />
              Chào hàng cạnh tranh rút gọn
            </label>

            <label>
              <input
                type="radio"
                checked={formFilter === "DTRR"}
                onChange={() => setFormFilter("DTRR")}
              />
              Đấu thầu rộng rãi
            </label>

            <label>
              <input
                type="radio"
                checked={formFilter === "CHCT"}
                onChange={() => setFormFilter("CHCT")}
              />
              Chào hàng cạnh tranh
            </label>
          </div>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Tên gói thầu</th>
                  <th>Chủ đầu tư</th>
                  <th>Giá</th>
                  <th>Địa điểm</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="empty">
                      Đang tải...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty">
                      Chưa có dữ liệu
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => {
                    const name = item.bid_name?.[0] || "";
                    const investor = item.investor_name || "";
                    const price = item.bid_price?.[0] || 0;
                    const province = item.locations?.[0]?.prov_name || "";

                    return (
                      <tr key={index}>
                        <td>{name}</td>
                        <td>{investor}</td>
                        <td>
                          {price
                            ? price.toLocaleString("vi-VN") + " VND"
                            : "N/A"}
                        </td>
                        <td>{province}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Follows;
