export default function YipinShifuPage() {
  return (
    <main className="min-h-screen bg-stone-950 text-white">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-950/35" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <a href="/" className="mb-12 text-xl font-semibold tracking-[0.18em]">
              HISEM GROUP
            </a>
            <div className="w-fit border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm uppercase tracking-[0.18em] text-amber-200">
              Food & Dining
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-tight">
              Yipin Shifu 一品食府
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-stone-200">
              正宗中餐，适合午餐、晚餐、家庭聚餐及朋友小聚。
            </p>
          </div>

          <section className="border border-amber-200/20 bg-stone-950/85 p-7 shadow-2xl">
            <div className="text-sm uppercase tracking-[0.18em] text-amber-200">
              Member Meal Card
            </div>
            <h2 className="mt-4 text-3xl font-semibold">餐次卡会员</h2>

            <div className="mt-6 grid grid-cols-2 gap-4 border-y border-white/10 py-6">
              <div>
                <div className="text-sm text-stone-400">总价</div>
                <div className="mt-2 text-5xl font-semibold text-amber-200">AED 300</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-stone-400">次数</div>
                <div className="mt-2 text-5xl font-semibold">10次</div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="border border-white/10 bg-white/5 p-4 text-sm text-stone-300">
                午餐或晚餐可用
              </div>
              <div className="border border-white/10 bg-white/5 p-4 text-sm text-stone-300">
                每次扣除1次
              </div>
              <div className="border border-white/10 bg-white/5 p-4 text-sm text-stone-300">
                可记录剩余次数
              </div>
            </div>

            <div className="mt-7 overflow-hidden border border-white/10">
              <div className="grid grid-cols-5 bg-amber-200 px-4 py-3 text-xs font-semibold text-stone-950">
                <span>姓名</span>
                <span>餐别</span>
                <span>日期</span>
                <span>扣次</span>
                <span>剩余</span>
              </div>
              {[
                ['Nesmaa', '中餐', '07/01', '-1', '9'],
                ['Nesmaa', '中餐', '08/01', '-1', '8'],
                ['Nesmaa', '晚餐', '09/01', '-1', '7'],
                ['Nesmaa', '中餐', '12/01', '-1', '6'],
              ].map((row) => (
                <div key={row.join('-')} className="grid grid-cols-5 border-t border-white/10 px-4 py-3 text-sm text-stone-200">
                  {row.map((cell) => (
                    <span key={cell}>{cell}</span>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
