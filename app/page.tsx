import Image from 'next/image';

const brands = [
  {
    name: 'HISEM',
    path: '/hisem',
    desc: 'Professional products, technical solutions, and business services.',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    category: 'Industrial & Business',
  },
  {
    name: 'SOXIBA',
    path: '/soxiba',
    desc: 'Industrial supplies, trading solutions, and business support services.',
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    category: 'Industrial & Business',
  },
  {
    name: 'GNG',
    path: '/gng',
    desc: 'Engineering products, project solutions, and technical trading services.',
    image:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    category: 'Industrial & Business',
  },
  {
    name: 'Yipin Shifu 一品食府',
    path: '/yipinshifu',
    desc: 'Authentic Chinese cuisine for family dining, gatherings, and group meals.',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    category: 'Food & Dining',
  },
  {
    name: 'Shaxian Snacks 沙县小吃',
    path: '/shaxian',
    desc: 'Quick, comforting meals for everyday dining and takeaway.',
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80',
    category: 'Food & Dining',
  },
];

const strengths = [
  {
    title: 'Diversified Portfolio',
    text: 'A balanced portfolio across business and consumer-facing sectors.',
  },
  {
    title: 'Practical Growth',
    text: 'Built on real operations, market responsiveness, and long-term development.',
  },
  {
    title: 'Brand Structure',
    text: 'A clear system that supports multiple businesses under one group identity.',
  },
  {
    title: 'Reliable Service',
    text: 'Focused on consistency, responsiveness, and sustainable relationships.',
  },
];

const divisions = [
  {
    title: 'Industrial & Business',
    text: 'Industrial products, technical solutions, and trading services through our business brands.',
  },
  {
    title: 'Food & Dining',
    text: 'Dining brands designed for everyday meals, family gatherings, takeaway, and group dining.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a href="/" className="text-xl font-semibold tracking-[0.18em] text-white">
            HISEM GROUP
          </a>

          <nav className="hidden items-center gap-8 text-sm text-slate-200 md:flex">
            <a href="#about" className="transition hover:text-white">About</a>
            <a href="#divisions" className="transition hover:text-white">Divisions</a>
            <a href="#brands" className="transition hover:text-white">Brands</a>
            <a href="#contact" className="transition hover:text-white">Contact</a>
          </nav>

          <div className="hidden md:block">
            <a
              href="#brands"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-slate-950"
            >
              Explore Brands
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.28),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_28%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.95),rgba(15,23,42,0.78),rgba(2,6,23,0.95))]" />

          <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-sm text-sky-200">
                HISEM Group Official Website
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                HISEM Group
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                A diversified platform for industrial solutions, trading services, and food &amp; dining brands.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                HISEM 集团是一个涵盖工业解决方案、贸易服务与餐饮品牌的多元化业务平台。
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#brands"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
                >
                  Explore Our Brands
                </a>
                <a
                  href="#contact"
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Contact Us
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-sky-950/30 backdrop-blur-sm">
                <div className="text-sm uppercase tracking-[0.2em] text-sky-300">Core sectors</div>
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <div className="text-lg font-semibold">Industrial &amp; Business</div>
                    <div className="mt-2 text-sm leading-6 text-slate-400">
                      HISEM, SOXIBA, and GNG serving technical, engineering, and trading markets.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <div className="text-lg font-semibold">Food &amp; Dining</div>
                    <div className="mt-2 text-sm leading-6 text-slate-400">
                      Yipin Shifu and Shaxian Snacks serving daily meals, gatherings, and takeaway needs.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-6 py-18 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">Who We Are</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                A structured group with diversified business focus.
              </h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-base leading-8 text-slate-300 shadow-xl shadow-slate-950/30">
              HISEM Group is a diversified business platform with operations spanning industrial solutions, trading services, and food &amp; dining brands. Through a growing portfolio of companies and brands, we aim to deliver practical value, reliable service, and long-term business development across multiple sectors.
            </div>
          </div>
        </section>

        <section id="divisions" className="border-y border-white/10 bg-white/[0.03]">
          <div className="mx-auto max-w-7xl px-6 py-18 lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">Business Divisions</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Built across two core sectors.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-400">
                Structured to serve different markets with clarity, consistency, and room for growth.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {divisions.map((division) => (
                <div
                  key={division.title}
                  className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30"
                >
                  <h3 className="text-2xl font-semibold text-white">{division.title}</h3>
                  <p className="mt-4 text-base leading-7 text-slate-400">{division.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="brands" className="mx-auto max-w-7xl px-6 py-18 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">Our Brands</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Explore the HISEM Group portfolio.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-400">
              Click any brand card below to enter its dedicated page.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {brands.map((brand) => (
              <a
                key={brand.name}
                href={brand.path}
                className="group overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-xl shadow-slate-950/30 transition duration-300 hover:-translate-y-1 hover:border-sky-400/40"
              >
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
                  <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-slate-950/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-sky-200 backdrop-blur">
                    {brand.category}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-2xl font-semibold text-white">{brand.name}</h3>
                    <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">{brand.desc}</p>
                    <div className="mt-5 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition group-hover:bg-white group-hover:text-slate-950">
                      Enter Brand
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.03]">
          <div className="mx-auto max-w-7xl px-6 py-18 lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">Why HISEM</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                A group structure built for clarity and long-term growth.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {strengths.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-slate-900/70 p-7 shadow-lg shadow-slate-950/30"
                >
                  <div className="h-11 w-11 rounded-2xl bg-sky-400/15 ring-1 ring-sky-300/20" />
                  <h3 className="mt-6 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-6 py-18 lg:px-8 lg:py-24">
          <div className="grid gap-10 rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl shadow-slate-950/40 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">Contact</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Get in touch with HISEM Group.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                For business enquiries, partnerships, product information, or brand-related contact, please reach out to the HISEM Group team.
              </p>
            </div>

            <div className="space-y-4">
              <a
                href="mailto:info@hisem.com"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-sm uppercase tracking-[0.18em] text-slate-400">Email</div>
                <div className="mt-2 text-lg font-medium text-white">info@hisem.com</div>
              </a>
              <a
                href="https://wa.me/971000000000"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-sm uppercase tracking-[0.18em] text-slate-400">WhatsApp</div>
                <div className="mt-2 text-lg font-medium text-white">+971 XX XXX XXXX</div>
              </a>
              <a
                href="#"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-sm uppercase tracking-[0.18em] text-slate-400">Location</div>
                <div className="mt-2 text-lg font-medium text-white">Dubai, United Arab Emirates</div>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="font-semibold tracking-[0.18em] text-white">HISEM GROUP</div>
            <div className="mt-2">A diversified business platform across industrial solutions, trading services, and dining brands.</div>
          </div>
          <div className="text-slate-500">© 2026 HISEM Group. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
