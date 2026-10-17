import { useEffect, useState } from 'react'
import { supabase, BLOOD_GROUPS } from '../lib/supabase'
import TopBar from '../components/TopBar'
import DonorCard from '../components/DonorCard'
import Icon from '../components/Icon'

export default function FindDonors() {
  const [donors, setDonors] = useState(null)
  const [q, setQ] = useState(''); const [bg, setBg] = useState('All')
  useEffect(() => { supabase.from('donors').select('user_id,full_name,blood_group,area,city,id_verified').eq('available', true).limit(100).then(({ data }) => setDonors(data || [])) }, [])
  const shown = (donors || []).filter((d) => (bg === 'All' || d.blood_group === bg) && (`${d.full_name} ${d.area || ''} ${d.city}`).toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <TopBar title="Find donor" />
      <div className="search"><Icon n="search" /><input placeholder="Search by name or area" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="chips">{['All', ...BLOOD_GROUPS].map((b) => <button key={b} className={`chip ${bg === b ? 'on' : ''}`} onClick={() => setBg(b)}>{b}</button>)}</div>
      {donors === null && <p className="muted">Loading…</p>}
      {donors && shown.length === 0 && <p className="muted">No available donors match. Try another blood group, or add a donor you found elsewhere from a request.</p>}
      {shown.map((d) => <DonorCard key={d.user_id} d={d} to={`/donors/${d.user_id}`} />)}
    </>
  )
}
