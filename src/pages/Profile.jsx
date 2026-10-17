import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import Avatar from '../components/Avatar'
import Icon from '../components/Icon'

export default function Profile() {
  const { user, profile, signOut } = useAuth()
  const nav = useNavigate()
  const [donor, setDonor] = useState(null)
  const [stats, setStats] = useState({ a: 0, b: 0, c: 0 })
  const isDonor = profile?.role === 'donor'

  useEffect(() => {
    if (!profile) return
    if (isDonor) {
      supabase.from('donors').select('*').eq('user_id', user.id).maybeSingle().then(({ data }) => setDonor(data))
      supabase.from('request_participants').select('status').eq('donor_id', user.id).then(({ data }) => {
        const s = data || []; setStats({ a: s.filter((x) => x.status === 'donated').length, b: s.filter((x) => x.status !== 'invited').length, c: s.length })
      })
    } else {
      supabase.from('blood_requests').select('status,units_fulfilled').eq('attender_id', user.id).then(({ data }) => {
        const s = data || []; setStats({ a: s.length, b: s.filter((x) => x.status === 'open').length, c: s.reduce((n, x) => n + x.units_fulfilled, 0) })
      })
    }
  }, [profile, isDonor, user.id])

  async function toggle() { if (!donor) return nav('/profile/edit'); const v = !donor.available; await supabase.from('donors').update({ available: v }).eq('user_id', user.id); setDonor({ ...donor, available: v }) }
  const share = () => (navigator.share ? navigator.share({ title: 'BloodBridge', url: window.location.origin }) : navigator.clipboard.writeText(window.location.origin))
  const labels = isDonor ? ['Donated', 'Responded', 'Invites'] : ['Requests', 'Open', 'Donors helped']
  const Row = ({ ic, t, onClick, right }) => <button className="menu" onClick={onClick}><span className="mi"><Icon n={ic} /></span><span className="t">{t}</span>{right || <Icon n="chev" className="chev" />}</button>

  return (
    <>
      <div className="pcenter"><Avatar name={profile?.full_name || '?'} size="lg" /><h1>{profile?.full_name}</h1>
        <p className="sub">{isDonor ? (donor ? `${donor.blood_group} donor · ${donor.area || donor.city}` : 'Finish your donor profile') : 'Attender account'}</p></div>
      <div className="stats">{[stats.a, stats.b, stats.c].map((n, i) => <div key={i} className="stat"><small>{labels[i]}</small><b>{String(n).padStart(2, '0')}</b></div>)}</div>
      {isDonor && <Row ic="heart" t="I want to donate" onClick={toggle} right={<span className={`switch ${donor?.available ? 'on' : ''}`} />} />}
      {isDonor && <Row ic="edit" t="Edit profile" onClick={() => nav('/profile/edit')} />}
      <Row ic="list" t={isDonor ? 'My donations' : 'My requests'} onClick={() => nav('/requests')} />
      <Row ic="share" t="Invite friends" onClick={share} />
      <Row ic="shield" t="Privacy policy" onClick={() => alert('Add your privacy policy page here.')} />
      <Row ic="info" t="About us" onClick={() => alert('BloodBridge: a trusted coordination layer for emergency blood donation.')} />
      <button className="link" style={{ display: 'block', margin: '18px auto' }} onClick={signOut}>Sign out</button>
    </>
  )
}
