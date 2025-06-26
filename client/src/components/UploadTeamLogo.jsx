import React, { useState } from "react";
import { uploadFile } from "../utils/api";

export default function UploadTeamLogo({ teamId, onUploaded }) {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Оберіть файл");
    try {
      const res = await uploadFile(
        `http://localhost:5000/api/teams/${teamId}/logo`,
        "logo",
        file
      );
      alert("Логотип завантажено");
      onUploaded(res.data.logoUrl);
    } catch {
      alert("Помилка завантаження");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type="submit">Завантажити логотип</button>
    </form>
  );
}