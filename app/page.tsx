import type { Metadata } from "next";
import LandingPage from "@/components/landing-page";
import AuthRedirect from "@/components/auth-redirect";
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
    <AuthRedirect>
      <LandingPage
        headline={homePageContent.headline}
        subheadline={homePageContent.subheadline}
        heroDescription={homePageContent.heroDescription}
        features={homePageContent.features}
        faq={homePageContent.faq}
      />
    </AuthRedirect>
  );
}
