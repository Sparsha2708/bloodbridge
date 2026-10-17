import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TopBar from '../components/TopBar'
import Avatar from '../components/Avatar'
import StatusPill from '../components/StatusPill'
import DonorCard from '../components/DonorCard'

export default function RequestDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [req, setReq] = useState(null)
  const [parts, setParts] = useState([])
  const [matches, setMatches] = useState([])
  const [ext, setExt] = useState(''); const [err, setErr] = useState(''); const [copied, setCopied] = useState('')

  const load = useCallback(async () => {
    const { data: r } = await supabase.from('blood_requests').select('*,hospitals(name,city)').eq('id', id).single()
    setReq(r)
    const { data: p } = await supabase.from('request_participants').select('*,donors(full_name,blood_group,area,id_verified)').eq('request_id', id).order('created_at')
    setParts(p || [])
    if (r) {
      const taken = (p || []).map((x) => x.donor_id).filter(Boolean)
      const { data: m } = await supabase.from('donors').select('user_id,full_name,blood_group,area,city,id_verified').eq('blood_group', r.blood_group).eq('available', true).limit(20)
      setMatches((m || []).filter((d) => !taken.includes(d.user_id)))
    }
  }, [id])
  useEffect(() => { load() }, [load])

  const run = async (q) => { setErr(''); const { error } = await q; error ? setErr(error.message) : load() }
  const link = (t) => `${window.location.origin}/invite/${t}`
  const copy = async (t) => { await navigator.clipboard.writeText(link(t)); setCopied(t); setTimeout(() => setCopied(''), 1500) }
  const wa = (p) => `https://wa.me/?text=${encodeURIComponent(`Hi ${p.invited_name}, we urgently need ${req.blood_group} blood at ${req.hospitals.name}. Please confirm here: ${link(p.invite_token)}`)}`
  async function addExternal(e) { e.preventDefault(); if (!ext.trim()) return; await run(supabase.from('request_participants').insert({ request_id: id, source: 'external', invited_name: ext.trim() })); setExt('') }

  if (!req) return <><TopBar title="Request" /><p className="muted">Loading…</p></>
  const open = req.status === 'open'
  return (
    <>
      <TopBar title="Request details" />
      <div className="hero">
        <h1>{req.blood_group} needed · {req.patient_ref}</h1>
        <p>{req.hospitals.name}, {req.hospitals.city} · {req.urgency}</p>
        <p>{req.units_fulfilled} of {req.units_required} donors have donated</p>
        <div className="track"><i style={{ width: `${Math.min(100, (req.units_fulfilled / req.units_required) * 100)}%` }} /></div>
      </div>
      {err && <p className="err">{err}</p>}

      <h2>Donors on this request</h2>
      {parts.length === 0 && <p className="muted">No donors yet. Invite from the platform below, or add someone you found elsewhere.</p>}
      {parts.map((p) => (
        <div key={p.id} className="card shadow">
          <div className="person">
            <Avatar name={p.donors?.full_name || p.invited_name} />
            <div className="who"><b>{p.donors?.full_name || p.invited_name}</b>
              <span className="loc" style={{ display: 'block' }}>{p.donor_id ? `${p.donors?.blood_group || ''}${p.donors?.area ? ' · ' + p.donors.area : ''}` : 'Found outside · hasn’t joined yet'}</span></div>
            <StatusPill status={p.status} />
          </div>
          {!p.donor_id && <div className="cardfoot"><a className="btn sm" href={wa(p)} target="_blank" rel="noreferrer">Send on WhatsApp</a><button className="btn sm out" onClick={() => copy(p.invite_token)}>{copied === p.invite_token ? 'Copied' : 'Copy link'}</button></div>}
          {p.donor_id && <div className="cardfoot"><button className="link" onClick={() => nav(`/chat/${id}`)}>Open chat</button>{p.status === 'invited' && <button className="link muted" onClick={() => run(supabase.from('request_participants').delete().eq('id', p.id))}>Remove</button>}</div>}
          {!p.donor_id && p.status === 'invited' && <button className="link muted" onClick={() => run(supabase.from('request_participants').delete().eq('id', p.id))}>Remove</button>}
        </div>
      ))}

      {open && <>
        <h2>Add a donor you found elsewhere</h2>
        <form onSubmit={addExternal}>
          <input value={ext} onChange={(e) => setExt(e.target.value)} placeholder="Donor’s name" />
          <button className="btn">Create invite link</button>
        </form>
        <p className="muted small">They open the link, sign up and join, so everything stays on this request.</p>
        <h2>Available {req.blood_group} donors</h2>
        {matches.length === 0 && <p className="muted">No available matches yet.</p>}
        {matches.map((d) => <DonorCard key={d.user_id} d={d} action={<button className="btn sm" onClick={() => run(supabase.from('request_participants').insert({ request_id: id, donor_id: d.user_id, source: 'platform', invited_name: d.full_name }))}>Invite</button>} />)}
        <button className="btn out" style={{ marginTop: 28 }} onClick={() => run(supabase.from('blood_requests').update({ status: 'cancelled' }).eq('id', id))}>Cancel this request</button>
      </>}
    </>
  )
}
