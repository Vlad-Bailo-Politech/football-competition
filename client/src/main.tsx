import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx';
import './i18n';
import './index.css'

createRoot(document.getElementById("root")!).render(
    <AuthProvider>
        <App />
    </AuthProvider>
);