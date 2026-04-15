import React from "react";
import { FiTrendingUp } from "react-icons/fi";
import { FaRegHeart,FaRegChartBar,FaSearch,FaBullseye} from "react-icons/fa";
function SideBar({ activeMenu, setActiveMenu }) {
  return (
    <div className="sidebar">
      <h1 className={activeMenu === "home" ? "active" : ""}
          onClick={() => setActiveMenu("home")}>Bidwinner</h1>

      <div className="menu">
        <h2>Thiết lập của bạn</h2>   
        <p
          className={activeMenu === "timeline" ? "active" : ""}
          onClick={() => setActiveMenu("timeline")}
        >
          <FiTrendingUp style={{ marginLeft: "5px" }} /> Timeline đấu thầu
        </p>

        <p
          className={activeMenu === "settings" ? "active" : ""}
          onClick={() => setActiveMenu("settings")}
        >
          <FaRegChartBar style={{ marginLeft: "5px" }} /> Bộ lọc tìm kiếm
        </p>

        <p
          className={activeMenu === "favorite" ? "active" : ""}
          onClick={() => setActiveMenu("favorite")}
        >
          <FaRegHeart style={{ marginLeft: "5px" }} /> Gói thầu đang theo dõi
        </p>
        <h2>Tìm kiếm gói thầu</h2>
         <p
          className={activeMenu === "keyword" ? "active" : ""}
          onClick={() => setActiveMenu("keyword")}
        >
          <FaSearch style={{ marginLeft: "5px" }} />Theo từ khóa
        </p> <p
          className={activeMenu === "favorite" ? "active" : ""}
          onClick={() => setActiveMenu("favorite")}
        >
          <FaSearch style={{ marginLeft: "5px" }} />Phòng chào giá trực tuyến
        </p> <p
          className={activeMenu === "province" ? "active" : ""}
          onClick={() => setActiveMenu("province")}
        >
          <FaSearch style={{ marginLeft: "5px" }} />Theo địa phương
        </p> <p
          className={activeMenu === "districtjob" ? "active" : ""}
          onClick={() => setActiveMenu("districtjob")}
        >
         <FaSearch style={{ marginLeft: "5px" }} />Ngành nghề & địa phương
        </p>
         <p
          className={activeMenu === "lcnt" ? "active" : ""}
          onClick={() => setActiveMenu("lcnt")}
        >
          <FaSearch style={{ marginLeft: "5px" }} />Kế hoạch LCNT
        </p>
         <p
          className={activeMenu === "favorite" ? "active" : ""}
          onClick={() => setActiveMenu("favorite")}
        >
          <FaSearch style={{ marginLeft: "5px" }} />Dự án đầu tư phát triển
        </p>
        <h2>Thông tin đấu thầu</h2>
        <p
          className={activeMenu === "favorite" ? "active" : ""}
          onClick={() => setActiveMenu("favorite")}
        >
          <FaBullseye style={{ marginLeft: "5px" }} />Dự án đầu tư phát triển
        </p>  
        <p
          className={activeMenu === "PackageBid" ? "active" : ""}
          onClick={() => setActiveMenu("PackageBid")}
        >
          <FaBullseye style={{ marginLeft: "5px" }} />Tra cứu gói thầu 
        </p> 
        <p
          className={activeMenu === "favorite" ? "active" : ""}
          onClick={() => setActiveMenu("favorite")}
        >
          <FaBullseye style={{ marginLeft: "5px" }} />Dự án đầu tư phát triển
        </p> 
        <p
          className={activeMenu === "favorite" ? "active" : ""}
          onClick={() => setActiveMenu("favorite")}
        >
          <FaBullseye style={{ marginLeft: "5px" }} />Dự án đầu tư phát triển
        </p> 
        <p
          className={activeMenu === "favorite" ? "active" : ""}
          onClick={() => setActiveMenu("favorite")}
        >
          <FaBullseye style={{ marginLeft: "5px" }} />Dự án đầu tư phát triển
        </p> 
      </div>
    </div>
  );
}

export default SideBar;
