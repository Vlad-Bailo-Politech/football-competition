import React, { useState } from "react";
import axios from "axios";

export default function CreateTournament({ onCreated }) {
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [format, setFormat] = useState("group");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const res = await axios.post("http://localhost:5000/api/tournaments", {
                name, location, startDate, endDate, format
            }, {
                headers: getAuthHeaders()
            });

            alert("Турнір створено!");
            setName(""); setLocation(""); setStartDate(""); setEndDate("");
            if (onCreated) onCreated(res.data); // для оновлення списку
        } catch (err) {
            alert("Помилка створення турніру");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
            <h3>Створити новий турнір</h3>
            <input placeholder="Назва" value={name} onChange={e => setName(e.target.value)} required /><br /><br />
            <input placeholder="Місце" value={location} onChange={e => setLocation(e.target.value)} /><br /><br />
            <label>Початок:</label><br />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required /><br /><br />
            <label>Кінець:</label><br />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required /><br /><br />
            <select value={format} onChange={e => setFormat(e.target.value)}>
                <option value="group">Груповий</option>
                <option value="playoff">Плей-офф</option>
                <option value="mixed">Змішаний</option>
            </select><br /><br />
            <button type="submit">Створити турнір</button>
        </form>
    );
}