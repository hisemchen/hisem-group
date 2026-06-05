'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type MealRecord = {
  id: string;
  meal_date: string;
  meal_type: string;
  deducted: number;
  note: string | null;
  created_at: string;
};

type MealCard = {
  id: string;
  customer_name: string;
  card_no: number;
  purchase_date: string;
  payment_method: string;
  total_meals: number;
  price_aed: number;
  created_at: string;
  records: MealRecord[];
};

const today = new Date().toISOString().slice(0, 10);

function cardStats(card: MealCard) {
  const used = card.records.reduce((sum, record) => sum + Number(record.deducted || 0), 0);
  const left = Math.max(0, Number(card.total_meals || 0) - used);
  return { used, left, status: left > 0 ? '使用中' : '已用完' };
}

export default function YipinShifuAdminPage() {
  const [cards, setCards] = useState<MealCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [mealDate, setMealDate] = useState(today);
  const [mealType, setMealType] = useState('中餐');

  async function loadCards() {
    setLoading(true);
    setMessage('');
    const response = await fetch('/api/yipinshifu/cards', { cache: 'no-store' });
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || 'Failed to load cards.');
      setLoading(false);
      return;
    }

    setCards(result.cards || []);
    setLoading(false);
  }

  useEffect(() => {
    loadCards();
  }, []);

  const activeCards = useMemo(
    () => cards.filter((card) => cardStats(card).left > 0),
    [cards]
  );

  useEffect(() => {
    if (!selectedCardId && activeCards[0]) {
      setSelectedCardId(activeCards[0].id);
    }
  }, [activeCards, selectedCardId]);

  async function createCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    const response = await fetch('/api/yipinshifu/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, purchaseDate, paymentMethod }),
    });
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || 'Failed to create card.');
      return;
    }

    setCustomerName('');
    await loadCards();
    setMessage('新餐次卡已创建。');
  }

  async function deductMeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    const response = await fetch('/api/yipinshifu/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: selectedCardId, mealDate, mealType }),
    });
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || 'Failed to deduct meal.');
      return;
    }

    await loadCards();
    setMessage('已扣除 1 次。');
  }

  return (
    <main className="min-h-screen bg-stone-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="text-sm text-stone-400 transition hover:text-white">
          HISEM GROUP
        </a>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold">一品食府会员后台</h1>
            <p className="mt-3 text-stone-300">
              餐次卡：AED 300 / 10次。每消费一次扣1次，扣完后续卡。
            </p>
          </div>
          <button
            type="button"
            onClick={loadCards}
            className="w-fit rounded-full border border-white/20 px-5 py-2 text-sm font-semibold transition hover:bg-white hover:text-stone-950"
          >
            刷新
          </button>
        </div>

        {message && (
          <div className="mt-6 border border-amber-200/30 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">
            {message}
          </div>
        )}

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <form onSubmit={createCard} className="border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-semibold">新增 / 续卡</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <label className="text-sm text-stone-300">
                姓名
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200"
                  placeholder="Nesmaa"
                  required
                />
              </label>
              <label className="text-sm text-stone-300">
                购买日期
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(event) => setPurchaseDate(event.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200"
                  required
                />
              </label>
              <label className="text-sm text-stone-300">
                付款方式
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200"
                >
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Transfer</option>
                  <option>Tabby</option>
                </select>
              </label>
            </div>
            <button className="mt-5 rounded-full bg-amber-200 px-5 py-2 text-sm font-semibold text-stone-950 transition hover:bg-white">
              创建10次餐卡
            </button>
          </form>

          <form onSubmit={deductMeal} className="border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-semibold">消费扣卡</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <label className="text-sm text-stone-300">
                选择餐卡
                <select
                  value={selectedCardId}
                  onChange={(event) => setSelectedCardId(event.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200"
                  required
                >
                  {activeCards.map((card) => {
                    const stats = cardStats(card);
                    return (
                      <option key={card.id} value={card.id}>
                        {card.customer_name} 第{card.card_no}张卡 剩余{stats.left}次
                      </option>
                    );
                  })}
                </select>
              </label>
              <label className="text-sm text-stone-300">
                消费日期
                <input
                  type="date"
                  value={mealDate}
                  onChange={(event) => setMealDate(event.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200"
                  required
                />
              </label>
              <label className="text-sm text-stone-300">
                餐别
                <select
                  value={mealType}
                  onChange={(event) => setMealType(event.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200"
                >
                  <option>中餐</option>
                  <option>晚餐</option>
                </select>
              </label>
            </div>
            <button
              disabled={!activeCards.length}
              className="mt-5 rounded-full bg-amber-200 px-5 py-2 text-sm font-semibold text-stone-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
            >
              扣除1次
            </button>
          </form>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">会员餐次卡汇总</h2>
          <div className="mt-5 overflow-x-auto border border-white/10">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-amber-200 text-xs font-semibold uppercase text-stone-950">
                <tr>
                  <th className="px-4 py-3">姓名</th>
                  <th className="px-4 py-3">卡号</th>
                  <th className="px-4 py-3">购买日期</th>
                  <th className="px-4 py-3">付款方式</th>
                  <th className="px-4 py-3">金额</th>
                  <th className="px-4 py-3">总次数</th>
                  <th className="px-4 py-3">已用</th>
                  <th className="px-4 py-3">剩余</th>
                  <th className="px-4 py-3">状态</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-4 py-4 text-stone-300" colSpan={9}>
                      Loading...
                    </td>
                  </tr>
                ) : (
                  cards.map((card) => {
                    const stats = cardStats(card);
                    return (
                      <tr key={card.id} className="border-t border-white/10 text-stone-200">
                        <td className="px-4 py-3">{card.customer_name}</td>
                        <td className="px-4 py-3">第{card.card_no}张卡</td>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            defaultValue={card.purchase_date}
                            onBlur={async (e) => {
                              if (e.target.value === card.purchase_date) return;
                              await fetch(`/api/yipinshifu/cards/${card.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ purchase_date: e.target.value }),
                              });
                              await loadCards();
                            }}
                            className="border border-white/10 bg-stone-900 px-2 py-1 text-white outline-none focus:border-amber-200"
                          />
                        </td>
                        <td className="px-4 py-3">{card.payment_method}</td>
                        <td className="px-4 py-3">AED {Number(card.price_aed).toFixed(0)}</td>
                        <td className="px-4 py-3">{card.total_meals}</td>
                        <td className="px-4 py-3">{stats.used}</td>
                        <td className="px-4 py-3">{stats.left}</td>
                        <td className="px-4 py-3">{stats.status}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">消费扣次记录</h2>
          <div className="mt-5 overflow-x-auto border border-white/10">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-amber-200 text-xs font-semibold uppercase text-stone-950">
                <tr>
                  <th className="px-4 py-3">姓名</th>
                  <th className="px-4 py-3">卡号</th>
                  <th className="px-4 py-3">消费日期</th>
                  <th className="px-4 py-3">餐别</th>
                  <th className="px-4 py-3">扣次</th>
                  <th className="px-4 py-3">扣后剩余</th>
                </tr>
              </thead>
              <tbody>
                {cards.flatMap((card) => {
                  let left = Number(card.total_meals || 0);
                  return card.records.map((record) => {
                    left -= Number(record.deducted || 0);
                    return (
                      <tr key={record.id} className="border-t border-white/10 text-stone-200">
                        <td className="px-4 py-3">{card.customer_name}</td>
                        <td className="px-4 py-3">第{card.card_no}张卡</td>
                        <td className="px-4 py-3">{record.meal_date}</td>
                        <td className="px-4 py-3">{record.meal_type}</td>
                        <td className="px-4 py-3">-{record.deducted}</td>
                        <td className="px-4 py-3">{left}</td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
