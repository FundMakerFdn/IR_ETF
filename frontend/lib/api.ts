import axios from "axios";
import dotenv from "dotenv"
dotenv.config();
const API_URL = process.env.REACT_APP_BACKEND_API_URL || "http://localhost:5000/api"; // Change this to your backend URL

export const fetchAssetData = async () => {
  try {
    const response = await axios.get(`${API_URL}/apy/getHourlyAPYs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching asset data:", error);
    return null;
  }
};