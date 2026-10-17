import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import TopBar from '../components/TopBar'
import DonorProfileForm from '../components/DonorProfileForm'

export default function EditProfile() {
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const [donor, setDonor] = useState(undefined)
  useEffect(() => { supabase.from('donors').select('*').eq('user_id', user.id).maybeSingle().then(({ data }) => setDonor(data)) }, [user.id])
  if (donor === undefined) return <p className="muted">Loading…</p>
  if (profile?.role !== 'donor') return <><TopBar title="Edit profile" /><p className="muted">Only donors have a donor profile.</p></>
  return <><TopBar title={donor ? 'Edit profile' : 'Set up donor profile'} /><DonorProfileForm donor={donor} onSaved={() => nav('/profile')} /></>
}
