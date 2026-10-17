import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import TopBar from '../components/TopBar'
import TabsRow from '../components/TabsRow'
import RequestCard from '../components/RequestCard'

export default function Requests() {
  const { user, profile } = useAuth()
  const isDonor = profile?.role === 'donor'
  const [tab, setTab] = useState('All')
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    if (!profile) return
    const { data } = isDonor
      ? await supabase.from('request_participants').select('id,status,blood_requests(id,blood_group,notes,urgency,hospitals(name,city))').eq('donor_id', user.id).order('created_at', { ascending: false })
      : await supabase.from('blood_requests').select('*,hospitals(name,city)').eq('attender_id', user.id).order('created_at', { ascending: false })
    setRows(data || [])
  }, [profile, isDonor, user.id])
  useEffect(() => { load() }, [load])

  async function respond(id, response) {
    setErr('')
    const { error } = await supabase.rpc('respond_to_request', { p_id: id, p_response: response })
    error ? setErr(error.message) : load()
  }

  const tabs = isDonor ? ['All', 'Pending', 'History'] : ['All', 'Open', 'Closed']
  const shown = (rows || []).filter((r) => {
    if (tab === 'All') return true
    if (isDonor) return tab === 'Pending' ? r.status === 'invited' : r.status !== 'invited'
    return tab === 'Open' ? r.status === 'open' : r.status !== 'open'
  })

  return (
    <>
      <TopBar title={isDonor ? 'Donate' : 'My requests'} />
      <TabsRow tabs={tabs} value={tab} onChange={setTab} />
      {err && <p className="err">{err}</p>}
      {rows === null && <p className="muted">Loading…</p>}
      {rows && shown.length === 0 && <p className="muted">Nothing here yet.</p>}
      {shown.map((r) => isDonor
        ? <RequestCard key={r.id} title={`${r.blood_requests.blood_group} needed`} place={`${r.blood_requests.hospitals.name}, ${r.blood_requests.hospitals.city}`} text={r.blood_requests.notes} group={r.blood_requests.blood_group} status={r.status}>
            {r.status === 'invited' && <><button className="btn sm" onClick={() => respond(r.id, 'accepted')}>Donate</button>{' '}<button className="btn sm out" onClick={() => respond(r.id, 'declined')}>Decline</button></>}
            {r.status === 'accepted' && <button className="btn sm out" onClick={() => respond(r.id, 'cancelled')}>Can’t make it</button>}
          </RequestCard>
        : <RequestCard key={r.id} to={`/request/${r.id}`} title={r.patient_ref} place={r.hospitals.name} text={`${r.units_fulfilled}/${r.units_required} donors donated · ${r.urgency}`} group={r.blood_group} status={r.status} />)}
    </>
  )
}
