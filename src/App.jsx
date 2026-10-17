import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import Icon from './components/Icon'
import Welcome from './pages/Welcome'
import { SignIn, SignUp, Forgot, Verify, Reset } from './pages/Auth'
import Home from './pages/Home'
import FindDonors from './pages/FindDonors'
import DonorProfile from './pages/DonorProfile'
import Requests from './pages/Requests'
import CreateRequest from './pages/CreateRequest'
import RequestDetail from './pages/RequestDetail'
import Hospitals from './pages/Hospitals'
import Inbox from './pages/Inbox'
import Chat from './pages/Chat'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import InvitePage from './pages/InvitePage'

function Guard() {
  const { user, loading } = useAuth()
  if (loading) return <p className="muted screen">Loading…</p>
  return user ? <Outlet /> : <Navigate to="/welcome" replace />
}

function TabLayout() {
  const tabs = [['/home', 'home', 'Home'], ['/inbox', 'chat', 'Inbox'], ['/notifications', 'bell', 'Alerts'], ['/profile', 'user', 'Profile']]
  return (
    <>
      <div className="screen"><Outlet /></div>
      <nav className="tabs" aria-label="Main">
        {tabs.map(([to, ic, label]) => <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'on' : '')}><Icon n={ic} />{label}</NavLink>)}
      </nav>
    </>
  )
}

function Root() {
  const { user, loading } = useAuth()
  if (loading) return <p className="muted screen">Loading…</p>
  return <Navigate to={user ? '/home' : '/welcome'} replace />
}

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/invite/:token" element={<InvitePage />} />
        <Route element={<Guard />}>
          <Route element={<TabLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route element={<div className="screen"><Outlet /></div>}>
            <Route path="/donors" element={<FindDonors />} />
            <Route path="/donors/:id" element={<DonorProfile />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/request/new" element={<CreateRequest />} />
            <Route path="/request/:id" element={<RequestDetail />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/profile/edit" element={<EditProfile />} />
          </Route>
        </Route>
      </Routes>
    </div>
  )
}
