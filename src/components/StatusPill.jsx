const LABEL = { invited: 'Waiting for reply', accepted: 'Accepted', declined: 'Declined', cancelled: 'Cancelled',
  arrived: 'Arrived', donated: 'Donated', deferred: 'Medically deferred', no_show: 'No-show', open: 'Open', closed: 'Closed' }
export default function StatusPill({ status }) {
  return <span className={`pill ${status}`}>{LABEL[status] || status}</span>
}
