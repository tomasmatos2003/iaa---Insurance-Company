import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import AuthApi from "./context/AuthApi";
import TokenApi from "./context/TokenApi";
import './index.css';

const Home = () => {
  const [data, setData] = useState([]);
  const [eblId, setEblId] = useState("");
  const [xmlResponse, setXmlResponse] = useState("");

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

  const getData = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/carrier/ebls", { headers });
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch eBLs", err);
    }
  }, [headers]);

  useEffect(() => {
    getData();
  }, [getData]);

  const formatXml = (xml) => {
    const PADDING = '  '; // 2 spaces
    const reg = /(>)(<)(\/*)/g;
    let formatted = '';
    let pad = 0;
    xml = xml.replace(reg, '$1\n$2$3');
    xml.split('\n').forEach((node) => {
      let indent = 0;
      if (node.match(/^<\/.+/)) {
        pad -= 1;
      } else if (node.match(/^<[^!?]+[^/]>$/)) {
        indent = 1;
      }
      formatted += PADDING.repeat(pad) + node + '\n';
      pad += indent;
    });
    return formatted.trim();
  };

  const handleEmit = async (e) => {
    e.preventDefault();
    const cleanedId = eblId.trim().replace(/[\s,]+$/, "");
    if (!cleanedId) return;
    try {
      const response = await axios.post(
        `http://127.0.0.1:8080/emitir-ebl-rep/${cleanedId}`,
        {},
        { headers, responseType: 'text' }
      );
      setXmlResponse(formatXml(response.data));
    } catch (err) {
      console.error("Failed to emit eBL", err);
      setXmlResponse(`Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleSubmitToCarrier = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/carrier/emit_ebl",
        xmlResponse,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "text/plain"
          }
        }
      );
      alert("eBill emitida com sucesso!");

      getData(); // Refresh the list of eBLs
    } catch (err) {
      console.error("Erro ao emitir eBL para o carrier", err);
      alert("Erro ao emitir eBL para o carrier");
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

      <form onSubmit={handleEmit} className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg mb-10 border border-[#d7ccc8]">
        <h3 className="text-xl font-semibold mb-4 text-[#5d4037]">Emit existing eBill</h3>
        <div className="flex flex-col gap-4">
          <input
            name="eblId"
            placeholder="Enter eBL ID"
            value={eblId}
            onChange={(e) => setEblId(e.target.value)}
            required
            className="p-3 border border-[#bcaaa4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a1887f]"
          />
          <button type="submit" className="bg-[#6d4c41] text-white px-4 py-2 rounded hover:bg-[#5d4037] transition">
            Generate XML
          </button>
        </div>
      </form>

      {xmlResponse && (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg mb-10 border border-[#d7ccc8]">
          <h4 className="text-xl font-semibold mb-2 text-[#5d4037]">Generated XML</h4>
          <pre className="bg-[#fafafa] border border-[#d7ccc8] p-4 rounded overflow-auto text-sm text-[#4e342e] whitespace-pre-wrap">
            {xmlResponse}
          </pre>
          <button
            onClick={handleSubmitToCarrier}
            className="mt-4 bg-[#4e342e] text-white px-4 py-2 rounded hover:bg-[#3e2723] transition"
          >
            Emitir eBill
          </button>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-[#d7ccc8]">
        <h3 className="text-xl font-semibold mb-4 text-[#5d4037]">All eBLs</h3>
        <ul className="list-disc list-inside space-y-2 text-sm">
          {data.map((item) => (
            <li key={item.id} className="text-[#4e342e] border-b border-[#d7ccc8] pb-2 mb-2">
              <div><strong>Status:</strong> {item.status}</div>
              <div><strong>Issuer:</strong> {item.issuer}</div>
              <div><strong>Shipper:</strong> {item.shipper}</div>
              <div><strong>Consignee:</strong> {item.consignee}</div>
              <div><strong>ID:</strong> <span className="text-xs break-all">{item.id}</span></div>
              <div>
              <strong>Signature:</strong>
              <div className="bg-[#f5f5f5] border border-[#d7ccc8] p-2 rounded text-xs text-[#4e342e] break-all max-h-32 overflow-auto">
                {item.signature}
              </div>
            </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;