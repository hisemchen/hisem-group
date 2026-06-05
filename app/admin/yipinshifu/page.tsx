const cards = [
  {
    cardNo: '第1张卡',
    name: 'Nesmaa',
    purchaseDate: '07/01',
    paymentMethod: 'Cash',
    total: 10,
    records: [
      { date: '07/01', meal: '中餐', deduct: 1 },
      { date: '08/01', meal: '中餐', deduct: 1 },
      { date: '09/01', meal: '晚餐', deduct: 1 },
      { date: '12/01', meal: '中餐', deduct: 1 },
    ],
  },
];

export default function YipinShifuAdminPage() {
  return (
    <main className="min-h-screen bg-stone-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="text-sm text-stone-400 hover:text-white">
          HISEM GROUP
        </a>

        <h1 className="mt-6 text-4xl font-semibold">一品食府会员后台</h1>
        <p className="mt-3 text-stone-300">
          餐次卡：AED 300 / 10次。每消费一次扣1次，扣完后续卡。
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">会员餐次卡汇总</h2>

          <div className="mt-5 overflow-hidden border border-white/10">
            <div className="grid grid-cols-8 bg-amber-200 px-4 py-3 text-xs font-semibold text-stone-950">
              <span>姓名</span>
              <span>卡号</span>
              <span>购买日期</span>
              <span>付款方式</span>
              <span>总次数</span>
              <span>已用</span>
              <span>剩余</span>
              <span>状态</span>
            </div>

            {cards.map((card) => {
              const used = card.records.reduce((sum, item) => sum + item.deduct, 0);
              const left = card.total - used;
              const status = left > 0 ? '使用中' : '已用完';

              return (
                <div key={`${card.name}-${card.cardNo}`} className="grid grid-cols-8 border-t border-white/10 px-4 py-3 text-sm text-stone-200">
                  <span>{card.name}</span>
                  <span>{card.cardNo}</span>
                  <span>{card.purchaseDate}</span>
                  <span>{card.paymentMethod}</span>
                  <span>{card.total}</span>
                  <span>{used}</span>
                  <span>{left}</span>
                  <span>{status}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">消费扣次记录</h2>

          <div className="mt-5 overflow-hidden border border-white/10">
            <div className="grid grid-cols-6 bg-amber-200 px-4 py-3 text-xs font-semibold text-stone-950">
              <span>姓名</span>
              <span>卡号</span>
              <span>消费日期</span>
              <span>餐别</span>
              <span>扣次</span>
              <span>扣后剩余</span>
            </div>

            {cards.flatMap((card) => {
              let left = card.total;

              return card.records.map((record, index) => {
                left -= record.deduct;

                return (
                  <div key={`${card.name}-${card.cardNo}-${record.date}-${index}`} className="grid grid-cols-6 border-t border-white/10 px-4 py-3 text-sm text-stone-200">
                    <span>{card.name}</span>
                    <span>{card.cardNo}</span>
                    <span>{record.date}</span>
                    <span>{record.meal}</span>
                    <span>-{record.deduct}</span>
                    <span>{left}</span>
                  </div>
                );
              });
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
