import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import Drop from '../components/Drop'

export default function InvitePage() {
  const { token } = useParams()
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const [info, setInfo] = useState(undefined); const [err, setErr] = useState('')
  useEffect(() => { supabase.rpc('invite_preview', { p_token: token }).then(({ data }) => setInfo(data?.[0] || null)) }, [token])
  async function join() {
    setErr(''); const { error } = await supabase.rpc('claim_invite', { p_token: token })
    error ? setErr(error.message) : nav('/requests')
  }
  if (info === undefined) return <p className="muted screen">Loading…</p>
  if (!info) return <div className="screen"><h1>Invite not available</h1><p className="sub">This link is invalid, already used, or the request is closed.</p></div>
  const here = encodeURIComponent(`/invite/${token}`)
  return (
    <div className="screen pcenter" style={{ paddingTop: 50 }}>
      <Drop group={info.blood_group} size={96} />
      <h1>{info.invited_name}, a family needs your help</h1>
      <p className="sub">{info.blood_group} blood is needed at {info.hospital} ({info.urgency}). The hospital makes the final call on eligibility.</p>
      {err && <p className="err">{err}</p>}
      {!user && <><Link className="btn" to={`/signup?role=donor&next=${here}`}>Sign up to join</Link><Link className="btn out" to={`/login?next=${here}`}>I already have an account</Link></>}
      {user && profile?.role !== 'donor' && <p className="err">You’re signed in as an attender. Use a donor account to join.</p>}
      {user && profile?.role === 'donor' && <><button className="btn" onClick={join}>Join this request</button><p className="muted small" style={{ marginTop: 12 }}>No donor profile yet? <Link to="/profile/edit">Set it up first</Link>, then return to this link.</p></>}
    </div>
  )
}
