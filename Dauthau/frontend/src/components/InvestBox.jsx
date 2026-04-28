import React, { useState } from "react";
import "./InvestBox.css";

function InvestBox({ selected, setSelected }) {
  const [selectedField, setSelectedField] = useState("");

  const fields = [
    { code: "HH", name: "Hàng hóa" },
    { code: "XL", name: "Xây lắp" },
    { code: "TV", name: "Tư vấn" },
    { code: "PTV", name: "Phi tư vấn" },
    { code: "HON_HOP", name: "Hỗn hợp" },
  ];

  const handleChange = (fieldCode) => {
    setSelectedField(fieldCode);

    // 👇 gửi lên component cha
    setSelected([fieldCode]);
  };

  return (
    <div className="radio-group">
      {fields.map((f) => (
        <label
          key={f.code}
          className={`radio-item ${
            selectedField === f.code ? "active" : ""
          }`}
        >
          <input
            type="radio"
            name="investField"
            value={f.code}
            checked={selectedField === f.code}
            onChange={() => handleChange(f.code)}
          />
          <span>{f.name}</span>
        </label>
      ))}
    </div>
  );
}

export default InvestBox;