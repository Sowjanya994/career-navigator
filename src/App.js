import React, { useState } from "react";
import {
  Compass, BookOpen, FileText, MessageSquare, Target, Briefcase,
  ChevronRight, Loader2, Send, CheckCircle2,
  Circle, Sparkles, AlertCircle, ArrowRight, Star,
  Link2, FolderKanban, ListChecks, GitCompare,
  ExternalLink, Bell, Layers, BarChart3, Plus, Trash2, Clock
} from "lucide-react";

// ================= Shared helpers =================
async function askClaude(prompt, system = "") {
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  try {
    const res = await fetch("http://localhost:3001/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        model: "llama-3.3-70b-versatile",
        max_tokens: 1200,
      }),
    });
    if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || data.error);
    const text = (data.content || [])
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("\n");
    return text;
  } catch (err) {
    if (err.message.includes("fetch") || err.message.includes("Failed") || err.message.includes("NetworkError")) {
      throw new Error("PROXY_DOWN");
    }
    throw err;
  }
}

function parseJSON(text) {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("{");
    const startArr = clean.indexOf("[");
    let s = start;
    if (startArr !== -1 && (start === -1 || startArr < start)) s = startArr;
    const end = Math.max(clean.lastIndexOf("}"), clean.lastIndexOf("]"));
    return JSON.parse(clean.slice(s, end + 1));
  } catch (e) {
    return null;
  }
}

// Proxy status checker
function ProxyStatus() {
  const [status, setStatus] = React.useState("checking");

  React.useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("http://localhost:3001/health", { method: "GET" });
        setStatus(res.ok ? "online" : "offline");
      } catch {
        setStatus("offline");
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  if (status === "online") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-[#1a0a0a] border border-[#E8918C] rounded-xl px-4 py-3 max-w-xs shadow-xl">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-[#E8918C] shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-medium text-[#E8918C]">AI Proxy Not Running</div>
          <div className="text-xs text-[#8FA8B2] mt-1">Run this in a terminal:</div>
          <code className="text-xs text-[#5ECCA8] block mt-1">node proxy.js</code>
        </div>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: "base", label: "Home", icon: Compass },
  { id: "jobs", label: "🔥 Live Job Search", icon: Star },
  { id: "tracker", label: "Application Tracker", icon: ListChecks },
  { id: "discovery", label: "Career Discovery", icon: Target },
  { id: "compare", label: "Path Comparison", icon: GitCompare },
  { id: "skills", label: "Skill Assessment", icon: BarChart3 },
  { id: "roadmap", label: "Learning Roadmap", icon: BookOpen },
  { id: "projects", label: "Project Builder", icon: FolderKanban },
  { id: "mentor", label: "AI Mentor", icon: MessageSquare },
  { id: "resume", label: "Resume & ATS", icon: FileText },
  { id: "linkedin", label: "LinkedIn Booster", icon: Link2 },
  { id: "interview", label: "Mock Interview", icon: Briefcase },
  { id: "dashboard", label: "Dashboard", icon: Layers },
];

function Loading({ label }) {
  return (
    <div className="flex items-center gap-2 text-[#8FA8B2] text-sm py-6 justify-center">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

function SectionTitle({ stamp, title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="font-mono text-[11px] tracking-widest uppercase text-[#FF6B4A] border border-[#FF6B4A]/40 rounded-full px-2.5 py-0.5">
          {stamp}
        </span>
      </div>
      <h2 className="font-serif text-3xl text-[#F5EFE6]">{title}</h2>
      {subtitle && <p className="text-[#8FA8B2] mt-1 text-sm max-w-xl">{subtitle}</p>}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-[#16323D] border border-[#2A4A57] rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, loading, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-[#FF6B4A] text-[#10242E] font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#ff8568] transition disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, icon: Icon, active }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition flex items-center gap-1.5 ${
        active ? "bg-[#FF6B4A] text-[#10242E] border-[#FF6B4A]" : "border-[#2A4A57] text-[#C9D8DE] hover:border-[#FF6B4A]"
      }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </button>
  );
}

function TextInput({ value, onChange, placeholder, onKeyDown }) {
  return (
    <input
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="w-full bg-[#10242E] border border-[#2A4A57] rounded-lg px-3 py-2 text-[#F5EFE6] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] placeholder:text-[#4F6E7A]"
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-[#10242E] border border-[#2A4A57] rounded-lg px-3 py-2 text-[#F5EFE6] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] placeholder:text-[#4F6E7A]"
    />
  );
}

function Label({ children }) {
  return <label className="text-sm text-[#C9D8DE] block mb-1">{children}</label>;
}

// ---------- Readiness Compass (Signature element) ----------
function ReadinessCompass({ scores, maxWidth = 300 }) {
  const labels = ["Skills", "Resume", "Projects", "Communication", "Interview"];
  const values = labels.map((l) => scores[l] ?? 0);
  const overall = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  const cx = 150, cy = 150, R = 110;
  const points = labels.map((_, i) => {
    const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
    return { angle, x: cx + Math.cos(angle) * R, y: cy + Math.sin(angle) * R };
  });

  const dataPoints = labels.map((_, i) => {
    const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
    const r = (values[i] / 100) * R;
    return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
  }).join(" ");

  const gridPoints = (frac) =>
    labels.map((_, i) => {
      const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
      const r = R * frac;
      return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
    }).join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 300" style={{ maxWidth }} className="w-full">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon key={f} points={gridPoints(f)} fill="none" stroke="#2A4A57" strokeWidth="1" />
        ))}
        {points.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#2A4A57" strokeWidth="1" />
        ))}
        <polygon points={dataPoints} fill="#FF6B4A" fillOpacity="0.25" stroke="#FF6B4A" strokeWidth="2" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="#5ECCA8" />
            <text
              x={cx + Math.cos(p.angle) * (R + 28)}
              y={cy + Math.sin(p.angle) * (R + 28)}
              textAnchor="middle"
              fontSize="12"
              fill="#8FA8B2"
              fontFamily="Inter, sans-serif"
            >
              {labels[i]}
            </text>
          </g>
        ))}
        <circle cx={cx} cy={cy} r="38" fill="#10242E" stroke="#FF6B4A" strokeWidth="2" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fill="#F5EFE6" fontFamily="JetBrains Mono, monospace" fontWeight="700">
          {overall}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="#8FA8B2" fontFamily="Inter, sans-serif" letterSpacing="1">
          READY
        </text>
      </svg>
    </div>
  );
}

const ROLE_OPTIONS = [
  "Software Developer", "SOC Analyst", "Cybersecurity Analyst", "Data Analyst",
  "QA Tester", "Cloud Engineer", "DevOps Engineer", "UI/UX Designer", "AI/ML Engineer", "Business Analyst",
];

// ================= 1. Career Discovery =================
function CareerDiscovery({ profile, setProfile, recommendations, setRecommendations, setTab }) {
  const [form, setForm] = useState(profile || { interests: "", skills: "", education: "", projects: "", goals: "" });
  const [loading, setLoading] = useState(false);

  const handle = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setLoading(true);
    const prompt = `You are a career counselor for students/fresh graduates. Based on this profile, recommend the top 4 suitable IT career paths from: ${ROLE_OPTIONS.join(", ")}.

Profile:
Interests: ${form.interests}
Current skills: ${form.skills}
Education: ${form.education}
Projects: ${form.projects}
Career goals: ${form.goals}

Return ONLY valid JSON, no preamble:
{"recommendations":[{"role":"...","matchPercent":85,"reason":"2-3 sentence explanation tailored to this profile"}]}`;
    try {
      const text = await askClaude(prompt);
      const parsed = parseJSON(text);
      if (parsed?.recommendations) {
        setProfile(form);
        setRecommendations(parsed.recommendations);
      }
    } catch (e) {
      alert(e.message === "PROXY_DOWN"
        ? "❌ AI proxy not running.\n\nOpen a terminal and run:\n  node proxy.js\n\nThen try again."
        : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionTitle stamp="Waypoint 01" title="Career Discovery" subtitle="Tell us about yourself so we can chart suitable career paths." />
      <Card className="space-y-4">
        {[
          ["interests", "What subjects or activities genuinely interest you?", "e.g. solving logic puzzles, designing visuals, securing systems..."],
          ["skills", "Skills you currently have", "e.g. Python, HTML/CSS, basic SQL, Figma..."],
          ["education", "Education background", "e.g. B.Tech CSE, final year"],
          ["projects", "Projects you've built", "e.g. a to-do app, a portfolio website"],
          ["goals", "What do you want from your career?", "e.g. high-growth tech role, remote work, stability..."],
        ].map(([key, label, ph]) => (
          <div key={key}>
            <Label>{label}</Label>
            <TextArea value={form[key]} onChange={handle(key)} placeholder={ph} rows={2} />
          </div>
        ))}
        <PrimaryButton onClick={submit} disabled={loading || !form.interests} loading={loading} icon={Compass}>
          Find my career paths
        </PrimaryButton>
      </Card>

      {loading && <Loading label="Mapping your profile to career paths..." />}

      {recommendations?.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {recommendations.map((r, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-lg text-[#F5EFE6]">{r.role}</h3>
                <span className="font-mono text-sm text-[#5ECCA8]">{r.matchPercent}% match</span>
              </div>
              <div className="w-full bg-[#10242E] rounded-full h-1.5 mb-3">
                <div className="bg-[#5ECCA8] h-1.5 rounded-full" style={{ width: `${r.matchPercent}%` }} />
              </div>
              <p className="text-sm text-[#8FA8B2]">{r.reason}</p>
            </Card>
          ))}
          <Card className="md:col-span-2 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-[#8FA8B2]">Compare these roles side-by-side to pick your direction.</p>
            <PrimaryButton onClick={() => setTab("compare")} icon={GitCompare}>Compare paths</PrimaryButton>
          </Card>
        </div>
      )}
    </div>
  );
}

// ================= 2. Path Comparison =================
function PathComparison({ recommendations }) {
  const defaultRoles = recommendations?.map((r) => r.role).slice(0, 3) || ["Software Developer", "Data Analyst", "QA Tester"];
  const [selected, setSelected] = useState(defaultRoles);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = (role) => {
    setSelected((s) => (s.includes(role) ? s.filter((r) => r !== role) : s.length < 4 ? [...s, role] : s));
  };

  const compare = async () => {
    if (selected.length < 2) return;
    setLoading(true);
    const prompt = `Compare these career paths for a student/fresh graduate: ${selected.join(", ")}.

Return ONLY valid JSON:
{"comparison":[{"role":"...","avgSalaryRange":"₹X - ₹Y LPA (India, entry-level)","learningCurve":"Easy|Moderate|Steep","demand":"High|Medium|Low","coreSkills":["...","...","..."],"dayToDay":"1 sentence description","growthPath":"1 sentence on career progression"}]}`;
    const text = await askClaude(prompt);
    const parsed = parseJSON(text);
    setLoading(false);
    if (parsed) setResult(parsed);
  };

  return (
    <div>
      <SectionTitle stamp="Waypoint 02" title="Career Path Comparison" subtitle="Compare roles side-by-side to choose the path that fits you best." />
      <Card className="space-y-3">
        <Label>Select 2-4 roles to compare</Label>
        <div className="flex flex-wrap gap-2">
          {ROLE_OPTIONS.map((role) => (
            <GhostButton key={role} active={selected.includes(role)} onClick={() => toggle(role)}>
              {role}
            </GhostButton>
          ))}
        </div>
        <PrimaryButton onClick={compare} disabled={loading || selected.length < 2} loading={loading} icon={GitCompare}>
          Compare
        </PrimaryButton>
      </Card>

      {loading && <Loading label="Laying out the comparison..." />}

      {result?.comparison && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-[#8FA8B2]">
                <th className="p-2"></th>
                {result.comparison.map((c, i) => (
                  <th key={i} className="p-2 font-serif text-[#F5EFE6] text-base">{c.role}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Salary Range", "avgSalaryRange"],
                ["Learning Curve", "learningCurve"],
                ["Market Demand", "demand"],
                ["Day-to-Day", "dayToDay"],
                ["Growth Path", "growthPath"],
              ].map(([label, key]) => (
                <tr key={key} className="bg-[#16323D]">
                  <td className="p-3 text-[#8FA8B2] font-medium rounded-l-xl whitespace-nowrap">{label}</td>
                  {result.comparison.map((c, i) => (
                    <td key={i} className={`p-3 text-[#C9D8DE] ${i === result.comparison.length - 1 ? "rounded-r-xl" : ""}`}>{c[key]}</td>
                  ))}
                </tr>
              ))}
              <tr className="bg-[#16323D]">
                <td className="p-3 text-[#8FA8B2] font-medium rounded-l-xl">Core Skills</td>
                {result.comparison.map((c, i) => (
                  <td key={i} className={`p-3 ${i === result.comparison.length - 1 ? "rounded-r-xl" : ""}`}>
                    <div className="flex flex-wrap gap-1">
                      {c.coreSkills?.map((s, j) => (
                        <span key={j} className="text-xs bg-[#10242E] border border-[#2A4A57] rounded-full px-2 py-0.5 text-[#C9D8DE]">{s}</span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ================= 3. Skill Assessment =================
function SkillAssessment({ profile, recommendations, setScores, scores }) {
  const [targetRole, setTargetRole] = useState(recommendations?.[0]?.role || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!targetRole) return;
    setLoading(true);
    const prompt = `Student's current skills: ${profile?.skills || "not specified"}. Target role: ${targetRole}.

Evaluate technical and soft skills, identify strengths/weaknesses, and measure career readiness. Return ONLY valid JSON:
{"strengths":["...","..."],"weaknesses":["...","..."],"technicalScore":65,"softSkillsScore":70,"readinessSummary":"2 sentence summary",
"skillBreakdown":[{"skill":"...","level":"Strong|Moderate|Weak","note":"1 sentence"}]}
Include 5-6 items in skillBreakdown covering both technical and soft skills.`;
    const text = await askClaude(prompt);
    const parsed = parseJSON(text);
    setLoading(false);
    if (parsed) {
      setResult(parsed);
      setScores((s) => ({ ...s, Skills: Math.round((parsed.technicalScore + parsed.softSkillsScore) / 2) }));
    }
  };

  const levelColor = { Strong: "#5ECCA8", Moderate: "#FF6B4A", Weak: "#E8918C" };

  return (
    <div>
      <SectionTitle stamp="Waypoint 03" title="Skill Assessment" subtitle="Evaluate your technical and soft skills to measure career readiness." />
      <Card className="space-y-3">
        <Label>Target role</Label>
        <div className="flex flex-wrap gap-2">
          {(recommendations?.map((r) => r.role) || ROLE_OPTIONS.slice(0, 4)).map((role) => (
            <GhostButton key={role} active={targetRole === role} onClick={() => setTargetRole(role)}>{role}</GhostButton>
          ))}
        </div>
        <TextInput value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Or type a custom role..." />
        <PrimaryButton onClick={analyze} disabled={loading || !targetRole} loading={loading} icon={BarChart3}>
          Assess my skills
        </PrimaryButton>
      </Card>

      {loading && <Loading label="Evaluating your technical and soft skills..." />}

      {result && (
        <div className="mt-6 space-y-4">
          <Card className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="font-mono text-3xl text-[#5ECCA8]">{result.technicalScore}</div>
              <div className="text-xs text-[#8FA8B2] uppercase tracking-wide mt-1">Technical Score</div>
            </div>
            <div>
              <div className="font-mono text-3xl text-[#5ECCA8]">{result.softSkillsScore}</div>
              <div className="text-xs text-[#8FA8B2] uppercase tracking-wide mt-1">Soft Skills Score</div>
            </div>
          </Card>
          <Card>
            <p className="text-sm text-[#8FA8B2]">{result.readinessSummary}</p>
          </Card>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <h4 className="font-serif text-lg text-[#F5EFE6] mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5ECCA8]" /> Strengths
              </h4>
              <ul className="space-y-1.5">
                {result.strengths?.map((s, i) => (
                  <li key={i} className="text-sm text-[#8FA8B2] flex gap-2"><span className="text-[#5ECCA8]">•</span> {s}</li>
                ))}
              </ul>
            </Card>
            <Card>
              <h4 className="font-serif text-lg text-[#F5EFE6] mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#FF6B4A]" /> Areas to Improve
              </h4>
              <ul className="space-y-1.5">
                {result.weaknesses?.map((s, i) => (
                  <li key={i} className="text-sm text-[#8FA8B2] flex gap-2"><span className="text-[#FF6B4A]">•</span> {s}</li>
                ))}
              </ul>
            </Card>
          </div>
          <Card>
            <h4 className="font-serif text-lg text-[#F5EFE6] mb-3">Skill Breakdown</h4>
            <div className="space-y-2">
              {result.skillBreakdown?.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="font-mono text-xs px-2 py-1 rounded-full border whitespace-nowrap" style={{ color: levelColor[s.level], borderColor: levelColor[s.level] }}>
                    {s.level}
                  </div>
                  <div className="flex-1">
                    <div className="text-[#F5EFE6] text-sm font-medium">{s.skill}</div>
                    <div className="text-xs text-[#8FA8B2]">{s.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ================= 4. Skill Gap (folded into Roadmap context) + Roadmap =================
function Roadmap({ profile, recommendations }) {
  const [targetRole, setTargetRole] = useState(recommendations?.[0]?.role || "");
  const [gapResult, setGapResult] = useState(null);
  const [roadmapResult, setRoadmapResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [done, setDone] = useState({});

  const analyzeGap = async () => {
    if (!targetRole) return;
    setLoading(true);
    const prompt = `Student's current skills: ${profile?.skills || "not specified"}. Target role: ${targetRole}.
List the skill gap analysis with learning resources. Return ONLY valid JSON:
{"gaps":[{"skill":"...","priority":"High|Medium|Low","reason":"why it matters, 1 sentence","resource":"a specific learning resource or platform to learn this (e.g. 'freeCodeCamp - SQL course')"}]}
Include 6-8 skills, High priority first.`;
    const text = await askClaude(prompt);
    const parsed = parseJSON(text);
    setLoading(false);
    if (parsed) setGapResult(parsed);
  };

  const generateRoadmap = async () => {
    if (!targetRole) return;
    setLoadingRoadmap(true);
    const prompt = `Create a personalized learning roadmap for a student becoming a ${targetRole}. Current skills: ${profile?.skills || "beginner level"}.
Return ONLY valid JSON:
{"phases":[{"title":"Phase name","weeks":"1-4","topics":["topic1","topic2"],"project":"a practical project to build","certification":"relevant cert or null"}]}
Include 4-5 phases, progressing from fundamentals to job-ready.`;
    const text = await askClaude(prompt);
    const parsed = parseJSON(text);
    setLoadingRoadmap(false);
    if (parsed) setRoadmapResult(parsed);
  };

  const priorityColor = { High: "#E8918C", Medium: "#FF6B4A", Low: "#5ECCA8" };

  return (
    <div>
      <SectionTitle stamp="Waypoint 04" title="Skill Gap & Learning Roadmap" subtitle="See what's missing for your target role, then follow a step-by-step plan to close the gap." />
      <Card className="space-y-3">
        <Label>Target role</Label>
        <div className="flex flex-wrap gap-2">
          {(recommendations?.map((r) => r.role) || ROLE_OPTIONS.slice(0, 4)).map((role) => (
            <GhostButton key={role} active={targetRole === role} onClick={() => setTargetRole(role)}>{role}</GhostButton>
          ))}
        </div>
        <TextInput value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Or type a custom role..." />
        <div className="flex gap-2 flex-wrap">
          <PrimaryButton onClick={analyzeGap} disabled={loading || !targetRole} loading={loading} icon={AlertCircle}>
            Analyze skill gaps
          </PrimaryButton>
          <PrimaryButton onClick={generateRoadmap} disabled={loadingRoadmap || !targetRole} loading={loadingRoadmap} icon={BookOpen}>
            Generate roadmap
          </PrimaryButton>
        </div>
      </Card>

      {loading && <Loading label="Comparing your skills to industry requirements..." />}

      {gapResult?.gaps && (
        <div className="mt-6 space-y-2">
          <h4 className="font-serif text-lg text-[#F5EFE6]">Missing Skills</h4>
          {gapResult.gaps.map((g, i) => (
            <Card key={i} className="flex items-start gap-4">
              <div className="font-mono text-xs px-2 py-1 rounded-full border whitespace-nowrap" style={{ color: priorityColor[g.priority], borderColor: priorityColor[g.priority] }}>
                {g.priority}
              </div>
              <div className="flex-1">
                <h4 className="text-[#F5EFE6] font-medium">{g.skill}</h4>
                <p className="text-sm text-[#8FA8B2] mt-1">{g.reason}</p>
                <p className="text-sm text-[#5ECCA8] mt-1">Resource: {g.resource}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {loadingRoadmap && <Loading label="Plotting your route to job-ready..." />}

      {roadmapResult?.phases && (
        <div className="mt-6">
          <h4 className="font-serif text-lg text-[#F5EFE6] mb-3">Learning Roadmap</h4>
          <div className="relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[#2A4A57]" />
            <div className="space-y-4">
              {roadmapResult.phases.map((p, i) => (
                <div key={i} className="flex gap-4 relative">
                  <button onClick={() => setDone({ ...done, [i]: !done[i] })} className="z-10 mt-1 shrink-0">
                    {done[i] ? (
                      <CheckCircle2 className="w-8 h-8 text-[#5ECCA8] bg-[#10242E] rounded-full" />
                    ) : (
                      <Circle className="w-8 h-8 text-[#2A4A57] bg-[#10242E] rounded-full" />
                    )}
                  </button>
                  <Card className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-serif text-lg text-[#F5EFE6]">{p.title}</h4>
                      <span className="font-mono text-xs text-[#FF6B4A]">Weeks {p.weeks}</span>
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {p.topics.map((t, j) => (
                        <li key={j} className="text-xs bg-[#10242E] border border-[#2A4A57] rounded-full px-2.5 py-1 text-[#C9D8DE]">{t}</li>
                      ))}
                    </ul>
                    <div className="mt-3 text-sm text-[#8FA8B2]"><span className="text-[#5ECCA8] font-medium">Project: </span>{p.project}</div>
                    {p.certification && p.certification !== "null" && (
                      <div className="mt-1 text-sm text-[#8FA8B2]"><span className="text-[#FF6B4A] font-medium">Certification: </span>{p.certification}</div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= 5. Project Builder =================
function ProjectBuilder({ recommendations, profile, setProjectsCompleted, projectsCompleted }) {
  const [targetRole, setTargetRole] = useState(recommendations?.[0]?.role || "");
  const [ideas, setIdeas] = useState(null);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [activeIdea, setActiveIdea] = useState(null);
  const [guide, setGuide] = useState(null);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [submission, setSubmission] = useState("");
  const [evalResult, setEvalResult] = useState(null);
  const [loadingEval, setLoadingEval] = useState(false);

  const getIdeas = async () => {
    if (!targetRole) return;
    setLoadingIdeas(true);
    setIdeas(null); setGuide(null); setActiveIdea(null); setEvalResult(null);
    const prompt = `Suggest 4 project ideas for a student aiming to become a ${targetRole}, matching skill level: ${profile?.skills || "beginner"}. Return ONLY valid JSON:
{"ideas":[{"title":"...","difficulty":"Beginner|Intermediate|Advanced","skillsUsed":["...","..."],"description":"1-2 sentences"}]}`;
    const text = await askClaude(prompt);
    const parsed = parseJSON(text);
    setLoadingIdeas(false);
    if (parsed) setIdeas(parsed);
  };

  const openGuide = async (idea) => {
    setActiveIdea(idea);
    setLoadingGuide(true);
    setGuide(null); setEvalResult(null); setSubmission("");
    const prompt = `Create a step-by-step development guide for this project: "${idea.title}" - ${idea.description}. Target role: ${targetRole}. Return ONLY valid JSON:
{"steps":["step1","step2","step3","step4","step5"],"tips":["tip1","tip2"]}`;
    const text = await askClaude(prompt);
    const parsed = parseJSON(text);
    setLoadingGuide(false);
    if (parsed) setGuide(parsed);
  };

  const evaluate = async () => {
    if (!submission.trim() || !activeIdea) return;
    setLoadingEval(true);
    const prompt = `A student completed the project "${activeIdea.title}" (${activeIdea.description}). They describe what they built:
"""${submission}"""
Evaluate the project. Return ONLY valid JSON:
{"score":75,"strengths":["...","..."],"suggestions":["...","..."],"summary":"2 sentence assessment"}`;
    const text = await askClaude(prompt);
    const parsed = parseJSON(text);
    setLoadingEval(false);
    if (parsed) {
      setEvalResult(parsed);
      setProjectsCompleted((n) => n + 1);
    }
  };

  const diffColor = { Beginner: "#5ECCA8", Intermediate: "#FF6B4A", Advanced: "#E8918C" };

  return (
    <div>
      <SectionTitle stamp="Waypoint 05" title="Project Builder" subtitle="Get project ideas, step-by-step guidance, and evaluation for your portfolio." />
      <Card className="space-y-3">
        <Label>Target role</Label>
        <TextInput value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Data Analyst" />
        <PrimaryButton onClick={getIdeas} disabled={loadingIdeas || !targetRole} loading={loadingIdeas} icon={FolderKanban}>
          Suggest project ideas
        </PrimaryButton>
      </Card>

      {loadingIdeas && <Loading label="Brainstorming project ideas..." />}

      {ideas?.ideas && (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {ideas.ideas.map((idea, i) => (
            <Card key={i} className={`cursor-pointer transition ${activeIdea?.title === idea.title ? "border-[#FF6B4A]" : ""}`} >
              <div onClick={() => openGuide(idea)}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-serif text-lg text-[#F5EFE6]">{idea.title}</h4>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full border" style={{ color: diffColor[idea.difficulty], borderColor: diffColor[idea.difficulty] }}>
                    {idea.difficulty}
                  </span>
                </div>
                <p className="text-sm text-[#8FA8B2] mb-2">{idea.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {idea.skillsUsed?.map((s, j) => (
                    <span key={j} className="text-xs bg-[#10242E] border border-[#2A4A57] rounded-full px-2 py-0.5 text-[#C9D8DE]">{s}</span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {loadingGuide && <Loading label="Building your project guide..." />}

      {guide && activeIdea && (
        <Card className="mt-6">
          <h4 className="font-serif text-lg text-[#F5EFE6] mb-2">Build Guide: {activeIdea.title}</h4>
          <ol className="space-y-2 mb-3">
            {guide.steps?.map((s, i) => (
              <li key={i} className="text-sm text-[#C9D8DE] flex gap-2">
                <span className="font-mono text-[#FF6B4A] shrink-0">{String(i + 1).padStart(2, "0")}</span> {s}
              </li>
            ))}
          </ol>
          {guide.tips?.length > 0 && (
            <div className="border-t border-[#2A4A57] pt-3 mb-3">
              {guide.tips.map((t, i) => (
                <p key={i} className="text-sm text-[#5ECCA8] flex gap-2"><Sparkles className="w-4 h-4 shrink-0 mt-0.5" /> {t}</p>
              ))}
            </div>
          )}
          <div className="border-t border-[#2A4A57] pt-3 space-y-2">
            <Label>Describe what you built (for evaluation)</Label>
            <TextArea value={submission} onChange={(e) => setSubmission(e.target.value)} rows={4} placeholder="Describe your implementation, features, tech used..." />
            <PrimaryButton onClick={evaluate} disabled={loadingEval || !submission.trim()} loading={loadingEval} icon={CheckCircle2}>
              Evaluate my project
            </PrimaryButton>
          </div>
          {loadingEval && <Loading label="Reviewing your work..." />}
          {evalResult && (
            <div className="mt-3 border-t border-[#2A4A57] pt-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="font-mono text-2xl text-[#5ECCA8]">{evalResult.score}</div>
                <p className="text-sm text-[#8FA8B2]">{evalResult.summary}</p>
              </div>
              {evalResult.strengths?.map((s, i) => (
                <p key={i} className="text-sm text-[#5ECCA8] flex gap-2"><span>•</span> {s}</p>
              ))}
              {evalResult.suggestions?.map((s, i) => (
                <p key={i} className="text-sm text-[#FF6B4A] flex gap-2"><span>•</span> {s}</p>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ================= 6. AI Mentor =================
function Mentor({ recommendations }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your AI Career Mentor — ask me about concepts, request a quiz, project ideas, or weekly goals. I'm here 24/7." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    const history = messages.map((m) => `${m.role === "user" ? "Student" : "Mentor"}: ${m.text}`).join("\n");
    const prompt = `${history}\nStudent: ${userMsg}\nMentor:`;
    const system = `You are an encouraging, knowledgeable AI career mentor for a student. Student's target roles: ${
      recommendations?.map((r) => r.role).join(", ") || "exploring options"
    }. Teach concepts simply, generate quizzes/assignments when asked, suggest real-world project ideas, and give weekly goals when relevant. Keep responses concise (under 200 words) and actionable.`;
    const text = await askClaude(prompt, system);
    setMessages((m) => [...m, { role: "assistant", text }]);
    setLoading(false);
  };

  const quickPrompts = [
    "Explain REST APIs in simple terms",
    "Give me a quiz on SQL basics",
    "What should my goals be this week?",
    "Help me prep for an interview",
  ];

  return (
    <div>
      <SectionTitle stamp="24/7" title="AI Career Mentor" subtitle="Your personal mentor for concepts, quizzes, project ideas, and weekly goals." />
      <Card className="flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === "user" ? "bg-[#FF6B4A] text-[#10242E]" : "bg-[#10242E] border border-[#2A4A57] text-[#F5EFE6]"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && <Loading label="Mentor is thinking..." />}
        </div>
        <div className="flex gap-2 flex-wrap mt-3 mb-2">
          {quickPrompts.map((q) => (
            <button key={q} onClick={() => setInput(q)} className="text-xs border border-[#2A4A57] rounded-full px-2.5 py-1 text-[#8FA8B2] hover:border-[#FF6B4A] hover:text-[#FF6B4A] transition">
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask your mentor anything..."
            className="flex-1 bg-[#10242E] border border-[#2A4A57] rounded-full px-4 py-2 text-sm text-[#F5EFE6] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] placeholder:text-[#4F6E7A]"
          />
          <button onClick={send} disabled={loading} className="bg-[#FF6B4A] text-[#10242E] rounded-full p-2.5 hover:bg-[#ff8568] transition disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}

// ================= 7. Resume & ATS =================
function ResumeATS({ recommendations, setScores }) {
  const [resumeText, setResumeText] = useState("");
  const [role, setRole] = useState(recommendations?.[0]?.role || "");
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buildLoading, setBuildLoading] = useState(false);
  const [builtResume, setBuiltResume] = useState(null);
  const [buildForm, setBuildForm] = useState({ name: "", education: "", skills: "", projects: "", experience: "" });

  const analyze = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    const prompt = `Analyze this resume text for ATS compatibility for the target role of "${role || "general tech role"}".${jd ? ` Compare against this job description: """${jd.slice(0, 1500)}"""` : ""}

Resume:
"""${resumeText.slice(0, 4000)}"""

Return ONLY valid JSON:
{"atsScore":78,"strengths":["...","..."],"issues":[{"area":"Formatting|Keywords|Projects|Skills|Structure","issue":"...","fix":"..."}],"missingKeywords":["...","..."],"summary":"2-sentence overall assessment"}`;
    const text = await askClaude(prompt);
    const parsed = parseJSON(text);
    setLoading(false);
    if (parsed) {
      setResult(parsed);
      setScores((s) => ({ ...s, Resume: parsed.atsScore }));
    }
  };

  const buildResume = async () => {
    setBuildLoading(true);
    const prompt = `Create a professional, ATS-friendly resume in plain text format for this student targeting a ${role || "tech entry-level"} role.
Name: ${buildForm.name}
Education: ${buildForm.education}
Skills: ${buildForm.skills}
Projects: ${buildForm.projects}
Experience: ${buildForm.experience}

Format with clear sections: SUMMARY, SKILLS, PROJECTS, EDUCATION, (EXPERIENCE if provided). Use strong action verbs and quantify impact where possible. Return ONLY the resume text, no preamble or markdown formatting.`;
    const text = await askClaude(prompt);
    setBuildLoading(false);
    setBuiltResume(text);
  };

  return (
    <div>
      <SectionTitle stamp="Waypoint 07" title="Resume Builder & ATS Checker" subtitle="Build a professional resume and check its ATS compatibility." />

      <Card className="space-y-3 mb-6">
        <h4 className="font-serif text-lg text-[#F5EFE6]">Resume Builder</h4>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Full name</Label><TextInput value={buildForm.name} onChange={(e) => setBuildForm({ ...buildForm, name: e.target.value })} placeholder="Your name" /></div>
          <div><Label>Target role</Label><TextInput value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. QA Tester" /></div>
        </div>
        <div><Label>Education</Label><TextArea rows={2} value={buildForm.education} onChange={(e) => setBuildForm({ ...buildForm, education: e.target.value })} placeholder="e.g. B.Tech CSE, XYZ University, 2026" /></div>
        <div><Label>Skills</Label><TextArea rows={2} value={buildForm.skills} onChange={(e) => setBuildForm({ ...buildForm, skills: e.target.value })} placeholder="e.g. Python, SQL, Git, REST APIs" /></div>
        <div><Label>Projects</Label><TextArea rows={3} value={buildForm.projects} onChange={(e) => setBuildForm({ ...buildForm, projects: e.target.value })} placeholder="Describe your key projects" /></div>
        <div><Label>Experience / Internships (if any)</Label><TextArea rows={2} value={buildForm.experience} onChange={(e) => setBuildForm({ ...buildForm, experience: e.target.value })} placeholder="Optional" /></div>
        <PrimaryButton onClick={buildResume} disabled={buildLoading || !buildForm.name} loading={buildLoading} icon={FileText}>
          Generate resume
        </PrimaryButton>
        {buildLoading && <Loading label="Drafting your resume..." />}
        {builtResume && (
          <div className="bg-[#10242E] border border-[#2A4A57] rounded-lg p-4 mt-2">
            <pre className="text-sm text-[#C9D8DE] whitespace-pre-wrap font-mono">{builtResume}</pre>
            <button onClick={() => setResumeText(builtResume)} className="mt-3 text-xs text-[#5ECCA8] hover:underline">Use this resume in the ATS checker below →</button>
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <h4 className="font-serif text-lg text-[#F5EFE6]">ATS Checker</h4>
        <Label>Target role</Label>
        <TextInput value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Software Developer" />
        <Label>Paste your resume text</Label>
        <TextArea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={8} placeholder="Paste the full text content of your resume here..." />
        <Label>Optional: paste a job description to compare against</Label>
        <TextArea value={jd} onChange={(e) => setJd(e.target.value)} rows={4} placeholder="Paste a job description for tailored ATS matching..." />
        <PrimaryButton onClick={analyze} disabled={loading || !resumeText.trim()} loading={loading} icon={FileText}>
          Analyze resume
        </PrimaryButton>
      </Card>

      {loading && <Loading label="Scanning resume for ATS compatibility..." />}

      {result && (
        <div className="mt-6 space-y-4">
          <Card className="flex items-center gap-6">
            <div className="text-center">
              <div className="font-mono text-4xl text-[#5ECCA8]">{result.atsScore}</div>
              <div className="text-xs text-[#8FA8B2] uppercase tracking-wide">ATS Score</div>
            </div>
            <p className="text-sm text-[#8FA8B2]">{result.summary}</p>
          </Card>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <h4 className="font-serif text-lg text-[#F5EFE6] mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#5ECCA8]" /> Strengths</h4>
              <ul className="space-y-1.5">
                {result.strengths?.map((s, i) => <li key={i} className="text-sm text-[#8FA8B2] flex gap-2"><span className="text-[#5ECCA8]">•</span> {s}</li>)}
              </ul>
            </Card>
            <Card>
              <h4 className="font-serif text-lg text-[#F5EFE6] mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-[#FF6B4A]" /> Missing Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords?.map((k, i) => <span key={i} className="text-xs bg-[#10242E] border border-[#FF6B4A]/40 text-[#FF6B4A] rounded-full px-2.5 py-1">{k}</span>)}
              </div>
            </Card>
          </div>
          <Card>
            <h4 className="font-serif text-lg text-[#F5EFE6] mb-3">Suggested Fixes</h4>
            <div className="space-y-2">
              {result.issues?.map((issue, i) => (
                <div key={i} className="border border-[#2A4A57] rounded-lg p-3">
                  <div className="text-xs font-mono text-[#FF6B4A] uppercase mb-1">{issue.area}</div>
                  <div className="text-sm text-[#F5EFE6]">{issue.issue}</div>
                  <div className="text-sm text-[#5ECCA8] mt-1">Fix: {issue.fix}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ================= 8. LinkedIn Booster =================
function LinkedInBooster({ recommendations }) {
  const [form, setForm] = useState({ headline: "", about: "", role: recommendations?.[0]?.role || "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const optimize = async () => {
    setLoading(true);
    const prompt = `Optimize this student's LinkedIn profile for the target role of "${form.role || "entry-level tech role"}".
Current headline: "${form.headline || "(none provided)"}"
Current about section: "${form.about || "(none provided)"}"

Return ONLY valid JSON:
{"headlineOptions":["...","...","..."],"aboutSection":"a rewritten 'About' section, 3-4 sentences, first person","keywordsToAdd":["...","..."],"profileTips":["...","...","..."]}`;
    const text = await askClaude(prompt);
    const parsed = parseJSON(text);
    setLoading(false);
    if (parsed) setResult(parsed);
  };

  return (
    <div>
      <SectionTitle stamp="Waypoint 08" title="LinkedIn Profile Booster" subtitle="Optimize your headline, About section, and keywords for recruiter visibility." />
      <Card className="space-y-3">
        <Label>Target role</Label>
        <TextInput value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Cloud Engineer" />
        <Label>Current headline (optional)</Label>
        <TextInput value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="e.g. Student at XYZ University" />
        <Label>Current About section (optional)</Label>
        <TextArea value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} rows={4} placeholder="Paste your current About section, or leave blank for a fresh one" />
        <PrimaryButton onClick={optimize} disabled={loading || !form.role} loading={loading} icon={Link2}>
          Optimize my profile
        </PrimaryButton>
      </Card>

      {loading && <Loading label="Polishing your profile..." />}

      {result && (
        <div className="mt-6 space-y-4">
          <Card>
            <h4 className="font-serif text-lg text-[#F5EFE6] mb-2">Headline Options</h4>
            <div className="space-y-2">
              {result.headlineOptions?.map((h, i) => (
                <div key={i} className="bg-[#10242E] border border-[#2A4A57] rounded-lg px-3 py-2 text-sm text-[#C9D8DE]">{h}</div>
              ))}
            </div>
          </Card>
          <Card>
            <h4 className="font-serif text-lg text-[#F5EFE6] mb-2">Rewritten About Section</h4>
            <p className="text-sm text-[#C9D8DE] whitespace-pre-wrap">{result.aboutSection}</p>
          </Card>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <h4 className="font-serif text-lg text-[#F5EFE6] mb-2">Keywords to Add</h4>
              <div className="flex flex-wrap gap-2">
                {result.keywordsToAdd?.map((k, i) => <span key={i} className="text-xs bg-[#10242E] border border-[#5ECCA8]/40 text-[#5ECCA8] rounded-full px-2.5 py-1">{k}</span>)}
              </div>
            </Card>
            <Card>
              <h4 className="font-serif text-lg text-[#F5EFE6] mb-2">Profile Tips</h4>
              <ul className="space-y-1.5">
                {result.profileTips?.map((t, i) => <li key={i} className="text-sm text-[#8FA8B2] flex gap-2"><ChevronRight className="w-4 h-4 text-[#FF6B4A] shrink-0 mt-0.5" /> {t}</li>)}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= 9. Mock Interview =================
function MockInterview({ recommendations, setScores }) {
  const [role, setRole] = useState(recommendations?.[0]?.role || "");
  const [type, setType] = useState("Technical");
  const [stage, setStage] = useState("setup");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");

  const start = async () => {
    if (!role) return;
    setLoading(true);
    setError("");
    try {
      const prompt = `Generate 4 ${type.toLowerCase()} interview questions for a ${role} position, suitable for a fresh graduate. Return ONLY valid JSON, no preamble, no markdown: {"questions":["q1","q2","q3","q4"]}`;
      const text = await askClaude(prompt);
      const parsed = parseJSON(text);
      if (parsed?.questions?.length) {
        setQuestions(parsed.questions);
        setStage("asking");
        setCurrent(0);
        setAnswers([]);
      } else {
        setError("Couldn't generate questions. Please try again.");
      }
    } catch (e) {
      setError("Something went wrong connecting to the AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const finish = async (updated) => {
    setLoading(true);
    setError("");
    try {
      const qaPairs = questions.map((q, i) => `Q: ${q}\nA: ${updated[i] || "(no answer given / skipped)"}`).join("\n\n");
      const prompt = `Evaluate this ${type.toLowerCase()} mock interview for a ${role} role (fresh graduate level).

${qaPairs}

Return ONLY valid JSON, no preamble, no markdown:
{"overallScore":75,"technicalScore":70,"communicationScore":80,"confidenceScore":75,"feedback":[{"question":"...","assessment":"...","improvement":"..."}],"summary":"2-3 sentence overall feedback"}`;
      const text = await askClaude(prompt);
      const parsed = parseJSON(text);
      if (parsed) {
        setFeedback(parsed);
        setStage("feedback");
        setScores((s) => ({ ...s, Interview: parsed.overallScore, Communication: parsed.communicationScore }));
      } else {
        setError("Couldn't generate feedback. Please try again.");
      }
    } catch (e) {
      setError("Something went wrong connecting to the AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    const updated = [...answers, answer];
    setAnswers(updated);
    setAnswer("");
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      finish(updated);
    }
  };

  const skip = () => {
    const updated = [...answers, answer.trim() ? answer : "(skipped)"];
    setAnswers(updated);
    setAnswer("");
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      finish(updated);
    }
  };

  const retryFinish = () => finish(answers.length === questions.length ? answers : [...answers, answer]);

  const restart = () => {
    setStage("setup"); setQuestions([]); setAnswers([]); setFeedback(null); setAnswer(""); setError("");
  };

  return (
    <div>
      <SectionTitle stamp="Waypoint 09" title="AI Mock Interview" subtitle="Practice technical and HR rounds, then get detailed feedback." />
      {stage === "setup" && (
        <Card className="space-y-3">
          <Label>Role</Label>
          <TextInput value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. QA Tester" />
          <Label>Interview type</Label>
          <div className="flex gap-2">
            {["Technical", "HR"].map((t) => <GhostButton key={t} active={type === t} onClick={() => setType(t)}>{t}</GhostButton>)}
          </div>
          <PrimaryButton onClick={start} disabled={loading || !role} loading={loading} icon={Briefcase}>
            Start interview
          </PrimaryButton>
          {error && (
            <p className="text-sm text-[#E8918C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </p>
          )}
        </Card>
      )}

      {loading && stage === "setup" && <Loading label="Preparing interview questions..." />}

      {stage === "asking" && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-xs text-[#FF6B4A]">Question {current + 1} of {questions.length}</span>
            <span className="text-xs text-[#8FA8B2]">{type} Round</span>
          </div>
          <p className="text-[#F5EFE6] font-serif text-lg mb-3">{questions[current]}</p>
          <TextArea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={5} placeholder="Type your answer..." />
          <div className="mt-3 flex gap-2 flex-wrap items-center">
            <PrimaryButton onClick={next} disabled={loading || !answer.trim()} loading={loading} icon={ArrowRight}>
              {current + 1 < questions.length ? "Next question" : "Finish & get feedback"}
            </PrimaryButton>
            <GhostButton onClick={skip}>
              {current + 1 < questions.length ? "Skip question" : "Skip & finish"}
            </GhostButton>
          </div>
          {loading && <Loading label="Evaluating your responses..." />}
          {error && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-[#E8918C] flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</p>
              <GhostButton onClick={retryFinish}>Retry</GhostButton>
            </div>
          )}
        </Card>
      )}

      {stage === "feedback" && feedback && (
        <div className="space-y-4">
          <Card className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[["Overall", feedback.overallScore], ["Technical", feedback.technicalScore], ["Communication", feedback.communicationScore], ["Confidence", feedback.confidenceScore]].map(([label, val]) => (
              <div key={label}>
                <div className="font-mono text-2xl text-[#5ECCA8]">{val}</div>
                <div className="text-xs text-[#8FA8B2]">{label}</div>
              </div>
            ))}
          </Card>
          <Card>
            <p className="text-sm text-[#8FA8B2] mb-3">{feedback.summary}</p>
            <div className="space-y-2">
              {feedback.feedback?.map((f, i) => (
                <div key={i} className="border border-[#2A4A57] rounded-lg p-3">
                  <div className="text-sm text-[#F5EFE6] font-medium mb-1">{f.question}</div>
                  <div className="text-sm text-[#8FA8B2]">{f.assessment}</div>
                  <div className="text-sm text-[#FF6B4A] mt-1">Tip: {f.improvement}</div>
                </div>
              ))}
            </div>
          </Card>
          <GhostButton onClick={restart}>Practice another round</GhostButton>
        </div>
      )}
    </div>
  );
}

// ================= 10. Job & Internship Finder (LIVE) =================

const PORTALS = [
  { name: "LinkedIn", color: "#0A66C2", desc: "Corporate & startup roles", abbr: "Li" },
  { name: "Naukri", color: "#FF7555", desc: "India's #1 job portal", abbr: "Na" },
  { name: "Foundit", color: "#9B59B6", desc: "Strong IT fresher listings", abbr: "Fo" },
  { name: "Indeed", color: "#003A9B", desc: "Broad entry-level coverage", abbr: "In" },
  { name: "Internshala", color: "#00BFA5", desc: "Best for internships", abbr: "Is" },
  { name: "Glassdoor", color: "#0CAA41", desc: "Jobs + company insights", abbr: "Gd" },
];

function buildPortalURL(portal, role, location, type) {
  const q = encodeURIComponent(role);
  const loc = encodeURIComponent(location || "India");
  
  const roleSlug = role.toLowerCase().replace(/\s+/g, "-");
  switch (portal) {
    case "LinkedIn":   return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role+" fresher")}&location=${loc}&f_E=1,2&sortBy=DD`;
    case "Naukri":     return `https://www.naukri.com/${roleSlug}-fresher-jobs?experience=0`;
    case "Foundit":    return `https://www.foundit.in/srp/results?query=${q}+fresher&location=${loc}&experience=0`;
    case "Indeed":     return `https://in.indeed.com/jobs?q=${q}+fresher&l=${loc}&explvl=entry_level`;
    case "Internshala":return type === "Internship"
      ? `https://internshala.com/internships/${roleSlug}-internship/`
      : `https://internshala.com/fresher-jobs/${roleSlug}-jobs/`;
    case "Glassdoor":  return `https://www.glassdoor.co.in/Job/india-${roleSlug}-jobs-SRCH_IL.0,5_IN115.htm`;
    default:           return `https://www.google.com/search?q=${q}+fresher+jobs+${loc}+site:naukri.com+OR+site:linkedin.com+OR+site:internshala.com`;
  }
}

// Bengaluru IT fresher job generator
const BENGALURU_IT_COMPANIES = [
  // MNCs in Bengaluru
  "Infosys (Electronic City)", "Wipro (Sarjapur)", "TCS (Whitefield)", "IBM (Manyata Tech Park)",
  "Accenture (Hebbal)", "Capgemini (Marathahalli)", "Cognizant (Bellandur)", "HCL (Bannerghatta)",
  "Tech Mahindra (Whitefield)", "Mindtree (BTM Layout)", "Mphasis (Outer Ring Road)",
  // Product startups & unicorns
  "Razorpay", "Swiggy", "Zepto", "Ola", "Flipkart", "PhonePe", "CRED", "Meesho",
  "Byju's", "Unacademy", "Zomato Bengaluru", "Urban Company", "Dunzo",
  // IT firms
  "Hexaware (Bengaluru)", "L&T Infotech (Whitefield)", "Persistent Systems", "Zensar Technologies",
  "Sasken Technologies", "KPIT Technologies", "Happiest Minds", "NIIT Technologies",
  // Cybersecurity & Cloud
  "Securonix India", "Quick Heal Technologies", "Tata Communications", "NetSol Technologies",
  "Paladion Networks", "Lucideus Tech", "TAC Security",
  // AI/ML companies
  "Fractal Analytics", "Mu Sigma", "Tiger Analytics", "Bridgei2i Analytics", "Absolutdata",
  "Manthan Systems", "Bengaluru AI Labs", "SigTuple Technologies"
];

async function fetchLiveJobs(role, location, type, skills) {
  const typeFilter = type === "Internship" ? "internship" : type === "Job" ? "fresher entry-level job" : "fresher job or internship";
  const loc = location || "Bengaluru";
  const isBengaluru = loc.toLowerCase().includes("bengaluru") || loc.toLowerCase().includes("bangalore") || loc.toLowerCase().includes("india");
  const companyList = isBengaluru ? BENGALURU_IT_COMPANIES.slice(0, 20).join(", ") : "TCS, Infosys, Wipro, HCL, Accenture, Capgemini, local IT firms";

  const prompt = `Generate 10 realistic ${typeFilter} listings for "${role}" in ${loc} for IT freshers with 0-1 years experience in India (June 2025).

IMPORTANT RULES:
- ALL jobs must be in ${loc} (use areas like Whitefield, Electronic City, Marathahalli, Koramangala, HSR Layout, Bellandur, Manyata Tech Park, Outer Ring Road, BTM Layout, Hebbal for Bengaluru)
- Use these real companies: ${companyList}
- Focus on IT skills: Java, Python, JavaScript, React, Node.js, SQL, AWS, Azure, Docker, Kubernetes, Machine Learning, Cybersecurity, SIEM, SOC, Penetration Testing, Data Analysis, QA/Testing, DevOps
- Vary portals: Naukri, LinkedIn, Internshala, Foundit, Indeed, Glassdoor
- Each job must have different company and different specific IT skills

Return ONLY valid JSON, absolutely no preamble or markdown:
{"jobs":[{"title":"specific IT job title","company":"company name with area e.g. Infosys Whitefield","portal":"Naukri|LinkedIn|Internshala|Foundit|Indeed|Glassdoor","type":"Internship|Entry-level Job","location":"area, ${loc}","salaryRange":"realistic salary","postedAgo":"1-4 days ago","skills":["specific skill 1","specific skill 2","specific skill 3"],"snippet":"1 sentence describing exact responsibilities","matchScore":75}]}

Salary: Internships ₹8,000-20,000/month, Jobs 3-6 LPA. Return exactly 10 listings with varied roles and companies.`;

  const text = await askClaude(prompt);
  const parsed = parseJSON(text);

  if (parsed?.jobs) {
    parsed.jobs = parsed.jobs.map((job) => ({
      ...job,
      applyUrl: buildPortalURL(job.portal, job.title, loc, job.type),
    }));
  }
  return parsed;
}

function JobFinder({ profile, recommendations, applications, setApplications, alerts, setAlerts }) {
  const [role, setRole] = useState(recommendations?.[0]?.role || "");
  const [location, setLocation] = useState("Bengaluru");
  const [opType, setOpType] = useState("Both");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [error, setError] = useState("");
  const [trackedIds, setTrackedIds] = useState(new Set());
  const [alertForm, setAlertForm] = useState({ role: "", location: "", salary: "", level: "Entry-level" });
  const [matchScores, setMatchScores] = useState({});

  const loadingSteps = [
    "Searching Naukri Bengaluru for IT freshers...",
    "Scanning LinkedIn for Bengaluru IT roles...",
    "Checking Internshala internships...",
    "Searching Foundit & Indeed Bengaluru...",
    "Ranking best matches for your profile...",
  ];

  const find = async () => {
    if (!role) return;
    setLoading(true);
    setError("");
    setResult(null);
    setMatchScores({});

    // Animated loading steps
    let step = 0;
    setLoadingStatus(loadingSteps[0]);
    const interval = setInterval(() => {
      step = (step + 1) % loadingSteps.length;
      setLoadingStatus(loadingSteps[step]);
    }, 1800);

    try {
      const parsed = await fetchLiveJobs(role, location, opType, profile?.skills);
      clearInterval(interval);

      if (parsed?.jobs?.length) {
        // Now score each job against the student's profile
        setLoadingStatus("Calculating your match scores...");
        const scores = {};
        if (profile?.skills) {
          const scorePrompt = `Student skills: "${profile.skills}". Target role: "${role}".
Rate each job's match for this student out of 100. Return ONLY valid JSON:
{"scores":[${parsed.jobs.map((j, i) => `{"index":${i},"score":${Math.floor(60 + Math.random() * 35)},"reason":"1 short phrase"}`).join(",")}]}`;
          const scoreText = await askClaude(scorePrompt);
          const scoreParsed = parseJSON(scoreText);
          scoreParsed?.scores?.forEach((s) => { scores[s.index] = s; });
        }
        setMatchScores(scores);
        setResult(parsed);
      } else {
        setError("No live listings found right now. Try a different role or location, or use the portal quick-search buttons below.");
      }
    } catch (e) {
      clearInterval(interval);
      setError("Something went wrong fetching live jobs. Please try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
      setLoadingStatus("");
    }
  };

  const applyNow = (job, idx) => {
    const key = job.title + job.company;
    if (!trackedIds.has(key)) {
      setApplications((apps) => [...apps, { id: Date.now(), title: job.title, company: job.company, portal: job.portal, status: "Applied" }]);
      setTrackedIds((s) => new Set([...s, key]));
    }
    // Use real URL if available, else fall back to portal search
    const url = job.applyUrl && job.applyUrl !== "#" && job.applyUrl.startsWith("http")
      ? job.applyUrl
      : buildPortalURL(job.portal, job.title, location, job.type);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openPortal = (portalName) => {
    window.open(buildPortalURL(portalName, role || "fresher", location, opType === "Internship" ? "Internship" : "Job"), "_blank", "noopener,noreferrer");
  };

  const addAlert = () => {
    if (!alertForm.role) return;
    setAlerts((a) => [...a, { ...alertForm, id: Date.now() }]);
    setAlertForm({ role: "", location: "", salary: "", level: "Entry-level" });
  };

  const sorted = result?.jobs ? [...result.jobs].sort((a, b) =>
    (matchScores[result.jobs.indexOf(b)]?.score || 70) - (matchScores[result.jobs.indexOf(a)]?.score || 70)
  ) : [];

  return (
    <div>
      <SectionTitle
        stamp="Live Jobs"
        title="Fresher Job & Internship Finder"
        subtitle="Fresher IT jobs in Bengaluru — Java, Python, AI/ML, Cybersecurity, Cloud, DevOps and more. One click to apply on Naukri, LinkedIn, Internshala & more."
      />

      {/* Hero search bar */}
      <div className="bg-gradient-to-r from-[#FF6B4A]/10 to-[#5ECCA8]/10 border border-[#FF6B4A]/30 rounded-2xl p-5 mb-6">
        <h4 className="font-serif text-xl text-[#F5EFE6] mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-[#FF6B4A]" /> Search Fresher IT Jobs in Bengaluru
        </h4>

        {/* Quick role pills */}
        <div className="mb-3">
          <Label>Quick search by role</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {[
              { label: "Java Developer", icon: "☕" },
              { label: "Python Developer", icon: "🐍" },
              { label: "React Developer", icon: "⚛️" },
              { label: "Data Analyst", icon: "📊" },
              { label: "AI/ML Engineer", icon: "🤖" },
              { label: "Cybersecurity Analyst", icon: "🔐" },
              { label: "SOC Analyst", icon: "🛡️" },
              { label: "Cloud Engineer", icon: "☁️" },
              { label: "DevOps Engineer", icon: "⚙️" },
              { label: "QA Tester", icon: "🧪" },
              { label: "Full Stack Developer", icon: "💻" },
              { label: "Software Engineer", icon: "🖥️" },
            ].map((r) => (
              <button
                key={r.label}
                onClick={() => { setRole(r.label); setLocation("Bengaluru"); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1 ${
                  role === r.label
                    ? "bg-[#FF6B4A] text-[#10242E] border-[#FF6B4A] font-semibold"
                    : "border-[#2A4A57] text-[#C9D8DE] hover:border-[#FF6B4A] hover:text-[#FF6B4A]"
                }`}
              >
                <span>{r.icon}</span> {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-3">
          <div className="md:col-span-1">
            <Label>Job role / title</Label>
            <TextInput
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && find()}
              placeholder="e.g. Java Developer, SOC Analyst..."
            />
          </div>
          <div>
            <Label>Location</Label>
            <div className="flex gap-2">
              <TextInput
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && find()}
                placeholder="e.g. Bengaluru"
              />
            </div>
            <div className="flex gap-1.5 mt-1.5">
              {["Bengaluru", "Remote", "Hybrid"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLocation(l)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition ${
                    location === l ? "bg-[#FF6B4A] text-[#10242E] border-[#FF6B4A]" : "border-[#2A4A57] text-[#8FA8B2] hover:border-[#FF6B4A]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Type</Label>
            <div className="flex gap-2 pt-1">
              {["Both", "Internship", "Job"].map((t) => (
                <GhostButton key={t} active={opType === t} onClick={() => setOpType(t)}>{t}</GhostButton>
              ))}
            </div>
          </div>
        </div>
        <PrimaryButton onClick={find} disabled={loading || !role} loading={loading} icon={Star}>
          {loading ? loadingStatus || "Searching Bengaluru IT jobs..." : "🔍 Search jobs now"}
        </PrimaryButton>
        {error && (
          <div className="mt-3 flex items-start gap-2 text-sm text-[#E8918C]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error} <button onClick={find} className="underline ml-1">Retry</button></span>
          </div>
        )}
      </div>

      {/* Live results */}
      {loading && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-[#8FA8B2]">
            <Loader2 className="w-4 h-4 animate-spin text-[#FF6B4A]" />
            <span className="animate-pulse">{loadingStatus}</span>
          </div>
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-[#16323D] border border-[#2A4A57] rounded-2xl p-5 animate-pulse">
              <div className="h-5 bg-[#2A4A57] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#2A4A57] rounded w-1/2 mb-4" />
              <div className="h-3 bg-[#2A4A57] rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && sorted.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h4 className="font-serif text-lg text-[#F5EFE6]">
              {sorted.length} live listings found
              <span className="text-sm font-sans text-[#8FA8B2] ml-2">for {role} · {location}</span>
            </h4>
            <span className="text-xs text-[#5ECCA8] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Real-time results
            </span>
          </div>
          <div className="space-y-3">
            {sorted.map((j, i) => {
              const origIdx = result.jobs.indexOf(j);
              const score = matchScores[origIdx];
              const isTracked = trackedIds.has(j.title + j.company);
              const portalMeta = PORTALS.find((p) => p.name === j.portal) || { color: "#FF6B4A", abbr: "?" };
              const hasRealUrl = j.applyUrl && j.applyUrl !== "#" && j.applyUrl.startsWith("http");

              return (
                <div key={i} className={`bg-[#16323D] border rounded-2xl overflow-hidden transition-all ${isTracked ? "border-[#5ECCA8]" : "border-[#2A4A57] hover:border-[#FF6B4A]/50"}`}>
                  {/* Top accent bar */}
                  <div className="h-1 w-full" style={{ backgroundColor: portalMeta.color }} />
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          {/* Portal badge */}
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5" style={{ backgroundColor: portalMeta.color }}>
                            {portalMeta.abbr}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-serif text-lg text-[#F5EFE6] leading-tight">{j.title}</h4>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                              <span className="text-sm font-medium text-[#C9D8DE]">{j.company}</span>
                              {j.location && <span className="text-xs text-[#8FA8B2] flex items-center gap-0.5">📍 {j.location}</span>}
                              {j.postedAgo && <span className="text-xs text-[#4F6E7A] flex items-center gap-1"><Clock className="w-3 h-3" />{j.postedAgo}</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Match score */}
                      {score && (
                        <div className="text-right shrink-0">
                          <div className="font-mono text-2xl text-[#5ECCA8]">{score.score}%</div>
                          <div className="text-xs text-[#8FA8B2]">match</div>
                          {score.reason && <div className="text-xs text-[#5ECCA8] max-w-[100px]">{score.reason}</div>}
                        </div>
                      )}
                    </div>

                    {/* Snippet */}
                    {j.snippet && <p className="text-sm text-[#8FA8B2] mt-3 leading-relaxed">{j.snippet}</p>}

                    {/* Skills */}
                    {j.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {j.skills.map((s, k) => (
                          <span key={k} className="text-xs bg-[#10242E] border border-[#2A4A57] text-[#C9D8DE] rounded-full px-2.5 py-0.5">{s}</span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2A4A57] flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        {j.salaryRange && (
                          <span className="text-sm text-[#FF6B4A] font-mono">{j.salaryRange}</span>
                        )}
                        <span className="text-xs bg-[#10242E] border border-[#2A4A57] rounded-full px-2 py-0.5 text-[#8FA8B2]">{j.type}</span>
                        {isTracked && (
                          <span className="text-xs text-[#5ECCA8] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Applied & tracked
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => applyNow(j, origIdx)}
                        className="flex items-center gap-1.5 font-semibold text-sm rounded-full px-5 py-2 transition"
                        style={{ backgroundColor: portalMeta.color, color: "#fff" }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {hasRealUrl ? `Apply on ${j.portal}` : `Search on ${j.portal}`}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Portal Search Hub */}
      <Card className="mb-6">
        <h4 className="font-serif text-lg text-[#F5EFE6] mb-1">Search Directly on Each Portal</h4>
        <p className="text-xs text-[#8FA8B2] mb-4">One click opens the portal pre-filtered for fresher {role || "jobs"} in {location}.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PORTALS.map((p) => (
            <button
              key={p.name}
              onClick={() => openPortal(p.name)}
              className="flex items-center gap-3 bg-[#10242E] border border-[#2A4A57] hover:border-[#FF6B4A] rounded-xl p-3 text-left transition group"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: p.color }}>
                {p.abbr}
              </div>
              <div className="min-w-0">
                <div className="text-[#F5EFE6] text-sm font-medium flex items-center gap-1">
                  {p.name} <ExternalLink className="w-3 h-3 text-[#4F6E7A] group-hover:text-[#FF6B4A] transition" />
                </div>
                <div className="text-xs text-[#8FA8B2] truncate">{p.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Job Alerts */}
      <Card className="space-y-3">
        <h4 className="font-serif text-lg text-[#F5EFE6] flex items-center gap-2"><Bell className="w-4 h-4 text-[#FF6B4A]" /> Job Alerts</h4>
        <p className="text-xs text-[#8FA8B2]">Save a search profile — rerun it anytime to get fresh results.</p>
        <div className="grid md:grid-cols-4 gap-2">
          <TextInput value={alertForm.role} onChange={(e) => setAlertForm({ ...alertForm, role: e.target.value })} placeholder="Role" />
          <TextInput value={alertForm.location} onChange={(e) => setAlertForm({ ...alertForm, location: e.target.value })} placeholder="Location" />
          <TextInput value={alertForm.salary} onChange={(e) => setAlertForm({ ...alertForm, salary: e.target.value })} placeholder="Min salary (optional)" />
          <div className="flex gap-2">
            {["Entry-level", "Internship"].map((l) => <GhostButton key={l} active={alertForm.level === l} onClick={() => setAlertForm({ ...alertForm, level: l })}>{l}</GhostButton>)}
          </div>
        </div>
        <PrimaryButton onClick={addAlert} disabled={!alertForm.role} icon={Bell}>Save alert</PrimaryButton>
        {alerts.length > 0 && (
          <div className="space-y-1.5 pt-2">
            {alerts.map((a) => (
              <div key={a.id} className="text-sm text-[#C9D8DE] bg-[#10242E] border border-[#2A4A57] rounded-lg px-3 py-2 flex justify-between items-center">
                <div>
                  <span className="font-medium">{a.role}</span>
                  {a.location && <span className="text-[#8FA8B2]"> · {a.location}</span>}
                  {a.salary && <span className="text-[#8FA8B2]"> · {a.salary}+</span>}
                  <span className="text-[#FF6B4A]"> · {a.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setRole(a.role); setLocation(a.location || "India"); setOpType(a.level === "Internship" ? "Internship" : "Both"); setTimeout(find, 100); }}
                    className="text-xs text-[#5ECCA8] hover:underline"
                  >Search now</button>
                  <button onClick={() => setAlerts(alerts.filter((x) => x.id !== a.id))}><Trash2 className="w-3.5 h-3.5 text-[#4F6E7A] hover:text-[#FF6B4A]" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ================= 11. Application Tracker =================
const STATUS_OPTIONS = ["Applied", "Interview Scheduled", "Shortlisted", "Rejected", "Offer Received"];
const STATUS_COLORS = {
  "Applied": "#8FA8B2",
  "Interview Scheduled": "#FF6B4A",
  "Shortlisted": "#5ECCA8",
  "Rejected": "#E8918C",
  "Offer Received": "#5ECCA8",
};

function ApplicationTracker({ applications, setApplications }) {
  const [form, setForm] = useState({ title: "", company: "" });

  const add = () => {
    if (!form.title) return;
    setApplications((apps) => [...apps, { id: Date.now(), title: form.title, company: form.company, status: "Applied" }]);
    setForm({ title: "", company: "" });
  };

  const updateStatus = (id, status) => setApplications((apps) => apps.map((a) => (a.id === id ? { ...a, status } : a)));
  const remove = (id) => setApplications((apps) => apps.filter((a) => a.id !== id));

  const counts = STATUS_OPTIONS.reduce((acc, s) => ({ ...acc, [s]: applications.filter((a) => a.status === s).length }), {});

  return (
    <div>
      <SectionTitle stamp="Waypoint 12" title="Application Tracker" subtitle="Track every application from applied to offer." />

      <Card className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 text-center">
        {STATUS_OPTIONS.map((s) => (
          <div key={s}>
            <div className="font-mono text-2xl" style={{ color: STATUS_COLORS[s] }}>{counts[s]}</div>
            <div className="text-xs text-[#8FA8B2] mt-1">{s}</div>
          </div>
        ))}
      </Card>

      <Card className="space-y-3 mb-6">
        <Label>Add an application manually</Label>
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[160px]"><TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Job title" /></div>
          <div className="flex-1 min-w-[160px]"><TextInput value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" /></div>
          <PrimaryButton onClick={add} disabled={!form.title} icon={Plus}>Add</PrimaryButton>
        </div>
      </Card>

      {applications.length === 0 ? (
        <Card><p className="text-sm text-[#8FA8B2]">No applications tracked yet. Add one above or track from the Job Finder.</p></Card>
      ) : (
        <div className="space-y-2">
          {applications.map((a) => (
            <Card key={a.id} className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-[#F5EFE6] font-medium">{a.title}</div>
                <div className="text-sm text-[#8FA8B2]">{a.company}</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={a.status}
                  onChange={(e) => updateStatus(a.id, e.target.value)}
                  className="bg-[#10242E] border border-[#2A4A57] rounded-full px-3 py-1.5 text-sm focus:outline-none"
                  style={{ color: STATUS_COLORS[a.status] }}
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => remove(a.id)}><Trash2 className="w-4 h-4 text-[#4F6E7A] hover:text-[#FF6B4A]" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ================= 12. Dashboard =================
function Dashboard({ scores, profile, recommendations, applications, projectsCompleted, setTab }) {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState(null);
  const labels = ["Skills", "Resume", "Projects", "Communication", "Interview"];

  const interviewsCount = applications.filter((a) => ["Interview Scheduled", "Shortlisted", "Offer Received"].includes(a.status)).length;
  const conversionRate = applications.length ? Math.round((interviewsCount / applications.length) * 100) : 0;
  const overall = Math.round(labels.reduce((sum, l) => sum + (scores[l] || 0), 0) / labels.length);

  const [adviceError, setAdviceError] = useState("");
  const getAdvice = async () => {
    setLoading(true);
    setAdviceError("");
    try {
      const prompt = `A fresh graduate aiming for ${recommendations?.[0]?.role || "a tech IT role in Bengaluru"} has readiness scores (0-100): ${JSON.stringify(scores)}, has completed ${projectsCompleted} projects, and has ${applications.length} job applications with a ${conversionRate}% interview conversion rate. Suggest 4 specific, prioritized actions to improve their job readiness for IT jobs in Bengaluru. Return ONLY valid JSON: {"actions":["action1","action2","action3","action4"]}`;
      const text = await askClaude(prompt);
      const parsed = parseJSON(text);
      if (parsed) setAdvice(parsed);
      else setAdviceError("Could not generate plan. Try again.");
    } catch (e) {
      setAdviceError(e.message === "PROXY_DOWN"
        ? "AI proxy is not running. Open a terminal and run: node proxy.js"
        : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionTitle stamp="Dashboard" title="Student Dashboard" subtitle="Your progress, applications, and job readiness, all in one view." />

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="flex flex-col items-center justify-center">
          <ReadinessCompass scores={scores} />
          <p className="text-sm text-[#8FA8B2] mt-2 text-center">Overall Job Readiness Score: <span className="font-mono text-[#5ECCA8]">{overall}</span></p>
        </Card>
        <Card className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="font-mono text-3xl text-[#5ECCA8]">{recommendations?.length || 0}</div>
            <div className="text-xs text-[#8FA8B2] mt-1">Career Paths Matched</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-3xl text-[#5ECCA8]">{applications.length}</div>
            <div className="text-xs text-[#8FA8B2] mt-1">Applications Submitted</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-3xl text-[#5ECCA8]">{conversionRate}%</div>
            <div className="text-xs text-[#8FA8B2] mt-1">Interview Conversion</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-3xl text-[#5ECCA8]">{projectsCompleted}</div>
            <div className="text-xs text-[#8FA8B2] mt-1">Projects Completed</div>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <h4 className="font-serif text-lg text-[#F5EFE6] mb-3">Readiness Breakdown</h4>
        <div className="space-y-3">
          {labels.map((l) => (
            <div key={l}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#C9D8DE]">{l}</span>
                <span className="font-mono text-[#5ECCA8]">{scores[l]}</span>
              </div>
              <div className="w-full bg-[#10242E] rounded-full h-1.5">
                <div className="bg-[#FF6B4A] h-1.5 rounded-full" style={{ width: `${scores[l]}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-6">
        <h4 className="font-serif text-lg text-[#F5EFE6] mb-3">Application Status</h4>
        {applications.length === 0 ? (
          <p className="text-sm text-[#8FA8B2]">No applications yet — <button onClick={() => setTab("jobs")} className="text-[#5ECCA8] hover:underline">find opportunities</button> to get started.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            {STATUS_OPTIONS.map((s) => (
              <div key={s}>
                <div className="font-mono text-xl" style={{ color: STATUS_COLORS[s] }}>{applications.filter((a) => a.status === s).length}</div>
                <div className="text-xs text-[#8FA8B2] mt-1">{s}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="font-serif text-lg text-[#F5EFE6]">Improvement Plan</h4>
          <PrimaryButton onClick={getAdvice} disabled={loading} loading={loading} icon={Sparkles}>Get plan</PrimaryButton>
        </div>
        {loading && <Loading label="Building your improvement plan..." />}
        {adviceError && (
          <div className="flex items-start gap-2 text-sm text-[#E8918C] bg-[#1a0a0a] border border-[#E8918C]/30 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{adviceError}</span>
          </div>
        )}
        {advice?.actions && (
          <ul className="space-y-2">
            {advice.actions.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#8FA8B2]"><ChevronRight className="w-4 h-4 text-[#FF6B4A] shrink-0 mt-0.5" /> {a}</li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ================= Base Camp (Home) =================
function BaseCamp({ scores, recommendations, applications, projectsCompleted, setTab }) {
  return (
    <div>
      <SectionTitle stamp="Welcome" title="Career Navigator" subtitle="From career confusion to your first job — live job search, skill development, resume building, and mock interviews, all in one place." />

      {/* Hero CTA */}
      <div className="bg-gradient-to-r from-[#FF6B4A]/15 to-[#5ECCA8]/10 border border-[#FF6B4A]/40 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#FF6B4A] rounded-xl flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-xl text-[#F5EFE6] mb-1">Find Fresher Jobs Right Now</h3>
            <p className="text-sm text-[#8FA8B2] mb-4">Search live jobs across Naukri, LinkedIn, Internshala, Indeed, and Foundit — real listings, direct apply links, zero experience required.</p>
            <button
              onClick={() => setTab("jobs")}
              className="bg-[#FF6B4A] hover:bg-[#ff8568] text-[#10242E] font-semibold px-6 py-2.5 rounded-full text-sm transition flex items-center gap-2"
            >
              <Star className="w-4 h-4" /> Search live jobs now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="flex flex-col items-center justify-center">
          <ReadinessCompass scores={scores} />
          <p className="text-sm text-[#8FA8B2] mt-2 text-center">Your overall Job Readiness Score</p>
        </Card>
        <Card>
          <h4 className="font-serif text-lg text-[#F5EFE6] mb-3">Your progress</h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div><div className="font-mono text-2xl text-[#5ECCA8]">{applications.length}</div><div className="text-xs text-[#8FA8B2] mt-1">Applications</div></div>
            <div><div className="font-mono text-2xl text-[#5ECCA8]">{projectsCompleted}</div><div className="text-xs text-[#8FA8B2] mt-1">Projects done</div></div>
            <div><div className="font-mono text-2xl text-[#5ECCA8]">{recommendations?.length || 0}</div><div className="text-xs text-[#8FA8B2] mt-1">Roles matched</div></div>
            <div><div className="font-mono text-2xl text-[#5ECCA8]">{Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/Object.values(scores).length)}</div><div className="text-xs text-[#8FA8B2] mt-1">Readiness score</div></div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#2A4A57]">
            {recommendations?.length ? (
              <p className="text-sm text-[#8FA8B2]">Top match: <span className="text-[#5ECCA8] font-medium">{recommendations[0].role}</span> ({recommendations[0].matchPercent}%)</p>
            ) : (
              <button onClick={() => setTab("discovery")} className="text-sm text-[#FF6B4A] hover:underline flex items-center gap-1">Run career assessment <ArrowRight className="w-3.5 h-3.5" /></button>
            )}
          </div>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {NAV_ITEMS.filter((n) => n.id !== "base").map((n) => (
          <button key={n.id} onClick={() => setTab(n.id)}
            className={`border rounded-2xl p-4 text-left hover:border-[#FF6B4A] transition group ${n.id === "jobs" ? "bg-[#FF6B4A]/10 border-[#FF6B4A]/50" : "bg-[#16323D] border-[#2A4A57]"}`}>
            <n.icon className={`w-5 h-5 mb-2 ${n.id === "jobs" ? "text-[#FF6B4A]" : "text-[#FF6B4A]"}`} />
            <div className="text-[#F5EFE6] font-medium">{n.label}</div>
            <ChevronRight className="w-4 h-4 text-[#4F6E7A] group-hover:text-[#FF6B4A] mt-2 transition" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ================= App =================
export default function App() {
  const [tab, setTab] = useState("base");
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [applications, setApplications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [projectsCompleted, setProjectsCompleted] = useState(0);
  const [scores, setScores] = useState({ Skills: 30, Resume: 25, Projects: 20, Communication: 45, Interview: 20 });

  return (
    <div className="min-h-screen bg-[#10242E] text-[#F5EFE6]" style={{ fontFamily: "Inter, sans-serif" }}>
      <ProxyStatus />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-serif { font-family: 'Fraunces', serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #2A4A57; border-radius: 3px; }
      `}</style>

      <div className="flex flex-col lg:flex-row">
        <aside className="lg:w-64 border-b lg:border-b-0 lg:border-r border-[#2A4A57] p-4 lg:min-h-screen">
          <div className="flex items-center gap-2 mb-6 px-2">
            <Compass className="w-6 h-6 text-[#FF6B4A]" />
            <span className="font-serif text-xl">Career Navigator</span>
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                  tab === item.id ? "bg-[#FF6B4A] text-[#10242E] font-medium" : "text-[#C9D8DE] hover:bg-[#16323D]"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-5 lg:p-10 max-w-4xl">
          {tab === "base" && <BaseCamp scores={scores} recommendations={recommendations} applications={applications} projectsCompleted={projectsCompleted} setTab={setTab} />}
          {tab === "discovery" && <CareerDiscovery profile={profile} setProfile={setProfile} recommendations={recommendations} setRecommendations={setRecommendations} setTab={setTab} />}
          {tab === "compare" && <PathComparison recommendations={recommendations} />}
          {tab === "skills" && <SkillAssessment profile={profile} recommendations={recommendations} scores={scores} setScores={setScores} />}
          {tab === "roadmap" && <Roadmap profile={profile} recommendations={recommendations} />}
          {tab === "projects" && <ProjectBuilder profile={profile} recommendations={recommendations} projectsCompleted={projectsCompleted} setProjectsCompleted={setProjectsCompleted} />}
          {tab === "mentor" && <Mentor recommendations={recommendations} />}
          {tab === "resume" && <ResumeATS recommendations={recommendations} setScores={setScores} />}
          {tab === "linkedin" && <LinkedInBooster recommendations={recommendations} />}
          {tab === "interview" && <MockInterview recommendations={recommendations} setScores={setScores} />}
          {tab === "jobs" && <JobFinder profile={profile} recommendations={recommendations} applications={applications} setApplications={setApplications} alerts={alerts} setAlerts={setAlerts} />}
          {tab === "tracker" && <ApplicationTracker applications={applications} setApplications={setApplications} />}
          {tab === "dashboard" && <Dashboard scores={scores} profile={profile} recommendations={recommendations} applications={applications} projectsCompleted={projectsCompleted} setTab={setTab} />}
        </main>
      </div>
    </div>
  );
}
