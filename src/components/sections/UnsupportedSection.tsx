import type { Section } from "@/types/page";

type UnsupportedSectionProps = {
  section: Section;
};

export function UnsupportedSection({ section }: UnsupportedSectionProps) {
  return (
    <section className="section unsupported-section" role="status">
      <div className="section-inner">
        <h2>Unsupported section</h2>
        <p>The section type &quot;{section.type}&quot; is not registered yet.</p>
      </div>
    </section>
  );
}
