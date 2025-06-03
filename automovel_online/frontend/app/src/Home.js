import React, { useState, useContext, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import AuthApi from "./context/AuthApi";
import TokenApi from "./context/TokenApi";
import './index.css';

const Home = () => {
  const [vehicle, setVehicle] = useState({
    countryDistinguishingSign: "PT",
    issuingAuthorities: "Instituto da Mobilidade e dos Transportes",
    plateNumber: "",
    firstRegistrationDate: "2022-01-15",
    owner: {
      name: "",
      address: {
        streetAddress: "",
        postalCode: "",
        city: "",
        country: ""
      }
    },
    brand: "",
    model: "",
    commercialName: "",
    vin: "",
    unladenWeight: "",
    fuelType: "",  
    seating: {
      seats: "",
      standingPlaces: ""
    },
    vehicleCategory: {
      nationalCategory: "",
      vehicleType: "",
      transmissionType: ""
    },
    color: "",
    tyres: {
      frontTyres: "",
      rearTyres: ""
    },
    specialNotes: "",
  });

  const [response, setResponse] = useState(null);
  const [errors, setErrors] = useState({}); // <-- added error state

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

  const handleChange = (e, path) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setVehicle(prev => {
      const newVehicle = { ...prev };
      const keys = path.split(".");
      let obj = newVehicle;
      while (keys.length > 1) {
        const key = keys.shift();
        obj[key] = { ...obj[key] };
        obj = obj[key];
      }
      obj[keys[0]] = value;
      return newVehicle;
    });

    // Clear error for this field on change
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[path];
      return newErrors;
    });
  };

  // Helper to get nested values by path string, e.g. "owner.name"
  const getValue = (obj, path) => {
    return path.split(".").reduce((acc, key) => acc && acc[key], obj);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // List of required fields to validate
    const requiredFields = [
      "plateNumber",
      "firstRegistrationDate",
      "brand",
      "model",
      "commercialName",
      "vin",
      "unladenWeight",
      "fuelType",
      "color",
      "specialNotes",
      "owner.name",
      "owner.address.streetAddress",
      "owner.address.postalCode",
      "owner.address.city",
      "owner.address.country",
      "seating.seats",
      "seating.standingPlaces",
      "vehicleCategory.nationalCategory",
      "vehicleCategory.vehicleType",
      "vehicleCategory.transmissionType",
      "tyres.frontTyres",
      "tyres.rearTyres"
    ];

    let newErrors = {};

    requiredFields.forEach(field => {
      if (!getValue(vehicle, field) || getValue(vehicle, field).toString().trim() === "") {
        newErrors[field] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please fill in all required fields.");
      return; // Prevent submit
    }

    setErrors({}); // Clear errors if all good

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
        <h2 className="text-4xl font-bold tracking-tight text-blue-900">Vehicle Data Entry</h2>
        <button onClick={handleLogout} className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-md">
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-blue-300">
        <h3 className="text-xl font-semibold mb-6 text-blue-700 text-center">Complete Vehicle Registration</h3>

        {[
          "plateNumber",
          "firstRegistrationDate",
          "brand",
          "model",
          "commercialName",
          "vin",
          "unladenWeight",
          "fuelType",
          "color",
          "specialNotes"
        ].map((path) => {
          const label = path
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());

          const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "LPG", "CNG"];
          const colors = ["Black", "White", "Grey", "Blue", "Red", "Green", "Silver", "Yellow", "Orange", "Brown"];

          return (
            <div key={path}>
              <label className="block mb-1 font-medium text-blue-800">{label}:</label>

              {path === "brand" ? (
                <select
                  value={getValue(vehicle, path)}
                  onChange={(e) => handleChange(e, path)}
                  className="w-full mb-4 p-2 border border-blue-300 rounded"
                >
                  <option value="">Select a brand</option>
                  {[
                    "Toyota", "Ford", "Volkswagen", "BMW", "Mercedes", "Renault", "Peugeot",
                    "Honda", "Hyundai", "Kia", "Nissan", "Audi", "Fiat", "Opel",
                    "Citroen", "Mazda", "Subaru", "Volvo", "Mitsubishi", "Suzuki"
                  ].map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              ) : path === "fuelType" ? (
                <select
                  value={getValue(vehicle, path)}
                  onChange={(e) => handleChange(e, path)}
                  className="w-full mb-4 p-2 border border-blue-300 rounded"
                >
                  <option value="">Select fuel type</option>
                  {fuelTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              ) : path === "color" ? (
                <select
                  value={getValue(vehicle, path)}
                  onChange={(e) => handleChange(e, path)}
                  className="w-full mb-4 p-2 border border-blue-300 rounded"
                >
                  <option value="">Select color</option>
                  {colors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={path.toLowerCase().includes("date") ? "date" : "text"}
                  value={getValue(vehicle, path)}
                  onChange={(e) => handleChange(e, path)}
                  className="w-full mb-4 p-2 border border-blue-300 rounded"
                />
              )}
            </div>
          );
        })}

        <h4 className="font-semibold mt-6 text-blue-800">Owner Info</h4>
        {[
          "owner.name",
          "owner.address.streetAddress",
          "owner.address.postalCode",
          "owner.address.city",
          "owner.address.country"
        ].map((path) => {
          const field = path.split('.').slice(-1)[0]; // Ex: "city", "country"
          const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

          const cityOptions = ["Lisbon", "Porto", "Coimbra", "Braga", "Faro"];
          const countryOptions = ["Portugal", "Spain", "France", "Germany", "Italy"];

          return (
            <div key={path}>
              <label className="block mb-1 font-medium text-blue-800">{label}:</label>

              {field === "city" ? (
                <select
                  value={getValue(vehicle, path)}
                  onChange={(e) => handleChange(e, path)}
                  className="w-full mb-4 p-2 border border-blue-300 rounded"
                >
                  <option value="">Select a city</option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              ) : field === "country" ? (
                <select
                  value={getValue(vehicle, path)}
                  onChange={(e) => handleChange(e, path)}
                  className="w-full mb-4 p-2 border border-blue-300 rounded"
                >
                  <option value="">Select a country</option>
                  {countryOptions.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={getValue(vehicle, path)}
                  onChange={(e) => handleChange(e, path)}
                  className="w-full mb-4 p-2 border border-blue-300 rounded"
                />
              )}
            </div>
          );
        })}

        <h4 className="font-semibold mt-6 text-blue-800">Seating</h4>
        {["seating.seats", "seating.standingPlaces"].map((path) => (
          <div key={path}>
            <label className="block mb-1 font-medium text-blue-800">{path.split('.').slice(-1)[0]}:</label>
            <input
              type="text"
              value={getValue(vehicle, path)}
              onChange={(e) => handleChange(e, path)}
              className="w-full mb-4 p-2 border border-blue-300 rounded"
            />
          </div>
        ))}

        <h4 className="font-semibold mt-6 text-blue-800">Vehicle Category</h4>
        {[
            "vehicleCategory.nationalCategory",
            "vehicleCategory.vehicleType",
            "vehicleCategory.transmissionType"
          ].map((path) => {
            const field = path.split('.').slice(-1)[0]; // pega apenas o nome do campo
            const label = field.replace(/([A-Z])/g, ' $1');

            // Define opções para cada campo
            const options = {
              nationalCategory: [
                "M1", "M2", "M3",
                "N1", "N2", "N3",
                "L1e", "L2e", "L3e", "L4e", "L5e", "L6e", "L7e",
                "O1", "O2", "O3", "O4"
              ],
              vehicleType: ["Passenger Car", "Truck", "Motorcycle", "Bus", "Trailer", "Van"],
              transmissionType: ["Manual", "Automatic", "Semi-Automatic", "CVT"]
            };

            const fieldKey = field; // exemplo: "nationalCategory"

            return (
              <div key={path}>
                <label className="block mb-1 font-medium text-blue-800">
                  {label.charAt(0).toUpperCase() + label.slice(1)}:
                </label>
                <select
                  value={getValue(vehicle, path)}
                  onChange={(e) => handleChange(e, path)}
                  className="w-full mb-4 p-2 border border-blue-300 rounded"
                >
                  <option value="">Select an option</option>
                  {(options[fieldKey] || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          })}

        <h4 className="font-semibold mt-6 text-blue-800">Tyres</h4>
        {["tyres.frontTyres", "tyres.rearTyres"].map((path) => {
          const field = path.split('.').slice(-1)[0];
          const label = field.replace(/([A-Z])/g, ' $1');

          const tyreOptions = [
            "195/65 R15", "205/55 R16", "215/60 R16",
            "225/45 R17", "235/40 R18", "245/45 R18",
            "255/35 R19", "265/30 R20", "275/40 R20"
          ];

          return (
            <div key={path}>
              <label className="block mb-1 font-medium text-blue-800">
                {label.charAt(0).toUpperCase() + label.slice(1)}:
              </label>
              <select
                value={getValue(vehicle, path)}
                onChange={(e) => handleChange(e, path)}
                className="w-full mb-4 p-2 border border-blue-300 rounded"
              >
                <option value="">Select a tyre size</option>
                {tyreOptions.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          );
        })}

        <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded hover:bg-blue-800 transition">
          Submit Vehicle Data
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

const getValue = (obj, path) => {
  return path.split('.').reduce((o, key) => (o ? o[key] : ""), obj);
};

export default Home;
