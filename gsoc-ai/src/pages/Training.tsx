import { useState, useEffect, useCallback } from 'react';
import { BookOpen, CheckCircle, ChevronRight, Lock, Star, Zap, AlertTriangle, Lightbulb, Target, RotateCcw, Award } from 'lucide-react';
import { MODULES, CLEARANCE_LEVELS, type TrainingModule, type Lesson, type ContentBlock } from '../data/trainingContent';

// ── Progress helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'gsoc-training-progress';

interface Progress {
  completed: Record<string, boolean>;   // `${moduleId}:${lessonId}` → true
  quizScores: Record<string, number>;   // `${moduleId}:${lessonId}` → score %
}

function loadProgress(): Progress {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return { completed: {}, quizScores: {} };
  }
}

function saveProgress(p: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function lessonKey(moduleId: string, lessonId: string) {
  return `${moduleId}:${lessonId}`;
}

function totalLessons() {
  return MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
}

function completedCount(progress: Progress) {
  return Object.values(progress.completed ?? {}).filter(Boolean).length;
}

function moduleCompleted(m: TrainingModule, progress: Progress) {
  return m.lessons.every(l => progress.completed?.[lessonKey(m.id, l.id)]);
}

function moduleStarted(m: TrainingModule, progress: Progress) {
  return m.lessons.some(l => progress.completed?.[lessonKey(m.id, l.id)]);
}

// ── Content block renderer ────────────────────────────────────────────────────

function ContentRenderer({ block }: { block: ContentBlock }) {
  if (block.type === 'paragraph') {
    return <p style={{ lineHeight: 1.75, marginBottom: '16px', color: 'var(--text)' }}>{block.text}</p>;
  }
  if (block.type === 'steps') {
    return (
      <div style={{ marginBottom: '20px' }}>
        {block.title && <p style={{ fontWeight: 600, marginBottom: '10px', color: 'var(--text)' }}>{block.title}</p>}
        <ol style={{ paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{
                minWidth: '24px', height: '24px', borderRadius: '50%',
                background: 'var(--accent)', color: '#000', fontSize: '12px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px',
              }}>{i + 1}</span>
              <span style={{ lineHeight: 1.65, paddingTop: '2px', color: 'var(--text)' }}>{item}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  if (block.type === 'tip') {
    return (
      <div style={{
        background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.3)',
        borderLeft: '3px solid var(--accent)', borderRadius: '6px',
        padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start',
      }}>
        <Lightbulb size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
        <span style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--text)' }}>{block.text}</span>
      </div>
    );
  }
  if (block.type === 'warning') {
    return (
      <div style={{
        background: 'rgba(245,101,101,0.07)', border: '1px solid rgba(245,101,101,0.3)',
        borderLeft: '3px solid var(--danger)', borderRadius: '6px',
        padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start',
      }}>
        <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
        <span style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--text)' }}>{block.text}</span>
      </div>
    );
  }
  if (block.type === 'definition') {
    return (
      <div style={{
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: '6px', padding: '12px 16px', marginBottom: '16px',
      }}>
        <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent)', display: 'block', marginBottom: '4px' }}>
          {block.term}
        </span>
        <span style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{block.text}</span>
      </div>
    );
  }
  return null;
}

// ── Quiz component ─────────────────────────────────────────────────────────────

function Quiz({
  questions, onComplete,
}: {
  questions: NonNullable<Extract<ContentBlock, { type: 'quiz' }>['questions']>;
  onComplete: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) return;
    const correct = questions.filter((q, i) => answers[i] === q.correct).length;
    setSubmitted(true);
    onComplete(Math.round((correct / questions.length) * 100));
  };

  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '20px', marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Target size={18} style={{ color: 'var(--accent)' }} />
        <span style={{ fontWeight: 700, fontSize: '14px' }}>Knowledge Check</span>
      </div>
      {questions.map((q, qi) => (
        <div key={qi} style={{ marginBottom: '20px' }}>
          <p style={{ fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>{qi + 1}. {q.question}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              const isCorrect = oi === q.correct;
              let bg = 'var(--bg-secondary)';
              let border = 'var(--border)';
              let textColor = 'var(--text)';
              if (submitted) {
                if (isCorrect) { bg = 'rgba(72,187,120,0.12)'; border = 'var(--success)'; textColor = 'var(--success)'; }
                else if (selected && !isCorrect) { bg = 'rgba(245,101,101,0.1)'; border = 'var(--danger)'; textColor = 'var(--danger)'; }
              } else if (selected) {
                bg = 'rgba(0,212,170,0.1)'; border = 'var(--accent)';
              }
              return (
                <button
                  key={oi}
                  disabled={submitted}
                  onClick={() => !submitted && setAnswers(a => ({ ...a, [qi]: oi }))}
                  style={{
                    background: bg, border: `1px solid ${border}`, borderRadius: '6px',
                    padding: '10px 14px', textAlign: 'left', cursor: submitted ? 'default' : 'pointer',
                    fontSize: '13.5px', color: textColor, transition: 'all 120ms',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  <span style={{
                    width: '20px', height: '20px', borderRadius: '50%', border: `1px solid ${border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px',
                  }}>
                    {submitted && isCorrect ? '✓' : submitted && selected && !isCorrect ? '✗' : String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic', paddingLeft: '4px' }}>
              {q.explanation}
            </p>
          )}
        </div>
      ))}
      {!submitted && (
        <button
          className="btn btn-primary"
          disabled={Object.keys(answers).length < questions.length}
          onClick={handleSubmit}
          style={{ marginTop: '4px' }}
        >
          <Target size={15} /> Submit Answers
        </button>
      )}
      {submitted && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
          background: 'rgba(72,187,120,0.1)', border: '1px solid var(--success)',
          borderRadius: '6px', marginTop: '4px', fontSize: '13px', color: 'var(--success)',
        }}>
          <CheckCircle size={16} />
          {questions.filter((q, i) => answers[i] === q.correct).length} / {questions.length} correct
        </div>
      )}
    </div>
  );
}

// ── Lesson viewer ──────────────────────────────────────────────────────────────

function LessonView({
  module: mod, lesson, lessonIndex, totalInModule,
  isCompleted, onComplete, onNav,
}: {
  module: TrainingModule;
  lesson: Lesson;
  lessonIndex: number;
  totalInModule: number;
  isCompleted: boolean;
  onComplete: (score?: number) => void;
  onNav: (dir: 'prev' | 'next') => void;
}) {
  const [quizDone, setQuizDone] = useState(false);
  const hasQuiz = lesson.content.some(b => b.type === 'quiz');
  const nonQuizBlocks = lesson.content.filter(b => b.type !== 'quiz');
  const quizBlock = lesson.content.find(b => b.type === 'quiz') as Extract<ContentBlock, { type: 'quiz' }> | undefined;

  const canComplete = !hasQuiz || quizDone || isCompleted;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Lesson header */}
      <div style={{ padding: '24px 28px 0', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          <span style={{ color: mod.color, fontWeight: 600 }}>Module {mod.number}</span>
          <ChevronRight size={12} />
          <span>{mod.title}</span>
          <ChevronRight size={12} />
          <span>Lesson {lessonIndex + 1} of {totalInModule}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>{lesson.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>⏱ {lesson.readTime}</span>
            {isCompleted && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--success)', background: 'rgba(72,187,120,0.1)', padding: '3px 10px', borderRadius: '20px', border: '1px solid var(--success)' }}>
                <CheckCircle size={12} /> Complete
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px' }}>
        {nonQuizBlocks.map((block, i) => (
          <ContentRenderer key={i} block={block} />
        ))}

        {quizBlock && (
          <Quiz
            questions={quizBlock.questions}
            onComplete={score => { setQuizDone(true); if (!isCompleted) onComplete(score); }}
          />
        )}

        {!hasQuiz && !isCompleted && (
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <button className="btn btn-primary" onClick={() => onComplete()}>
              <CheckCircle size={15} /> Mark Complete
            </button>
          </div>
        )}

        {isCompleted && !quizDone && hasQuiz && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(72,187,120,0.1)', border: '1px solid var(--success)', borderRadius: '6px', fontSize: '13px', color: 'var(--success)', marginBottom: '16px' }}>
            <CheckCircle size={16} /> Already completed
          </div>
        )}
      </div>

      {/* Nav footer */}
      <div style={{
        borderTop: '1px solid var(--border)', padding: '14px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onNav('prev')}
          disabled={lessonIndex === 0 && mod.number === 1}
        >
          ← Previous
        </button>
        <div style={{ display: 'flex', gap: '6px' }}>
          {Array.from({ length: totalInModule }).map((_, i) => (
            <div key={i} style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: i === lessonIndex ? mod.color : i < lessonIndex ? 'var(--success)' : 'var(--border)',
            }} />
          ))}
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onNav('next')}
          disabled={!canComplete}
          title={!canComplete ? 'Complete the quiz to continue' : undefined}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Training() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [completionBurst, setCompletionBurst] = useState<string | null>(null);

  const total = totalLessons();
  const done = completedCount(progress);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const clearanceIdx = Math.min(Math.floor((done / total) * CLEARANCE_LEVELS.length), CLEARANCE_LEVELS.length - 1);
  const clearance = CLEARANCE_LEVELS[clearanceIdx];

  const updateProgress = useCallback((moduleId: string, lessonId: string, score?: number) => {
    setProgress(prev => {
      const next: Progress = {
        completed: { ...prev.completed, [lessonKey(moduleId, lessonId)]: true },
        quizScores: score != null
          ? { ...prev.quizScores, [lessonKey(moduleId, lessonId)]: score }
          : prev.quizScores ?? {},
      };
      saveProgress(next);
      return next;
    });
  }, []);

  // Auto-advance to first incomplete lesson on mount if a module is active
  useEffect(() => {
    if (!activeModule) return;
    const mod = MODULES.find(m => m.id === activeModule);
    if (!mod) return;
    if (!activeLesson) {
      const first = mod.lessons.find(l => !progress.completed?.[lessonKey(mod.id, l.id)]) ?? mod.lessons[0];
      setActiveLesson(first.id);
    }
  }, [activeModule, activeLesson, progress]);

  const handleNav = (dir: 'prev' | 'next') => {
    const mod = MODULES.find(m => m.id === activeModule);
    if (!mod) return;
    const lessonIdx = mod.lessons.findIndex(l => l.id === activeLesson);
    if (dir === 'next') {
      if (lessonIdx < mod.lessons.length - 1) {
        setActiveLesson(mod.lessons[lessonIdx + 1].id);
      } else {
        // Move to next module
        const modIdx = MODULES.findIndex(m => m.id === activeModule);
        if (modIdx < MODULES.length - 1) {
          const nextMod = MODULES[modIdx + 1];
          setActiveModule(nextMod.id);
          setActiveLesson(nextMod.lessons[0].id);
        }
      }
    } else {
      if (lessonIdx > 0) {
        setActiveLesson(mod.lessons[lessonIdx - 1].id);
      } else {
        const modIdx = MODULES.findIndex(m => m.id === activeModule);
        if (modIdx > 0) {
          const prevMod = MODULES[modIdx - 1];
          setActiveModule(prevMod.id);
          setActiveLesson(prevMod.lessons[prevMod.lessons.length - 1].id);
        }
      }
    }
  };

  const handleComplete = (moduleId: string, lessonId: string, score?: number) => {
    updateProgress(moduleId, lessonId, score);
    setCompletionBurst(lessonKey(moduleId, lessonId));
    setTimeout(() => setCompletionBurst(null), 2000);
  };

  const currentMod = MODULES.find(m => m.id === activeModule);
  const currentLesson = currentMod?.lessons.find(l => l.id === activeLesson);

  // ── Overview (no lesson selected) ────────────────────────────────────────────
  if (!activeModule || !currentMod || !currentLesson) {
    return (
      <div>
        {/* Academy header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg) 100%)',
          border: '1px solid var(--border)', borderRadius: '12px',
          padding: '28px 32px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <BookOpen size={24} style={{ color: 'var(--accent)' }} />
              <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>GSOC Academy</h1>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
              Complete all 8 modules to achieve Operations Chief clearance
            </p>
          </div>

          {/* Clearance badge */}
          <div style={{
            background: 'var(--bg)', border: `2px solid ${clearance.color}`,
            borderRadius: '12px', padding: '14px 20px', textAlign: 'center', minWidth: '180px',
          }}>
            <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '4px' }}>CLEARANCE LEVEL</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: clearance.color, letterSpacing: '-0.5px' }}>{clearanceIdx}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: clearance.color, letterSpacing: '1px' }}>{clearance.label}</div>
            <div style={{ marginTop: '10px', height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: clearance.color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{done}/{total} lessons</div>
          </div>
        </div>

        {/* Module grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {MODULES.map((mod, modIdx) => {
            const isComplete = moduleCompleted(mod, progress);
            const started = moduleStarted(mod, progress);
            const completedLessons = mod.lessons.filter(l => progress.completed?.[lessonKey(mod.id, l.id)]).length;
            const locked = false; // All modules accessible

            return (
              <div
                key={mod.id}
                onClick={() => { setActiveModule(mod.id); setActiveLesson(null); }}
                style={{
                  background: isComplete ? `${mod.color}0d` : 'var(--bg-secondary)',
                  border: `1px solid ${isComplete ? mod.color + '40' : 'var(--border)'}`,
                  borderRadius: '10px', padding: '18px 20px', cursor: 'pointer',
                  transition: 'all 150ms', position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = mod.color; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = isComplete ? mod.color + '40' : 'var(--border)'; }}
              >
                {/* Color stripe */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: mod.color, borderRadius: '10px 0 0 10px' }} />

                <div style={{ paddingLeft: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: mod.color, letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
                        MODULE {mod.number.toString().padStart(2, '0')}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{mod.title}</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>{mod.subtitle}</p>
                    </div>
                    {isComplete
                      ? <Award size={20} style={{ color: mod.color, flexShrink: 0 }} />
                      : locked
                      ? <Lock size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                      : started
                      ? <Zap size={16} style={{ color: mod.color, flexShrink: 0 }} />
                      : <ChevronRight size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />}
                  </div>

                  {/* Lesson dots */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                      {mod.lessons.map(l => (
                        <div key={l.id} style={{
                          flex: 1, height: '4px', borderRadius: '2px',
                          background: progress.completed?.[lessonKey(mod.id, l.id)] ? mod.color : 'var(--border)',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', flexShrink: 0 }}>
                      {completedLessons}/{mod.lessons.length}
                    </span>
                  </div>

                  {/* Status */}
                  <div style={{ marginTop: '10px' }}>
                    {isComplete && (
                      <span style={{ fontSize: '11px', color: mod.color, fontWeight: 700, letterSpacing: '0.5px' }}>✓ COMPLETE</span>
                    )}
                    {started && !isComplete && (
                      <span style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 700, letterSpacing: '0.5px' }}>● IN PROGRESS</span>
                    )}
                    {!started && !isComplete && (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>○ NOT STARTED</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reset + completion */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {pct === 100 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px',
              background: 'rgba(72,187,120,0.1)', border: '1px solid var(--success)', borderRadius: '8px',
              color: 'var(--success)', fontSize: '14px', fontWeight: 600,
            }}>
              <Star size={18} /> All modules complete — Operations Chief clearance achieved
            </div>
          )}
          <div style={{ marginLeft: 'auto' }}>
            {!showReset
              ? <button className="btn btn-secondary btn-sm" onClick={() => setShowReset(true)}><RotateCcw size={13} /> Reset Progress</button>
              : (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--danger)' }}>Reset all progress?</span>
                  <button className="btn btn-danger btn-sm" onClick={() => {
                    const empty: Progress = { completed: {}, quizScores: {} };
                    saveProgress(empty);
                    setProgress(empty);
                    setShowReset(false);
                  }}>Confirm</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowReset(false)}>Cancel</button>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }

  // ── Lesson view ──────────────────────────────────────────────────────────────
  const lessonIdx = currentMod.lessons.findIndex(l => l.id === activeLesson);
  const isCompleted = Boolean(progress.completed?.[lessonKey(currentMod.id, currentLesson.id)]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '16px' }}>

      {/* Left: module + lesson sidebar */}
      <div style={{
        width: '240px', flexShrink: 0, background: 'var(--bg-secondary)',
        border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <button
          onClick={() => { setActiveModule(null); setActiveLesson(null); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px',
            background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            textAlign: 'left', width: '100%',
          }}
        >
          ← All Modules
        </button>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {MODULES.map(mod => {
            const isActive = mod.id === activeModule;
            const mComplete = moduleCompleted(mod, progress);
            return (
              <div key={mod.id}>
                <button
                  onClick={() => { setActiveModule(mod.id); setActiveLesson(mod.lessons[0].id); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 14px',
                    background: isActive ? `${mod.color}15` : 'none',
                    border: 'none', borderLeft: isActive ? `3px solid ${mod.color}` : '3px solid transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, color: isActive ? mod.color : 'var(--text-secondary)', minWidth: '20px' }}>
                    {mod.number.toString().padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '12.5px', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--text)' : 'var(--text-secondary)', flex: 1 }}>
                    {mod.title}
                  </span>
                  {mComplete && <CheckCircle size={12} style={{ color: mod.color, flexShrink: 0 }} />}
                </button>
                {isActive && mod.lessons.map((lesson, li) => {
                  const lComplete = Boolean(progress.completed?.[lessonKey(mod.id, lesson.id)]);
                  const lActive = lesson.id === activeLesson;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson.id)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '7px 14px 7px 38px',
                        background: lActive ? `${mod.color}10` : 'none',
                        border: 'none', cursor: 'pointer', fontSize: '12px',
                        color: lActive ? 'var(--text)' : 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}
                    >
                      <span style={{
                        width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                        background: lComplete ? mod.color : 'var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#fff',
                      }}>
                        {lComplete ? '✓' : li + 1}
                      </span>
                      {lesson.title}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Overall progress footer */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
            <span>{CLEARANCE_LEVELS[clearanceIdx].label}</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>

      {/* Right: lesson content */}
      <div style={{
        flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}>
        {/* Completion burst */}
        {completionBurst === lessonKey(currentMod.id, currentLesson.id) && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', zIndex: 10, borderRadius: '10px', pointerEvents: 'none',
          }}>
            <div style={{
              background: 'var(--bg-secondary)', border: `2px solid ${currentMod.color}`,
              borderRadius: '14px', padding: '28px 36px', textAlign: 'center', maxWidth: '280px',
            }}>
              <Award size={40} style={{ color: currentMod.color, marginBottom: '10px' }} />
              <div style={{ fontWeight: 800, fontSize: '18px', marginBottom: '4px' }}>Lesson Complete</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{currentLesson.title}</div>
            </div>
          </div>
        )}

        <LessonView
          module={currentMod}
          lesson={currentLesson}
          lessonIndex={lessonIdx}
          totalInModule={currentMod.lessons.length}
          isCompleted={isCompleted}
          onComplete={score => handleComplete(currentMod.id, currentLesson.id, score)}
          onNav={handleNav}
        />
      </div>
    </div>
  );
}
