'use client';

import { useRef, useState } from 'react';

export default function RefundPaidButton({
  name,
  paidAt,
  receiptUrl,
}: {
  name: string;
  paidAt: string | null;
  receiptUrl: string | null;
}) {
  const [paid, setPaid] = useState<string | null>(paidAt);
  const [receipt, setReceipt] = useState<string | null>(receiptUrl);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const buttonStyle: React.CSSProperties = {
    background: '#c9a227',
    color: '#fff',
    border: 'none',
    padding: '6px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
      {/* 付款凭证部分 */}
      {receipt && (
        <span style={{ color: '#2e7d32', fontWeight: 700, fontSize: '13px' }}>
          ✓ 已上传凭证
          
            className="no-print"
            href={receipt}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: '8px', color: '#1a6bb0', fontWeight: 400 }}
          >
            查看
          </a>
        </span>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploading(true);
          const fd = new FormData();
          fd.append('file', file);
          fd.append('name', name);
          const res = await fetch('/api/yipinshifu/refund-receipt', {
            method: 'POST',
            body: fd,
          });
          setUploading(false);
          e.target.value = '';
          if (res.ok) {
            const data = await res.json();
            setReceipt(data.url);
          } else {
            alert('上传失败，请重试');
          }
        }}
      />
      <button
        className="no-print"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
        style={{ ...buttonStyle, background: '#6b6b6b' }}
      >
        {uploading ? '上传中...' : receipt ? '重新上传凭证' : '上传付款凭证'}
      </button>

      {/* 标记已付部分 */}
      {paid ? (
        <span style={{ color: '#2e7d32', fontWeight: 700, fontSize: '13px' }}>
          ✓ 退款已付（{paid.slice(0, 10)}）
        </span>
      ) : (
        <button
          className="no-print"
          disabled={loading}
          onClick={async () => {
            if (!confirm('确认标记该客户退款已付？')) return;
            setLoading(true);
            const res = await fetch('/api/yipinshifu/refund-paid', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name }),
            });
            setLoading(false);
            if (res.ok) {
              setPaid(new Date().toISOString());
            } else {
              alert('操作失败，请重试');
            }
          }}
          style={buttonStyle}
        >
          {loading ? '处理中...' : '标记退款已付'}
        </button>
      )}
    </div>
  );
}
