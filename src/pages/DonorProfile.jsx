import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import TopBar from '../components/TopBar'
import Avatar from '../components/Avatar'

export default function DonorProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const [d, setD] = useState(null)
  const [reqs, setReqs] = useState([])
  const [rid, setRid] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from('donors').select('*').eq('user_id', id).single().then(({ data }) => setD(data))
    supabase.from('blood_requests').select('id,patient_ref,blood_group,hospitals(name)').eq('attender_id', user.id).eq('status', 'open')
      .then(({ data }) => { setReqs(data || []); if (data?.[0]) setRid(data[0].id) })
  }, [id, user.id])

  async function invite() {
    setMsg('')
    const { error } = await supabase.from('request_participants').insert({ request_id: rid, donor_id: id, source: 'platform', invited_name: d.full_name })
    setMsg(error ? (error.code === '23505' ? 'Already invited to this request.' : error.message) : 'Invite sent.')
  }

  if (!d) return <><TopBar title="Profile" /><p className="muted">Loading…</p></>
  return (
    <>
      <TopBar title="Profile" />
      <div className="pcenter"><Avatar name={d.full_name} size="lg" /><h1>{d.full_name}</h1>
        <p className="sub">{d.last_donated ? `Last donation: ${new Date(d.last_donated).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}` : 'No donation recorded yet'}</p></div>
      <div className="stats">
        <div className="stat"><small>Blood type</small><b>{d.blood_group}</b></div>
        <div className="stat"><small>Area</small><b style={{ fontSize: '.8rem' }}>{d.area || d.city}</b></div>
        <div className="stat"><small>ID</small><b style={{ fontSize: '.8rem' }}>{d.id_verified ? 'Verified' : 'Not yet'}</b></div>
      </div>
      <p className="muted small">The hospital makes the final decision on whether this donor can donate.</p>
      {reqs.length === 0
        ? <p className="muted">Create an open request first, then invite this donor to it.</p>
        : <>
            <label>Invite to request<select value={rid} onChange={(e) => setRid(e.target.value)}>{reqs.map((r) => <option key={r.id} value={r.id}>{r.blood_group} · {r.patient_ref} · {r.hospitals.name}</option>)}</select></label>
            <button className="btn" onClick={invite}>Invite donor</button>
          </>}
      {msg && <p className="muted small" style={{ textAlign: 'center' }}>{msg}</p>}
    </>
  )
}
