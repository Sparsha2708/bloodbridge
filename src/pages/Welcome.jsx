import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import Drop from '../components/Drop'
import Icon from '../components/Icon'

const SLIDES = [
  { icon: 'search', title: 'Find donors by blood type', text: 'Search registered donors near the hospital, or bring in someone you already know.' },
  { icon: 'check', title: 'See who is really coming', text: 'Every donor accepts a specific request, so you always know who is on the way.' },
  { icon: 'hospital', title: 'Hospital stays in the loop', text: 'The hospital confirms arrival and donation, and makes the final eligibility call.' },
]

export default function Welcome() {
  const { user } = useAuth()
  const [splash, setSplash] = useState(true)
  const [i, setI] = useState(0)
  useEffect(() => { const t = setTimeout(() => setSplash(false), 1200); return () => clearTimeout(t) }, [])
  if (user) return <Navigate to="/home" replace />
  if (splash) return <div className="splash"><div style={{ margin: '0 auto' }}><svg width="72" height="72" viewBox="0 0 24 24"><path d="M12 2C12 2 5 9.5 5 15a7 7 0 0 0 14 0c0-5.500-7-13-7-13z" fill="#fff" /><path d="M12 17.500l-2.800-2.700a1.700 1.700 0 0 1 2.800-2 1.700 1.700 0 0 1 2.800 2z" fill="#e5174f" /></svg></div><b>BloodBridge</b></div>
  const last = i === SLIDES.length
  const s = SLIDES[i]
  return (
    <div className="onb">
      <div className="art"><div className="bubble">{last ? <Drop group="+" size={110} /> : <Icon n={s.icon} className="" />}</div></div>
      <div className="panel">
        {last ? (
          <>
            <h1>Welcome to BloodBridge</h1>
            <p className="sub">You find the donor. We make the interaction verifiable.</p>
            <Link className="btn" to="/signup">Sign up</Link>
            <Link className="btn out" to="/login">Sign in</Link>
          </>
        ) : (
          <>
            <h1>{s.title}</h1><p className="sub">{s.text}</p>
            <div className="row">
              <button className="link muted" onClick={() => setI(SLIDES.length)}>Skip</button>
              <div className="dots">{SLIDES.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
              <button className="next" onClick={() => setI(i + 1)} aria-label="Next"><Icon n="chev" /></button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
