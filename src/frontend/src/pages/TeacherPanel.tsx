import { useCallback, useEffect, useState } from "react";
import type { SessionUser } from "../App";
import { ExternalBlob } from "../backend";
import type { Doubt, MCQQuestion, Schedule } from "../backend";
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

interface Props {
  user: SessionUser;
  onLogout: () => void;
}

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

type Tab =
  | "schedule"
  | "video"
  | "notes"
  | "test"
  | "doubts"
  | "live"
  | "attendance";

const CLASSES = [9, 10, 11, 12];
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function TeacherPanel({ user, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("schedule");

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
              <p className="text-orange-400 text-xs">Teacher Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {(
            [
              ["schedule", "📅 My Schedule"],
              ["video", "🎥 Add Video"],
              ["notes", "📷 Upload Notes"],
              ["test", "📝 Create Test"],
              ["doubts", "❓ Doubts"],
              ["live", "📡 Live Class"],
              ["attendance", "📋 Attendance"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              type="button"
              key={key}
              data-ocid={`teacher.${key}_tab`}
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
          <span className="text-white font-bold text-sm">USA Teacher</span>
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
        {tab === "schedule" && <ScheduleView username={user.username} />}
        {tab === "video" && <AddVideoTab />}
        {tab === "notes" && <UploadNotesTab />}
        {tab === "test" && <CreateTestTab />}
        {tab === "doubts" && <AnswerDoubtsTab />}
        {tab === "live" && <LiveClassTab username={user.username} />}
        {tab === "attendance" && <AttendanceTab />}
      </main>

      <div
        className="md:hidden fixed bottom-0 left-0 right-0 flex"
        style={{ background: "#0a1628" }}
      >
        {(
          [
            ["schedule", "📅"],
            ["video", "🎥"],
            ["notes", "📷"],
            ["test", "📝"],
            ["doubts", "❓"],
            ["live", "📡"],
            ["attendance", "📋"],
          ] as [Tab, string][]
        ).map(([key, icon]) => (
          <button
            type="button"
            key={key}
            data-ocid={`teacher.${key}_tab`}
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

function ScheduleView({ username }: { username: string }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backend.getSchedules().then((all) => {
      setSchedules(all.filter((s) => s.teacher === username));
      setLoading(false);
    });
  }, [username]);

  const byDay = DAYS.map((day) => ({
    day,
    periods: schedules.filter((s) => s.day === day),
  })).filter((d) => d.periods.length > 0);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Schedule</h2>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : byDay.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          Schedule अभी set नहीं हुआ। Admin से contact करें।
        </div>
      ) : (
        <div className="space-y-6">
          {byDay.map(({ day, periods }) => (
            <div key={day}>
              <h3 className="font-semibold text-gray-700 mb-2">{day}</h3>
              <div className="grid gap-2 md:grid-cols-2">
                {periods.map((p, i) => (
                  <Card
                    key={`${day}-${p.time}-${i}`}
                    className="border-l-4"
                    style={{ borderLeftColor: "#f97316" }}
                  >
                    <CardContent className="py-3">
                      <p className="font-semibold">{p.subject}</p>
                      <p className="text-sm text-gray-500">
                        {p.time} | Class {p.schoolClass.toString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddVideoTab() {
  const [mode, setMode] = useState<"youtube" | "upload">("youtube");
  const [form, setForm] = useState({
    title: "",
    url: "",
    subject: "",
    schoolClass: 9,
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "youtube") {
        await backend.addVideo(
          form.title,
          form.url,
          BigInt(form.schoolClass),
          form.subject,
        );
      } else {
        if (!file) {
          setError("Please select a video file");
          setLoading(false);
          return;
        }
        setUploadProgress(0);
        const bytes = new Uint8Array(await file.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(Math.round(pct)),
        );
        const videoUrl = blob.getDirectURL();
        await backend.addVideo(
          form.title,
          videoUrl,
          BigInt(form.schoolClass),
          form.subject,
        );
      }
      setSuccess(true);
      setForm({ title: "", url: "", subject: "", schoolClass: 9 });
      setFile(null);
      setUploadProgress(0);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Video upload failed. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Add Video Lecture
      </h2>
      <Card className="max-w-lg">
        <CardContent className="pt-6">
          {/* Mode Toggle */}
          <div className="flex rounded-lg overflow-hidden border mb-4">
            <button
              type="button"
              data-ocid="teacher.video.youtube_toggle"
              onClick={() => setMode("youtube")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === "youtube"
                  ? "text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              style={mode === "youtube" ? { background: "#f97316" } : {}}
            >
              🔗 YouTube URL
            </button>
            <button
              type="button"
              data-ocid="teacher.video.upload_toggle"
              onClick={() => setMode("upload")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === "upload"
                  ? "text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              style={mode === "upload" ? { background: "#f97316" } : {}}
            >
              📁 Device Upload
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Video Title</Label>
              <Input
                data-ocid="teacher.video.title_input"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Newton's Laws"
                required
              />
            </div>

            {mode === "youtube" ? (
              <div>
                <Label>YouTube URL</Label>
                <Input
                  data-ocid="teacher.video.url_input"
                  value={form.url}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, url: e.target.value }))
                  }
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </div>
            ) : (
              <div>
                <Label>Video File चुनें</Label>
                <input
                  data-ocid="teacher.video.upload_button"
                  type="file"
                  accept="video/*"
                  className="w-full border rounded px-3 py-2 mt-1 text-sm"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                />
                {file && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {file.name} (
                    {(file.size / 1024 / 1024).toFixed(1)} MB)
                  </p>
                )}
              </div>
            )}

            <div>
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) =>
                  setForm((p) => ({ ...p, subject: e.target.value }))
                }
                placeholder="Physics"
                required
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

            {loading && mode === "upload" && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  Uploading... {uploadProgress}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      background: "#f97316",
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div
                data-ocid="teacher.video.error_state"
                className="text-red-500 text-sm"
              >
                {error}
              </div>
            )}
            {success && (
              <div
                data-ocid="teacher.video.success_state"
                className="text-green-600 text-sm"
              >
                ✓ Video successfully add हो गया!
              </div>
            )}
            <Button
              data-ocid="teacher.video.submit_button"
              type="submit"
              disabled={loading}
              style={{ background: "#f97316" }}
              className="text-white w-full"
            >
              {loading
                ? mode === "upload"
                  ? `Uploading... ${uploadProgress}%`
                  : "Adding..."
                : "Add Video"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function UploadNotesTab() {
  const [form, setForm] = useState({ title: "", subject: "", schoolClass: 9 });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setProgress(0);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
      setProgress(Math.round(pct)),
    );
    await backend.addNote(
      form.title,
      BigInt(form.schoolClass),
      form.subject,
      blob,
    );
    setSuccess(true);
    setFile(null);
    setForm({ title: "", subject: "", schoolClass: 9 });
    setLoading(false);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Upload Notes (Photo)
      </h2>
      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Notes Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Chapter 1 Notes"
                required
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) =>
                  setForm((p) => ({ ...p, subject: e.target.value }))
                }
                placeholder="Chemistry"
                required
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
            <div>
              <Label>Photo Upload करें</Label>
              <input
                data-ocid="teacher.notes.upload_button"
                type="file"
                accept="image/*"
                className="w-full border rounded px-3 py-2 mt-1"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                required
              />
            </div>
            {loading && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{ background: "#f97316", width: `${progress}%` }}
                />
              </div>
            )}
            {success && (
              <div
                data-ocid="teacher.notes.success_state"
                className="text-green-600 text-sm"
              >
                ✓ Notes successfully upload हो गए!
              </div>
            )}
            <Button
              type="submit"
              disabled={loading || !file}
              style={{ background: "#f97316" }}
              className="text-white w-full"
            >
              {loading ? `Uploading... ${progress}%` : "Upload Notes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateTestTab() {
  const [form, setForm] = useState({ title: "", subject: "", schoolClass: 9 });
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [qForm, setQForm] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function addQuestion() {
    if (!qForm.text || qForm.options.some((o) => !o)) return;
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (questions.length === 0) return;
    setLoading(true);
    await backend.addTest(
      form.title,
      BigInt(form.schoolClass),
      form.subject,
      questions,
    );
    setSuccess(true);
    setForm({ title: "", subject: "", schoolClass: 9 });
    setQuestions([]);
    setLoading(false);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create MCQ Test</h2>
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              placeholder="Test Title"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              required
            />
            <Input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) =>
                setForm((p) => ({ ...p, subject: e.target.value }))
              }
              required
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

            <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
              <p className="font-medium text-gray-700">Question Add करें</p>
              <Textarea
                placeholder="Question text..."
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
              <div className="flex items-center gap-3">
                <Label>Correct:</Label>
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
                      {String.fromCharCode(65 + i)}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={addQuestion}
                  size="sm"
                  style={{ background: "#f97316" }}
                  className="text-white"
                >
                  + Add Q
                </Button>
              </div>
            </div>

            {questions.length > 0 && (
              <div className="bg-blue-50 rounded p-3 text-sm">
                <p className="font-medium">{questions.length} Questions:</p>
                {questions.map((q, i) => (
                  <p
                    key={`q-${i}-${q.text.slice(0, 8)}`}
                    className="text-gray-600"
                  >
                    {i + 1}. {q.text}
                  </p>
                ))}
              </div>
            )}

            {success && (
              <div
                data-ocid="teacher.test.success_state"
                className="text-green-600 text-sm"
              >
                ✓ Test बना दिया गया!
              </div>
            )}
            <Button
              type="submit"
              disabled={loading || questions.length === 0}
              style={{ background: "#f97316" }}
              className="text-white w-full"
            >
              {loading ? "Creating..." : "Create Test"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AnswerDoubtsTab() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const d = await backend.getUnansweredDoubts();
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Student Doubts Answer करें
      </h2>
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
                    Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {doubts.length === 0 && (
            <div
              data-ocid="teacher.doubts.empty_state"
              className="text-center py-8 text-gray-400"
            >
              सब doubts answer हो गए! ✓
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LiveClassTab({ username }: { username: string }) {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    schoolClass: 9,
    date: "",
    time: "",
    joinLink: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const all = (await (backend as any).getLiveClasses()) as LiveClass[];
    setLiveClasses(all.filter((lc) => lc.teacher === username));
    setLoading(false);
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await (backend as any).addLiveClass(
      form.title,
      form.subject,
      BigInt(form.schoolClass),
      form.date,
      form.time,
      form.joinLink,
    );
    setSuccess(true);
    setForm({
      title: "",
      subject: "",
      schoolClass: 9,
      date: "",
      time: "",
      joinLink: "",
    });
    setSubmitting(false);
    setTimeout(() => setSuccess(false), 3000);
    load();
  }

  async function handleDelete(id: bigint) {
    await (backend as any).deleteLiveClass(id);
    load();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        📡 Live Class Schedule
      </h2>
      <Card className="max-w-lg mb-8">
        <CardHeader>
          <CardTitle className="text-base">
            New Live Class Schedule करें
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label>Class Title</Label>
              <Input
                data-ocid="teacher.live.title_input"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Physics Live Lecture"
                required
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) =>
                  setForm((p) => ({ ...p, subject: e.target.value }))
                }
                placeholder="Physics"
                required
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  data-ocid="teacher.live.date_input"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  data-ocid="teacher.live.time_input"
                  value={form.time}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, time: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label>Join Link (YouTube Live / Meet / Zoom)</Label>
              <Input
                data-ocid="teacher.live.link_input"
                value={form.joinLink}
                onChange={(e) =>
                  setForm((p) => ({ ...p, joinLink: e.target.value }))
                }
                placeholder="https://meet.google.com/... or https://youtube.com/live/..."
                required
              />
            </div>
            {success && (
              <div
                data-ocid="teacher.live.success_state"
                className="text-green-600 text-sm"
              >
                ✓ Live class scheduled!
              </div>
            )}
            <Button
              data-ocid="teacher.live.submit_button"
              type="submit"
              disabled={submitting}
              style={{ background: "#f97316" }}
              className="text-white w-full"
            >
              {submitting ? "Scheduling..." : "Schedule Live Class"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <h3 className="text-lg font-semibold text-gray-700 mb-3">
        My Scheduled Classes
      </h3>
      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {liveClasses.map((lc, idx) => (
            <Card
              key={lc.id.toString()}
              data-ocid={`teacher.live.item.${idx + 1}`}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold">{lc.title}</p>
                    <p className="text-sm text-gray-500">
                      {lc.subject} | Class {lc.schoolClass.toString()}
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
                    data-ocid={`teacher.live.delete_button.${idx + 1}`}
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
              data-ocid="teacher.live.empty_state"
              className="text-center py-8 text-gray-400"
            >
              अभी कोई live class scheduled नहीं
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AttendanceTab() {
  const today = new Date().toISOString().split("T")[0];
  const currentYear = String(new Date().getFullYear());
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

  const [selectedClass, setSelectedClass] = useState(9);
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState<
    Array<{ username: string; status: "Present" | "Absent" }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [monthlyClass, setMonthlyClass] = useState(9);
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [monthlyData, setMonthlyData] = useState<
    Array<{ studentId: string; date: string; status: string }>
  >([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  async function loadStudents() {
    setLoading(true);
    setSaved(false);
    try {
      const allUsers = await backend.listUsers();
      const CLASS_KEY = "educoach_class";
      const studentList = allUsers
        .filter(([, role]) => role === "student")
        .filter(([username]) => {
          const saved = localStorage.getItem(`${CLASS_KEY}_${username}`);
          if (saved) return Number(saved) === selectedClass;
          try {
            const profiles = JSON.parse(
              localStorage.getItem("educoach_student_profiles") || "{}",
            );
            if (profiles[username]?.class)
              return profiles[username].class === selectedClass;
          } catch {}
          return false;
        })
        .map(([username]) => username);

      const existing = await backend.getAttendanceByClass(
        BigInt(selectedClass),
        date,
      );
      const existingMap: Record<string, string> = {};
      for (const r of existing) {
        existingMap[r.studentId] = r.status;
      }

      setStudents(
        studentList.map((username) => ({
          username,
          status: (existingMap[username] as "Present" | "Absent") || "Present",
        })),
      );
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function saveAttendance() {
    setSaving(true);
    try {
      const records = students.map((s) => ({
        studentId: s.username,
        status: s.status,
        date,
        schoolClass: BigInt(selectedClass),
        subject: "General",
      }));
      await backend.markAttendance(records);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  async function loadMonthly() {
    setMonthlyLoading(true);
    try {
      const data = await backend.getMonthlyAttendanceByClass(
        BigInt(monthlyClass),
        year,
        month,
      );
      setMonthlyData(
        data.map((r) => ({
          studentId: r.studentId,
          date: r.date,
          status: r.status,
        })),
      );
    } catch (e) {
      console.error(e);
    }
    setMonthlyLoading(false);
  }

  const uniqueStudents = [...new Set(monthlyData.map((r) => r.studentId))];
  const uniqueDates = [...new Set(monthlyData.map((r) => r.date))].sort();

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">📋 Attendance</h2>

      {/* Mark Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendance Mark करें</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 block mb-1">
                Class
              </p>
              <select
                data-ocid="attendance.class_select"
                className="border rounded px-3 py-2"
                value={selectedClass}
                onChange={(e) => setSelectedClass(Number(e.target.value))}
              >
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 block mb-1">
                Date
              </p>
              <input
                data-ocid="attendance.date_input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="flex items-end">
              <Button
                data-ocid="attendance.load_button"
                onClick={loadStudents}
                disabled={loading}
                style={{ background: "#f97316" }}
                className="text-white"
              >
                {loading ? "Loading..." : "Load Students"}
              </Button>
            </div>
          </div>

          {loading && (
            <div
              data-ocid="attendance.loading_state"
              className="flex items-center gap-2 text-gray-500 py-4"
            >
              <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              Students load हो रहे हैं...
            </div>
          )}

          {!loading && students.length === 0 && (
            <div
              data-ocid="attendance.empty_state"
              className="text-center py-8 text-gray-400"
            >
              Class {selectedClass} के students load करने के लिए ऊपर "Load
              Students" click करें
            </div>
          )}

          {students.length > 0 && (
            <>
              <div className="space-y-2">
                {students.map((s, idx) => (
                  <div
                    key={s.username}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border"
                  >
                    <span className="font-medium text-gray-800">
                      {s.username}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        data-ocid={`attendance.student.toggle.${idx + 1}`}
                        onClick={() =>
                          setStudents((prev) =>
                            prev.map((st) =>
                              st.username === s.username
                                ? { ...st, status: "Present" }
                                : st,
                            ),
                          )
                        }
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                          s.status === "Present"
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600 hover:bg-green-100"
                        }`}
                      >
                        ✓ Present
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setStudents((prev) =>
                            prev.map((st) =>
                              st.username === s.username
                                ? { ...st, status: "Absent" }
                                : st,
                            ),
                          )
                        }
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                          s.status === "Absent"
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-600 hover:bg-red-100"
                        }`}
                      >
                        ✗ Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {saving && (
                <div
                  data-ocid="attendance.loading_state"
                  className="flex items-center gap-2 text-orange-500"
                >
                  <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              )}
              {saved && (
                <div
                  data-ocid="attendance.success_state"
                  className="text-green-600 font-medium"
                >
                  ✓ Attendance saved successfully!
                </div>
              )}

              <Button
                data-ocid="attendance.save_button"
                onClick={saveAttendance}
                disabled={saving}
                className="w-full text-white font-bold"
                style={{ background: "#0a1628" }}
              >
                {saving ? "Saving..." : "💾 Save Attendance"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Monthly View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Attendance देखें</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 block mb-1">
                Class
              </p>
              <select
                className="border rounded px-3 py-2"
                value={monthlyClass}
                onChange={(e) => setMonthlyClass(Number(e.target.value))}
              >
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 block mb-1">
                Month
              </p>
              <select
                data-ocid="attendance.month_select"
                className="border rounded px-3 py-2"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                {[
                  "01",
                  "02",
                  "03",
                  "04",
                  "05",
                  "06",
                  "07",
                  "08",
                  "09",
                  "10",
                  "11",
                  "12",
                ].map((m, i) => (
                  <option key={m} value={m}>
                    {
                      [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ][i]
                    }
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 block mb-1">
                Year
              </p>
              <select
                data-ocid="attendance.year_select"
                className="border rounded px-3 py-2"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {["2024", "2025", "2026", "2027"].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                data-ocid="attendance.view_button"
                onClick={loadMonthly}
                disabled={monthlyLoading}
                style={{ background: "#f97316" }}
                className="text-white"
              >
                {monthlyLoading ? "Loading..." : "View Monthly"}
              </Button>
            </div>
          </div>

          {monthlyLoading && (
            <div className="flex items-center gap-2 text-gray-500 py-4">
              <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          )}

          {!monthlyLoading && monthlyData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-3 py-2 border font-semibold">
                      Student
                    </th>
                    {uniqueDates.map((d) => (
                      <th
                        key={d}
                        className="px-2 py-2 border font-medium text-xs"
                      >
                        {d.split("-")[2]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uniqueStudents.map((studentId) => (
                    <tr key={studentId} className="hover:bg-gray-50">
                      <td className="px-3 py-2 border font-medium">
                        {studentId}
                      </td>
                      {uniqueDates.map((d) => {
                        const record = monthlyData.find(
                          (r) => r.studentId === studentId && r.date === d,
                        );
                        return (
                          <td key={d} className="px-2 py-2 border text-center">
                            {record ? (
                              <span
                                className={`text-xs font-bold ${
                                  record.status === "Present"
                                    ? "text-green-600"
                                    : "text-red-500"
                                }`}
                              >
                                {record.status === "Present" ? "P" : "A"}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!monthlyLoading && monthlyData.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm">
              Month और Class select करके "View Monthly" click करें
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
