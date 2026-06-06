import { supabaseAdmin } from '@/lib/supabaseAdmin';

type GuestRecord = {
  id: string;
  customer_name: string;
  meal_date: string;
  meal_type: string;
  price_aed: number;
  payment_status: string;
};

export default async function GuestStatementPage({
  params,
}: {
  params: { name: string };
}) {
  const name = decodeURIComponent(params.name);
  const today = new Date().toISOString().slice(0, 10);

  const { data: records } = await supabaseAdmin
    .from('yipin_guest_records')
    .select('*')
    .eq('customer_name', name)
    .order('meal_date', { ascending: true });

  const guestRecords = (records || []) as GuestRecord[];
  const totalPaid = guestRecords.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + Number(r.price_aed || 35), 0);
  const totalUnpaid = guestRecords.filter(r => r.payment_status === 'unpaid').reduce((sum, r) => sum + Number(r.price_aed || 35), 0);
  const total = totalPaid + totalUnpaid;

  return (
    <html lang="zh">
      <head>
        <meta charSet="utf-8" />
        <title>{name} 消费对账单</title>
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
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
          th { background: #dcc896; padding: 8px 14px; text-align: left; font-weight: 600; }
          td { padding: 7px 14px; border-bottom: 1px solid #f0f0f0; }
          .badge-paid { display: inline-block; background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
          .badge-unpaid { display: inline-block; background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
          .summary { margin-top: 16px; border: 1px solid #ddd; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 14px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
          .summary-row:last-child { border-bottom: none; }
          .summary-total { background: #f5f0dc; font-weight: 700; }
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
            <p>消费对账单</p>
          </div>
          <div className="meta">
            <p>生成日期：{today}</p>
          </div>
        </div>

        <div className="customer-info">
          <h2>客户姓名：{name}</h2>
          <p>会员状态：散客（非会员）</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>消费日期</th>
              <th>餐别</th>
              <th>金额</th>
              <th>付款状态</th>
            </tr>
          </thead>
          <tbody>
            {guestRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.meal_date}</td>
                <td>{record.meal_type}</td>
                <td>AED {Number(record.price_aed).toFixed(0)}</td>
                <td>
                  {record.payment_status === 'paid'
                    ? <span className="badge-paid">✓ 已付款</span>
                    : <span className="badge-unpaid">✗ 未付款</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="summary">
          <div className="summary-row">
            <span>已付款合计</span>
            <span>AED {totalPaid.toFixed(0)}</span>
          </div>
          <div className="summary-row">
            <span>未付款合计</span>
            <span>AED {totalUnpaid.toFixed(0)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>总计</span>
            <span>AED {total.toFixed(0)}</span>
          </div>
        </div>

        <div className="footer">
          一品食府 | HISEM GROUP
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('DOMContentLoaded', function() {
            var btn = document.createElement('button');
            btn.className = 'print-btn';
            btn.textContent = '🖨️ 打印 / 保存 PDF';
            btn.onclick = function() { window.print(); };
            document.body.appendChild(btn);
          });
        `}} />
      </body>
    </html>
  );
}
