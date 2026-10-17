import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import TopBar from '../components/TopBar'
import Icon from '../components/Icon'

export default function Hospitals() {
  const { profile } = useAuth()
  const [rows, setRows] = useState(null); const [q, setQ] = useState('')
  useEffect(() => { supabase.from('hospitals').select('*').order('name').then(({ data }) => setRows(data || [])) }, [])
  const shown = (rows || []).filter((h) => `${h.name} ${h.city}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <TopBar title="Blood banks & hospitals" />
      <div className="search"><Icon n="search" /><input placeholder="Search hospitals" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {rows === null && <p className="muted">Loading…</p>}
      {shown.map((h) => {
        const body = <div className="person"><div className="avatar" style={{ background: '#fde8ee', color: '#e5174f' }}><Icon n="hospital" /></div><div className="who"><b>{h.name}</b><span className="loc"><Icon n="pin" />{h.city}</span></div>{profile?.role === 'attender' && <Icon n="chev" className="muted" />}</div>
        return profile?.role === 'attender' ? <Link key={h.id} className="card shadow" to={`/request/new?hospital=${h.id}`}>{body}</Link> : <div key={h.id} className="card shadow">{body}</div>
      })}
      {profile?.role === 'attender' && <p className="muted small">Tap a hospital to start a request there.</p>}
    </>
  )
}
