import { useState } from 'react'
import { supabase, BLOOD_GROUPS } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function DonorProfileForm({ donor, onSaved }) {
  const { user, profile } = useAuth()
  const [f, setF] = useState({
    blood_group: donor?.blood_group || user?.user_metadata?.blood_group || 'O+', city: donor?.city || 'Bengaluru',
    area: donor?.area || '', last_donated: donor?.last_donated || '', available: donor?.available ?? true,
  })
  const [msg, setMsg] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  async function save(e) {
    e.preventDefault(); setMsg('')
    const row = { ...f, last_donated: f.last_donated || null }
    const { error } = donor
      ? await supabase.from('donors').update(row).eq('user_id', user.id)
      : await supabase.from('donors').insert({ ...row, user_id: user.id, full_name: profile.full_name })
    if (error) return setMsg(error.message)
    setMsg('Saved'); onSaved?.()
  }

  return (
    <form onSubmit={save}>
      <label>Blood group<select value={f.blood_group} onChange={set('blood_group')}>{BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}</select></label>
      <label>City<input required value={f.city} onChange={set('city')} /></label>
      <label>Area (approximate)<input value={f.area} onChange={set('area')} placeholder="e.g. Yelahanka" /></label>
      <label>Last donated<input type="date" value={f.last_donated} onChange={set('last_donated')} /></label>
      <label className="check"><input type="checkbox" checked={f.available} onChange={set('available')} /> I’m available to donate right now</label>
      <p className="muted small">Attenders only see your area. The hospital decides final eligibility.</p>
      <button className="btn">Save profile</button>{msg && <p className="muted small">{msg}</p>}
    </form>
  )
}
