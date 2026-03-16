import { useEffect, useState } from "react";
import AdminPanel from "./pages/AdminPanel";
import LoginPage from "./pages/LoginPage";
import StudentPanel from "./pages/StudentPanel";
import TeacherPanel from "./pages/TeacherPanel";

export type AppRole = "admin" | "teacher" | "student";

export interface SessionUser {
  username: string;
  role: AppRole;
}

const SESSION_KEY = "educoach_session";

export function getSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export default function App() {
  const [user, setUser] = useState<SessionUser | null>(getSession);

  useEffect(() => {
    const s = getSession();
    setUser(s);
  }, []);

  function handleLogin(u: SessionUser) {
    setSession(u);
    setUser(u);
  }

  function handleLogout() {
    clearSession();
    setUser(null);
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;
  if (user.role === "admin")
    return <AdminPanel user={user} onLogout={handleLogout} />;
  if (user.role === "teacher")
    return <TeacherPanel user={user} onLogout={handleLogout} />;
  return <StudentPanel user={user} onLogout={handleLogout} />;
}
