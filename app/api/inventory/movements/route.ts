import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('yipin_inventory_movements')
    .select('*, item:yipin_inventory_items(name, unit)')
    .order('move_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ movements: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const itemId = String(body.itemId || '');
  const moveType = String(body.moveType || '入库');
  const quantity = Number(body.quantity) || 0;
  const moveDate = String(body.moveDate || new Date().toISOString().slice(0, 10));
  const note = body.note ? String(body.note) : null;

  if (!itemId || quantity <= 0) {
    return NextResponse.json({ error: '请选择物品并填写大于 0 的数量' }, { status: 400 });
  }

  const { data: item, error: itemError } = await supabaseAdmin
    .from('yipin_inventory_items')
    .select('*')
    .eq('id', itemId)
    .single();
  if (itemError || !item) {
    return NextResponse.json({ error: '物品不存在' }, { status: 404 });
  }

  const change = moveType === '出库' ? -quantity : quantity;
  const newQty = Number(item.quantity) + change;
  if (newQty < 0) {
    return NextResponse.json({ error: `库存不足：当前仅剩 ${item.quantity} ${item.unit}` }, { status: 400 });
  }

  const { error: moveError } = await supabaseAdmin
    .from('yipin_inventory_movements')
    .insert({ item_id: itemId, change, move_type: moveType, move_date: moveDate, note });
  if (moveError) return NextResponse.json({ error: moveError.message }, { status: 500 });

  const { error: updateError } = await supabaseAdmin
    .from('yipin_inventory_items')
    .update({ quantity: newQty })
    .eq('id', itemId);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true, quantity: newQty });
}
