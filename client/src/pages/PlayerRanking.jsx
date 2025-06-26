import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getAuthHeaders } from "../utils/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PlayerRanking() {
  const [ranking, setRanking] = useState([]);
  const tokenHeaders = getAuthHeaders();
  const rankingRef = useRef(null);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/players/ranking", {
        headers: tokenHeaders
      });
      setRanking(res.data);
    } catch (err) {
      console.error("Помилка завантаження рейтингу", err);
    }
  };

  const exportPDF = async () => {
    if (!rankingRef.current) return;
    const canvas = await html2canvas(rankingRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = canvas.height * pdfWidth / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('player_ranking.pdf');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Рейтинг гравців</h2>
      <button onClick={exportPDF} disabled={ranking.length === 0}>
        Експорт рейтингу у PDF
      </button>
      <div ref={rankingRef} style={{ marginTop: 20 }}>
        {ranking.length === 0 ? (
          <p>Немає даних для відображення.</p>
        ) : (
          <table border={1} cellPadding={8} style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>#</th><th>Ім’я</th><th>Команда</th><th>Матчів</th><th>Перемог</th><th>Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((player, index) => (
                <tr key={player._id}>
                  <td>{index + 1}</td>
                  <td>{player.name}</td>
                  <td>{player.team?.name || "-"}</td>
                  <td>{player.stats.games}</td>
                  <td>{player.stats.wins}</td>
                  <td>
                    {player.stats.games > 0
                      ? ((player.stats.wins / player.stats.games) * 100).toFixed(1) + "%"
                      : "0%"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}