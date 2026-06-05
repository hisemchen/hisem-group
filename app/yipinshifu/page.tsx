import Image from 'next/image';

const meals = [
  'Lunch or dinner meal redemption',
  '10 total visits per card',
  'Simple member record tracking',
];

const sampleRecords = [
  { name: 'Member', date: '07/01', meal: 'Lunch', used: 1, left: 9 },
  { name: 'Member', date: '08/01', meal: 'Dinner', used: 1, left: 8 },
  { name: 'Member', date: '12/01', meal: 'Lunch', used: 1, left: 7 },
  { name: 'Member', date: '19/01', meal: 'Lunch', used: 1, left: 6 },
];

export default function YipinShifuPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-stone-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a href="/" className="text-xl font-semibold tracking-[0.18em] text-white">
            HISEM GROUP
          </a>
          <nav className="hidden items-center gap-8 text-sm text-stone-200 md:flex">
            <a href="/" className="transition hover:text-white">Home</a>
            <a href="#member-card" className="transition hover:text-white">Membership</a>
            <a href="#contact" className="transition hover:text-white">Contact</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80"
            alt="Yipin Shifu dining room"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/78 to-stone-950/25" />
          <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-sm font-medium uppercase tracking-[0.18em] text-amber-200">
                Food & Dining
              </div>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                Yipin Shifu 一品食府
              </h1>
              <p className="mt-6 text-lg leading-8 text-stone-200 sm:text-xl">
                Authentic Chinese cuisine for everyday meals, family dining, and group gatherings.
              </p>
              <p className="mt-4 text-base leading-7 text-stone-300">
                正宗中餐，适合午餐、晚餐、家庭聚餐及朋友小聚。
              </p>
            </div>

            <section
              id="member-card"
              className="border border-amber-200/20 bg-stone-950/82 p-7 shadow-2xl shadow-stone-950/50 backdrop-blur"
            >
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-amber-200">
                Member Meal Card
              </div>
              <h2 className="mt-4 text-3xl font-semibold text-white">餐次卡会员</h2>
              <div className="mt-6 grid grid-cols-[1fr_auto] items-end gap-6 border-y border-white/10 py-6">
                <div>
                  <div className="text-sm text-stone-400">Total price</div>
                  <div className="mt-2 text-5xl font-semibold text-amber-200">AED 300</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-stone-400">Meals</div>
                  <div className="mt-2 text-5xl font-semibold text-white">10次</div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {meals.map((item) => (
                  <div key={item} className="border border-white/10 bg-white/5 p-4">
                    <div className="h-2 w-2 rounded-full bg-amber-300" />
                    <p className="mt-3 text-sm leading-6 text-stone-300">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 overflow-hidden border border-white/10 bg-white/[0.04]">
                <div className="grid grid-cols-5 bg-amber-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-950">
                  <span>Name</span>
                  <span>Date</span>
                  <span>Meal</span>
                  <span>Used</span>
                  <span>Left</span>
                </div>
                {sampleRecords.map((record) => (
                  <div
                    key={`${record.date}-${record.left}`}
                    className="grid grid-cols-5 border-t border-white/10 px-4 py-3 text-sm text-stone-200"
                  >
                    <span>{record.name}</span>
