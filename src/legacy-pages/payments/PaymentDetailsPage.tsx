import ModalLink from '../../routes/ModalLink';
import { useAppRouteContext } from '../../routes/route-context';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2, X } from 'lucide-react';
import { type AppRouteContext } from '../../routes/route-context';

export default function PaymentDetailsPage() {
  const { paymentId } = useParams();
  const { paymentsData, dataReady, deletePayment } = useAppRouteContext<AppRouteContext>();
  const navigate = useNavigate();
  const location = useLocation();
  const payment = paymentsData.find(item => item.id === Number(paymentId));

  if (!dataReady) return <div className="py-8 text-center text-sm text-neutral-500">Loading payment…</div>;
  if (!payment) return <Navigate to="/payments" replace />;
  const paidAt = String((payment as any).paid_at || '').replace('T', ' ');
  const paidDate = paidAt.slice(0, 10);
  const paidTime = paidAt.slice(11, 16) || '—';
  const displayDate = paidDate && /^\\d{4}-\\d{2}-\\d{2}$/.test(paidDate)
    ? new Date(`${paidDate}T12:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const formatMinor = (value: unknown) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((Number(value) || 0) / 100);
  const close = () => ((location.state as any)?.backgroundLocation ? navigate(-1) : navigate('/payments'));
  return <section className="route-detail-modal mx-auto flex w-full max-w-3xl flex-col">
    <header className="route-modal-header flex shrink-0 items-center justify-between border-b border-neutral-800 px-5 py-4">
      <h2 className="text-lg font-bold">Payment details</h2>
      <button type="button" onClick={close} aria-label="Close payment details" className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800"><X size={21}/></button>
    </header>
    <div className="route-detail-content flex min-h-0 flex-col">
      <div className="px-5 pt-5 text-3xl font-bold tabular-nums">{formatMinor((payment as any).amount_minor)}</div>
      <dl className="grid grid-cols-2 gap-x-5 gap-y-4 px-5 py-5 text-sm">
      <div className="min-w-0"><dt className="text-neutral-500">Card</dt><dd className="mt-1 break-words font-medium text-neutral-100">{(payment as any).card_name}</dd></div>
      <div><dt className="text-neutral-500">Date</dt><dd className="mt-1 font-medium text-neutral-100">{displayDate}</dd></div>
      <div><dt className="text-neutral-500">Time</dt><dd className="mt-1 font-medium tabular-nums text-neutral-100">{paidTime}</dd></div>
      <div className="min-w-0"><dt className="text-neutral-500">Reference</dt><dd className="mt-1 break-words font-medium text-neutral-100">{(payment as any).reference||'—'}</dd></div>
      <div><dt className="text-neutral-500">Allocated</dt><dd className="mt-1 font-medium tabular-nums text-neutral-100">{formatMinor((payment as any).allocated_minor)}</dd></div>
      <div><dt className="text-neutral-500">Unallocated</dt><dd className="mt-1 font-medium tabular-nums text-neutral-100">{formatMinor((payment as any).unallocated_minor)}</dd></div>
      </dl>
      {(payment as any).notes&&<p className="mt-4 px-5 pb-4 text-sm text-neutral-300">{(payment as any).notes}</p>}
    </div>
    <div className="route-detail-actions grid grid-cols-2 gap-2 px-5 pb-4">
      <ModalLink to={`/payments/${payment.id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-700 px-3 text-sm"><Pencil size={15}/> Edit</ModalLink>
      <button type="button" onClick={() => { if (window.confirm('Move this payment to Deleted Payments? Its allocations will be reversed and outstanding bills recalculated. You can restore it later.')) { deletePayment(payment); if ((location.state as any)?.backgroundLocation) { navigate(-1); } else { navigate('/payments'); } } }} className="txn-delete-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-900 bg-red-950/50 px-3 text-sm text-red-300"><Trash2 size={15}/> Move to deleted</button>
    </div>
  </section>;
}
