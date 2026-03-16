import { useCallback, useEffect, useState } from "react";
import type { SessionUser } from "../App";
import type { AppRole as BackendRole } from "../backend";
import type {
  Doubt,
  MCQQuestion,
  Schedule,
  Test,
  VideoLecture,
} from "../backend";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { backend } from "../lib/backend";

interface LiveClass {
  id: bigint;
  title: string;
  subject: string;
  schoolClass: bigint;
  teacher: string;
  date: string;
  time: string;
  joinLink: string;
}

interface Props {
  user: SessionUser;
  onLogout: () => void;
}

type Tab = "users" | "schedule" | "videos" | "tests" | "doubts" | "live";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const CLASSES = [9, 10, 11, 12];

export default function AdminPanel({ user, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("users");

  return (
    <div className="min-h-screen flex" style={{ background: "#f0f4f8" }}>
      <aside
        className="w-64 hidden md:flex flex-col"
        style={{ background: "#0a1628" }}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <img
              src="/assets/uploads/Gemini_Generated_Image_5ehygk5ehygk5ehy-1.png"
              alt="USA Logo"
              className="h-10 w-10 rounded-full object-cover shrink-0"
            />
            <div>
              <p className="text-white font-bold text-xs leading-tight">
                Universal Success Academy
              </p>
              <p className="text-orange-400 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {(
            [
              ["users", "👥 Users"],
              ["schedule", "📅 Schedules"],
              ["videos", "🎥 Videos"],
              ["tests", "📝 Tests"],
              ["doubts", "❓ Doubts"],
              ["live", "📡 Live Classes"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              type="button"
              key={key}
              data-ocid={`admin.${key}_tab`}
              onClick={() => setTab(key)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                tab === key
                  ? "text-white"
                  : "text-blue-300 hover:text-white hover:bg-white/10"
              }`}
              style={tab === key ? { background: "#f97316" } : {}}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="text-blue-300 text-xs mb-2">{user.username}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full text-white border-white/20 hover:bg-white/10"
          >
            Logout
          </Button>
        </div>
      </aside>

      <div
        className="md:hidden fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3"
        style={{ background: "#0a1628" }}
      >
        <div className="flex items-center gap-2">
          <img
            src="/assets/uploads/Gemini_Generated_Image_5ehygk5ehygk5ehy-1.png"
            alt="USA"
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="text-white font-bold text-sm">USA Admin</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="text-white"
        >
          Logout
        </Button>
      </div>

      <main className="flex-1 p-4 md:p-8 mt-12 md:mt-0 overflow-auto pb-20 md:pb-8">
        {tab === "users" && <UsersTab />}
        {tab === "schedule" && <ScheduleTab />}
        {tab === "videos" && <VideosTab />}
        {tab === "tests" && <TestsTab />}
        {tab === "doubts" && <DoubtsTab />}
        {tab === "live" && <AdminLiveClassTab />}
      </main>

      <div
        className="md:hidden fixed bottom-0 left-0 right-0 flex"
        style={{ background: "#0a1628" }}
      >
        {(
          [
            ["users", "👥"],
            ["schedule", "📅"],
            ["videos", "🎥"],
            ["tests", "📝"],
            ["doubts", "❓"],
            ["live", "📡"],
          ] as [Tab, string][]
        ).map(([key, icon]) => (
          <button
            type="button"
            key={key}
            data-ocid={`admin.${key}_tab`}
            onClick={() => setTab(key)}
            className={`flex-1 py-3 text-xl transition-colors ${tab === key ? "text-orange-400" : "text-blue-400"}`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<[string, string][]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "student",
    studentClass: 0,
    studentSubjects: [] as string[],
  });
  const [editUser, setEditUser] = useState<{
    username: string;
    password: string;
    role: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await backend.listUsers();
    setUsers(list as [string, string][]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    await backend.createUser(
      newUser.username,
      newUser.password,
      newUser.role as typeof BackendRole.admin,
    );
    if (newUser.role === "student" && newUser.studentClass > 0) {
      const profiles = JSON.parse(
        localStorage.getItem("educoach_student_profiles") || "{}",
      );
      profiles[newUser.username] = {
        class: newUser.studentClass,
        subjects: newUser.studentSubjects,
      };
      localStorage.setItem(
        "educoach_student_profiles",
        JSON.stringify(profiles),
      );
    }
    setNewUser({
      username: "",
      password: "",
      role: "student",
      studentClass: 0,
      studentSubjects: [],
    });
    setShowCreate(false);
    load();
  }

  async function handleDelete(username: string) {
    if (confirm(`"${username}" को delete करें?`)) {
      await backend.deleteUser(username);
      load();
    }
  }

  async function handleUpdate() {
    if (!editUser) return;
    await backend.updateUser(
      editUser.username,
      editUser.password || null,
      (editUser.role as typeof BackendRole.admin) || null,
    );
    setEditUser(null);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Users Management</h2>
        <Button
          data-ocid="admin.create_user_button"
          onClick={() => setShowCreate(true)}
          style={{ background: "#f97316" }}
          className="text-white"
        >
          + New User
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>New User बनाएं</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Username"
              value={newUser.username}
              onChange={(e) =>
                setNewUser((p) => ({ ...p, username: e.target.value }))
              }
            />
            <Input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser((p) => ({ ...p, password: e.target.value }))
              }
            />
            <select
              className="w-full border rounded px-3 py-2"
              value={newUser.role}
              onChange={(e) =>
                setNewUser((p) => ({ ...p, role: e.target.value }))
              }
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            {newUser.role === "student" && (
              <div className="space-y-3 border rounded-lg p-3 bg-orange-50">
                <div>
                  <p className="block text-sm font-semibold text-gray-700 mb-2">
                    Class चुनें
                  </p>
                  <div className="flex gap-2">
                    {[9, 10, 11, 12].map((c) => (
                      <button
                        type="button"
                        key={c}
                        data-ocid="admin.student_class_select"
                        onClick={() =>
                          setNewUser((p) => ({ ...p, studentClass: c }))
                        }
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                          newUser.studentClass === c
                            ? "text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                        }`}
                        style={
                          newUser.studentClass === c
                            ? { background: "#f97316" }
                            : {}
                        }
                      >
                        {c}th
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="block text-sm font-semibold text-gray-700 mb-2">
                    Subjects चुनें (optional)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Physics",
                      "Chemistry",
                      "Mathematics",
                      "Biology",
                      "English",
                      "Hindi",
                      "Social Science",
                    ].map((sub) => (
                      <label
                        key={sub}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          data-ocid="admin.student_subject_checkbox"
                          checked={newUser.studentSubjects.includes(sub)}
                          onChange={(e) => {
                            setNewUser((p) => ({
                              ...p,
                              studentSubjects: e.target.checked
                                ? [...p.studentSubjects, sub]
                                : p.studentSubjects.filter((s) => s !== sub),
                            }));
                          }}
                          className="accent-orange-500"
                        />
                        {sub}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                style={{ background: "#f97316" }}
                className="text-white"
              >
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {editUser && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editUser.username} Edit करें</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="password"
              placeholder="New Password (optional)"
              value={editUser.password}
              onChange={(e) =>
                setEditUser((p) =>
                  p ? { ...p, password: e.target.value } : null,
                )
              }
            />
            <select
              className="w-full border rounded px-3 py-2"
              value={editUser.role}
              onChange={(e) =>
                setEditUser((p) => (p ? { ...p, role: e.target.value } : null))
              }
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                style={{ background: "#f97316" }}
                className="text-white"
              >
                Update
              </Button>
              <Button variant="outline" onClick={() => setEditUser(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div
          data-ocid="admin.users.loading_state"
          className="text-center py-8 text-gray-500"
        >
          Loading...
        </div>
      ) : (
        <div className="space-y-2">
          {users.map(([uname, role], i) => (
            <Card key={uname}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold">{uname}</p>
                  <Badge
                    variant={
                      role === "admin"
                        ? "destructive"
                        : role === "teacher"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {role}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    data-ocid={`admin.user.edit_button.${i + 1}`}
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setEditUser({ username: uname, password: "", role })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    data-ocid={`admin.user.delete_button.${i + 1}`}
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(uname)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {users.length === 0 && (
            <div
              data-ocid="admin.users.empty_state"
              className="text-center py-8 text-gray-400"
            >
              कोई user नहीं है
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScheduleTab() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    teacher: "",
    day: "Monday",
    time: "",
    subject: "",
    schoolClass: 9,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const s = await backend.getSchedules();
    setSchedules(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd() {
    await backend.addSchedule({
      ...form,
      schoolClass: BigInt(form.schoolClass),
    });
    setShowAdd(false);
    setForm({
      teacher: "",
      day: "Monday",
      time: "",
      subject: "",
      schoolClass: 9,
    });
    load();
  }

  async function handleDelete(i: number) {
    await backend.deleteSchedule(BigInt(i));
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Teacher Schedules</h2>
        <Button
          onClick={() => setShowAdd(true)}
          style={{ background: "#f97316" }}
          className="text-white"
        >
          + Add Period
        </Button>
      </div>

      {showAdd && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>नया Period Add करें</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div>
              <Label>Teacher Username</Label>
              <Input
                value={form.teacher}
                onChange={(e) =>
                  setForm((p) => ({ ...p, teacher: e.target.value }))
                }
                placeholder="teacher username"
              />
            </div>
            <div>
              <Label>Day</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.day}
                onChange={(e) =>
                  setForm((p) => ({ ...p, day: e.target.value }))
                }
              >
                {DAYS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Time</Label>
              <Input
                value={form.time}
                onChange={(e) =>
                  setForm((p) => ({ ...p, time: e.target.value }))
                }
                placeholder="9:00 AM - 10:00 AM"
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) =>
                  setForm((p) => ({ ...p, subject: e.target.value }))
                }
                placeholder="Subject"
              />
            </div>
            <div>
              <Label>Class</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.schoolClass}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    schoolClass: Number.parseInt(e.target.value),
                  }))
                }
              >
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleAdd}
                style={{ background: "#f97316" }}
                className="text-white"
              >
                Add
              </Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-2">
          {schedules.map((s, i) => (
            <Card key={`${s.teacher}-${s.day}-${s.time}-${i}`}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold">
                    {s.teacher} — {s.subject}
                  </p>
                  <p className="text-sm text-gray-500">
                    {s.day} | {s.time} | Class {s.schoolClass.toString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(i)}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
          {schedules.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              कोई schedule नहीं
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VideosTab() {
  const [videos, setVideos] = useState<VideoLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: "",
    url: "",
    subject: "",
    schoolClass: 9,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const v = await backend.getVideos();
    setVideos(v);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd() {
    await backend.addVideo(
      form.title,
      form.url,
      BigInt(form.schoolClass),
      form.subject,
    );
    setShowAdd(false);
    setForm({ title: "", url: "", subject: "", schoolClass: 9 });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Video Lectures</h2>
        <Button
          onClick={() => setShowAdd(true)}
          style={{ background: "#f97316" }}
          className="text-white"
        >
          + Add Video
        </Button>
      </div>

      {showAdd && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>नया Video Add करें</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
            />
            <Input
              placeholder="YouTube URL"
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
            />
            <Input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) =>
                setForm((p) => ({ ...p, subject: e.target.value }))
              }
            />
            <select
              className="w-full border rounded px-3 py-2"
              value={form.schoolClass}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  schoolClass: Number.parseInt(e.target.value),
                }))
              }
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button
                onClick={handleAdd}
                style={{ background: "#f97316" }}
                className="text-white"
              >
                Add
              </Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {videos.map((v) => (
            <Card key={v.id.toString()}>
              <CardContent className="py-4">
                <p className="font-semibold">{v.title}</p>
                <p className="text-sm text-gray-500">
                  {v.subject} | Class {v.schoolClass.toString()}
                </p>
                <p className="text-xs text-blue-500 truncate">{v.url}</p>
              </CardContent>
            </Card>
          ))}
          {videos.length === 0 && (
            <div className="col-span-2 text-center py-8 text-gray-400">
              कोई video नहीं
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TestsTab() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", schoolClass: 9 });
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [qForm, setQForm] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const t = await backend.getTests();
    setTests(t);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      {
        text: qForm.text,
        options: qForm.options,
        correctAnswer: BigInt(qForm.correctAnswer),
      },
    ]);
    setQForm({ text: "", options: ["", "", "", ""], correctAnswer: 0 });
  }

  async function handleCreate() {
    await backend.addTest(
      form.title,
      BigInt(form.schoolClass),
      form.subject,
      questions,
    );
    setShowAdd(false);
    setForm({ title: "", subject: "", schoolClass: 9 });
    setQuestions([]);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">MCQ Tests</h2>
        <Button
          onClick={() => setShowAdd(true)}
          style={{ background: "#f97316" }}
          className="text-white"
        >
          + Create Test
        </Button>
      </div>

      {showAdd && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>नया Test बनाएं</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Test Title"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
            />
            <Input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) =>
                setForm((p) => ({ ...p, subject: e.target.value }))
              }
            />
            <select
              className="w-full border rounded px-3 py-2"
              value={form.schoolClass}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  schoolClass: Number.parseInt(e.target.value),
                }))
              }
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>

            <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <p className="font-medium">Question Add करें</p>
              <Textarea
                placeholder="Question text"
                value={qForm.text}
                onChange={(e) =>
                  setQForm((p) => ({ ...p, text: e.target.value }))
                }
              />
              {[0, 1, 2, 3].map((i) => (
                <Input
                  key={i}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  value={qForm.options[i]}
                  onChange={(e) =>
                    setQForm((p) => {
                      const o = [...p.options];
                      o[i] = e.target.value;
                      return { ...p, options: o };
                    })
                  }
                />
              ))}
              <div className="flex items-center gap-2">
                <Label>Correct Answer:</Label>
                <select
                  className="border rounded px-2 py-1"
                  value={qForm.correctAnswer}
                  onChange={(e) =>
                    setQForm((p) => ({
                      ...p,
                      correctAnswer: Number.parseInt(e.target.value),
                    }))
                  }
                >
                  {[0, 1, 2, 3].map((i) => (
                    <option key={i} value={i}>
                      Option {String.fromCharCode(65 + i)}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  onClick={addQuestion}
                  style={{ background: "#f97316" }}
                  className="text-white"
                >
                  Add Q
                </Button>
              </div>
            </div>

            {questions.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {questions.length} questions added
                </p>
                {questions.map((q, i) => (
                  <p
                    key={`q-${i}-${q.text.slice(0, 8)}`}
                    className="text-sm text-gray-600"
                  >
                    {i + 1}. {q.text}
                  </p>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={questions.length === 0}
                style={{ background: "#f97316" }}
                className="text-white"
              >
                Create Test
              </Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-2">
          {tests.map((t) => (
            <Card key={t.id.toString()}>
              <CardContent className="py-4">
                <p className="font-semibold">{t.title}</p>
                <p className="text-sm text-gray-500">
                  {t.subject} | Class {t.schoolClass.toString()} |{" "}
                  {t.questions.length} questions
                </p>
              </CardContent>
            </Card>
          ))}
          {tests.length === 0 && (
            <div className="text-center py-8 text-gray-400">कोई test नहीं</div>
          )}
        </div>
      )}
    </div>
  );
}

function DoubtsTab() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const d = await backend.getDoubts();
    setDoubts(d);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAnswer(id: bigint) {
    const ans = answers[id.toString()];
    if (!ans) return;
    await backend.answerDoubt(id, ans);
    setAnswers((p) => {
      const n = { ...p };
      delete n[id.toString()];
      return n;
    });
    load();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Doubts</h2>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-4">
          {doubts.map((d) => (
            <Card key={d.id.toString()}>
              <CardContent className="py-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-400">
                    By {d.student} | {d.subject} | Class{" "}
                    {d.schoolClass.toString()}
                  </p>
                  <p className="font-medium mt-1">{d.question}</p>
                </div>
                {d.answer ? (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-xs text-green-600 font-medium">
                      Answer:
                    </p>
                    <p className="text-sm">{d.answer}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Answer लिखें..."
                      value={answers[d.id.toString()] ?? ""}
                      onChange={(e) =>
                        setAnswers((p) => ({
                          ...p,
                          [d.id.toString()]: e.target.value,
                        }))
                      }
                    />
                    <Button
                      onClick={() => handleAnswer(d.id)}
                      style={{ background: "#f97316" }}
                      className="text-white shrink-0"
                    >
                      Answer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {doubts.length === 0 && (
            <div className="text-center py-8 text-gray-400">कोई doubt नहीं</div>
          )}
        </div>
      )}
    </div>
  );
}

function AdminLiveClassTab() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = (await (backend as any).getLiveClasses()) as LiveClass[];
    setLiveClasses(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: bigint) {
    await (backend as any).deleteLiveClass(id);
    load();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        📡 All Live Classes
      </h2>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {liveClasses.map((lc, idx) => (
            <Card
              key={lc.id.toString()}
              data-ocid={`admin.live.item.${idx + 1}`}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">{lc.title}</p>
                    <p className="text-sm text-gray-500">
                      {lc.subject} | Class {lc.schoolClass.toString()} |
                      Teacher: {lc.teacher}
                    </p>
                    <p className="text-sm text-gray-500">
                      {lc.date} at {lc.time}
                    </p>
                    <a
                      href={lc.joinLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-orange-500 underline mt-1 inline-block"
                    >
                      {lc.joinLink}
                    </a>
                  </div>
                  <Button
                    data-ocid={`admin.live.delete_button.${idx + 1}`}
                    size="sm"
                    variant="outline"
                    className="text-red-500 border-red-200 hover:bg-red-50 shrink-0"
                    onClick={() => handleDelete(lc.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {liveClasses.length === 0 && (
            <div
              data-ocid="admin.live.empty_state"
              className="text-center py-8 text-gray-400"
            >
              कोई live class scheduled नहीं
            </div>
          )}
        </div>
      )}
    </div>
  );
}
