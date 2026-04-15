import { useState, useRef, useEffect } from "react";
import "./InvestFields.css";

const investOptions = [
  { code: "HH", name: "Hàng hóa" },
  { code: "XL", name: "Xây lắp" },
  { code: "TV", name: "Tư vấn" },
  { code: "PTV", name: "Phi tư vấn" },
];

export default function InvestFields({ selected, setSelected, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const toggleOption = (code) => {
    let newList;
    if (selected.includes(code)) {
      if (selected.length === 1) return; 
      newList = selected.filter((c) => c !== code);
    } else {
      newList = [...selected, code];
    }
    setSelected(newList);
    if (onChange) onChange(newList);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="invest-field-dropdown" ref={dropdownRef}>
      <div className="select-box" onClick={() => setOpen(!open)}>
        {selected.length === investOptions.length
          ? "Tất cả"
          : investOptions
              .filter((o) => selected.includes(o.code))
              .map((o) => o.name)
              .join(", ")}
        <span className="arrow">{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="options-box">
          {investOptions.map((f) => (
            <div
              key={f.code}
              className="option-item"
              onClick={(e) => {
                e.stopPropagation();
                toggleOption(f.code);
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(f.code)}
                readOnly
              />
              <span>{f.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}