function FilterPrice({ minPrice, setMinPrice }) {
  const priceOptions = [
    { value: "", label: "Tất cả" },
    { value: "1000000000", label: "Từ 1 tỷ" },
    { value: "2000000000", label: "Từ 2 tỷ" },
    { value: "3000000000", label: "Từ 3 tỷ" },
    { value: "4000000000", label: "Từ 4 tỷ" },
    { value: "5000000000", label: "Từ 5 tỷ" },
  ];

  const selectStyle = {
    width: "100%",
    backgroundColor: "transparent",
    color: "white",
    border: "1px solid #cbd5e1",
    borderRadius: "4px",
    padding: "10px 15px",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 15px center",
    backgroundSize: "16px",
  };

  return (
    <div className="filter-price-section" style={{ marginBottom: "25px" }}>
      <select
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        style={selectStyle} 
      >
        {priceOptions.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: "#0f172a", color: "white" }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterPrice;