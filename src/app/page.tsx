import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="section">
        <div className="section-inner">
          <p className="eyebrow">Page Studio</p>
          <h1>Contentful preview is ready to wire.</h1>
          <p>
            Start with the published homepage at{" "}
            <Link href="/preview/home">/preview/home</Link>.
          </p>
          <p>
            Sign in first at <Link href="/login">/login</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
