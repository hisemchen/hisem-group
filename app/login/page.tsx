'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const result = await res.json();
    if (res.ok) {
      router.push('/admin/yipinshifu');
    } else {
      setError(result.error || '用户名或密码错误');
    }
    setLoading(false);
  }

  return (
    <main style={{minHeight:'100vh',background:'#0c0a09',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:'100%',maxWidth:'380px',padding:'40px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <img src="/logo.png" alt="一品食府" style={{width:'80px',height:'80px',objectFit:'contain',margin:'0 auto'}} />
          <div style={{color:'#fff',fontSize:'22px',fontWeight:'700',marginTop:'16px'}}>一品食府会员后台</div>
          <div style={{color:'#a8a29e',fontSize:'13px',marginTop:'6px'}}>HISEM GROUP</div>
        </div>

        {error && (
          <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#fca5a5',padding:'10px 14px',fontSize:'13px',marginBottom:'20px'}}>
            {error}
          </div>
        )}

        <div style={{marginBottom:'16px'}}>
          <label style={{display:'block',color:'#a8a29e',fontSize:'13px',marginBottom:'6px'}}>用户名</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{width:'100%',background:'#1c1917',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',padding:'10px 12px',fontSize:'14px',outline:'none'}}
            placeholder="输入用户名"
          />
        </div>

        <div style={{marginBottom:'24px'}}>
          <label style={{display:'block',color:'#a8a29e',fontSize:'13px',marginBottom:'6px'}}>密码</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{width:'100%',background:'#1c1917',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',padding:'10px 12px',fontSize:'14px',outline:'none'}}
            placeholder="输入密码"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{width:'100%',background:'#d97706',color:'#fff',border:'none',padding:'12px',fontSize:'15px',fontWeight:'600',cursor:'pointer',borderRadius:'2px'}}>
          {loading ? '登录中...' : '登录'}
        </button>
      </div>
    </main>
  );
}
