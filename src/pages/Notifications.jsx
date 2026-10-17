import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import Icon from '../components/Icon'

// Derived from request activity for now. Part 4 can swap in a real `notifications` table.
export default function Notifications() {
  const { profile } = useAuth()
  const [rows, setRows] = useState(null)
  useEffect(() => {
    if (!profile) return
    supabase.from('request_participants').select('id,status,invited_name,created_at,blood_requests(blood_group,hospitals(name))').order('created_at', { ascending: false }).limit(30)
      .then(({ data }) => setRows(data || []))
  }, [profile])
  const text = (r) => {
    const h = r.blood_requests.hospitals.name; const g = r.blood_requests.blood_group
    if (profile.role === 'donor') return r.status === 'invited' ? [`New ${g} request`, `${h} needs your help.`] : [`You ${r.status.replace('_', ' ')}`, `${g} request at ${h}.`]
    return [`${r.invited_name} ${r.status === 'invited' ? 'was invited' : r.status.replace('_', ' ')}`, `${g} request at ${h}.`]
  }
  return (
    <>
      <h1>Notifications</h1><p className="sub">Recent activity on your requests.</p>
      {rows === null && <p className="muted">Loading…</p>}
      {rows?.length === 0 && <p className="muted">Nothing yet.</p>}
      {rows?.map((r) => { const [a, b] = text(r); return <div key={r.id} className="nitem"><div className="mi"><Icon n={r.status === 'invited' ? 'bell' : 'check'} /></div><div><b>{a}</b><span className="muted small">{b}</span></div></div> })}
    </>
  )
}
