import React, { useState } from "react";

function KeywordInput({ keywords, setKeywords }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = inputValue.trim();
      if (!value) return;

      // Tránh trùng lặp từ khóa
      if (!keywords.includes(value)) {
        setKeywords([...keywords, value]);
      }
      setInputValue("");
    }
  };

  const removeKeyword = (kwToRemove) => {
    setKeywords(keywords.filter((kw) => kw !== kwToRemove));
  };

  return (
    <div className="keyword-input-wrapper">
      <input
        className="input-keyword"
        placeholder="Thêm từ khóa tìm kiếm cho bộ lọc"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      
      {keywords.length > 0 && (
        <div className="selected-keywords">
          {keywords.map((kw, index) => (
            <div key={index} className="keyword-tag">
              <span
                className="remove-btn"
                onClick={() => removeKeyword(kw)}
              >
                ×
              </span>
              {kw}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KeywordInput;