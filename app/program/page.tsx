import type { Metadata } from "next";
import WorkoutViewer from "@/components/workout-viewer";

export const metadata: Metadata = {
  title: "Your Program — Dungym",
  description:
    "Your 3-day kettlebell strength program. Track sets, tempo, and progress.",
};

export default function ProgramPage() {
  return <WorkoutViewer />;
}
