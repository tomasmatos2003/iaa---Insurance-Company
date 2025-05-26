import React, { useState } from "react";
import axios from "axios";
import './index.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import Cookies from "js-cookie";
import Home from "./Home.js";

import AuthApi from "./context/AuthApi.js";
import TokenApi from "./context/TokenApi.js";

function App() {
  const [auth, setAuth] = useState(false);
  const [token, setToken] = useState("");

  React.useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setAuth(true);
      setToken(token);
    }
  }, []);

  return (
    <AuthApi.Provider value={{ auth, setAuth }}>
      <TokenApi.Provider value={{ token, setToken }}>
        <Router>
          <div className="bg-blue-50 min-h-screen p-4 font-sans">
            <nav className="mb-8">
              <ul className="flex gap-6 text-[#4e342e] font-medium">
                {!auth && (
                  <>
                    <li><Link to="/register" className="hover:underline">Register</Link></li>
                    <li><Link to="/login" className="hover:underline">Login</Link></li>
                  </>
                )}
                {auth && (
                  <li><Link to="/" className="hover:underline">Home</Link></li>
                )}
              </ul>
            </nav>
            <RoutesComponent />
          </div>
        </Router>
      </TokenApi.Provider>
    </AuthApi.Provider>
  );
}

const RoutesComponent = () => {
  const Auth = React.useContext(AuthApi);

  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route
        path="/login"
        element={!Auth.auth ? <Login /> : <Navigate to="/" />}
      />
      <Route
        path="/"
        element={Auth.auth ? <Home /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

function Register() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (evt) => {
    evt.preventDefault();
    const data = {
      username: name,
      // company: company,
      password: password,
      // role: "carrier"
    };
    axios
      .post("http://127.0.0.1:8003/register", data)
      .then((response) => {
        console.log(response);
        alert("Registered successfully!");
      })
      .catch((error) => {
        alert("Registration error");
      });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white max-w-md mx-auto p-6 mt-20 border border-[#d7ccc8] rounded-xl shadow-md"
    >
      <h2 className="text-2xl font-semibold text-center text-[#5d4037] mb-6">Register</h2>
      <div className="mb-4">
        <label className="block mb-1">Username:</label>
        <input
          type="text"
          className="w-full p-2 border border-[#bcaaa4] rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      {/* <div className="mb-4">
        <label className="block mb-1">Company:</label>
        <input
          type="text"
          className="w-full p-2 border border-[#bcaaa4] rounded"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div> */}
      <div className="mb-6">
        <label className="block mb-1">Password:</label>
        <input
          type="password"
          className="w-full p-2 border border-[#bcaaa4] rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-[#5d4037] transition">
        Submit
      </button>
    </form>
  );
}

const Login = () => {
  //const Auth = React.useContext(AuthApi);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    const formData = new URLSearchParams();
    formData.append("username", name);
    formData.append("password", password);

    try {
      const response = await axios.post("http://127.0.0.1:8003/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      Cookies.set("token", response.data.access_token);
      window.location.reload();
    } catch (error) {
      console.log("Login error:", error.message);
      alert("Login failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white max-w-md mx-auto p-6 mt-20 border border-[#d7ccc8] rounded-xl shadow-md"
    >
      <h2 className="text-2xl font-semibold text-center text-[#5d4037] mb-6">Login</h2>
      <div className="mb-4">
        <label className="block mb-1">Username:</label>
        <input
          type="text"
          className="w-full p-2 border border-[#bcaaa4] rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <label className="block mb-1">Password:</label>
        <input
          type="password"
          className="w-full p-2 border border-[#bcaaa4] rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-[#5d4037] transition">
        Submit
      </button>
    </form>
  );
};

export default App;