import type { TestimonialSection } from "@/types/page";

type TestimonialProps = {
  section: TestimonialSection;
};

export function Testimonial({ section }: TestimonialProps) {
  return (
    <section
      className="section testimonial-section"
      aria-labelledby={`${section.id}-title`}
    >
      <div className="section-inner">
        <h2 id={`${section.id}-title`}>Customer story</h2>
        <figure>
          <blockquote>{section.props.quote}</blockquote>
          <figcaption>{section.props.author}</figcaption>
        </figure>
      </div>
    </section>
  );
}
