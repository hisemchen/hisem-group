'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type InventoryItem = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  min_quantity: number;
  created_at: string;
};

type Movement = {
  id: string;
  item_id: string;
  change: number;
  move_type: string;
  move_date: string;
  note: string | null;
  created_at: string;
  item: { name: string; unit: string } | null;
};

const today = new Date().toISOString().slice(0, 10);

export default function InventoryAdminPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // 添加物品表单
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('份');
  const [newQty, setNewQty] = useState('0');
  const [newMinQty, setNewMinQty] = useState('0');

  // 入库/出库表单
  const [selectedItemId, setSelectedItemId] = useState('');
  const [moveType, setMoveType] = useState('入库');
  const [moveQty, setMoveQty] = useState('1');
  const [moveDate, setMoveDate] = useState(today);
  const [moveNote, setMoveNote] = useState('');

  const [recordFilter, setRecordFilter] = useState('');

  async function loadAll() {
    setLoading(true);
    const [itemsRes, movesRes] = await Promise.all([
      fetch('/api/inventory/items', { cache: 'no-store' }),
      fetch('/api/inventory/movements', { cache: 'no-store' }),
    ]);
    const itemsData = await itemsRes.json();
    const movesData = await movesRes.json();
    if (itemsRes.ok) setItems(itemsData.items || []);
    if (movesRes.ok) setMovements(movesData.movements || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!selectedItemId && items[0]) setSelectedItemId(items[0].id);
  }, [items, selectedItemId]);

  async function addItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/inventory/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        unit: newUnit,
        quantity: Number(newQty) || 0,
        minQuantity: Number(newMinQty) || 0,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || '添加失败');
      return;
    }
    setNewName('');
    setNewQty('0');
    setNewMinQty('0');
    await loadAll();
    setMessage('物品已添加。');
  }

  async function submitMove(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/inventory/movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: selectedItemId,
        moveType,
        quantity: Number(moveQty) || 0,
        moveDate,
        note: moveNote,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || '操作失败');
      return;
    }
    setMoveQty('1');
    setMoveNote('');
    await loadAll();
    setMessage(`${moveType}成功。`);
  }

  const lowStockItems = useMemo(
    () => items.filter((i) => Number(i.quantity) <= Number(i.min_quantity)),
    [items]
  );

  return (
    <main className="min-h-screen bg-stone-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="text-sm text-stone-400 transition hover:text-white">HISEM GROUP</a>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold">一品食府库存管理</h1>
            <p className="mt-3 text-stone-300">记录物品入库、出库，库存低于预警值时会提示补货。</p>
          </div>
          <div className="flex gap-3">
            <a href="/admin/yipinshifu"
              className="w-fit rounded-full border border-white/20 px-5 py-2 text-sm font-semibold transition hover:bg-white hover:text-stone-950">
              会员后台
            </a>
            <button type="button" onClick={loadAll}
              className="w-fit rounded-full border border-white/20 px-5 py-2 text-sm font-semibold transition hover:bg-white hover:text-stone-950">
              刷新
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-6 border border-amber-200/30 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">
            {message}
          </div>
        )}

        {lowStockItems.length > 0 && (
          <div className="mt-6 border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            ⚠️ {lowStockItems.length} 项库存低于预警值，需要补货：
            {lowStockItems.map((i) => ` ${i.name}（剩 ${i.quantity} ${i.unit}）`).join('、')}
          </div>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* 添加物品 */}
          <form onSubmit={addItem} className="border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-semibold">添加物品</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-stone-300">
                物品名称
                <input value={newName} onChange={(e) => setNewName(e.target.value)} required
                  placeholder="例如：大米"
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200" />
              </label>
              <label className="text-sm text-stone-300">
                单位
                <select value={newUnit} onChange={(e) => setNewUnit(e.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200">
                  <option>份</option>
                  <option>公斤</option>
                  <option>袋</option>
                  <option>箱</option>
                  <option>瓶</option>
                  <option>包</option>
                  <option>个</option>
                  <option>升</option>
                </select>
              </label>
              <label className="text-sm text-stone-300">
                初始数量
                <input type="number" min="0" step="any" value={newQty} onChange={(e) => setNewQty(e.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200" />
              </label>
              <label className="text-sm text-stone-300">
                预警数量（低于此数提示补货）
                <input type="number" min="0" step="any" value={newMinQty} onChange={(e) => setNewMinQty(e.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200" />
              </label>
            </div>
            <button className="mt-5 rounded-full bg-amber-200 px-5 py-2 text-sm font-semibold text-stone-950 transition hover:bg-white">
              添加物品
            </button>
          </form>

          {/* 入库 / 出库 */}
          <form onSubmit={submitMove} className="border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-semibold">入库 / 出库</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-stone-300">
                选择物品
                <select value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)} required
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200">
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}（当前 {item.quantity} {item.unit}）
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-stone-300">
                类型
                <select value={moveType} onChange={(e) => setMoveType(e.target.value)}
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200">
                  <option>入库</option>
                  <option>出库</option>
                </select>
              </label>
              <label className="text-sm text-stone-300">
                数量
                <input type="number" min="0" step="any" value={moveQty} onChange={(e) => setMoveQty(e.target.value)} required
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200" />
              </label>
              <label className="text-sm text-stone-300">
                日期
                <input type="date" value={moveDate} onChange={(e) => setMoveDate(e.target.value)} required
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200" />
              </label>
              <label className="text-sm text-stone-300 sm:col-span-2">
                备注（选填）
                <input value={moveNote} onChange={(e) => setMoveNote(e.target.value)}
                  placeholder="例如：供应商送货 / 后厨领用"
                  className="mt-2 w-full border border-white/10 bg-stone-900 px-3 py-2 text-white outline-none focus:border-amber-200" />
              </label>
            </div>
            <button disabled={!items.length}
              className="mt-5 rounded-full bg-amber-200 px-5 py-2 text-sm font-semibold text-stone-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400">
              确认{moveType}
            </button>
          </form>
        </section>

        {/* 库存汇总 */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">库存汇总</h2>
          <div className="mt-3 overflow-x-auto border border-white/10">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead className="bg-amber-200 text-xs font-semibold uppercase text-stone-950">
                <tr>
                  <th className="px-4 py-3">物品</th>
                  <th className="px-4 py-3">单位</th>
                  <th className="px-4 py-3">当前库存</th>
                  <th className="px-4 py-3">预警值</th>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="px-4 py-4 text-stone-300" colSpan={6}>Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td className="px-4 py-4 text-stone-400" colSpan={6}>暂无物品，请先添加</td></tr>
                ) : (
                  items.map((item) => {
                    const isLow = Number(item.quantity) <= Number(item.min_quantity);
                    return (
                      <tr key={item.id} className="border-t border-white/10 text-stone-200">
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">{item.unit}</td>
                        <td className={`px-4 py-3 font-semibold ${isLow ? 'text-red-400' : 'text-white'}`}>{item.quantity}</td>
                        <td className="px-4 py-3">{item.min_quantity}</td>
                        <td className="px-4 py-3">
                          {isLow ? (
                            <span className="text-red-400">需补货</span>
                          ) : (
                            <span className="text-green-400">充足</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={async () => {
                              if (!confirm(`确认删除「${item.name}」？其出入库记录也会一并删除。`)) return;
                              await fetch(`/api/inventory/items/${item.id}`, { method: 'DELETE' });
                              await loadAll();
                            }}
                            className="rounded-full bg-red-800 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700">
                            删除
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 出入库记录 */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">出入库记录</h2>
          <div className="mt-4">
            <input
              type="text"
              value={recordFilter}
              onChange={(e) => setRecordFilter(e.target.value)}
              placeholder="按物品名筛选..."
              className="border border-white/10 bg-stone-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-200 w-48"
            />
          </div>
          <div className="mt-3 overflow-x-auto border border-white/10">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead className="bg-amber-200 text-xs font-semibold uppercase text-stone-950">
                <tr>
                  <th className="px-4 py-3">日期</th>
                  <th className="px-4 py-3">物品</th>
                  <th className="px-4 py-3">类型</th>
                  <th className="px-4 py-3">数量变化</th>
                  <th className="px-4 py-3">备注</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr><td className="px-4 py-4 text-stone-400" colSpan={5}>暂无记录</td></tr>
                ) : (
                  movements
                    .filter((m) => !recordFilter || (m.item?.name || '').toLowerCase().includes(recordFilter.toLowerCase()))
                    .map((m) => (
                      <tr key={m.id} className="border-t border-white/10 text-stone-200">
                        <td className="px-4 py-3">{m.move_date}</td>
                        <td className="px-4 py-3">{m.item?.name || '（已删除物品）'}</td>
                        <td className="px-4 py-3">{m.move_type}</td>
                        <td className={`px-4 py-3 font-semibold ${Number(m.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {Number(m.change) >= 0 ? '+' : ''}{m.change} {m.item?.unit || ''}
                        </td>
                        <td className="px-4 py-3 text-stone-400">{m.note || '—'}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
