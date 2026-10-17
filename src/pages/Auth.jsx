import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase, BLOOD_GROUPS } from '../lib/supabase'
import TopBar from '../components/TopBar'

function Google({ next }) {
  const go = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + (next || '/') } })
  return <><div className="or">Or</div><button type="button" className="social" onClick={go} aria-label="Continue with Google">G</button></>
}

export function SignIn() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true)
    const { error } = await supabase.auth.signInWithPassword(f)
    setBusy(false); error ? setErr(error.message) : nav(next)
  }
  return (
    <form className="screen" onSubmit={submit}>
      <TopBar title="" />
      <h1>Sign in to your account</h1><p className="sub">Welcome back. Your requests are waiting.</p>
      <input type="email" required placeholder="Email address" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <label style={{ margin: 0 }} />
      <input type="password" required placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      <div className="secrow" style={{ margin: '10px 0' }}><span /><Link to="/forgot" className="link">Forgot password?</Link></div>
      {err && <p className="err">{err}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Please wait…' : 'Sign in'}</button>
      <Google next={next} />
      <p className="foot">Don’t have an account? <Link to={`/signup${params.get('role') ? '?role=' + params.get('role') : ''}${next !== '/' ? (params.get('role') ? '&' : '?') + 'next=' + encodeURIComponent(next) : ''}`} className="link">Sign up</Link></p>
    </form>
  )
}

export function SignUp() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const [f, setF] = useState({ full_name: '', email: '', phone: '', password: '', role: params.get('role') || 'attender', blood_group: 'O+', agree: false })
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true)
    const { data, error } = await supabase.auth.signUp({ email: f.email, password: f.password,
      options: { data: { full_name: f.full_name, phone: f.phone, role: f.role, blood_group: f.blood_group } } })
    setBusy(false)
    if (error) return setErr(error.message)
    if (data.session) nav(next)
    else nav(`/verify?type=signup&email=${encodeURIComponent(f.email)}&next=${encodeURIComponent(next)}`)
  }
  return (
    <form className="screen" onSubmit={submit}>
      <TopBar title="" />
      <h1>Create your account</h1><p className="sub">It takes a minute. Donors only set up once.</p>
      <div className="seg">
        <button type="button" className={f.role === 'attender' ? 'on' : ''} onClick={() => setF({ ...f, role: 'attender' })}>I need blood</button>
        <button type="button" className={f.role === 'donor' ? 'on' : ''} onClick={() => setF({ ...f, role: 'donor' })}>I want to donate</button>
      </div>
      <label>Full name<input required value={f.full_name} onChange={set('full_name')} /></label>
      <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
      <label>Phone<input required inputMode="tel" value={f.phone} onChange={set('phone')} /></label>
      <label>Password<input type="password" required minLength={6} value={f.password} onChange={set('password')} /></label>
      {f.role === 'donor' && <label>Blood group<select value={f.blood_group} onChange={set('blood_group')}>{BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}</select></label>}
      <label className="check" style={{ marginTop: 14 }}><input type="checkbox" required checked={f.agree} onChange={set('agree')} /> I agree to the terms &amp; conditions</label>
      {err && <p className="err">{err}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Please wait…' : 'Sign up'}</button>
      <Google next={next} />
      <p className="foot">Already have an account? <Link to="/login" className="link">Sign in</Link></p>
    </form>
  )
}

export function Forgot() {
  const nav = useNavigate()
  const [email, setEmail] = useState(''); const [err, setErr] = useState('')
  async function submit(e) {
    e.preventDefault(); setErr('')
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    error ? setErr(error.message) : nav(`/verify?type=recovery&email=${encodeURIComponent(email)}`)
  }
  return (
    <form className="screen" onSubmit={submit}>
      <TopBar title="" />
      <h1>Forgot password</h1><p className="sub">Enter your email and we’ll send you a code.</p>
      <input type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
      {err && <p className="err">{err}</p>}
      <button className="btn">Send code</button>
      <p className="foot">Remembered it? <Link to="/login" className="link">Sign in</Link></p>
    </form>
  )
}

// NOTE: 6-digit codes need the Supabase email templates to include {{ .Token }}.
export function Verify() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const email = params.get('email'); const type = params.get('type') || 'signup'; const next = params.get('next') || '/'
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [err, setErr] = useState(''); const [wait, setWait] = useState(30)
  const refs = useRef([])
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t) }, [wait])
  const onChange = (i, v) => {
    v = v.replace(/\D/g, '').slice(-1); const c = [...code]; c[i] = v; setCode(c)
    if (v && i < 5) refs.current[i + 1].focus()
  }
  const onKey = (i, e) => { if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1].focus() }
  async function verify() {
    setErr('')
    const { error } = await supabase.auth.verifyOtp({ email, token: code.join(''), type })
    if (error) return setErr(error.message)
    nav(type === 'recovery' ? '/reset' : next)
  }
  async function resend() {
    setWait(30)
    type === 'recovery' ? await supabase.auth.resetPasswordForEmail(email) : await supabase.auth.resend({ type: 'signup', email })
  }
  return (
    <div className="screen">
      <TopBar title="" />
      <h1>Enter your verification code</h1><p className="sub">We sent a 6-digit code to {email}.</p>
      <div className="otp">{code.map((c, i) => <input key={i} ref={(el) => (refs.current[i] = el)} inputMode="numeric" aria-label={`Digit ${i + 1}`} value={c} onChange={(e) => onChange(i, e.target.value)} onKeyDown={(e) => onKey(i, e)} />)}</div>
      <p className="foot" style={{ margin: '6px 0' }}>{wait > 0 ? `Resend code in ${wait} sec` : <button className="link" onClick={resend}>Resend code</button>}</p>
      {err && <p className="err" style={{ textAlign: 'center' }}>{err}</p>}
      <button className="btn" disabled={code.join('').length < 6} onClick={verify}>Verify</button>
    </div>
  )
}

export function Reset() {
  const nav = useNavigate()
  const [p, setP] = useState(''); const [c, setC] = useState(''); const [err, setErr] = useState('')
  async function submit(e) {
    e.preventDefault(); setErr('')
    if (p !== c) return setErr('Passwords don’t match.')
    const { error } = await supabase.auth.updateUser({ password: p })
    error ? setErr(error.message) : nav('/home')
  }
  return (
    <form className="screen" onSubmit={submit}>
      <TopBar title="" />
      <h1>Reset your password</h1><p className="sub">Choose a new password for your account.</p>
      <input type="password" required minLength={6} placeholder="New password" value={p} onChange={(e) => setP(e.target.value)} />
      <label style={{ margin: 0 }} />
      <input type="password" required placeholder="Confirm password" value={c} onChange={(e) => setC(e.target.value)} />
      {err && <p className="err">{err}</p>}
      <button className="btn">Reset password</button>
    </form>
  )
}
