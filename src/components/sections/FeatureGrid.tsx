import type { FeatureGridSection } from "@/types/page";

type FeatureGridProps = {
  section: FeatureGridSection;
};

function getItemTitle(
  item: FeatureGridSection["props"]["items"][number],
) {
  return typeof item === "string" ? item : item.title;
}

function getItemDescription(
  item: FeatureGridSection["props"]["items"][number],
) {
  return typeof item === "string" ? "" : item.description;
}

export function FeatureGrid({ section }: FeatureGridProps) {
  return (
    <section className="section feature-section" aria-labelledby={`${section.id}-title`}>
      <div className="section-inner">
        <h2 id={`${section.id}-title`}>{section.props.title}</h2>
        <div className="feature-grid">
          {section.props.items.map((item, index) => (
            <article className="feature-card" key={`${getItemTitle(item)}-${index}`}>
              <h3>{getItemTitle(item)}</h3>
              {getItemDescription(item) ? <p>{getItemDescription(item)}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
