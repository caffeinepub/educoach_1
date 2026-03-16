import { useCallback, useEffect, useState } from "react";
import type { SessionUser } from "../App";
import type { Doubt, Note, Test, TestAttempt, VideoLecture } from "../backend";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
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

type Tab =
  | "videos"
  | "notes"
  | "tests"
  | "results"
  | "doubts"
  | "live"
  | "attendance";

const CLASS_KEY = "educoach_class";

export default function StudentPanel({ user, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("videos");
  const [studentClass, setStudentClass] = useState<number>(() => {
    const saved = localStorage.getItem(`${CLASS_KEY}_${user.username}`);
    if (saved) return Number.parseInt(saved);
    try {
      const profiles = JSON.parse(
        localStorage.getItem("educoach_student_profiles") || "{}",
      );
      if (profiles[user.username]?.class) return profiles[user.username].class;
    } catch {}
    return 0;
  });

  function selectClass(c: number) {
    localStorage.setItem(`${CLASS_KEY}_${user.username}`, String(c));
    setStudentClass(c);
  }

  if (!studentClass) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #1a2f55 100%)",
        }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">अपनी Class चुनें</h2>
          <p className="text-blue-300 mb-6">आपके लिए सही content show होगा</p>
          <div className="grid grid-cols-2 gap-4 justify-items-center">
            {[9, 10, 11, 12].map((c) => (
              <button
                type="button"
                key={c}
                data-ocid="student.class_select"
                onClick={() => selectClass(c)}
                className="w-32 h-32 rounded-2xl text-white text-2xl font-bold transition-transform hover:scale-105"
                style={{ background: "#f97316" }}
              >
                Class {c}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            className="text-blue-300 mt-6"
            onClick={onLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    );
  }

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
              <p className="text-orange-400 text-xs">Class {studentClass}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {(
            [
              ["videos", "🎥 Videos"],
              ["notes", "📷 Notes"],
              ["tests", "📝 Tests"],
              ["results", "🏆 My Results"],
              ["doubts", "❓ Doubts"],
              ["live", "📡 Live"],
              ["attendance", "📋 Attendance"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              type="button"
              key={key}
              data-ocid={`student.${key}_tab`}
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
        <div className="p-4 border-t border-white/10 space-y-2">
          <p className="text-blue-300 text-xs">
            {user.username} | Class {studentClass}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 text-xs w-full"
            onClick={() => {
              localStorage.removeItem(`${CLASS_KEY}_${user.username}`);
              setStudentClass(0);
            }}
          >
            Change Class
          </Button>
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
          <span className="text-white font-bold text-sm">
            USA | Class {studentClass}
          </span>
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
        {tab === "videos" && (
          <>
            <div
              className="mb-4 rounded-xl p-4 flex items-center justify-between text-white"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              }}
            >
              <div>
                <p className="font-bold text-lg">📡 Live Class Join करें</p>
                <p className="text-orange-100 text-sm">
                  अभी चल रही या upcoming live classes देखें
                </p>
              </div>
              <button
                type="button"
                data-ocid="student.live_banner_button"
                onClick={() => setTab("live")}
                className="bg-white text-orange-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-orange-50 transition-colors"
              >
                Join Live →
              </button>
            </div>
            <VideosTab schoolClass={studentClass} />
          </>
        )}
        {tab === "notes" && <NotesTab schoolClass={studentClass} />}
        {tab === "tests" && (
          <TestsTab schoolClass={studentClass} username={user.username} />
        )}
        {tab === "results" && <ResultsTab username={user.username} />}
        {tab === "doubts" && (
          <DoubtsTab schoolClass={studentClass} username={user.username} />
        )}
        {tab === "live" && <LiveClassStudentTab schoolClass={studentClass} />}
        {tab === "attendance" && (
          <AttendanceStudentTab username={user.username} />
        )}
      </main>

      <div
        className="md:hidden fixed bottom-0 left-0 right-0 flex"
        style={{ background: "#0a1628" }}
      >
        {(
          [
            ["videos", "🎥"],
            ["notes", "📷"],
            ["tests", "📝"],
            ["results", "🏆"],
            ["doubts", "❓"],
            ["live", "📡"],
            ["attendance", "📋"],
          ] as [Tab, string][]
        ).map(([key, icon]) => (
          <button
            type="button"
            key={key}
            data-ocid={`student.${key}_tab`}
            onClick={() => setTab(key)}
            className={`flex-1 py-3 text-xl transition-colors ${
              key === "live"
                ? tab === key
                  ? "text-orange-400 scale-110"
                  : "text-orange-300"
                : tab === key
                  ? "text-orange-400"
                  : "text-blue-400"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}

function VideosTab({ schoolClass }: { schoolClass: number }) {
  const [videos, setVideos] = useState<VideoLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VideoLecture | null>(null);

  useEffect(() => {
    backend.getVideosByClass(BigInt(schoolClass)).then((v) => {
      setVideos(v);
      setLoading(false);
    });
  }, [schoolClass]);

  function getYouTubeEmbedUrl(url: string) {
    const match = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Video Lectures - Class {schoolClass}
      </h2>
      {selected && (
        <div className="mb-6">
          <div className="aspect-video w-full max-w-2xl rounded-xl overflow-hidden shadow-lg">
            <iframe
              src={getYouTubeEmbedUrl(selected.url)}
              className="w-full h-full"
              allowFullScreen
              title={selected.title}
            />
          </div>
          <p className="mt-2 font-semibold text-gray-800">{selected.title}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setSelected(null)}
          >
            Close
          </Button>
        </div>
      )}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <button
              type="button"
              key={v.id.toString()}
              className="text-left cursor-pointer hover:shadow-md transition-shadow rounded-xl border bg-white"
              onClick={() => setSelected(v)}
            >
              <div className="p-4">
                <div
                  className="w-full h-32 rounded-lg mb-3 flex items-center justify-center"
                  style={{ background: "#0a1628" }}
                >
                  <span className="text-4xl">▶️</span>
                </div>
                <p className="font-semibold text-gray-800">{v.title}</p>
                <p className="text-sm text-gray-500">{v.subject}</p>
                <Badge variant="secondary" className="mt-1">
                  By {v.teacher}
                </Badge>
              </div>
            </button>
          ))}
          {videos.length === 0 && (
            <div
              data-ocid="student.videos.empty_state"
              className="col-span-3 text-center py-8 text-gray-400"
            >
              Class {schoolClass} के लिए कोई video नहीं
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotesTab({ schoolClass }: { schoolClass: number }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Note | null>(null);

  useEffect(() => {
    backend.getNotesByClass(BigInt(schoolClass)).then((n) => {
      setNotes(n);
      setLoading(false);
    });
  }, [schoolClass]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Notes - Class {schoolClass}
      </h2>
      {preview && (
        <dialog
          open
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 border-0 max-w-full max-h-full w-full h-full m-0"
          onClick={() => setPreview(null)}
          onKeyDown={(e) => e.key === "Escape" && setPreview(null)}
          aria-label="Note preview"
        >
          <div
            className="max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <img
              src={preview.blob.getDirectURL()}
              alt={preview.title}
              className="w-full rounded-lg"
            />
            <Button className="mt-4 w-full" onClick={() => setPreview(null)}>
              Close
            </Button>
          </div>
        </dialog>
      )}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((n) => (
            <button
              type="button"
              key={n.id.toString()}
              className="text-left cursor-pointer hover:shadow-md rounded-xl border bg-white"
              onClick={() => setPreview(n)}
            >
              <div className="p-3">
                <img
                  src={n.blob.getDirectURL()}
                  alt={n.title}
                  className="w-full h-40 object-cover rounded-lg mb-2"
                />
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-gray-500">{n.subject}</p>
              </div>
            </button>
          ))}
          {notes.length === 0 && (
            <div
              data-ocid="student.notes.empty_state"
              className="col-span-3 text-center py-8 text-gray-400"
            >
              Class {schoolClass} के लिए कोई notes नहीं
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TestsTab({
  schoolClass,
  username,
}: { schoolClass: number; username: string }) {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // username is used in submitTest but we need to keep it in deps to avoid stale closure issues
  const _username = username;

  useEffect(() => {
    backend.getTestsByClass(BigInt(schoolClass)).then((t) => {
      setTests(t);
      setLoading(false);
    });
  }, [schoolClass]);

  function startTest(t: Test) {
    setActiveTest(t);
    setAnswers(new Array(t.questions.length).fill(-1));
    setSubmitted(false);
    setScore(0);
  }

  async function submitTest() {
    if (!activeTest) return;
    let s = 0;
    answers.forEach((ans, i) => {
      if (ans === Number(activeTest.questions[i].correctAnswer)) s++;
    });
    setScore(s);
    await backend.submitAttempt(
      activeTest.id,
      answers.map((a) => BigInt(a)),
      BigInt(s),
    );
    setSubmitted(true);
  }

  if (activeTest) {
    if (submitted) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold">Test Complete!</h2>
          <p className="text-xl mt-2">
            {score} / {activeTest.questions.length} सही
          </p>
          <p className="text-gray-500 mt-1">
            {Math.round((score / activeTest.questions.length) * 100)}% Score
          </p>
          <Button
            className="mt-6"
            style={{ background: "#f97316" }}
            onClick={() => setActiveTest(null)}
          >
            Back to Tests
          </Button>
        </div>
      );
    }
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{activeTest.title}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTest(null)}
          >
            Exit
          </Button>
        </div>
        <div className="space-y-6">
          {activeTest.questions.map((q, qi) => (
            <Card key={`q-${q.text.slice(0, 15)}-${q.options[0]?.slice(0, 5)}`}>
              <CardContent className="py-4">
                <p className="font-medium mb-3">
                  {qi + 1}. {q.text}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <button
                      type="button"
                      key={`opt-${qi}-${opt.slice(0, 10)}`}
                      onClick={() => {
                        const a = [...answers];
                        a[qi] = oi;
                        setAnswers(a);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg border-2 transition-colors ${
                        answers[qi] === oi
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 hover:border-orange-200"
                      }`}
                    >
                      <span className="font-medium">
                        {String.fromCharCode(65 + oi)}.
                      </span>{" "}
                      {opt}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button
          data-ocid="test.submit_button"
          className="w-full mt-6 text-white"
          style={{ background: "#f97316" }}
          disabled={answers.some((a) => a === -1)}
          onClick={submitTest}
        >
          Submit Test
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        MCQ Tests - Class {schoolClass}
      </h2>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {tests.map((t) => (
            <button
              type="button"
              key={t.id.toString()}
              className="text-left hover:shadow-md cursor-pointer rounded-xl border bg-white"
              onClick={() => startTest(t)}
            >
              <div className="p-4">
                <p className="font-semibold text-lg">{t.title}</p>
                <p className="text-gray-500">{t.subject}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {t.questions.length} Questions
                </p>
                <span
                  className="inline-block mt-3 px-3 py-1 rounded text-white text-sm"
                  style={{ background: "#f97316" }}
                >
                  Start Test
                </span>
              </div>
            </button>
          ))}
          {tests.length === 0 && (
            <div
              data-ocid="student.tests.empty_state"
              className="col-span-2 text-center py-8 text-gray-400"
            >
              Class {schoolClass} के लिए कोई test नहीं
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultsTab({ username }: { username: string }) {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backend.getStudentAttempts(username).then((a) => {
      setAttempts(a);
      setLoading(false);
    });
  }, [username]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Test Results</h2>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {attempts.map((a) => (
            <Card key={a.id.toString()}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold">Test #{a.testId.toString()}</p>
                  <p className="text-sm text-gray-500">
                    {a.answers.length} Questions
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "#f97316" }}
                  >
                    {a.score.toString()}
                  </p>
                  <p className="text-xs text-gray-400">Score</p>
                </div>
              </CardContent>
            </Card>
          ))}
          {attempts.length === 0 && (
            <div
              data-ocid="student.results.empty_state"
              className="text-center py-8 text-gray-400"
            >
              अभी कोई test नहीं दिया
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DoubtsTab({
  schoolClass,
  username,
}: { schoolClass: number; username: string }) {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await backend.getDoubts();
    setDoubts(all.filter((d) => d.student === username));
    setLoading(false);
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await backend.postDoubt(question, BigInt(schoolClass), subject);
    setQuestion("");
    setSubject("");
    setSubmitting(false);
    load();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Doubts</h2>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">नया Doubt पूछें</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              placeholder="Subject (e.g. Physics)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              rows={3}
              placeholder="अपना question लिखें..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
            <Button
              data-ocid="student.doubt.submit_button"
              type="submit"
              disabled={submitting}
              style={{ background: "#f97316" }}
              className="text-white"
            >
              {submitting ? "Posting..." : "Post Doubt"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {doubts.map((d) => (
            <Card
              key={d.id.toString()}
              className={d.answer ? "border-green-200" : ""}
            >
              <CardContent className="py-4">
                <p className="text-xs text-gray-400">
                  {d.subject} | Class {d.schoolClass.toString()}
                </p>
                <p className="font-medium mt-1">{d.question}</p>
                {d.answer ? (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-xs font-medium text-green-600">
                      Teacher Answer:
                    </p>
                    <p className="text-sm mt-1">{d.answer}</p>
                  </div>
                ) : (
                  <Badge variant="secondary" className="mt-2">
                    Pending...
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
          {doubts.length === 0 && (
            <div
              data-ocid="student.doubts.empty_state"
              className="text-center py-6 text-gray-400"
            >
              अभी कोई doubt नहीं
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LiveClassStudentTab({ schoolClass }: { schoolClass: number }) {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (backend as any)
      .getLiveClassesByClass(BigInt(schoolClass))
      .then((lcs: LiveClass[]) => {
        setLiveClasses(lcs);
        setLoading(false);
      });
  }, [schoolClass]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        📡 Live Classes - Class {schoolClass}
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Join करने के लिए नीचे "Join Live Class" button click करें
      </p>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {liveClasses.map((lc, idx) => (
            <Card
              key={lc.id.toString()}
              data-ocid={`student.live.item.${idx + 1}`}
              className="border-l-4"
              style={{ borderLeftColor: "#f97316" }}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-bold text-lg">{lc.title}</p>
                    <p className="text-sm text-gray-600">{lc.subject}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Teacher: {lc.teacher}
                    </p>
                  </div>
                  <span
                    className="px-2 py-1 rounded text-xs text-white font-medium shrink-0"
                    style={{ background: "#0a1628" }}
                  >
                    Class {lc.schoolClass.toString()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>📅 {lc.date}</span>
                  <span>🕐 {lc.time}</span>
                </div>
                <a
                  data-ocid={`student.live.button.${idx + 1}`}
                  href={lc.joinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2 px-4 rounded-lg text-white font-semibold transition-opacity hover:opacity-90"
                  style={{ background: "#f97316" }}
                >
                  🎥 Join Live Class
                </a>
              </CardContent>
            </Card>
          ))}
          {liveClasses.length === 0 && (
            <div
              data-ocid="student.live.empty_state"
              className="col-span-2 text-center py-12 text-gray-400"
            >
              Class {schoolClass} के लिए अभी कोई live class scheduled नहीं
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AttendanceStudentTab({ username }: { username: string }) {
  const currentYear = String(new Date().getFullYear());
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [records, setRecords] = useState<
    Array<{ date: string; status: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function loadAttendance() {
    setLoading(true);
    try {
      const data = await backend.getAttendanceByStudent(username, year, month);
      setRecords(data.map((r) => ({ date: r.date, status: r.status })));
      setLoaded(true);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const presentCount = records.filter((r) => r.status === "Present").length;
  const totalCount = records.length;
  const percentage =
    totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        📋 My Attendance
      </h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <p className="text-sm font-medium text-gray-700 block mb-1">Month</p>
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
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ][i]
                }
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 block mb-1">Year</p>
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
          <button
            type="button"
            data-ocid="attendance.view_button"
            onClick={loadAttendance}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "#f97316" }}
          >
            {loading ? "Loading..." : "View Attendance"}
          </button>
        </div>
      </div>

      {loading && (
        <div
          data-ocid="attendance.loading_state"
          className="flex items-center gap-2 text-gray-500 py-6"
        >
          <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          Attendance load हो रही है...
        </div>
      )}

      {!loading && loaded && totalCount > 0 && (
        <>
          <div
            className="rounded-xl p-4 mb-6 text-white"
            style={{ background: percentage >= 75 ? "#16a34a" : "#dc2626" }}
          >
            <p className="text-3xl font-bold">{percentage}%</p>
            <p className="text-sm opacity-90">
              {presentCount} Present / {totalCount} Total Days
            </p>
            <p className="text-xs opacity-75 mt-1">
              {percentage >= 75
                ? "✓ Attendance अच्छी है!"
                : "⚠️ Attendance 75% से कम है"}
            </p>
          </div>

          <div className="space-y-2">
            {records
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((r, idx) => (
                <div
                  key={`${r.date}-${idx}`}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-white border"
                >
                  <span className="text-gray-700 font-medium">
                    {new Date(r.date).toLocaleDateString("hi-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      r.status === "Present"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {r.status === "Present" ? "✓ Present" : "✗ Absent"}
                  </span>
                </div>
              ))}
          </div>
        </>
      )}

      {!loading && loaded && totalCount === 0 && (
        <div
          data-ocid="attendance.empty_state"
          className="text-center py-12 text-gray-400"
        >
          इस महीने की attendance data नहीं मिली
        </div>
      )}

      {!loading && !loaded && (
        <div
          data-ocid="attendance.empty_state"
          className="text-center py-12 text-gray-400"
        >
          Month और Year select करके "View Attendance" click करें
        </div>
      )}
    </div>
  );
}
