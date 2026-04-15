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

  const [allData, setAllData] = useState([]);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [investFields, setInvestFields] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState([]);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;


  useEffect(() => {
    axios
      .get("http://localhost:8000/data")
      .then((res) => {
        let filtered = res.data;
        if (provinceQuery) {
          filtered = filtered.filter((item) =>
            item.locations?.some(
              (loc) =>
                loc.prov_code === provinceQuery ||
                loc.provCode === provinceQuery,
            ),
          );
        }

        setAllData(filtered);
        setResults(filtered);
        setCurrentPage(1);
      })
      .catch((err) => console.error(err));
  }, [provinceQuery]);
  const applyFilters = (
    newInvestFields = investFields,
    newKeywords = keywords,
  ) => {
    let filtered = [...allData];
    if (newInvestFields.length > 0) {
      filtered = filtered.filter((item) => {
        const field = item.invest_field || item.investField;
        if (!field) return false;
        if (Array.isArray(field)) {
          return field.some((f) => newInvestFields.includes(f));
        }
        return newInvestFields.includes(field);
      });
    }
    if (newKeywords.length > 0) {
      filtered = filtered.filter((item) => {

        let names = [];
        if (Array.isArray(item.bid_name)) names = item.bid_name;
        else if (Array.isArray(item.bidName)) names = item.bidName;
        else names = [item.bid_name || item.bidName || ""];
        let investors = [];
        if (Array.isArray(item.investor_name)) investors = item.investor_name;
        else if (Array.isArray(item.investorName))
          investors = item.investorName;
        else investors = [item.investor_name || item.investorName || ""];
        return newKeywords.some((kw) => {
          const k = kw.toLowerCase();
          return (
            names.some((n) => (n || "").toLowerCase().includes(k)) ||
            investors.some((inv) => (inv || "").toLowerCase().includes(k))
          );
        });
      });
    }

    setResults(filtered);
    setCurrentPage(1);
  };

  return (
    <div className="search-container">
      <div className="filter-box">
        <h3 className="filter-title">Danh sách các gói thầu đang mời thầu</h3>
        <InvestBox 
          allData={allData} 
          setResults={setResults} 
          setCurrentPage={setCurrentPage}
          keywords={keywords}
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

                setKeywords([val]);
                applyFilters(investFields, [val]);
                setKeyword("");
              }
            }}
          />
        </div>
      </div>

      <Table
        data={results}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

export default SearchPage;
