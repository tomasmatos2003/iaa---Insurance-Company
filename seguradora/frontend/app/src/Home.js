import React, { useState, useContext, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import AuthApi from "./context/AuthApi";
import TokenApi from "./context/TokenApi";
import './index.css';

const Home = () => {
  const [qrCodeDataUri, setQrCodeDataUri] = useState(null);
  const [requiredVCs, setRequiredVCs] = useState([]);
  const [error, setError] = useState(null);

  const Auth = useContext(AuthApi);
  const Token = useContext(TokenApi);

  const token = Token.token;
  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);

  const handleLogout = () => {
    Auth.setAuth(false);
    Cookies.remove("token");
  };

  const fetchQRCode = async () => {
    setError(null);
    setQrCodeDataUri(null);
    setRequiredVCs([]);
    try {
      const res = await axios.get("http://127.0.0.1:8000/generate_qrcode", { headers });

      setQrCodeDataUri(res.data.qrCodeDataUri);
      // Safely access requiredVCs inside data, fallback to empty array if undefined
      setRequiredVCs(res.data?.data?.requiredVCs ?? []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
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
        <h3 className="text-xl font-semibold mb-6 text-[#5d4037]">Generate QR Code for Required VCs</h3>

        <button
          onClick={fetchQRCode}
          className="bg-[#6d4c41] text-white px-6 py-3 rounded hover:bg-[#5d4037] transition mb-6"
        >
          Generate QR Code
        </button>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {qrCodeDataUri && (
          <div className="mb-6">
            <img src={qrCodeDataUri} alt="VCs QR Code" className="mx-auto mb-4" />
            <p className="text-[#5d4037] font-semibold">Required Verifiable Credentials:</p>
            <ul className="list-disc list-inside text-[#4e342e]">
              {requiredVCs.map((vc) => (
                <li key={vc}>{vc}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
