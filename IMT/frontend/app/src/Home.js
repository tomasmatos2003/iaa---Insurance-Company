import React, { useState, useContext, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import AuthApi from "./context/AuthApi";
import TokenApi from "./context/TokenApi";
import './index.css';

const Home = () => {
  const [formData, setFormData] = useState({
    familyName: "",
    givenName: "",
    birthDate: "",
    birthPlace: "",
    nationality: "",
    streetAddress: "",
    postalCode: "",
    city: "",
    country: "",
    issuingAuthority: "Instituto da Mobilidade e dos Transportes",
    categoryCode: "",
    categoryFirstIssueDate: "",
    categoryValidUntil: "",
    categoryRestrictions: ""
  });


  const [response, setResponse] = useState(null);

  const Auth = useContext(AuthApi);
  const Token = useContext(TokenApi);

  const token = Token.token;

  // headers só com Authorization para usar com FormData (Axios configura Content-Type)
  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  const handleLogout = () => {
    Auth.setAuth(false);
    Cookies.remove("token");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { driving_license: formData };

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
        <h2 className="text-4xl font-bold tracking-tight text-red-900">
          Driving License Dashboard
        </h2>
        <button
          onClick={handleLogout}
          className="bg-red-900 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition shadow-md"
        >
          Logout
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg mb-10 border border-red-300 max-w-md mx-auto"
      >
        <h3 className="text-xl font-semibold mb-6 text-red-700 text-center">
          Enter Driving License & Personal Data
        </h3>

        {/* Campo upload de foto */}
        {/* <label className="block mb-2 font-medium text-red-800">Upload Photo:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mb-4"
        /> */}

        {/* ... o resto dos inputs permanece igual */}

        {/* Nome e Apelido */}
        <label className="block mb-2 font-medium text-red-800">Family Name:</label>
        <input
          name="familyName"
          value={formData.familyName}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-red-300 rounded"
          placeholder="Silva"
        />

        <label className="block mb-2 font-medium text-red-800">Given Name:</label>
        <input
          name="givenName"
          value={formData.givenName}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-red-300 rounded"
          placeholder="João"
        />

        {/* Data de Nascimento e Local de Nascimento */}
        <label className="block mb-2 font-medium text-red-800">Date of Birth:</label>
        <input
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-red-300 rounded"
        />

        <label className="block mb-2 font-medium text-red-800">Birth Place:</label>
        <input
          name="birthPlace"
          value={formData.birthPlace}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-red-300 rounded"
          placeholder="Aveiro, Portugal"
        />

        {/* Nacionalidade */}
        <label className="block mb-2 font-medium text-red-800">Nationality:</label>
        <input
          name="nationality"
          value={formData.nationality}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-red-300 rounded"
          placeholder="PRT"
        />

        {/* Morada */}
        <label className="block mb-2 font-medium text-red-800">Street Address:</label>
        <input
          name="streetAddress"
          value={formData.streetAddress}
          onChange={handleChange}
          className="w-full mb-4 p-2 border border-red-300 rounded"
          placeholder="Rua das Flores, 123"
        />

        <label className="block mb-2 font-medium text-red-800">Postal Code:</label>
        <input
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          className="w-full mb-4 p-2 border border-red-300 rounded"
          placeholder="3800-000"
        />

        <label className="block mb-2 font-medium text-red-800">City:</label>
        <input
          name="city"
          value={formData.city}
          onChange={handleChange}
          className="w-full mb-4 p-2 border border-red-300 rounded"
          placeholder="Aveiro"
        />

        <label className="block mb-2 font-medium text-red-800">Country:</label>
        <input
          name="country"
          value={formData.country}
          onChange={handleChange}
          className="w-full mb-4 p-2 border border-red-300 rounded"
          placeholder="Portugal"
        />

        {/* Dados da Carta */}
        {/* <label className="block mb-2 font-medium text-red-800">License Number:</label>
        <input
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-red-300 rounded"
          placeholder="AV-12345678"
        /> */}

        {/* Categoria */}
        <h4 className="text-lg font-semibold mb-2 text-red-700">Category</h4>

        <label className="block mb-2 font-medium text-red-800">Category Code:</label>
        <input
          name="categoryCode"
          value={formData.categoryCode}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-red-300 rounded"
          placeholder="B"
        />

        <label className="block mb-2 font-medium text-red-800">First Issue Date (Category):</label>
        <input
          name="categoryFirstIssueDate"
          type="date"
          value={formData.categoryFirstIssueDate}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-red-300 rounded"
        />

        <label className="block mb-2 font-medium text-red-800">Valid Until (Category):</label>
        <input
          name="categoryValidUntil"
          type="date"
          value={formData.categoryValidUntil}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border border-red-300 rounded"
        />

        <label className="block mb-2 font-medium text-red-800">Restrictions (comma-separated):</label>
        <input
          name="categoryRestrictions"
          value={formData.categoryRestrictions}
          onChange={handleChange}
          className="w-full mb-6 p-2 border border-red-300 rounded"
          placeholder="01, 02"
        />

        <button
          type="submit"
          className="w-full bg-red-700 text-white py-3 rounded hover:bg-red-800 transition"
        >
          Submit Driving License Data
        </button>
      </form>

      {response && (
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-lg border border-blue-300 max-w-xl mx-auto">
        <h4 className="text-xl font-semibold mb-4 text-blue-700">Response</h4>
        {/* <pre className="bg-red-50 border border-red-200 p-4 rounded overflow-auto text-sm text-red-900 whitespace-pre-wrap">
          {JSON.stringify(response, null, 2)}
        </pre> */}
        {response.qr_code && (
          <div className="mt-4 text-center">
            <h5 className="font-medium mb-2">Credential QR Code</h5>
            <img
              src={response.qr_code}
              alt="Verifiable Credential QR Code"
              className="mx-auto w-96"
              // or inline style: style={{ maxWidth: '450px' }}
            />
          </div>
        )}
      </div>
    )}
    </div>
  );
};

export default Home;