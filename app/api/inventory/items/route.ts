import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('yipin_inventory_items')
    .select('*')
    .order('name', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || '').trim();
  const unit = String(body.unit || '份').trim();
  const quantity = Number(body.quantity) || 0;
  const minQuantity = Number(body.minQuantity) || 0;

  if (!name) {
    return NextResponse.json({ error: '物品名称必填' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('yipin_inventory_items')
    .insert({ name, unit, quantity, min_quantity: minQuantity })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (quantity > 0) {
    await supabaseAdmin.from('yipin_inventory_movements').insert({
      item_id: data.id,
      change: quantity,
      move_type: '期初库存',
      move_date: new Date().toISOString().slice(0, 10),
      note: null,
    });
  }

  return NextResponse.json({ item: data });
}
