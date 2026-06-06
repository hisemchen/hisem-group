'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';

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

type ImportRow = {
  name: string;
  mealType: string;
  mealDate: string;
  matchedCardId: string;
  status: 'matched' | 'unmatched';
  done?: boolean;
  paid?: boolean;
  paymentMethod?: string;
};

const today = new Date().toISOString().slice(0, 10);

function cardStats(card: MealCard) {
  const used = card.records.reduce((sum, r) => sum + Number(r.deducted || 0), 0);
  const left = Math.max(0, Number(card.total_meals || 0) - used);
  return { used, left, status: left > 0 ? '使用中' : '已用完' };
}

function parseExcelDate(val: string | number): string {
  if (typeof val === 'number' || (!isNaN(Number(val)) && !String(val).includes('/'))) {
    const date = new Date(Math.round((Number(val) - 25569) * 86400 * 1000));
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const parts = String(val).trim().split('/');
  if (parts.length === 2) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    return `2026-${month}-${day}`;
  }
  return String(val);
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
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => { loadCards(); }, []);

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
    if (!response.ok) { setMessage(result.error || 'Failed to create card.'); return; }
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
    if (!response.ok) { setMessage(result.error || 'Failed to deduct meal.'); return; }
    await loadCards();
    setMessage('已扣除 1 次。');
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<{ 姓名: string; 餐别: string; 日期: string | number }>(sheet);
      const parsed: ImportRow[] = rows.map((row) => {
        const name = String(row['姓名'] || '').trim();
        const mealType = String(row['餐别'] || '').trim();
        const mealDate = parseExcelDate(row['日期']);
        const matched = activeCards.find((card) => card.customer_name.trim() === name);
        return {
          name,
          mealType,
          mealDate,
          matchedCardId: matched?.id || '',
          status: matched ? 'matched' : 'unmatched',
          done: false,
          paid: false,
          paymentMethod: 'Cash',
        };
      });
      setImportRows(parsed);
    };
    reader.readAsBinaryString(file);
  }

  // 单条确认导入（已匹配）
  async function confirmSingleRow(i: number) {
    const row = importRows[i];
    const response = await fetch('/api/yipinshifu/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: [{ cardId: row.matchedCardId, mealDate: row.mealDate, mealType: row.mealType }],
      }),
    });
    if (response.ok) {
      const updated = [...importRows];
      updated[i] = { ...updated[i], done: true };
      setImportRows(updated);
      await loadCards();
    }
  }

  // 标记已付款
  function markPaid(i: number) {
    const updated = [...importRows];
    updated[i] = { ...updated[i], paid: true };
    setImportRows(updated);
  }

  // 创建卡并扣卡
  async function createAndDeduct(i: number) {
    const row = importRows[i];
    const createRes = await fetch('/api/yipinshifu/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: row.name,
        purchaseDate: row.mealDate,
        paymentMethod: row.paymentMethod || 'Cash',
      }),
    });
    const createResult = await createRes.json();
    if (!createRes.ok) { setMessage(createResult.error || '创建卡失败'); return; }

    const deductRes = await fetch('/api/yipinshifu/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: [{ cardId: createResult.card.id, mealDate: row.mealDate, mealType: row.mealType }],
      }),
    });
    if (deductRes.ok) {
      const updated = [...importRows];
      updated[i] = { ...updated[i], done: true, status: 'matched' };
      setImportRows(updated);
      await loadCards();
    }
  }

  // 全部批量导入已匹配
  async function submitImport() {
    setImporting(true);
    setMessage('');
    const toSubmit = importRows.filter((r) => r.matchedCardId && !r.done);
    const response = await fetch('/api/yipinshifu/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: toSubmit.map((r) => ({
          cardId: r.matchedCardId,
          mealDate: r.mealDate,
          mealType: r.mealType,
        })),
      }),
    });
    const result = await response.json();
    if (!response.ok) { setMessage('批量导入失败'); setImporting(false); return; }
    const failed = result.results.filter((r: { success: boolean }) => !r.success).length;
    await loadCards();
    setImportRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setMessage(`批量导入完成，成功 ${toSubmit.length - failed} 条${failed ? `，失败 ${failed} 条` : ''}。`);
    setImporting(false);
  }

  return (
    <main className="min-h-screen bg-stone-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="text-sm text-stone-400 transition hover:text-white">HISEM GROUP</a>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold">一品食府会员后台</h1>
            <p className="mt-3 text-stone-300">餐次卡：AED 300 / 10次。每消费一次扣1次，扣完后续卡。</p>
          </div>
          <button type="button" onClick={loadCards}
            className="w-fit rounded-full border border-white/20 px-5 py-2 text-sm font-semibold transition hover:bg-white hover:text-stone-950">
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
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200"
                  placeholder="Nesmaa" required />
              </label>
              <label className="text-sm text-stone-300">
                购买日期
                <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200" required />
              </label>
              <label className="text-sm text-stone-300">
                付款方式
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200">
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
                <select value={selectedCardId} onChange={(e) => setSelectedCardId(e.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200" required>
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
                <input type="date" value={mealDate} onChange={(e) => setMealDate(e.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200" required />
              </label>
              <label className="text-sm text-stone-300">
                餐别
                <select value={mealType} onChange={(e) => setMealType(e.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200">
                  <option>中餐</option>
                  <option>晚餐</option>
                </select>
              </label>
            </div>
            <button disabled={!activeCards.length}
              className="mt-5 rounded-full bg-amber-200 px-5 py-2 text-sm font-semibold text-stone-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400">
              扣除1次
            </button>
          </form>
        </section>

        {/* 批量导入 */}
        <section className="mt-8 border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-semibold">批量导入扣卡</h2>
          <p className="mt-2 text-sm text-stone-400">Excel 需包含三列：姓名、餐别、日期</p>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileUpload}
            className="mt-4 text-sm text-stone-300" />

          {importRows.length > 0 && (
            <div className="mt-5">
              <div className="overflow-x-auto border border-white/10">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-amber-200 text-xs font-semibold uppercase text-stone-950">
                    <tr>
                      <th className="px-4 py-2">姓名</th>
                      <th className="px-4 py-2">餐别</th>
                      <th className="px-4 py-2">日期</th>
                      <th className="px-4 py-2">匹配餐卡</th>
                      <th className="px-4 py-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importRows.map((row, i) => (
                      <tr key={i} className={`border-t border-white/10 ${row.done ? 'opacity-40' : 'text-stone-200'}`}>
                        <td className="px-4 py-2">{row.name}</td>
                        <td className="px-4 py-2">{row.mealType}</td>
                        <td className="px-4 py-2">{row.mealDate}</td>
                        <td className="px-4 py-2">
                          {row.status === 'matched' ? (
                            <select
                              value={row.matchedCardId}
                              onChange={(e) => {
                                const updated = [...importRows];
                                updated[i] = { ...updated[i], matchedCardId: e.target.value };
                                setImportRows(updated);
                              }}
                              disabled={row.done}
                              className="border border-white/10 bg-stone-900 px-2 py-1 text-white outline-none focus:border-amber-200"
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
                          ) : (
                            <span className="text-red-400 text-xs">无匹配餐卡</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {row.done ? (
                            <span className="text-green-400 text-xs">✓ 已完成</span>
                          ) : row.status === 'matched' ? (
                            <button onClick={() => confirmSingleRow(i)}
                              className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-500">
                              确认导入
                            </button>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2">
                              {/* 付款方式选择 */}
                              <select
                                value={row.paymentMethod || 'Cash'}
                                onChange={(e) => {
                                  const updated = [...importRows];
                                  updated[i] = { ...updated[i], paymentMethod: e.target.value };
                                  setImportRows(updated);
                                }}
                                className="border border-white/10 bg-stone-900 px-2 py-1 text-xs text-white outline-none focus:border-amber-200"
                              >
                                <option>Cash</option>
                                <option>Card</option>
                                <option>Transfer</option>
                                <option>Tabby</option>
                              </select>
                              {/* 已付款按钮 */}
                              <button
                                onClick={() => markPaid(i)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                  row.paid
                                    ? 'bg-green-600 text-white cursor-default'
                                    : 'border border-white/20 text-stone-300 hover:bg-white/10'
                                }`}
                              >
                                {row.paid ? '✓ 已付款' : '已付款'}
                              </button>
                              {/* 创建卡并扣卡按钮 */}
                              <button
                                onClick={() => createAndDeduct(i)}
                                className="rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-stone-950 hover:bg-white"
                              >
                                创建卡并扣卡
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={submitImport} disabled={importing}
                  className="rounded-full bg-amber-200 px-5 py-2 text-sm font-semibold text-stone-950 transition hover:bg-white disabled:bg-stone-700 disabled:text-stone-400">
                  {importing ? '导入中...' : `全部导入已匹配 ${importRows.filter(r => r.matchedCardId && !r.done).length} 条`}
                </button>
                <button onClick={() => { setImportRows([]); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="rounded-full border border-white/20 px-5 py-2 text-sm transition hover:bg-white/10">
                  清空
                </button>
              </div>
            </div>
          )}
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
                  <tr><td className="px-4 py-4 text-stone-300" colSpan={9}>Loading...</td></tr>
                ) : (
                  cards.map((card) => {
                    const stats = cardStats(card);
                    return (
                      <tr key={card.id} className="border-t border-white/10 text-stone-200">
                        <td className="px-4 py-3">{card.customer_name}</td>
                        <td className="px-4 py-3">第{card.card_no}张卡</td>
                        <td className="px-4 py-3">
                          <input type="date" defaultValue={card.purchase_date}
                            onBlur={async (e) => {
                              if (e.target.value === card.purchase_date) return;
                              await fetch(`/api/yipinshifu/cards/${card.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ purchase_date: e.target.value }),
                              });
                              await loadCards();
                            }}
                            className="border border-white/10 bg-stone-900 px-2 py-1 text-white outline-none focus:border-amber-200" />
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
