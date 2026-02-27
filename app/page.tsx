import type { Metadata } from "next";
import LandingPage from "@/components/landing-page";
import { homePageContent } from "@/lib/landing-pages";

export const metadata: Metadata = {
  title: homePageContent.metaTitle,
  description: homePageContent.metaDescription,
  keywords: homePageContent.keywords,
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <LandingPage
      headline={homePageContent.headline}
      subheadline={homePageContent.subheadline}
      heroDescription={homePageContent.heroDescription}
      features={homePageContent.features}
      faq={homePageContent.faq}
    />
  );
}
