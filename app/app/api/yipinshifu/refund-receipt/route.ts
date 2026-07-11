import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const name = formData.get('name') as string | null;

    if (!file || !name) {
      return NextResponse.json({ error: '缺少文件或姓名' }, { status: 400 });
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `receipt_${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from('yipin-receipts')
      .upload(path, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: pub } = supabaseAdmin.storage
      .from('yipin-receipts')
      .getPublicUrl(path);

    const { error: dbError } = await supabaseAdmin
      .from('yipin_meal_cards')
      .update({ refund_receipt_url: pub.publicUrl })
      .eq('customer_name', name);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, url: pub.publicUrl });
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
}
