import React, { createContext, useState, useEffect, useContext } from "react";

const InvestContext = createContext();

export const InvestProvider = ({ children }) => {
  const [globalKeywords, setGlobalKeywords] = useState(() => {
    const saved = localStorage.getItem('globalKeywords');
    return saved ? JSON.parse(saved) : [];
  });

  const [globalInvestFields, setGlobalInvestFields] = useState(() => {
    const saved = localStorage.getItem('globalInvestFields');
    return saved ? JSON.parse(saved) : ["HH"]; 
  });
  const[globalProvince, setGlobalProvince] = useState(() => {
    const saved = localStorage.getItem('globalProvince');
    return saved ? JSON.parse(saved) : [];
  });
  const [isNation, setIsNation] = useState(() => {
    const saved = localStorage.getItem('isNation');
    return saved ? JSON.parse(saved) : true; 
  });
  useEffect(() => {
    localStorage.setItem('isNation', JSON.stringify(isNation));
  }, [isNation]);
  useEffect(() => {
    localStorage.setItem('globalInvestFields', JSON.stringify(globalInvestFields));
  }, [globalInvestFields]);

  useEffect(() => {
    localStorage.setItem('globalKeywords', JSON.stringify(globalKeywords));
  }, [globalKeywords]);
  useEffect(() => {
    localStorage.setItem('globalProvince', JSON.stringify(globalProvince));
  }, [globalProvince]);
  return (
    <InvestContext.Provider value={{ 
      globalInvestFields, setGlobalInvestFields,
      globalKeywords, setGlobalKeywords,
      globalProvince, setGlobalProvince,
      isNation, setIsNation
    }}>
      {children}
    </InvestContext.Provider>
  );
};

export const useInvest = () => {
  const context = useContext(InvestContext);
  if (!context) {
    throw new Error("useInvest must be used within an InvestProvider");
  }
  return context;
};