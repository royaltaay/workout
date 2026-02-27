"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

function FaqRow({ question, answer }: FaqItem) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <h3 className="text-base font-semibold text-zinc-300">{question}</h3>
        <span
          className="flex-shrink-0 text-sm text-red-500/70 transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          &#43;
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-sm leading-relaxed text-zinc-500">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="border-t border-white/5">
      {items.map((item) => (
        <FaqRow key={item.question} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
}
