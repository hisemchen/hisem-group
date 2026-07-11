'use client'
import { useState } from 'react'

export default function RefundPaidButton({
  name,
  paidAt,
}: {
  name: string
  paidAt: string | null
}) {
  const [paid, setPaid] = useState<string | null>(paidAt)
  const [loading, setLoading] = useState(false)

  if (paid) {
    return (
      <span style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '14px' }}>
        ✓ 退款已付（{paid.slice(0, 10)}）
      </span>
    )
  }

  return (
    <>
      <style>{`@media print { .refund-paid-btn { display: none } }`}</style>
      <button
        className="refund-paid-btn"
        disabled={loading}
        onClick={async () => {
          if (!confirm('确认标记该客户退款已付？')) return
          setLoading(true)
          const res = await fetch('/api/yipinshifu/refund-paid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          })
          setLoading(false)
          if (res.ok) {
            setPaid(new Date().toISOString())
          } else {
            alert('操作失败，请重试')
          }
        }}
        style={{
          background: '#c9a227',
          color: '#fff',
          border: 'none',
          padding: '6px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        {loading ? '处理中...' : '标记退款已付'}
      </button>
    </>
  )
}
