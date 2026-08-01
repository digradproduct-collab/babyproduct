"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  return (
    <form
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const email = new FormData(form).get("email");
        setStatus("loading");
        try {
          const res = await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (!res.ok) throw new Error();
          setStatus("done");
          form.reset();
        } catch {
          setStatus("error");
        }
      }}
    >
      <input
        type="email"
        name="email"
        required
        placeholder="votre@email.fr"
        className="flex-1 rounded-full border border-cream-500 bg-white px-4 py-2.5 text-sm outline-none focus:border-terracotta-500"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-terracotta-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-terracotta-700 disabled:opacity-60"
      >
        {status === "loading" ? "Envoi..." : "Je m'inscris"}
      </button>
      {status === "done" && (
        <p className="text-sm text-sage-700 sm:absolute sm:mt-10">Merci, à très vite ! 💌</p>
      )}
      {status === "error" && (
        <p className="text-sm text-berry-600">Une erreur est survenue, réessayez.</p>
      )}
    </form>
  );
}
