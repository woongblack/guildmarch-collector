import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PolicyPage, policyTitle } from "@/components/PolicyPage";
import { isLang } from "@/lib/i18n";
import { policy } from "@/lib/policies";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? pageMeta(lang, "/privacy/", policyTitle(lang, "privacy"), policy(lang, "privacy").description) : {};
}

export default async function Privacy({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <PolicyPage lang={lang} slug="privacy" />;
}
