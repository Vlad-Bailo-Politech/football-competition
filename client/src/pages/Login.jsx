import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password,
            });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            navigate("/dashboard");
        } catch (err) {
            alert("Login failed");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email" placeholder="Email"
                    value={email} onChange={e => setEmail(e.target.value)} required
                /><br /><br />
                <input
                    type="password" placeholder="Password"
                    value={password} onChange={e => setPassword(e.target.value)} required
                /><br /><br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}