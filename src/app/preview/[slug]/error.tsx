"use client";

type PreviewErrorProps = {
  error: Error;
  reset: () => void;
};

export default function PreviewError({ error, reset }: PreviewErrorProps) {
  return (
    <main className="page-shell">
      <section className="section">
        <div className="section-inner">
          <p className="eyebrow">Preview error</p>
          <h1>We could not render this page.</h1>
          <p>{error.message}</p>
          <button className="button-link" type="button" onClick={reset}>
            Try again
          </button>
        </div>
      </section>
    </main>
  );
}
