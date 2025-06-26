import React from "react";
import { Link } from "react-router-dom";

export default function PublicHome() {
  return (
    <div style={{ padding: 40 }}>
      <h1>⚽ Football Competition</h1>
      <p>Ласкаво просимо! Ви можете переглядати інформацію про турніри:</p>

      <ul>
        <li><Link to="/matches">Матчі</Link></li>
        <li><Link to="/standings">Турнірна таблиця</Link></li>
        <li><Link to="/ranking">Рейтинг гравців</Link></li>
      </ul>

      <p>Для керування командами, заявками та статистикою — <Link to="/login">Увійдіть</Link>.</p>
    </div>
  );
}