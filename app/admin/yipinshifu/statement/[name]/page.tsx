import { supabaseAdmin } from '@/lib/supabaseAdmin';
import PrintButton from './PrintButton';

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
  const totalPages = customerCards.length;

  return (
    <html lang="zh">
      <head>
        <meta charSet="utf-8" />
        <title>{name} 对账单</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 40px; }
          @media print {
            body { padding: 15px; background: #fff !important; color: #1a1a1a !important; }
            .no-print { display: none !important; }
            .main-header { display: none !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .card-block { page-break-after: always; }
            .card-block:last-of-type { page-break-after: avoid; }
          }
        `}</style>
      </head>
      <body>
        {/* 屏幕显示用的大抬头（打印时隐藏） */}
        <div className="main-header" style={{display:'flex',alignItems:'center',gap:'20px',borderBottom:'2px solid #1a1a1a',paddingBottom:'20px',marginBottom:'24px'}}>
          <img src="/logo.png" alt="一品食府" style={{width:'70px',height:'70px',objectFit:'contain'}} />
          <div>
            <div style={{fontSize:'22px',fontWeight:'700',color:'#1a1a1a'}}>一品食府</div>
            <div style={{fontSize:'13px',color:'#666',marginTop:'4px'}}>会员对账单</div>
          </div>
          <div style={{marginLeft:'auto',textAlign:'right',fontSize:'12px',color:'#666'}}>
            <div>生成日期：{today}</div>
            <PrintButton name={name} today={today} />
          </div>
        </div>

        {/* 屏幕显示用的客户信息（打印时隐藏） */}
        <div className="main-header" style={{marginBottom:'24px'}}>
          <div style={{fontSize:'18px',fontWeight:'700',color:'#1a1a1a',marginBottom:'6px'}}>客户姓名：{name}</div>
          <div style={{fontSize:'13px',color:'#444'}}>会员状态：✓ 会员（持有餐次卡）</div>
        </div>

        {/* 每张卡 */}
        {customerCards.map((card, index) => {
          const stats = cardStats(card);
          let left = Number(card.total_meals);
          const isLast = index === customerCards.length - 1;
          const refundCards = customerCards.filter(c => cardStats(c).left > 0);
          const totalRefund = refundCards.reduce((sum, c) => sum + cardStats(c).left * 30, 0);

          return (
            <div key={card.id} className="card-block" style={{marginBottom:'24px',border:'1px solid #ddd'}}>
              {/* 每页打印抬头 */}
              <div style={{display:'flex',alignItems:'center',gap:'16px',borderBottom:'1px solid #ddd',padding:'12px 14px'}}>
                <img src="/logo.png" alt="一品食府" style={{width:'45px',height:'45px',objectFit:'contain'}} />
                <div>
                  <div style={{fontSize:'16px',fontWeight:'700',color:'#1a1a1a'}}>一品食府 · 会员对账单</div>
                  <div style={{fontSize:'11px',color:'#666',marginTop:'2px'}}>生成日期：{today}</div>
                </div>
                <div style={{marginLeft:'auto',fontSize:'11px',color:'#666'}}>
                  第 {index + 1} 页 / 共 {totalPages} 页
                </div>
              </div>

              {/* 客户信息 */}
              <div style={{padding:'10px 14px',borderBottom:'1px solid #ddd',fontSize:'13px'}}>
                <span style={{fontWeight:'700',color:'#1a1a1a'}}>客户姓名：{name}</span>
                <span style={{marginLeft:'24px',color:'#444'}}>会员状态：✓ 会员（持有餐次卡）</span>
              </div>

              {/* 卡标题 */}
              <div style={{background:'#f5f0dc',padding:'10px 14px',fontSize:'14px',fontWeight:'700',color:'#1a1a1a',borderBottom:'1px solid #ddd'}}>
                第 {card.card_no} 张卡
              </div>

              {/* 卡信息 */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',padding:'12px 14px',fontSize:'13px',borderBottom:'1px solid #eee'}}>
                <div><span style={{color:'#666'}}>购买日期：</span><strong style={{color:'#1a1a1a'}}>{card.purchase_date}</strong></div>
                <div><span style={{color:'#666'}}>付款方式：</span><strong style={{color:'#1a1a1a'}}>{card.payment_method}</strong></div>
                <div><span style={{color:'#666'}}>金额：</span><strong style={{color:'#1a1a1a'}}>AED {Number(card.price_aed).toFixed(0)}</strong></div>
                <div><span style={{color:'#666'}}>总次数：</span><strong style={{color:'#1a1a1a'}}>{card.total_meals}</strong></div>
                <div><span style={{color:'#666'}}>已用：</span><strong style={{color:'#1a1a1a'}}>{stats.used}</strong></div>
                <div><span style={{color:'#666'}}>剩余：</span><strong style={{color:'#1a1a1a'}}>{stats.left}</strong></div>
              </div>

              {/* 消费记录 */}
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

              {/* 最后一页加退款计算 */}
              {isLast && refundCards.length > 0 && (
                <>
                  <div style={{background:'#f5f0dc',padding:'10px 14px',fontSize:'14px',fontWeight:'700',color:'#1a1a1a',borderTop:'1px solid #ddd',borderBottom:'1px solid #ddd',marginTop:'8px'}}>
                    退款计算
                  </div>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
                    <thead>
                      <tr style={{background:'#dcc896'}}>
                        <th style={{padding:'7px 12px',textAlign:'left',fontWeight:'600',color:'#1a1a1a'}}>卡号</th>
                        <th style={{padding:'7px 12px',textAlign:'left',fontWeight:'600',color:'#1a1a1a'}}>剩余次数</th>
                        <th style={{padding:'7px 12px',textAlign:'left',fontWeight:'600',color:'#1a1a1a'}}>单价</th>
                        <th style={{padding:'7px 12px',textAlign:'left',fontWeight:'600',color:'#1a1a1a'}}>应退金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refundCards.map(c => {
                        const s = cardStats(c);
                        return (
                          <tr key={c.id} style={{borderBottom:'1px solid #f0f0f0'}}>
                            <td style={{padding:'6px 12px',color:'#1a1a1a'}}>第 {c.card_no} 张卡</td>
                            <td style={{padding:'6px 12px',color:'#1a1a1a'}}>{s.left} 次</td>
                            <td style={{padding:'6px 12px',color:'#1a1a1a'}}>AED 30 / 次</td>
                            <td style={{padding:'6px 12px',color:'#1a1a1a'}}>AED {s.left * 30}</td>
                          </tr>
                        );
                      })}
                      <tr style={{background:'#f5f0dc',fontWeight:'700'}}>
                        <td colSpan={3} style={{padding:'8px 12px',color:'#1a1a1a'}}>合计应退</td>
                        <td style={{padding:'8px 12px',color:'#1a1a1a'}}>AED {totalRefund}</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
            </div>
          );
        })}

      </body>
    </html>
  );
}
