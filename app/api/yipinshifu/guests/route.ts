import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('yipin_guest_records')
    .select('*')
    .order('meal_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ records: data || [] });
}

export async function POST(request: Request) {
  const { records } = await request.json();

  const { data, error } = await supabaseAdmin
    .from('yipin_guest_records')
    .insert(records.map((r: { customerName: string; mealDate: string; mealType: string; paymentStatus: string }) => ({
      customer_name: r.customerName,
      meal_date: r.mealDate,
      meal_type: r.mealType,
      price_aed: 35,
      payment_status: r.paymentStatus,
    })))
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ records: data });
}
