import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  const { records } = await request.json();
  // records: { cardId: string, mealDate: string, mealType: string }[]

  const results = [];
  for (const record of records) {
    const { error } = await supabaseAdmin
      .from('yipin_meal_records')
      .insert({
        card_id: record.cardId,
        meal_date: record.mealDate,
        meal_type: record.mealType,
        deducted: 1,
      });
    results.push({ cardId: record.cardId, success: !error, error: error?.message });
  }

  return NextResponse.json({ results });
}
