import React from "react";
import { Link } from "react-router-dom";

export default function PublicHome() {
  return (
    <div style={{ padding: 40 }}>
      <h1>⚽ Football Competition</h1>
      <p>Ласкаво просимо! Ви можете переглядати інформацію про турніри:</p>

      <nav style={{ marginBottom: 20 }}>
        <Link to="/matches" style={{ marginRight: 15 }}>Матчі</Link>
        <Link to="/standings" style={{ marginRight: 15 }}>Турнірна таблиця</Link>
        <Link to="/ranking" style={{ marginRight: 15 }}>Рейтинг гравців</Link>
        <Link to="/search">Пошук</Link> {/* ← Ось тут */}
      </nav>

      <p>
        Для керування командами, заявками та статистикою —{" "}
        <Link to="/login">Увійдіть</Link>.
      </p>
    </div>
  );
}