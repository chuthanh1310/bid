import React from "react";
import provinces from "../data/provinces";
import "../pages/KeyWordSearch.css"
import { useInvest } from "../context/InvestContext";

function ProvinceFilter({ isNation,setIsNation,selectedProvinces, setSelectedProvinces, showProvinceBox, setShowProvinceBox }) {
  //const { globalProvince, setGlobalProvince, isNation, setIsNation } = useInvest();
  const handleToggleProvince = (code) => {
    if (globalProvince.includes(code)) {
      setSelectedProvinces(globalProvince.filter((p) => p !== code));
    } else {
      setSelectedProvinces([...selectedProvinces, code]);
    }
    setShowProvinceBox(false);
  };

  return (
    <div className="province-filter-section">
      <h3>Chọn địa điểm thực hiện gói thầu:</h3>
      <div className="location-options">
        <label>
          <input
            type="radio"
            checked={isNation}
            onChange={() => {
              setIsNation(true);
              setSelectedProvinces([]);
              setShowProvinceBox(false);
            }}
          />
          Trên toàn quốc
        </label>
        <br />
        <label>
          <input
            type="radio"
            checked={!isNation}
            onChange={() => {setIsNation(false); setShowProvinceBox(true)}}
          />
          Theo tỉnh/thành phố
        </label>
      </div>

      {!isNation && (
        <div className="province-selector-container">
          {showProvinceBox && (
            <div className="province-box">
              {provinces.map((prov) => (
                <div
                  key={prov.code}
                  className={`province-item ${
                    selectedProvinces.includes(prov.code) ? "selected" : ""
                  }`}
                  onClick={() => handleToggleProvince(prov.code)}
                >
                  {prov.name}
                </div>
              ))}
            </div>
          )}
          
            <div className="selected-provinces">
              {selectedProvinces.map((code) => {
                const prov = provinces.find((p) => p.code === code);
                return (
                  <div key={code} className="province-tag">
                    <span
                      className="remove-btn"
                      onClick={() => setSelectedProvinces(selectedProvinces.filter(p => p !== code))}
                    >
                      ×
                    </span>
                    {prov?.name}
                  </div>
                );
              })}
            </div>
          {!showProvinceBox && (
            <div
              className="reopen-province"
              onClick={() => setShowProvinceBox(true)}
            >
              <div className="choose-again"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProvinceFilter;