'use client';

export default function PrintButton({ name, today }: { name: string; today: string }) {
  return (
    <button
      onClick={() => {
        document.title = `${name}_对账单_${today}`;
        window.print();
      }}
      style={{marginTop:'8px',background:'#1a1a1a',color:'#fff',border:'none',padding:'8px 16px',fontSize:'13px',cursor:'pointer',borderRadius:'4px'}}>
      🖨️ 打印 / 保存 PDF
    </button>
  );
}
