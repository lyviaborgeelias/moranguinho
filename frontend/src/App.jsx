import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Adventure from "./pages/Adventure";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthForm from "./components/AuthForm";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="page-loading">
        <span className="spinner" /> Preparando sua jornada…
      </div>
    );
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/recuperar-senha" element={<AuthForm mode="forgot" />} />
          <Route path="/redefinir-senha/:uid/:token" element={<AuthForm mode="reset" />} />
          <Route
            path="/aventura"
            element={
              <Protected>
                <Adventure />
              </Protected>
            }
          />
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
                <p>Este destino não existe no mapa.</p>
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
