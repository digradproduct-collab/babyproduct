import Image from "next/image";

export function StoryBlock({
  image,
  alt,
  headline,
  text,
  reverse,
}: {
  image: string;
  alt: string;
  headline: string;
  text: string;
  reverse?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-1 items-center gap-8 md:grid-cols-2 ${
        reverse ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream-300 shadow-[0_16px_40px_-20px_rgba(54,42,34,0.35)]">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover saturate-[0.85]"
        />
      </div>
      <div>
        <h3 className="font-display text-2xl text-ink">{headline}</h3>
        <p className="mt-3 text-ink-soft">{text}</p>
      </div>
    </div>
  );
}
