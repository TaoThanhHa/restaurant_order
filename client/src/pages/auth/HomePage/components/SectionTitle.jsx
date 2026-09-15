export default function SectionTitle({
  eyebrow,
  title,
  description,
  light = false,
}) {
  return (
    <div className={`section-title ${light ? "section-title--light" : ""}`}>
      <span className="section-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}