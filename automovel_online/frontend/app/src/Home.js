import React, { useState, useContext, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import AuthApi from "./context/AuthApi";
import TokenApi from "./context/TokenApi";
import './index.css';

const Home = () => {
  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    year: "",
    vin: "",
    color: "",
    registrationNumber: "",
  });
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

  const handleChange = (e) => {
    setVehicle((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { vehicle };

      const res = await axios.post("http://127.0.0.1:8003/insert_data", payload, { headers });
      setResponse(res.data);
    } catch (err) {
      console.error("Failed to submit data", err);
      setResponse({ error: err.response?.data?.detail || err.message });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 text-[#3b2f2f] px-6 py-10 max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-bold tracking-tight text-blue-900">Automobile Dashboard</h2>
        <button onClick={handleLogout} className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-md">
          Logout
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg mb-10 border border-blue-300 max-w-md mx-auto"
      >
        <h3 className="text-xl font-semibold mb-6 text-blue-700 text-center">Enter Vehicle Data</h3>

        <label className="block mb-2 font-medium text-blue-800">Make:</label>
        <input
          name="make"
          value={vehicle.make}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-blue-300 rounded"
          placeholder="Toyota"
        />

        <label className="block mb-2 font-medium text-blue-800">Model:</label>
        <input
          name="model"
          value={vehicle.model}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-blue-300 rounded"
          placeholder="Corolla"
        />

        <label className="block mb-2 font-medium text-blue-800">Year:</label>
        <input
          name="year"
          type="number"
          value={vehicle.year}
          onChange={handleChange}
          required
          min="1900"
          max={new Date().getFullYear()}
          className="w-full mb-4 p-2 border border-blue-300 rounded"
          placeholder="2023"
        />

        <label className="block mb-2 font-medium text-blue-800">VIN:</label>
        <input
          name="vin"
          value={vehicle.vin}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-blue-300 rounded"
          placeholder="1HGCM82633A004352"
        />

        <label className="block mb-2 font-medium text-blue-800">Color:</label>
        <input
          name="color"
          value={vehicle.color}
          onChange={handleChange}
          className="w-full mb-4 p-2 border border-blue-300 rounded"
          placeholder="Blue"
        />

        <label className="block mb-2 font-medium text-blue-800">Registration Number:</label>
        <input
          name="registrationNumber"
          value={vehicle.registrationNumber}
          onChange={handleChange}
          className="w-full mb-6 p-2 border border-blue-300 rounded"
          placeholder="ABC1234"
        />

        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-3 rounded hover:bg-blue-800 transition"
        >
          Submit Vehicle Data
        </button>
      </form>

      {response && (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-blue-300 max-w-md mx-auto">
          <h4 className="text-xl font-semibold mb-4 text-blue-700">Response</h4>
          <pre className="bg-blue-50 border border-blue-200 p-4 rounded overflow-auto text-sm text-blue-900 whitespace-pre-wrap">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Home;
