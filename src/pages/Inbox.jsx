import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import Avatar from '../components/Avatar'
import Drop from '../components/Drop'

// One conversation per request. Part 3 replaces the preview text with the latest chat message.
export default function Inbox() {
  const { user, profile } = useAuth()
  const [rows, setRows] = useState(null)
  useEffect(() => {
    if (!profile) return
    const q = profile.role === 'donor'
      ? supabase.from('request_participants').select('blood_requests(id,blood_group,hospitals(name))').eq('donor_id', user.id).in('status', ['accepted', 'arrived'])
      : supabase.from('blood_requests').select('id,blood_group,patient_ref,hospitals(name)').eq('attender_id', user.id).eq('status', 'open')
    q.then(({ data }) => setRows((data || []).map((r) => r.blood_requests || r)))
  }, [profile, user.id])
  return (
    <>
      <h1>Inbox</h1><p className="sub">Chat with donors and attenders on each request.</p>
      {rows === null && <p className="muted">Loading…</p>}
      {rows?.length === 0 && <p className="muted">No active conversations. They appear once a donor accepts a request.</p>}
      {rows?.map((r) => (
        <Link key={r.id} to={`/chat/${r.id}`} className="card shadow person">
          <Avatar name={r.hospitals.name} /><div className="who"><b>{r.hospitals.name}</b><span className="loc">Tap to open chat</span></div><Drop group={r.blood_group} />
        </Link>
      ))}
    </>
  )
}
