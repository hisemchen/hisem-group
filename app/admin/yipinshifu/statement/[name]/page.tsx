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
  const left = Number(card.total_meals || 0) - used;
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
          body { font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif; color: #1a1a1a !important; background: #fff !important; padding: 40px; }
          @media print {
            body { padding: 15px; background: #fff !important; color: #1a1a1a !important; }
            .no-print { display: none !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color: #1a1a1a !important; }
          }
        `}</style>
      </head>
      <body>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:'20px',borderBottom:'2px solid #1a1a1a',paddingBottom:'20px',marginBottom:'24px'}}>
          <img src="/logo.png" alt="一品食府" style={{width:'70px',height:'70px',objectFit:'contain'}} />
          <div>
            <div style={{fontSize:'22px',fontWeight:'700',color:'#1a1a1a'}}>一品食府</div>
            <div style={{fontSize:'13px',color:'#666',marginTop:'4px'}}>会员对账单</div>
          </div>
          <div style={{marginLeft:'auto',textAlign:'right',fontSize:'12px',color:'#666'}}>
            生成日期：{today}
          </div>
        </div>

        {/* Customer Info */}
        <div style={{marginBottom:'24px'}}>
          <div style={{fontSize:'18px',fontWeight:'700',color:'#1a1a1a',marginBottom:'6px'}}>客户姓名：{name}</div>
          <div style={{fontSize:'13px',color:'#444'}}>会员状态：{isMember ? '✓ 会员（持有餐次卡）' : '非会员'}</div>
        </div>

        {/* Cards */}
        {customerCards.map((card) => {
          const stats = cardStats(card);
          let left = Number(card.total_meals);
          return (
            <div key={card.id} style={{marginBottom:'24px',border:'1px solid #ddd'}}>
              <div style={{background:'#f5f0dc',padding:'10px 14px',fontSize:'14px',fontWeight:'700',color:'#1a1a1a',borderBottom:'1px solid #ddd'}}>
                第 {card.card_no} 张卡
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',padding:'12px 14px',fontSize:'13px',borderBottom:'1px solid #eee'}}>
                <div><span style={{color:'#666'}}>购买日期：</span><strong style={{color:'#1a1a1a'}}>{card.purchase_date}</strong></div>
                <div><span style={{color:'#666'}}>付款方式：</span><strong style={{color:'#1a1a1a'}}>{card.payment_method}</strong></div>
                <div><span style={{color:'#666'}}>金额：</span><strong style={{color:'#1a1a1a'}}>AED {Number(card.price_aed).toFixed(0)}</strong></div>
                <div><span style={{color:'#666'}}>总次数：</span><strong style={{color:'#1a1a1a'}}>{card.total_meals}</strong></div>
                <div><span style={{color:'#666'}}>已用：</span><strong style={{color:'#1a1a1a'}}>{stats.used}</strong></div>
                <div><span style={{color:'#666'}}>剩余：</span><strong style={{color:'#1a1a1a'}}>{stats.left}</strong></div>
              </div>
              {card.records.length > 0 ? (
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
                  <thead>
                    <tr style={{background:'#dcc896'}}>
                      <th style={{padding:'7px 12px',textAlign:'left',fontWeight:'600',color:'#1a1a1a'}}>消费日期</th>
                      <th style={{padding:'7px 12px',textAlign:'left',fontWeight:'600',color:'#1a1a1a'}}>餐别</th>
                      <th style={{padding:'7px 12px',textAlign:'left',fontWeight:'600',color:'#1a1a1a'}}>扣次</th>
                      <th style={{padding:'7px 12px',textAlign:'left',fontWeight:'600',color:'#1a1a1a'}}>扣后剩余</th>
                    </tr>
                  </thead>
                  <tbody>
                    {card.records.map((record) => {
                      left -= Number(record.deducted || 0);
                      return (
                        <tr key={record.id} style={{borderBottom:'1px solid #f0f0f0'}}>
                          <td style={{padding:'6px 12px',color:'#1a1a1a'}}>{record.meal_date}</td>
                          <td style={{padding:'6px 12px',color:'#1a1a1a'}}>{record.meal_type}</td>
                          <td style={{padding:'6px 12px',color:'#1a1a1a'}}>-{record.deducted}</td>
                          <td style={{padding:'6px 12px',color:'#1a1a1a'}}>{left}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{padding:'10px 14px',fontSize:'12px',color:'#999'}}>暂无消费记录</div>
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div style={{marginTop:'40px',borderTop:'1px solid #ddd',paddingTop:'12px',textAlign:'center',fontSize:'11px',color:'#999'}}>
          一品食府 | HISEM GROUP
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          setTimeout(function() {
            var btn = document.createElement('button');
            btn.textContent = '🖨️ 打印 / 保存 PDF';
            btn.className = 'no-print';
            btn.style.cssText = 'position:fixed;bottom:30px;right:30px;background:#1a1a1a;color:#fff;border:none;padding:12px 24px;font-size:14px;cursor:pointer;border-radius:4px;z-index:9999;';
            btn.addEventListener('click', function() { window.print(); });
            document.body.appendChild(btn);
          }, 100);
        `}} />
      </body>
    </html>
  );
}
