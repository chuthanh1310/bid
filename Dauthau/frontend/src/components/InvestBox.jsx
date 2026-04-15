import React, { useState } from "react";
import "./InvestBox.css";

function InvestBox({ allData, setResults, setCurrentPage, keywords }) {
  const [selectedField, setSelectedField] = useState("");

  const fields = [
    { code: "HH", name: "Hàng hóa" },
    { code: "XL", name: "Xây lắp" },
    { code: "TV", name: "Tư vấn" },
    { code: "PTV", name: "Phi tư vấn" },
  ];

  
  const handleFilter = (fieldCode) => {
    setSelectedField(fieldCode); 
    
    let filtered = [...allData];

    if (fieldCode) {
      filtered = filtered.filter((item) => {
        const field = item.invest_field || item.investField;
        if (!field) return false;
        return Array.isArray(field) ? field.includes(fieldCode) : field === fieldCode;
      });
    }
    if (keywords && keywords.length > 0) {
      filtered = filtered.filter((item) => {
        let names = Array.isArray(item.bid_name) ? item.bid_name : [item.bid_name || ""];
        return keywords.some((kw) => 
          names.some((n) => n.toLowerCase().includes(kw.toLowerCase()))
        );
      });
    }

    setResults(filtered); 
    setCurrentPage(1);    
  };

  return (
    <div className="radio-group">
      {fields.map((f) => (
        <label 
          key={f.code} 
          className={`radio-item ${selectedField === f.code ? "active" : ""}`}
        >
          <input
            type="radio"
            name="investField"
            value={f.code}
            checked={selectedField === f.code}
            onChange={() => handleFilter(f.code)}
          />
          <span>{f.name}</span>
        </label>
      ))}
    </div>
  );
}

export default InvestBox;