import Link from "next/link";
import { Search, Zap, Sparkles } from "lucide-react";
import { ConsumerShell } from "@/components/consumer-shell";
import { FoodCard } from "@/components/cards";
import { cheapFoods, listCategories, listOutlets } from "@/lib/data/live";
import { slugify } from "@/lib/slug";

export const metadata = { title: "CRAVE — What's the campus craving?" };
export const revalidate = 60;

function Rail({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="mt-10" aria-label={title}>
      <div className="flex items-end justify-between px-4 md:px-0">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-ink-2 text-sm">{sub}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-4 overflow-x-auto no-scrollbar px-4 md:px-0 pb-2 snap-x">{children}</div>
    </section>
  );
}

export default async function Home() {
  const [outlets, categories, cheap] = await Promise.all([listOutlets(), listCategories(), cheapFoods(12)]);
  const openCount = outlets.filter((o) => o.isOpen).length;
  return (
    <ConsumerShell>
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-10 md:pt-20 md:pb-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-ink text-white text-xs font-bold">
              <Sparkles size={13} /> SRM · Main Campus · {openCount} outlets open now
            </p>
            <h1 className="font-display font-bold tracking-tight text-5xl md:text-6xl mt-4 leading-[1.02]">
              What&apos;s the campus <span className="text-accent-deep">craving?</span>
            </h1>
            <p className="text-lg text-ink-2 mt-3">Find it. Grab it. Get back to life.</p>
            <form action="/search" role="search" className="mt-6 flex gap-2">
              <label htmlFor="q" className="sr-only">Search cravings</label>
              <input id="q" name="q" placeholder="Biryani, cold coffee, momos…" autoComplete="off"
                className="flex-1 h-12 px-4 rounded-m border border-line bg-surface text-ink placeholder:text-ink-3 min-w-0" />
              <button className="h-12 px-5 rounded-m bg-accent text-accent-ink font-bold inline-flex items-center gap-2 hover:bg-accent-deep min-h-11">
                <Search size={17} /> <span className="hidden sm:inline">Search</span>
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Categories">
              {categories.slice(0, 8).map((c) => (
                <Link key={c.id} href={`/categories/${slugify(c.name)}`}
                  className="px-3 py-2 rounded-pill border border-line bg-surface text-sm font-bold hover:border-ink">{c.name}</Link>
              ))}
              <Link href="/search" className="px-3 py-2 rounded-pill bg-ink text-white text-sm font-bold">All {categories.length} →</Link>
            </div>
          </div>
          <div className="relative hidden md:block" aria-hidden>
            {outlets[0]?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={outlets[0].imageUrl!} alt="" className="rounded-l aspect-[4/3] object-cover w-full shadow-far" />
            ) : (
              <div className="rounded-l aspect-[4/3] w-full shadow-far bg-surface-2 grid place-items-center">
                <span className="font-display font-bold text-6xl text-ink-3">{outlets[0]?.name.charAt(0) ?? "C"}</span>
              </div>
            )}
            <div className="absolute -bottom-4 -left-4 bg-ink text-white rounded-l px-4 py-3 shadow-far">
              <p className="text-xs opacity-70">Peak hunger hours</p>
              <p className="font-display font-bold">12:30 – 1:45 PM · Beat the queue</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl md:px-4 pb-16">
        <Rail title="Under ₹100" sub="Your emergency meal, always within budget.">
          {cheap.map((f) => <div key={f.id} className="min-w-64 w-64 snap-start"><FoodCard food={f} /></div>)}
        </Rail>

        <section className="mt-10 px-4 md:px-0" aria-label="Outlets">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Outlets on campus</h2>
          <p className="text-ink-2 text-sm">Know what&apos;s open before you walk.</p>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {outlets.map((o) => (
              <Link key={o.id} href={`/outlets/${slugify(o.name)}`} className="bg-surface border border-line rounded-l overflow-hidden hover:shadow-far transition-shadow">
                {o.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.imageUrl} alt="" loading="lazy" className="w-full aspect-[16/9] object-cover" />
                ) : (
                  <div className="w-full aspect-[16/9] bg-surface-2 grid place-items-center" aria-hidden>
                    <span className="font-display font-bold text-5xl text-ink-3">{o.name.charAt(0)}</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold">{o.name}</h3>
                    <span className={`ml-auto shrink-0 text-[11px] font-bold px-2 py-1 rounded-pill ${o.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {o.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                  <p className="text-xs text-ink-2 mt-0.5">
                    {[o.location, o.hours ? `${o.hours.openTime}–${o.hours.closeTime}` : null].filter(Boolean).join(" · ") || "SRM KTR campus"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 px-4 md:px-0" aria-label="Categories">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Browse by craving</h2>
          <p className="text-ink-2 text-sm">{categories.length} live categories from the campus catalogue.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link key={c.id} href={`/categories/${slugify(c.name)}`}
                className="px-4 py-2.5 rounded-pill border border-line bg-surface text-sm font-bold hover:border-ink min-h-11 inline-flex items-center">{c.name}</Link>
            ))}
          </div>
        </section>

        <section className="mt-10 mx-4 md:mx-0 rounded-l bg-ink text-white p-6 md:p-8 flex flex-wrap items-center gap-4" aria-label="Offers">
          <Zap className="text-citrus" />
          <div>
            <h2 className="font-display text-xl font-bold">Pay at counter or online</h2>
            <p className="text-white/70 text-sm">Razorpay + pay-at-counter. Verified server-side, always.</p>
          </div>
          <Link href="/offers" className="ml-auto px-4 py-2.5 rounded-m bg-accent text-accent-ink font-bold min-h-11 inline-flex items-center">See offers</Link>
        </section>
      </div>
    </ConsumerShell>
  );
}
