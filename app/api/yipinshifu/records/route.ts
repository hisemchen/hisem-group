import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  const body = await request.json();
  const cardId = String(body.cardId || '').trim();
  const mealDate = String(body.mealDate || '').trim();
  const mealType = String(body.mealType || '').trim();

  if (!cardId || !mealDate || !mealType) {
    return NextResponse.json(
      { error: 'Card, meal date, and meal type are required.' },
      { status: 400 }
    );
  }

  const { data: card, error: cardError } = await supabaseAdmin
    .from('yipin_meal_cards')
    .select('id, total_meals, records:yipin_meal_records(deducted)')
    .eq('id', cardId)
    .single();

  if (cardError || !card) {
    return NextResponse.json({ error: 'Meal card not found.' }, { status: 404 });
  }

  const used = (card.records || []).reduce(
    (sum: number, record: { deducted: number }) => sum + Number(record.deducted || 0),
    0
  );

  if (used >= Number(card.total_meals)) {
    return NextResponse.json(
      { error: 'This card has no remaining meals. Please renew the card.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('yipin_meal_records')
    .insert({
      card_id: cardId,
      meal_date: mealDate,
      meal_type: mealType,
      deducted: 1,
      note: body.note ? String(body.note).trim() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ record: data });
}
