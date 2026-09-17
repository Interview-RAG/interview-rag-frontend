import { useEffect } from 'react';

function Example({ label = 'Try:', children }) {
  return (
    <div
      style={{
        background: 'var(--color-bg)', borderRadius: 16, padding: '14px 18px',
        fontSize: 14, boxShadow: 'var(--shadow-sm)',
      }}
    >
      <span className="text-muted">{label}</span> {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h3 style={{ fontSize: 24, letterSpacing: '-.02em', margin: '0 0 10px' }}>{title}</h3>
      {children}
    </section>
  );
}

export default function Docs() {
  useEffect(() => {
    document.title = 'Documentation — PrepAI';
  }, []);

  return (
    <div className="screen" style={{ maxWidth: 760 }}>
      <p className="text-muted" style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
        Documentation
      </p>
      <h1 style={{ fontSize: 'clamp(36px,4vw,52px)', lineHeight: 1, letterSpacing: '-.035em', margin: '0 0 20px' }}>
        How PrepAI fits together.
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.55, margin: '0 0 44px', opacity: 0.85 }}>
        One collection, one coach, three ways to practise. Everything the agent says is grounded
        in what you saved and what your resume says.
      </p>

      <article style={{ fontSize: 16, lineHeight: 1.65, display: 'flex', flexDirection: 'column', gap: 36 }}>
        <Section title="The coach">
          <p style={{ margin: '0 0 10px' }}>
            In <b>Coach</b> mode it answers, critiques and drafts. In <b>Mock interview</b> mode it
            asks one question at a time and waits. In <b>Pressure test</b> mode it picks a project
            from your resume and digs into architecture and edge cases.
          </p>
          <p style={{ margin: '0 0 14px' }}>
            If a question isn&apos;t covered by your collection it searches the web. Facts you tell
            it about yourself are kept in long-term memory.
          </p>
          <Example>
            &ldquo;Act as a Senior Engineering Manager and ask me a behavioral question about
            handling team conflicts.&rdquo;
          </Example>
        </Section>

        <Section title="Practice modes">
          <p style={{ margin: 0 }}>
            <b>Flip &amp; self-rate</b> shows the question, reveals your saved answer, and asks for
            Again, Good or Easy. The rating sets the next review date. <b>Type &amp; grade</b> hides
            the answer; you write yours and the coach grades it against what you saved.
          </p>
        </Section>

        <Section title="Drafting and saving">
          <p style={{ margin: '0 0 14px' }}>
            Refine an answer in chat, then tell the coach to save it. It drafts the pair, suggests
            tags, and asks for approval before anything is written.
          </p>
          <Example label="Step 1:">
            &ldquo;Help me draft a STAR answer for when I migrated our database to Postgres.&rdquo;
            <br />
            <span className="text-muted">Step 2:</span> &ldquo;Save that as &lsquo;Database
            Migration&rsquo;.&rdquo;
          </Example>
        </Section>

        <Section title="Resume Hub and the gap report">
          <p style={{ margin: 0 }}>
            Upload a PDF and the coach extracts skills, experience and projects. You get a general
            ATS score and a targeted match once you paste a job description. Progress compares each
            skill you list with the answers you actually have ready.
          </p>
        </Section>

        <Section title="Exporting">
          <p style={{ margin: 0 }}>
            <b>Export study guide</b> produces a PDF of your whole collection, grouped by tag.
          </p>
        </Section>
      </article>
    </div>
  );
}
