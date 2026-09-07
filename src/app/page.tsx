import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/layout/SiteHeader";
import { Badge, Card } from "@/components/ui";
import { createI18n } from "@/lib/i18n/server";

export default function LandingPage() {
  const { t } = createI18n();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at 30% 50%, var(--color-accent-light) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, var(--color-primary-light) 0%, transparent 50%)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <h1
              className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              style={{ color: "var(--color-primary-dark)" }}
            >
              {t("landing.tagline")}
            </h1>
            <p className="mx-auto mb-4 max-w-2xl text-lg sm:text-xl" style={{ color: "var(--color-text-muted)" }}>
              {t("landing.subtitle")}
            </p>
            <p className="mb-8 text-sm font-medium" style={{ color: "var(--color-accent)" }}>
              {t("landing.ethiopiaFirst")}
            </p>
            <Link
              href="/app"
              className="inline-flex rounded-xl px-8 py-3 text-base font-semibold text-white no-underline shadow-[var(--shadow-md)] hover:no-underline hover:opacity-90"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {t("nav.getStarted")}
            </Link>
          </div>
        </section>

        {/* Problem */}
        <section className="border-t border-[var(--color-border)] px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <Card>
              <h2 className="mb-4 text-2xl font-semibold">{t("landing.problem.title")}</h2>
              <p style={{ color: "var(--color-text-muted)" }}>{t("landing.problem.body")}</p>
            </Card>
          </div>
        </section>

        {/* How it works */}
        <section className="px-4 py-16 sm:px-6" style={{ backgroundColor: "var(--color-surface)" }}>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-semibold">{t("landing.how.title")}</h2>
            <p className="mx-auto max-w-2xl text-center" style={{ color: "var(--color-text-muted)" }}>
              {t("landing.how.body")}
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { step: "1", title: "Profile", desc: "Define your household members and dietary needs" },
                { step: "2", title: "Constraints", desc: "Enter budget, pantry items, and local context" },
                { step: "3", title: "Optimize", desc: "Deterministic engine finds best achievable nutrition" },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-[var(--color-border)] p-5 text-center"
                >
                  <div
                    className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    {item.step}
                  </div>
                  <h3 className="mb-2 font-semibold">{item.title}</h3>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experiences */}
        <section className="px-4 py-16 sm:px-6">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            <Card title={t("landing.household.title")}>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {t("landing.household.body")}
              </p>
              <div className="mt-4">
                <Badge variant="success">In development</Badge>
              </div>
            </Card>
            <Card title={t("landing.voice.title")}>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {t("landing.voice.body")}
              </p>
              <div className="mt-4">
                <Badge variant="muted">{t("landing.voice.planned")}</Badge>
              </div>
            </Card>
            <Card title={t("landing.impact.title")}>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {t("landing.impact.body")}
              </p>
              <div className="mt-4">
                <Badge variant="muted">{t("landing.impact.planned")}</Badge>
              </div>
            </Card>
          </div>
        </section>

        {/* Methodology */}
        <section
          className="border-t border-[var(--color-border)] px-4 py-16 sm:px-6"
          style={{ backgroundColor: "var(--color-primary-dark)" }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              {t("landing.methodology.title")}
            </h2>
            <p className="text-white/80">{t("landing.methodology.body")}</p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
