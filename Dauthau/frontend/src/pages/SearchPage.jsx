import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./SearchPage.css";
import Table from "../components/Table";
import InvestBox from "../components/InvestBox";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchPage() {
  const query = useQuery();
  const provinceQuery = query.get("province");

  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [investFields, setInvestFields] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState([]);

  const itemsPerPage = 5;

  // ================= CALL API =================
  const fetchData = async (page = 1, override = {}) => {
    try {
      const res = await axios.get("http://localhost:8000/search", {
        params: {
          q: (override.keywords ?? keywords).join(" "),
          provinces: provinceQuery || "",
          invest_field: (override.investFields ?? investFields).join(","),
          page: page,
          size: itemsPerPage,
        },
      });

      setResults(res.data.data || []);
      setTotal(res.data.total || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= INIT =================
  useEffect(() => {
    fetchData(1);
  }, [provinceQuery]);

  // ================= FILTER =================
  const applyFilters = (newInvestFields, newKeywords) => {
    setInvestFields(newInvestFields);
    setKeywords(newKeywords);

    fetchData(1, {
      investFields: newInvestFields,
      keywords: newKeywords,
    });
  };

  return (
    <div className="search-container">
      <div className="filter-box">
        <h3 className="filter-title">
          Danh sách các gói thầu đang mời thầu
        </h3>

        <InvestBox
          selected={investFields}
          setSelected={(list) => applyFilters(list, keywords)}
        />

        <div className="keyword-box">
          <p className="keyword-label">Lọc kết quả theo từ khóa</p>

          <input
            className="keyword-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Nhập từ khóa..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = keyword.trim();
                if (!val) return;

                applyFilters(investFields, [val]);
                setKeyword("");
              }
            }}
          />
        </div>
      </div>

      <Table
        data={results}
        total={total}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        onPageChange={fetchData}
      />
    </div>
  );
}

export default SearchPage;