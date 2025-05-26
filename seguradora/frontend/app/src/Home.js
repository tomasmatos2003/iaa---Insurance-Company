import React, { useState, useContext, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import AuthApi from "./context/AuthApi";
import TokenApi from "./context/TokenApi";
import './index.css';

const Home = () => {
  const [vehicleJson, setVehicleJson] = useState("");
  const [licenseJson, setLicenseJson] = useState("");
  const [response, setResponse] = useState(null);

  const Auth = useContext(AuthApi);
  const Token = useContext(TokenApi);

  const token = Token.token;
  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }), [token]);

  const handleLogout = () => {
    Auth.setAuth(false);
    Cookies.remove("token");
  };

  const handleFileUpload = async (event, setter) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      JSON.parse(text); // Validate JSON
      setter(text);
    } catch (error) {
      alert("Invalid JSON file");
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        vehicle_vc: JSON.parse(vehicleJson),
        driving_license_vc: JSON.parse(licenseJson),
      };

      const res = await axios.post("http://127.0.0.1:8000/insert_data", payload, { headers });
      setResponse(res.data);
    } catch (err) {
      console.error("Failed to submit data", err);
      setResponse({ error: err.response?.data?.detail || err.message });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6ede0] to-[#e6d5c3] text-[#3b2f2f] px-6 py-10 max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-bold tracking-tight text-[#4e342e]">Insurance Dashboard</h2>
        <button onClick={handleLogout} className="bg-[#8d6e63] text-white px-5 py-2 rounded-lg hover:bg-[#6d4c41] transition shadow-md">
          Logout
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg mb-10 border border-[#d7ccc8]">
        <h3 className="text-xl font-semibold mb-6 text-[#5d4037]">Upload Vehicle and Driving License JSON</h3>

        {/* VEHICLE FILE UPLOAD */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#5d4037] mb-2">Upload Vehicle JSON</label>
          <input
            type="file"
            accept=".json"
            onChange={(e) => handleFileUpload(e, setVehicleJson)}
            className="mb-2"
          />
          <textarea
            rows="8"
            value={vehicleJson}
            onChange={(e) => setVehicleJson(e.target.value)}
            className="w-full p-3 border border-[#bcaaa4] rounded-md font-mono text-sm"
            placeholder='Vehicle JSON will appear here after upload'
          />
        </div>

        {/* LICENSE FILE UPLOAD */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#5d4037] mb-2">Upload Driving License JSON</label>
          <input
            type="file"
            accept=".json"
            onChange={(e) => handleFileUpload(e, setLicenseJson)}
            className="mb-2"
          />
          <textarea
            rows="8"
            value={licenseJson}
            onChange={(e) => setLicenseJson(e.target.value)}
            className="w-full p-3 border border-[#bcaaa4] rounded-md font-mono text-sm"
            placeholder='Driving License JSON will appear here after upload'
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-[#6d4c41] text-white px-6 py-3 rounded hover:bg-[#5d4037] transition"
        >
          Submit to Insurance
        </button>
      </div>

      {response && (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg mb-10 border border-[#d7ccc8]">
          <h4 className="text-xl font-semibold mb-4 text-[#5d4037]">Response</h4>
          <pre className="bg-[#fafafa] border border-[#d7ccc8] p-4 rounded overflow-auto text-sm text-[#4e342e] whitespace-pre-wrap">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Home;
