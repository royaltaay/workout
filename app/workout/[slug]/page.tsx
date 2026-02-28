import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPage from "@/components/landing-page";
import { getLandingPage, getAllSlugs } from "@/lib/landing-pages";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) return {};

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: {
      canonical: `/workout/${page.slug}`,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `/workout/${page.slug}`,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: page.metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: page.metaTitle,
        },
      ],
    },
  };
}

export default async function WorkoutLandingPage({ params }: Props) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) notFound();

  return (
    <LandingPage
      headline={page.headline}
      subheadline={page.subheadline}
      heroDescription={page.heroDescription}
      features={page.features}
      faq={page.faq}
      slug={page.slug}
      breadcrumbTitle={page.title.split("|")[0].trim()}
    />
  );
}
