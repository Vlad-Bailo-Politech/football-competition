import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getAuthHeaders } from "../utils/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const tokenHeaders = getAuthHeaders();
  const listRef = useRef(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tournaments", {
        headers: tokenHeaders
      });
      setTournaments(res.data);
    } catch (err) {
      console.error("Помилка завантаження турнірів", err);
    }
  };

  const exportPDF = async () => {
    if (!listRef.current) return;
    const canvas = await html2canvas(listRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = canvas.height * pdfWidth / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('tournaments_list.pdf');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Список турнірів</h2>
      <button onClick={exportPDF} disabled={tournaments.length === 0}>
        Експорт турнірів у PDF
      </button>
      <div ref={listRef} style={{ marginTop: 20 }}>
        {tournaments.length === 0 ? (
          <p>Турніри ще не додані.</p>
        ) : (
          <ul>
            {tournaments.map((t) => (
              <li key={t._id} style={{ marginBottom: 10 }}>
                <strong>{t.name}</strong>
                <br />
                📍 {t.location || "-"} | 🗓 {new Date(t.startDate).toLocaleDateString()} – {new Date(t.endDate).toLocaleDateString()}
                <br />
                Організатор: {t.organizer?.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}