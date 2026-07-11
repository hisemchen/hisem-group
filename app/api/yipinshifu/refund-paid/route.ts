import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: '缺少姓名' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('yipin_meal_cards')
      .update({ refund_paid_at: new Date().toISOString() })
      .eq('customer_name', name);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
}
