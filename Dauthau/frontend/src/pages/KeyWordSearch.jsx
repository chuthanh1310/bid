import { useState,useEffect } from "react";
import axios from "axios";
import "./KeyWordSearch.css";
import provinces from "../data/provinces";
import InvestFields from "../components/InvestFields";
import Table from "../components/Table";
import FilterPrice from "../components/FilterPrice";
import { useInvest } from "../context/InvestContext";
import KeywordInput from "../components/KeywordInput";
import ProvinceFilter from "../components/ProvinceFilter";
function KeyWordSearch() {
  const { globalInvestFields, globalKeywords,  globalProvince,isNation:globalIsNation } = useInvest();
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [minPrice, setMinPrice] = useState("0");
  const [showProvinceBox, setShowProvinceBox] = useState(false);
  const [investFields, setInvestFields] = useState(["HH"]);
  const [localProvince, setLocalProvince] = useState(globalProvince);
  const [localIsNation, setLocalIsNation] = useState(globalIsNation);
  const [localKeywords, setLocalKeywords] = useState(globalKeywords);
  const [localInvestFields, setLocalInvestFields] = useState(globalInvestFields);
  const itemsPerPage = 5;
  useEffect(() => {
    setLocalProvince(globalProvince);
    setLocalIsNation(globalIsNation);
    setLocalInvestFields(globalInvestFields);
    setLocalKeywords(globalKeywords);
  }, [globalProvince, globalIsNation, globalInvestFields, globalKeywords]);
  const handleSearch = async (override = {}) => {
    try {
      const res = await axios.get("http://localhost:8000/search", {
        params: {
          q: localKeywords.join(" "),
          provinces:
            !localIsNation && localProvince.length > 0
              ? localProvince.join(",")
              : "",

          minPrice: minPrice,
          invest_field: (override.investFields ?? investFields).join(","),
        },
      });

      setResults(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <div className="kw-container">
        <div className="kw-form">
          <h3>Chọn lĩnh vực:</h3>
          <InvestFields
            selected={localInvestFields}
            setSelected={setLocalInvestFields}
            onChange={(newList) => handleSearch({ investFields: newList })}
          />

          <h3>Chọn thời điểm đăng tải:</h3>
          <select>
            <option>Chưa đóng thầu</option>
          </select>
          <h3> Chọn giá gói thầu tối thiểu:</h3>
          <FilterPrice minPrice={minPrice} setMinPrice={setMinPrice} />
          <ProvinceFilter 
            isNation={localIsNation}
            setIsNation={setLocalIsNation}
            selectedProvinces={localProvince}
            setSelectedProvinces={setLocalProvince}
            showProvinceBox={showProvinceBox}
            setShowProvinceBox={setShowProvinceBox}
          />
          <button className="btn-search" onClick={handleSearch}>
            Tìm Kiếm
          </button>

          <h3>Từ khóa tìm kiếm:</h3>
          
          <KeywordInput
            keywords={localKeywords}
            setKeywords={setLocalKeywords}
          />
          <button className="btn-search" onClick={handleSearch}>
            Tìm Kiếm
          </button>
        </div>
        <div className="kw-guide">
          <h2>Hướng dẫn tìm kiếm</h2>

          <p>
            Để kết quả chính xác, nhập ít nhất 2 từ khóa. Hệ thống sẽ tìm trong{" "}
            <span className="red">tên gói thầu</span>,{" "}
            <span className="red">tên bên mời thầu</span>...
          </p>

          <p>Bạn có thể nhập tiếng Việt có dấu hoặc không dấu.</p>

          <p>Việc tìm kiếm có thể mất vài giây, vui lòng chờ.</p>

          <p>Các thay đổi tại đây không ảnh hưởng tới bộ lọc chính.</p>
        </div>
      </div>
      <div className="result-wrapper">
        <Table
          data={results}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
}

export default KeyWordSearch;
