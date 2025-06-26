import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getAuthHeaders } from "../utils/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [user, setUser] = useState(null);
  const matchesRef = useRef(null);
  const tokenHeaders = getAuthHeaders();

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/matches", {
        headers: tokenHeaders
      });
      setMatches(res.data);
    } catch (err) {
      console.error("Помилка завантаження матчів", err);
    }
  };

  const exportPDF = async () => {
    if (!matchesRef.current) return;
    const canvas = await html2canvas(matchesRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = canvas.height * pdfWidth / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('matches_schedule.pdf');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Список матчів</h2>
      <button onClick={exportPDF} disabled={matches.length === 0}>
        Експорт матчів у PDF
      </button>
      <div ref={matchesRef} style={{ marginTop: 20 }}>
        {matches.length === 0 ? (
          <p>Матчів ще немає.</p>
        ) : (
          <ul>
            {matches.map((match) => (
              <li key={match._id} style={{ marginBottom: 10 }}>
                <strong>{match.teamA?.name || "??"}</strong> vs <strong>{match.teamB?.name || "??"}</strong>
                <br />
                🏟 {match.location} | 🕓 {new Date(match.date).toLocaleString()}
                <br />
                {match.scoreA != null && match.scoreB != null ? (
                  <>Рахунок: {match.scoreA} : {match.scoreB}</>
                ) : (
                  <em>Рахунок ще не встановлено</em>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}