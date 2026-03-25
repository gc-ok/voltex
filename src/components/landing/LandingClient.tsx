'use client';

import React from 'react';
import Link from 'next/link';
import { CourtDemo } from './CourtDemo';
import { PLAYS } from '@/data/plays';

// Pick showcase plays
const heroPlay = PLAYS.find(p => p.id === 'off_x') || PLAYS[0];
const demoPlays = [
  PLAYS.find(p => p.id === '51sr1'),
  PLAYS.find(p => p.id === 'off_slide'),
  PLAYS.find(p => p.id === 'def_peri_oh'),
].filter(Boolean) as typeof PLAYS;

const FEATURES = [
  {
    title: 'Animated Plays',
    desc: '27+ volleyball plays with smooth frame-by-frame animation. Watch serve receives, offensive sets, and defensive formations come to life.',
    icon: '▶',
  },
  {
    title: 'Rotation Validator',
    desc: 'Real-time overlap and positional fault detection. Never get called for a rotation violation again.',
    icon: '✓',
  },
  {
    title: 'Custom Formations',
    desc: 'Drag-and-drop players to build custom base positions for every rotation in your system (5-1, 6-2, or 4-2).',
    icon: '⚙',
  },
  {
    title: 'Coverage Strategies',
    desc: 'Configure perimeter, rotational, or man-up defense. Set blocker counts and attack-direction-specific coverage.',
    icon: '⛨',
  },
  {
    title: 'Rally Builder',
    desc: 'Chain multiple plays into full rally sequences. See your entire offensive and defensive flow animated end-to-end.',
    icon: '⟳',
  },
  {
    title: 'Quiz Mode',
    desc: 'Test your players\' volleyball IQ. Interactive quiz with animated scenarios and instant feedback.',
    icon: '?',
  },
];

const QUIZ_SAMPLE = {
  question: 'In a 5-1 system, Rotation 1: where should the setter release to after the serve?',
  options: ['Zone 4 (front left)', 'Zone 2/3 target (front right at net)', 'Zone 6 (back center)', 'Zone 5 (back left)'],
  answer: 1,
};

export function LandingClient() {
  const [quizSelected, setQuizSelected] = React.useState<number | null>(null);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {/* ── Navigation Bar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px',
        background: '#080f1eee',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)', letterSpacing: 2 }}>
          GC Volley
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <a href="#features" style={{ color: 'var(--text-mid)', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Features</a>
          <a href="#demo" style={{ color: 'var(--text-mid)', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Demo</a>
          <a href="#quiz" style={{ color: 'var(--text-mid)', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Quiz</a>
          <Link href="/app" style={{
            background: 'var(--accent)', color: '#000', padding: '8px 18px',
            borderRadius: 8, fontSize: 14, fontWeight: 900, textDecoration: 'none',
            letterSpacing: 0.5,
          }}>
            Launch App
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 48, padding: '80px 32px 60px',
        maxWidth: 1100, margin: '0 auto',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: '1 1 400px', minWidth: 300 }}>
          <h1 style={{
            fontSize: 48, fontWeight: 900, lineHeight: 1.1,
            color: 'var(--text)', marginBottom: 16, letterSpacing: -0.5,
          }}>
            The Visual<br />
            <span style={{ color: 'var(--accent)' }}>Volleyball Playbook</span>
          </h1>
          <p style={{
            fontSize: 18, color: 'var(--text-mid)', lineHeight: 1.6,
            marginBottom: 28, maxWidth: 480,
          }}>
            Animated plays, custom formations, rotation validation, and interactive quizzes.
            Everything your coaching staff needs — in one tool.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/app" style={{
              display: 'inline-block', background: 'var(--accent)', color: '#000',
              padding: '14px 32px', borderRadius: 10, fontSize: 17, fontWeight: 900,
              textDecoration: 'none', letterSpacing: 0.5,
            }}>
              Open Playbook
            </Link>
            <a href="#demo" style={{
              display: 'inline-block', background: 'none',
              border: '2px solid var(--border)', color: 'var(--text-mid)',
              padding: '12px 28px', borderRadius: 10, fontSize: 16, fontWeight: 700,
              textDecoration: 'none',
            }}>
              See it in action
            </a>
          </div>

          {/* Trust signals */}
          <div style={{ display: 'flex', gap: 24, marginTop: 36, flexWrap: 'wrap' }}>
            {['27+ Animated Plays', '3 Offense Systems', '3 Defense Types', 'Interactive Quiz'].map(t => (
              <div key={t} style={{
                fontSize: 12, fontWeight: 700, color: 'var(--text-dim)',
                padding: '4px 10px', background: 'var(--bg-card)',
                borderRadius: 6, border: '1px solid var(--border)',
              }}>
                {t}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: '1 1 340px', maxWidth: 380, minWidth: 280 }}>
          <CourtDemo play={heroPlay} autoPlay speed={0.3} />
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" style={{
        padding: '60px 32px',
        maxWidth: 1100, margin: '0 auto',
      }}>
        <h2 style={{
          fontSize: 36, fontWeight: 900, color: 'var(--text)',
          textAlign: 'center', marginBottom: 8,
        }}>
          Built for <span style={{ color: 'var(--accent)' }}>Real Coaches</span>
        </h2>
        <p style={{
          fontSize: 16, color: 'var(--text-dim)', textAlign: 'center',
          marginBottom: 40, maxWidth: 520, margin: '0 auto 40px',
        }}>
          Every feature designed around actual coaching workflows — not generic sports diagrams.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {FEATURES.map(f => (
            <article key={f.title} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '20px 18px',
              transition: 'border-color .2s',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: '#e8a83e15', border: '1px solid #e8a83e30',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: 'var(--accent)', marginBottom: 12,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--text)', marginBottom: 6 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Live Demo Section ── */}
      <section id="demo" style={{
        padding: '60px 32px',
        background: 'var(--bg-panel)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 36, fontWeight: 900, color: 'var(--text)',
            textAlign: 'center', marginBottom: 8,
          }}>
            See Plays <span style={{ color: 'var(--accent)' }}>Come Alive</span>
          </h2>
          <p style={{
            fontSize: 16, color: 'var(--text-dim)', textAlign: 'center',
            marginBottom: 40, maxWidth: 480, margin: '0 auto 40px',
          }}>
            Every play is animated phase-by-phase. Click any court to pause and inspect formations.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
            maxWidth: 900,
            margin: '0 auto',
          }}>
            {demoPlays.map(play => (
              <CourtDemo key={play.id} play={play} autoPlay speed={0.25} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Systems Section ── */}
      <section style={{
        padding: '60px 32px',
        maxWidth: 1100, margin: '0 auto',
      }}>
        <h2 style={{
          fontSize: 36, fontWeight: 900, color: 'var(--text)',
          textAlign: 'center', marginBottom: 40,
        }}>
          Every <span style={{ color: 'var(--accent)' }}>System</span> Supported
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}>
          {[
            { name: '5-1', desc: 'One setter, five hitters. The gold standard at competitive levels.', rotations: '6 rotations, all serve receive formations' },
            { name: '6-2', desc: 'Two setters from back row. Three front-row attackers every rotation.', rotations: 'Front-row firepower with back-row setting' },
            { name: '4-2', desc: 'Two setters from front row. Simple and reliable for developing teams.', rotations: 'Perfect for younger or recreational programs' },
          ].map(sys => (
            <div key={sys.name} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '20px 18px',
            }}>
              <div style={{
                fontSize: 32, fontWeight: 900, color: 'var(--accent)',
                marginBottom: 8,
              }}>
                {sys.name}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, marginBottom: 8 }}>
                {sys.desc}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                {sys.rotations}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Defense Types Section ── */}
      <section style={{
        padding: '60px 32px',
        background: 'var(--bg-panel)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 36, fontWeight: 900, color: 'var(--text)',
            textAlign: 'center', marginBottom: 8,
          }}>
            Defense <span style={{ color: 'var(--accent)' }}>Templates</span>
          </h2>
          <p style={{
            fontSize: 16, color: 'var(--text-dim)', textAlign: 'center',
            maxWidth: 520, margin: '0 auto 32px',
          }}>
            Choose your defensive philosophy during setup. Positions auto-populate across all rotations.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}>
            {[
              { name: 'Perimeter', desc: 'Back row holds sidelines. Libero deep center. The standard — safe and reliable.' },
              { name: 'Rotational', desc: 'Zone 6 rotates toward the line. Better line coverage, requires more practice.' },
              { name: 'Man-Up (Rover)', desc: 'Libero pushes forward for tips and rolls. High risk, high reward against tipping teams.' },
            ].map(def => (
              <div key={def.name} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '18px 16px',
              }}>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--accent)', marginBottom: 6 }}>
                  {def.name}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                  {def.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quiz Preview ── */}
      <section id="quiz" style={{
        padding: '60px 32px',
        maxWidth: 700, margin: '0 auto',
      }}>
        <h2 style={{
          fontSize: 36, fontWeight: 900, color: 'var(--text)',
          textAlign: 'center', marginBottom: 8,
        }}>
          Test Your Team's <span style={{ color: 'var(--accent)' }}>Volleyball IQ</span>
        </h2>
        <p style={{
          fontSize: 16, color: 'var(--text-dim)', textAlign: 'center',
          marginBottom: 32,
        }}>
          Interactive quiz mode with animated play scenarios. Try a sample question:
        </p>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '24px 20px',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 16, lineHeight: 1.5 }}>
            {QUIZ_SAMPLE.question}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {QUIZ_SAMPLE.options.map((opt, i) => {
              const isCorrect = i === QUIZ_SAMPLE.answer;
              const isSelected = quizSelected === i;
              const showResult = quizSelected !== null;
              return (
                <button
                  key={i}
                  onClick={() => setQuizSelected(i)}
                  disabled={showResult}
                  style={{
                    textAlign: 'left',
                    background: showResult
                      ? (isCorrect ? '#10b98115' : isSelected ? '#ef444415' : 'transparent')
                      : isSelected ? '#e8a83e10' : 'transparent',
                    border: `2px solid ${
                      showResult
                        ? (isCorrect ? '#10b981' : isSelected ? '#ef4444' : 'var(--border)')
                        : isSelected ? 'var(--accent)' : 'var(--border)'
                    }`,
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 14, fontWeight: 700,
                    color: showResult
                      ? (isCorrect ? '#10b981' : isSelected ? '#ef4444' : 'var(--text-dim)')
                      : 'var(--text)',
                    cursor: showResult ? 'default' : 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  {opt}
                  {showResult && isCorrect && ' ✓'}
                </button>
              );
            })}
          </div>
          {quizSelected !== null && (
            <div style={{
              marginTop: 12, padding: '10px 12px',
              background: quizSelected === QUIZ_SAMPLE.answer ? '#10b98110' : '#ef444410',
              border: `1px solid ${quizSelected === QUIZ_SAMPLE.answer ? '#10b98150' : '#ef444450'}`,
              borderRadius: 8,
              fontSize: 13, lineHeight: 1.5,
              color: quizSelected === QUIZ_SAMPLE.answer ? '#10b981' : '#ef4444',
            }}>
              {quizSelected === QUIZ_SAMPLE.answer
                ? 'Correct! The setter releases to the zone 2/3 target at the net — the standard setting position in a 5-1.'
                : 'Not quite. The setter needs to get to the zone 2/3 target at the net (front right) to run the offense.'
              }
            </div>
          )}
          {quizSelected !== null && (
            <button
              onClick={() => setQuizSelected(null)}
              style={{
                marginTop: 10, background: 'none', border: '1px solid var(--border)',
                color: 'var(--text-dim)', borderRadius: 7, padding: '6px 14px',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Try again
            </button>
          )}
        </div>
      </section>

      {/* ── CTA Footer ── */}
      <section style={{
        padding: '80px 32px',
        textAlign: 'center',
        background: 'var(--bg-panel)',
        borderTop: '1px solid var(--border)',
      }}>
        <h2 style={{ fontSize: 40, fontWeight: 900, color: 'var(--text)', marginBottom: 12 }}>
          Ready to Build Your <span style={{ color: 'var(--accent)' }}>Playbook</span>?
        </h2>
        <p style={{
          fontSize: 17, color: 'var(--text-dim)', marginBottom: 32,
          maxWidth: 480, margin: '0 auto 32px',
        }}>
          Set up your team, customize formations, and start animating plays in minutes.
        </p>
        <Link href="/app" style={{
          display: 'inline-block', background: 'var(--accent)', color: '#000',
          padding: '16px 40px', borderRadius: 12, fontSize: 19, fontWeight: 900,
          textDecoration: 'none', letterSpacing: 0.5,
        }}>
          Launch GC Volley
        </Link>
        <div style={{ marginTop: 20, fontSize: 13, color: 'var(--text-dim)' }}>
          Free to use. No account required.
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '24px 32px',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: 1100, margin: '0 auto',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--accent)', letterSpacing: 1 }}>
          GC Volley
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          Visual volleyball coaching platform
        </div>
      </footer>
    </main>
  );
}
