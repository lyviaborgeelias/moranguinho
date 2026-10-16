import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Adventure from "./pages/Adventure";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aventura" element={<Adventure />} />
          <Route path="/login" element={<Navigate to="/aventura" replace />} />
          <Route path="/cadastro" element={<Navigate to="/aventura" replace />} />
          <Route
            path="*"
            element={
              <main className="not-found">
                <span className="eyebrow">CAMINHO NÃO ENCONTRADO</span>
                <h1>
                  Uma pequena
                  <br />
                  mudança de rota.
                </h1>
                <p>Esta pista não existe no mapa.</p>
                <Link className="button button--primary" to="/">
                  Voltar ao início
                </Link>
              </main>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
