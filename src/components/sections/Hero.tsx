import type { HeroSection } from "@/types/page";

type HeroProps = {
  section: HeroSection;
};

export function Hero({ section }: HeroProps) {
  const { heading, subHeading, buttonText, buttonUrl } = section.props;

  return (
    <section className="section hero-section" aria-labelledby={`${section.id}-title`}>
      <div className="section-inner hero-inner">
        <p className="eyebrow">Landing page</p>
        <h1 id={`${section.id}-title`}>{heading}</h1>
        {subHeading ? <p className="hero-copy">{subHeading}</p> : null}
        {buttonText ? (
          <a className="button-link" href={buttonUrl}>
            {buttonText}
          </a>
        ) : null}
      </div>
    </section>
  );
}
