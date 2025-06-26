import React, { useState } from "react";
import axios from "axios";
import { getAuthHeaders } from "../utils/api";
import { Link } from "react-router-dom";

export default function Search() {
  const [type, setType] = useState("teams"); // "teams" або "players"
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const url =
        type === "teams"
          ? `http://localhost:5000/api/teams?search=${encodeURIComponent(query)}`
          : `http://localhost:5000/api/players?search=${encodeURIComponent(query)}`;

      const res = await axios.get(url, { headers: getAuthHeaders() });
      setResults(res.data);
    } catch (err) {
      console.error("Search error", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Пошук {type === "teams" ? "команд" : "гравців"}</h2>

      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() => {
            setType("teams");
            setResults([]);
            setQuery("");
          }}
          disabled={type === "teams"}
        >
          Команди
        </button>
        <button
          onClick={() => {
            setType("players");
            setResults([]);
            setQuery("");
          }}
          disabled={type === "players"}
          style={{ marginLeft: 10 }}
        >
          Гравці
        </button>
      </div>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder={`Введіть назву чи email`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          style={{ width: 300 }}
        />
        <button type="submit" style={{ marginLeft: 10 }}>
          Шукати
        </button>
      </form>

      <ul style={{ marginTop: 20 }}>
        {results.map((item) =>
          type === "teams" ? (
            <li key={item._id}>
              <Link to={`/teams/${item._id}`}>{item.name}</Link> — {item.tournament?.name}
            </li>
          ) : (
            <li key={item._id}>
              <Link to={`/players/${item._id}`}>{item.name}</Link> — {item.email}
            </li>
          )
        )}
      </ul>
    </div>
  );
}