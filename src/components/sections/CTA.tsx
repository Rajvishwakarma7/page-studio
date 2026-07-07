import type { CtaSection } from "@/types/page";

type CTAProps = {
  section: CtaSection;
};

export function CTA({ section }: CTAProps) {
  return (
    <section className="section cta-section" aria-labelledby={`${section.id}-title`}>
      <div className="section-inner cta-inner">
        <h2 id={`${section.id}-title`}>{section.props.heading}</h2>
        <a className="button-link" href={section.props.buttonUrl}>
          {section.props.buttonLabel}
        </a>
      </div>
    </section>
  );
}
