import { useEffect,useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import Settings from "./Settings/Settings";
import SideBar from "./components/SideBar";
import KeyWordSearch from "./pages/KeyWordSearch";
import ProvinceSearch from "./pages/ProvinceSearch";
import SearchPage from "./pages/SearchPage";
import BidInfo from "./pages/BidInfo";
import DistrictJob from "./pages/DistrictJob";
import Lcnt from "./pages/lcnt";
import PackageBid from "./pages/PackageBid";
import Register from "./Register/Register";
import Login from "./Login/Login";
import Home from "./Home/Home";
import Header from "./components/Header";
import { useAuth } from "./components/AuthContext";
import Timeline from "./pages/Timeline";
import Verify from "./Register/Verify";
import Follows from "./pages/Follows";
function AppContent() {
  const { user } = useAuth();
  //const username = localStorage.getItem("username");
  const location = useLocation();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("home");

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("keyword")) setActiveMenu("keyword");
    else if (path.includes("province")) setActiveMenu("province");
    else if (path.includes("search")) setActiveMenu("search");
    else setActiveMenu("home");
  }, [location.pathname]);

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    switch (menu) {
      case "home":
        navigate("/");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "keyword":
        navigate("/keyword");
        break;
      case "province":
        navigate("/province");
        break;
      case "search":
        navigate("/search");
        break;
      case "districtjob":
        navigate("/districtjob");
        break;
      case "lcnt":
        navigate("/lcnt");
        break;
      case "PackageBid":
        navigate("/packagebid");
        break;
      default:
        navigate("/");
      case "timeline":
        navigate("/timeline");
        break;
      case "follows":
        navigate("/follows");
        break;
    }
  };

  return (
    <div className="app">
      <SideBar activeMenu={activeMenu} setActiveMenu={handleMenuClick} />

      <div className="main">
        <Header />
        <div className="content">
          <Routes>
            <Route path="/" element={user ? <Home /> : <Login />} />
            <Route path="/keyword" element={<KeyWordSearch />} />
            <Route path="/province" element={<ProvinceSearch />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<div>Page not found</div>} />
            <Route path="/bid/:slug" element={<BidInfo />} />
            <Route path="/districtjob" element={<DistrictJob />} />
            <Route path="/lcnt" element={<Lcnt />} />
            <Route path="/packagebid" element={<PackageBid />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/follows" element={<Follows />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
