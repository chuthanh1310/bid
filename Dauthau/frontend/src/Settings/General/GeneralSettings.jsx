import React, { useState } from "react";
import provincesData from "../../data/provinces";
import { Info } from "lucide-react";
import "./GeneralSettings.css"
const investOptions = [
  { code: "HH", name: "Hàng hóa" },
  { code: "XL", name: "Xây lắp" },
  { code: "TV", name: "Tư vấn" },
  { code: "PTV", name: "Phi tư vấn" },
];

function GeneralSettings({ 
  globalProvince, setGlobalProvince, 
  globalKeywords, setGlobalKeywords, 
  editingFields, setEditingFields,
  handleSave 
}) {
  const [isNation, setIsNation] = useState(globalProvince.length === 0);
  const [showProvinceBox, setShowProvinceBox] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleToggleField = (code) => {
    setEditingFields(prev => 
      prev.includes(code) ? prev.filter(f => f !== code) : [...prev, code]
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !globalKeywords.includes(val)) {
        setGlobalKeywords([...globalKeywords, val]);
        setInputValue("");
      }
    }
  };

  return (
    <div className="general-settings-content">
      <h2 className="main-title">THIẾT LẬP CHUNG</h2>

      {/* 1. Lĩnh vực */}
      <section className="form-section">
        <h4 className="section-header">1. Lĩnh vực đấu thầu quan tâm</h4>
        <div className="checkbox-list">
          {investOptions.map((item) => (
            <label key={item.code} className="check-item">
              <input
                type="checkbox"
                checked={editingFields.includes(item.code)}
                onChange={() => handleToggleField(item.code)}
              />
              <span className="check-text">{item.name}</span>
            </label>
          ))}
        </div>
      </section>

      {/* 2. Giá gói thầu */}
      <section className="form-section grid-2">
        <div className="select-group">
          <h4 className="section-header">2.1 Giá gói thầu tối thiểu</h4>
          <select className="dark-select">
            <option>0 tỷ đồng</option>
            <option>10 tỷ đồng</option>
          </select>
        </div>
        <div className="select-group">
          <h4 className="section-header">2.2 Giá gói thầu tối đa</h4>
          <select className="dark-select">
            <option>Chọn mức giá</option>
            <option>20 tỷ đồng</option>
          </select>
        </div>
      </section>

      {/* 3. Địa điểm */}
      <section className="form-section">
        <h4 className="section-header">3. Địa điểm thực hiện</h4>
        <div className="radio-list">
          <label className="radio-item">
            <input type="radio" name="loc" checked={isNation} onChange={() => { setIsNation(true); setGlobalProvince([]); }} />
            <span>Trên toàn quốc</span>
          </label>
          <label className="radio-item">
            <input type="radio" name="loc" checked={!isNation} onChange={() => setIsNation(false)} />
            <span>Theo tỉnh/thành phố</span>
          </label>
        </div>

        {!isNation && (
          <div className="province-wrapper">
             <p className="sub-label">Chọn tỉnh, thành phố:</p>
             <div className="tags-container">
               {globalProvince.map(code => (
                 <div key={code} className="tag blue-tag">
                   {provincesData.find(p => p.code === code)?.name}
                   <span className="close-x" onClick={() => setGlobalProvince(globalProvince.filter(p => p !== code))}>×</span>
                 </div>
               ))}
               <button className="add-prov-btn" onClick={() => setShowProvinceBox(!showProvinceBox)}>+</button>
             </div>
             
             {showProvinceBox && (
               <div className="province-dropdown-box">
                 {provincesData.map(p => (
                   <div key={p.code} className="prov-opt" onClick={() => {
                     if(!globalProvince.includes(p.code)) setGlobalProvince([...globalProvince, p.code]);
                     setShowProvinceBox(false);
                   }}>{p.name}</div>
                 ))}
               </div>
             )}
          </div>
        )}
      </section>

      {/* 4. Từ khóa */}
      <section className="form-section">
        <h4 className="section-header">4. Từ khóa chính bạn đang theo dõi</h4>
        <div className="blue-info-border">
          <p>Thiết lập từ khóa chính giúp bạn tiết kiệm thời gian nhập ở các trang tìm kiếm gói thầu/Kế hoạch LCNT...</p>
          <p>Các từ khóa chính thiết lập ở đây không ảnh hưởng tới các bộ lọc từ khóa của bạn.</p>
        </div>
        
        <div className="tags-container mt-15">
          {globalKeywords.map((kw, i) => (
            <div key={i} className="tag blue-tag">
              {kw} <span className="close-x" onClick={() => setGlobalKeywords(globalKeywords.filter(k => k !== kw))}>×</span>
            </div>
          ))}
        </div>

        <input 
          type="text" 
          className="dark-underline-input"
          placeholder="Thêm từ khóa"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <p className="hint-txt">(Tiếng Việt có dấu, không phân biệt chữ hoa chữ thường. <span className="red-txt">Nhấn Enter</span> để thêm từ khóa và click "Lưu thiết lập")</p>
      </section>

      {/* 5. Email */}
      <section className="form-section">
        <h4 className="section-header">5. Email nhận thông báo</h4>
        <label className="check-item">
          <input type="checkbox" />
          <span className="check-text">Email</span>
          <Info size={14} className="info-icon-grey" />
        </label>
      </section>

      <div className="center-btn-wrapper">
        <button className="purple-pill-btn" onClick={handleSave}>Lưu Thiết Lập</button>
      </div>
    </div>
  );
}

export default GeneralSettings;