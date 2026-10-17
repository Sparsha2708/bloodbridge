import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import Icon from '../components/Icon'
import Avatar from '../components/Avatar'
import RequestCard from '../components/RequestCard'

export default function Home() {
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const isDonor = profile?.role === 'donor'
  const [items, setItems] = useState(null)

  useEffect(() => {
    if (!profile) return
    const q = isDonor
      ? supabase.from('request_participants').select('id,status,blood_requests(id,blood_group,urgency,notes,hospitals(name,city))').eq('donor_id', user.id).eq('status', 'invited')
      : supabase.from('blood_requests').select('*,hospitals(name,city)').eq('attender_id', user.id).eq('status', 'open').order('created_at', { ascending: false }).limit(3)
    q.then(({ data }) => setItems(data || []))
  }, [profile, isDonor, user.id])

  const actions = isDonor
    ? [['list', 'My Requests', '/requests'], ['hospital', 'Blood Banks', '/hospitals'], ['chat', 'Inbox', '/inbox'], ['bell', 'Alerts', '/notifications'], ['user', 'Profile', '/profile'], ['share', 'Invite Friends', 'share']]
    : [['search', 'Find Donors', '/donors'], ['plus', 'Post Request', '/request/new'], ['list', 'My Requests', '/requests'], ['hospital', 'Blood Banks', '/hospitals'], ['chat', 'Inbox', '/inbox'], ['bell', 'Alerts', '/notifications']]
  const go = (to) => (to === 'share' ? (navigator.share ? navigator.share({ title: 'BloodBridge', url: window.location.origin }) : navigator.clipboard.writeText(window.location.origin)) : nav(to))

  return (
    <>
      <div className="hello">
        <div><p className="sub" style={{ margin: 0 }}>Hello,</p><h1 style={{ margin: 0 }}>{profile?.full_name?.split(' ')[0] || '…'}</h1></div>
        <Avatar name={profile?.full_name || '?'} />
      </div>
      <div className="search"><Icon n="search" /><input readOnly placeholder={isDonor ? 'Search blood banks' : 'Search donors'} onFocus={() => nav(isDonor ? '/hospitals' : '/donors')} /></div>
      <div className="grid3">
        {actions.map(([ic, label, to]) => <button key={label} className="qa" onClick={() => go(to)}><div className="b"><Icon n={ic} /></div>{label}</button>)}
      </div>

      <div className="secrow"><h2>{isDonor ? 'Waiting for your reply' : 'Your open requests'}</h2><Link to="/requests" className="link">See all</Link></div>
      {items === null && <p className="muted">Loading…</p>}
      {items?.length === 0 && <p className="muted">{isDonor ? 'No new requests. You’ll see them here when an attender invites you.' : 'No open requests. Post one to start inviting donors.'}</p>}
      {items?.map((it) => isDonor
        ? <RequestCard key={it.id} to="/requests" title={`${it.blood_requests.blood_group} needed`} place={`${it.blood_requests.hospitals.name}, ${it.blood_requests.hospitals.city}`} text={it.blood_requests.notes} group={it.blood_requests.blood_group} status="invited" />
        : <RequestCard key={it.id} to={`/request/${it.id}`} title={it.patient_ref} place={it.hospitals.name} text={`${it.units_fulfilled}/${it.units_required} donors donated`} group={it.blood_group} status={it.status} />)}
    </>
  )
}
