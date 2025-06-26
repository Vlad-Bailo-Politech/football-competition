import React, { useState } from "react";
import { uploadFile } from "../utils/api";

export default function UploadAvatar({ playerId, onUploaded }) {
  const [file, setFile] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Оберіть файл");
    try {
      const res = await uploadFile(
        `http://localhost:5000/api/players/${playerId}/avatar`,
        "avatar",
        file
      );
      alert("Аватар завантажено");
      onUploaded(res.data.avatarUrl);
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
      <button type="submit">Завантажити аватар</button>
    </form>
  );
}