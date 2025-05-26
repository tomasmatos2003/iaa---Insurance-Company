import React, { useState, useContext, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import AuthApi from "./context/AuthApi";
import TokenApi from "./context/TokenApi";
import './index.css';

const Home = () => {
  const [drivingLicense, setDrivingLicense] = useState({
    license_number: "",
    issue_date: "",
    expiry_date: "",
    name: "",
    dob: "",
    address: "",
    category: "",
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
    setDrivingLicense((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { driving_license: drivingLicense };

      const res = await axios.post("http://127.0.0.1:8004/insert_data", payload, { headers });
      setResponse(res.data);
    } catch (err) {
      console.error("Failed to submit data", err);
      setResponse({ error: err.response?.data?.detail || err.message });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-300 text-[#3b2f2f] px-6 py-10 max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-bold tracking-tight text-red-900">Driving License Dashboard</h2>
        <button onClick={handleLogout} className="bg-red-900 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition shadow-md">
          Logout
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg mb-10 border border-red-300 max-w-md mx-auto"
      >
        <h3 className="text-xl font-semibold mb-6 text-red-700 text-center">Enter Driving License Data</h3>

        <label className="block mb-2 font-medium text-red-800">License Number:</label>
        <input
          name="license_number"
          value={drivingLicense.license_number}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-red-300 rounded"
          placeholder="DL1234567890"
        />

        <label className="block mb-2 font-medium text-red-800">Issue Date:</label>
        <input
          name="issue_date"
          type="date"
          value={drivingLicense.issue_date}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-red-300 rounded"
        />

        <label className="block mb-2 font-medium text-red-800">Expiry Date:</label>
        <input
          name="expiry_date"
          type="date"
          value={drivingLicense.expiry_date}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-red-300 rounded"
        />

        <label className="block mb-2 font-medium text-red-800">Full Name:</label>
        <input
          name="name"
          value={drivingLicense.name}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-red-300 rounded"
          placeholder="John Doe"
        />

        <label className="block mb-2 font-medium text-red-800">Date of Birth:</label>
        <input
          name="dob"
          type="date"
          value={drivingLicense.dob}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-red-300 rounded"
        />

        <label className="block mb-2 font-medium text-red-800">Address:</label>
        <input
          name="address"
          value={drivingLicense.address}
          onChange={handleChange}
          className="w-full mb-4 p-2 border border-red-300 rounded"
          placeholder="123 Main St, Springfield"
        />

        <label className="block mb-2 font-medium text-red-800">Category:</label>
        <input
          name="category"
          value={drivingLicense.category}
          onChange={handleChange}
          className="w-full mb-6 p-2 border border-red-300 rounded"
          placeholder="B"
        />

        <button
          type="submit"
          className="w-full bg-red-700 text-white py-3 rounded hover:bg-red-800 transition"
        >
          Submit Driving License Data
        </button>
      </form>

      {response && (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-red-300 max-w-md mx-auto">
          <h4 className="text-xl font-semibold mb-4 text-red-700">Response</h4>
          <pre className="bg-red-50 border border-red-200 p-4 rounded overflow-auto text-sm text-red-900 whitespace-pre-wrap">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Home;
