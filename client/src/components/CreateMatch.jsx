import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeaders } from "../utils/api";

export default function CreateMatch() {
    const [tournaments, setTournaments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [form, setForm] = useState({
        tournament: "",
        teamA: "",
        teamB: "",
        date: "",
        location: ""
    });

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchTournaments();
        fetchTeams();
    }, []);

    const fetchTournaments = async () => {
        const res = await axios.get("http://localhost:5000/api/tournaments", {
            headers: getAuthHeaders()
        });
        setTournaments(res.data);
    };

    const fetchTeams = async () => {
        const res = await axios.get("http://localhost:5000/api/teams", {
            headers: getAuthHeaders()
        });
        setTeams(res.data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.teamA === form.teamB) {
            return alert("Команди повинні бути різні!");
        }

        try {
            await axios.post("http://localhost:5000/api/matches", form, {
                headers: getAuthHeaders()
            });

            alert("Матч створено!");
            setForm({ tournament: "", teamA: "", teamB: "", date: "", location: "" });
        } catch (err) {
            alert("Помилка створення матчу");
        }
    };

    return (
        <div style={{ marginTop: 30 }}>
            <h3>Створити матч</h3>
            <form onSubmit={handleSubmit}>
                <select name="tournament" value={form.tournament} onChange={handleChange} required>
                    <option value="">Оберіть турнір</option>
                    {tournaments.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                </select><br /><br />

                <select name="teamA" value={form.teamA} onChange={handleChange} required>
                    <option value="">Команда A</option>
                    {teams.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                </select><br /><br />

                <select name="teamB" value={form.teamB} onChange={handleChange} required>
                    <option value="">Команда B</option>
                    {teams.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                </select><br /><br />

                <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required /><br /><br />
                <input name="location" placeholder="Місце проведення" value={form.location} onChange={handleChange} /><br /><br />

                <button type="submit">Створити матч</button>
            </form>
        </div>
    );
}