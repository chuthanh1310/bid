import InvestBox from "../components/InvestBox";
import { useEffect, useState } from "react";
import axios from "axios";
function DistrictJob(params) {
    const [allData, setAllData] = useState([]);
    useEffect(() => {
        axios
          .get("http://localhost:8000/data")
            .then((res) => {
                setAllData(res.data);
            })
            .catch((err) => console.error(err));
    }, []); 
    return (
        <>
          <div>
            <h4>Chọn lĩnh vực</h4>
            <InvestBox />
          </div>  
        </>
    );
}
export default DistrictJob;