import Link from "next/link";

export default function GetStartedPage() {
  return (
    <main className="page-shell">
      <section className="section">
        <div className="section-inner">
          <p className="eyebrow">Get started</p>
          <h1>Choose where to continue</h1>
          <p>
            Open the published preview or continue into Studio if your role has
            editor access.
          </p>
          <div className="action-row">
            <Link className="button-link" href="/studio/home">
              Open studio
            </Link>
            <Link className="button-link secondary-link" href="/preview/home">
              View preview
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
