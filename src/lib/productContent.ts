export type FaqItem = { question: string; answer: string };
export type Testimonial = { author: string; rating: number; quote: string };

export function parseFaqText(text: string): FaqItem[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [question, ...rest] = block.split("\n");
      return { question: question.trim(), answer: rest.join(" ").trim() };
    })
    .filter((item) => item.question && item.answer);
}

export function faqToText(faq: FaqItem[]): string {
  return faq.map((item) => `${item.question}\n${item.answer}`).join("\n\n");
}

export function parseTestimonialsText(text: string): Testimonial[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [author, ratingStr, ...quoteParts] = line.split("|").map((p) => p.trim());
      const rating = Math.min(5, Math.max(1, Number.parseInt(ratingStr, 10) || 5));
      return { author, rating, quote: quoteParts.join("|").trim() };
    })
    .filter((item) => item.author && item.quote);
}

export function testimonialsToText(testimonials: Testimonial[]): string {
  return testimonials.map((t) => `${t.author} | ${t.rating} | ${t.quote}`).join("\n");
}

export function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function isFaqArray(value: unknown): value is FaqItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (v) => v && typeof v === "object" && typeof v.question === "string" && typeof v.answer === "string",
    )
  );
}

export function isTestimonialArray(value: unknown): value is Testimonial[] {
  return (
    Array.isArray(value) &&
    value.every(
      (v) =>
        v &&
        typeof v === "object" &&
        typeof v.author === "string" &&
        typeof v.quote === "string" &&
        typeof v.rating === "number",
    )
  );
}
