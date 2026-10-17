import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase, BLOOD_GROUPS } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import TopBar from '../components/TopBar'

export default function CreateRequest() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [hospitals, setHospitals] = useState([])
  const [f, setF] = useState({ hospital_id: params.get('hospital') || '', patient_ref: '', blood_group: 'B+', units_required: 2, urgency: 'urgent', notes: '' })
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  useEffect(() => { supabase.from('hospitals').select('*').order('name').then(({ data }) => {
    setHospitals(data || []); setF((p) => ({ ...p, hospital_id: p.hospital_id || data?.[0]?.id || '' }))
  }) }, [])

  async function submit(e) {
    e.preventDefault(); setErr('')
    const { data, error } = await supabase.from('blood_requests').insert({ ...f, units_required: Number(f.units_required), attender_id: user.id }).select().single()
    error ? setErr(error.message) : nav(`/request/${data.id}`, { replace: true })
  }

  return (
    <form onSubmit={submit}>
      <TopBar title="Post a request" />
      <label>Patient reference<input required value={f.patient_ref} onChange={set('patient_ref')} placeholder="Initials or ward/bed, not full name" /></label>
      <label>Blood group</label>
      <div className="bgrid">{BLOOD_GROUPS.map((b) => <button type="button" key={b} className={`bg ${f.blood_group === b ? 'on' : ''}`} onClick={() => setF({ ...f, blood_group: b })}>{b}</button>)}</div>
      <label>Donors needed: {f.units_required}</label>
      <input type="range" min="1" max="10" value={f.units_required} onChange={set('units_required')} />
      <label>Hospital<select required value={f.hospital_id} onChange={set('hospital_id')}>{hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}, {h.city}</option>)}</select></label>
      <label>How urgent?<select value={f.urgency} onChange={set('urgency')}><option value="critical">Critical (within hours)</option><option value="urgent">Urgent (today)</option><option value="planned">Planned (within days)</option></select></label>
      <label>Notes for donors<textarea rows="3" value={f.notes} onChange={set('notes')} placeholder="Ward, hospital contact, timing…" /></label>
      {err && <p className="err">{err}</p>}
      <button className="btn">Send request</button>
    </form>
  )
}
