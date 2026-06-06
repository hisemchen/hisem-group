import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get('cardId');
  const mealDate = searchParams.get('mealDate');
  const mealType = searchParams.get('mealType');

  if (!cardId || !mealDate || !mealType) {
    return NextResponse.json({ exists: false });
  }

  const { data } = await supabaseAdmin
    .from('yipin_meal_records')
    .select('id')
    .eq('card_id', cardId)
    .eq('meal_date', mealDate)
    .eq('meal_type', mealType)
    .limit(1);

  return NextResponse.json({ exists: (data?.length ?? 0) > 0 });
}
