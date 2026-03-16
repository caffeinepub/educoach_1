import { useState } from "react";
import type { AppRole, SessionUser } from "../App";
import { AppRole as BackendRole } from "../backend";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { backend } from "../lib/backend";

interface Props {
  onLogin: (user: SessionUser) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const ok = await backend.login(username.trim(), password);
      if (!ok) {
        setError("गलत username या password");
        setLoading(false);
        return;
      }
      const profile = await backend.getCallerUserProfile();
      if (!profile) {
        setError("Profile नहीं मिली");
        setLoading(false);
        return;
      }
      const roleMap: Record<string, AppRole> = {
        [BackendRole.admin]: "admin",
        [BackendRole.teacher]: "teacher",
        [BackendRole.student]: "student",
      };
      const role = roleMap[profile.role as string] ?? "student";
      onLogin({ username: profile.username, role });
    } catch {
      setError("Login failed. Try again.");
    }
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #0a1628 0%, #1a2f55 100%)",
      }}
    >
      {/* Loading Overlay */}
      {loading && (
        <div
          data-ocid="login.loading_state"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            background: "rgba(10,22,40,0.85)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="w-16 h-16 rounded-full border-4 border-orange-400 border-t-transparent animate-spin mb-4"
            style={{
              borderColor: "#f97316",
              borderTopColor: "transparent",
            }}
          />
          <p className="text-white text-lg font-semibold">Logging in...</p>
          <p className="text-blue-300 text-sm mt-1">Please wait...</p>
        </div>
      )}

      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <img
              src="/assets/uploads/Gemini_Generated_Image_5ehygk5ehygk5ehy-1.png"
              alt="Universal Success Academy"
              className="h-20 w-20 rounded-full object-cover shadow-lg"
              style={{ border: "3px solid #f97316" }}
            />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Universal Success Academy
          </h1>
          <p className="text-orange-400 font-semibold text-sm mt-0.5">USA</p>
          <p className="text-blue-300 mt-1 text-sm">Your Learning Platform</p>
        </div>
        <Card
          className="border-0 shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-white text-center">Login करें</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-blue-200">Username</Label>
                <Input
                  data-ocid="login.username_input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="अपना username डालें"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">Password</Label>
                <Input
                  data-ocid="login.password_input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password डालें"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              {error && (
                <div
                  className="text-red-400 text-sm text-center"
                  data-ocid="login.error_state"
                >
                  {error}
                </div>
              )}
              <Button
                data-ocid="login.submit_button"
                type="submit"
                disabled={loading}
                className="w-full font-bold text-white"
                style={{ background: "#f97316" }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
