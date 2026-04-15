import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Filter, Building2, ArrowRight } from "lucide-react";
import "./Settings.css";
import { useInvest } from "../context/InvestContext";
import GeneralSettings from "./General/GeneralSettings";
import KeywordSettings from "./Keyword/KeywordSettings";  
import BidderSettings from "./Bidder/BidderSettings";

function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [showToast, setShowToast] = useState(false);
  const {
    globalInvestFields, setGlobalInvestFields,
    globalKeywords, setGlobalKeywords,
    globalProvince, setGlobalProvince
  } = useInvest();

  const [editingFields, setEditingFields] = useState(globalInvestFields);

  useEffect(() => { setEditingFields(globalInvestFields); }, [globalInvestFields]);

  const handleSave = () => {
    setGlobalInvestFields(editingFields);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="settings-container">
      {/* Cards điều hướng */}
      <div className="cards-wrapper">
        <TabCard 
          active={activeTab === "general"} 
          onClick={() => setActiveTab("general")}
          icon={<SettingsIcon size={24} color="white" />}
          title="Quản lý thiết lập chung"
          bgColor="bg-purple"
        />
        <TabCard 
          active={activeTab === "filters"} 
          onClick={() => setActiveTab("filters")}
          icon={<Filter size={24} color="white" />}
          title="Quản lý bộ lọc từ khóa"
          bgColor="bg-cyan"
        />
        <TabCard 
          active={activeTab === "follow"} 
          onClick={() => setActiveTab("follow")}
          icon={<Building2 size={24} color="white" />}
          title="Theo dõi bên mời thầu"
          bgColor="bg-blue"
        />
      </div>
      <div className="settings-form">
        {activeTab === "general" && (
          <GeneralSettings 
            globalProvince={globalProvince} setGlobalProvince={setGlobalProvince}
            globalKeywords={globalKeywords} setGlobalKeywords={setGlobalKeywords}
            editingFields={editingFields} setEditingFields={setEditingFields}
            handleSave={handleSave}
          />
        )}
        {activeTab === "filters" && <KeywordSettings />}
        {activeTab === "follow" && <BidderSettings/>}
      </div>

      {showToast && <div className="custom-toast">Lưu thiết lập thành công!</div>}
    </div>
  );
}

// Component phụ cho đỡ lặp code card
const TabCard = ({ active, onClick, icon, title, bgColor }) => (
  <div className={`card ${active ? "card-active" : ""}`} onClick={onClick}>
    <div className={`card-header ${bgColor}`}>{icon}</div>
    <div className="card-body">
      <div className="card-title">{title}</div>
    </div>
    <div className="card-footer">
      <button className="btn-link">Vào thiết lập <ArrowRight size={16} /></button>
    </div>
  </div>
);

export default Settings;