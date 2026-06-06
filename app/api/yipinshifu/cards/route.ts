import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('yipin_meal_cards')
    .select('*, records:yipin_meal_records(*)')
    .order('created_at', { ascending: false })
    .order('meal_date', {
      referencedTable: 'yipin_meal_records',
      ascending: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ cards: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const customerName = String(body.customerName || '').trim();
  const purchaseDate = String(body.purchaseDate || '').trim();
  const paymentMethod = String(body.paymentMethod || '').trim();

  if (!customerName || !purchaseDate || !paymentMethod) {
    return NextResponse.json(
      { error: 'Name, purchase date, and payment method are required.' },
      { status: 400 }
    );
  }

  const { count } = await supabaseAdmin
    .from('yipin_meal_cards')
    .select('id', { count: 'exact', head: true })
    .eq('customer_name', customerName);

  const { data, error } = await supabaseAdmin
    .from('yipin_meal_cards')
    .insert({
      customer_name: customerName,
      card_no: Number(count || 0) + 1,
      purchase_date: purchaseDate,
      payment_method: paymentMethod,
      total_meals: 10,
      price_aed: 300,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ card: data });
}
