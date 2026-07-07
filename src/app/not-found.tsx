import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <section className="section">
        <div className="section-inner">
          <p className="eyebrow">404</p>
          <h1>Page not found</h1>
          <Link className="button-link" href="/preview/home">
            Open homepage preview
          </Link>
        </div>
      </section>
    </main>
  );
}
