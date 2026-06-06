import { supabaseAdmin } from '@/lib/supabaseAdmin';

type MealRecord = {
  id: string;
  meal_date: string;
  meal_type: string;
  deducted: number;
  note: string | null;
};

type MealCard = {
  id: string;
  customer_name: string;
  card_no: number;
  purchase_date: string;
  payment_method: string;
  total_meals: number;
  price_aed: number;
  records: MealRecord[];
};

function cardStats(card: MealCard) {
  const used = card.records.reduce((sum, r) => sum + Number(r.deducted || 0), 0);
  const left = Math.max(0, Number(card.total_meals || 0) - used);
  return { used, left };
}

export default async function StatementPage({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  const today = new Date().toISOString().slice(0, 10);

  const { data: cards } = await supabaseAdmin
    .from('yipin_meal_cards')
    .select('*, records:yipin_meal_records(*)')
    .eq('customer_name', name)
    .order('card_no', { ascending: true })
    .order('meal_date', { referencedTable: 'yipin_meal_records', ascending: true });

  const customerCards = (cards || []) as MealCard[];
  const isMember = customerCards.length > 0;

  return (
    <html lang="zh">
      <head>
        <meta charSet="utf-8" />
        <title>{name} 对账单</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; color: #1a1a1a; background: #fff; padding: 40px; }
          .header { display: flex; align-items: center; gap: 20px; border-bottom: 2px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { width: 70px; height: 70px; object-fit: contain; }
          .brand h1 { font-size: 22px; font-weight: 700; }
          .brand p { font-size: 13px; color: #666; margin-top: 4px; }
          .meta { margin-left: auto; text-align: right; font-size: 12px; color: #666; }
          .customer-info { margin-bottom: 24px; }
          .customer-info h2 { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
          .customer-info p { font-size: 13px; color: #444; }
          .card-block { margin-bottom: 24px; border: 1px solid #ddd; }
          .card-header { background: #f5f0dc; padding: 10px 14px; font-size: 14px; font-weight: 700; border-bottom: 1px solid #ddd; }
          .card-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 12px 14px; font-size: 13px; border-bottom: 1px solid #eee; }
          .card-info span { color: #666; }
          .card-info strong { color: #1a1a1a; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #dcc896; padding: 7px 12px; text-align: left; font-weight: 600; }
          td { padding: 6px 12px; border-bottom: 1px solid #f0f0f0; }
          .no-record { padding: 10px 14px; font-size: 12px; color: #999; }
          .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 12px; text-align: center; font-size: 11px; color: #999; }
          .print-btn { position: fixed; bottom: 30px; right: 30px; background: #1a1a1a; color: #fff; border: none; padding: 12px 24px; font-size: 14px; cursor: pointer; border-radius: 4px; }
          @media print {
            .print-btn { display: none; }
            body { padding: 20px; }
          }
        `}</style>
      </head>
      <body>
        <div className="header">
          <img src="/logo.png" alt="一品食府" className="logo" />
          <div className="brand">
            <h1>一品食府</h1>
            <p>会员对账单</p>
          </div>
          <div className="meta">
            <p>生成日期：{today}</p>
          </div>
        </div>

        <div className="customer-info">
          <h2>客户姓名：{name}</h2>
          <p>会员状态：{isMember ? '✓ 会员（持有餐次卡）' : '非会员'}</p>
        </div>

        {customerCards.map((card) => {
          const stats = cardStats(card);
          let left = Number(card.total_meals);
          return (
            <div key={card.id} className="card-block">
              <div className="card-header">第 {card.card_no} 张卡</div>
              <div className="card-info">
                <div><span>购买日期：</span><strong>{card.purchase_date}</strong></div>
                <div><span>付款方式：</span><strong>{card.payment_method}</strong></div>
                <div><span>金额：</span><strong>AED {Number(card.price_aed).toFixed(0)}</strong></div>
                <div><span>总次数：</span><strong>{card.total_meals}</strong></div>
                <div><span>已用：</span><strong>{stats.used}</strong></div>
                <div><span>剩余：</span><strong>{stats.left}</strong></div>
              </div>
              {card.records.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>消费日期</th>
                      <th>餐别</th>
                      <th>扣次</th>
                      <th>扣后剩余</th>
                    </tr>
                  </thead>
                  <tbody>
                    {card.records.map((record) => {
                      left -= Number(record.deducted || 0);
                      return (
                        <tr key={record.id}>
                          <td>{record.meal_date}</td>
                          <td>{record.meal_type}</td>
                          <td>-{record.deducted}</td>
                          <td>{left}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="no-record">暂无消费记录</p>
              )}
            </div>
          );
        })}

        <div className="footer">
          一品食府 | HISEM GROUP
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          setTimeout(function() {
            var btn = document.createElement('button');
            btn.textContent = '🖨️ 打印 / 保存 PDF';
            btn.style.cssText = 'display:block;position:fixed;bottom:30px;right:30px;background:#1a1a1a;color:#fff;border:none;padding:12px 24px;font-size:14px;cursor:pointer;border-radius:4px;z-index:9999;';
            btn.addEventListener('click', function() { window.print(); });
            document.body.appendChild(btn);
          }, 100);
        `}} />
      </body>
    </html>
  );
}
