import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, Pencil, Wallet } from 'lucide-react';
import type { Card, DashboardData, StateSetter } from './view-types';
type Props = { [key: string]: any; activeCards: Card[]; cards: Card[]; dashboard: DashboardData | null; setSummaryExpanded: StateSetter<boolean>; setCardsExpanded: StateSetter<boolean>; onMakePaymentForCard: (card: Card) => void; onViewCardDetails: (card: Card) => void; onEditCardFromDues: (card: Card) => void };

function statementDueStatus(dueDateValue: unknown) {
  const dueDateText = String(dueDateValue || '').slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dueDateText);
  if (!match) return null;
  const dueDate = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(dueDate.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / 86400000);
  if (daysUntilDue < 0) {
    const overdueDays = Math.abs(daysUntilDue);
    return { label: `Overdue ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'}`, color: 'text-red-400' };
  }
  if (daysUntilDue === 0) return { label: 'Due today', color: 'text-amber-400' };
  return { label: `Due in ${daysUntilDue} ${daysUntilDue === 1 ? 'day' : 'days'}`, color: 'text-amber-400' };
}

type DuesBillRowProps = {
  card: Card | undefined;
  title: string;
  dueDate?: unknown;
  amountMinor: number;
  dueStatus: { label: string; color: string } | null;
  day: (value: unknown) => string;
  formatAmount: (value: number) => string;
  onMakePayment: (card: Card) => void;
  onViewCard: (card: Card) => void;
  onEditCard: (card: Card) => void;
};

function DuesBillRow({ card, title, dueDate, amountMinor, dueStatus, day, formatAmount, onMakePayment, onViewCard, onEditCard }: DuesBillRowProps) {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const pressTimer = useRef<number | null>(null);
  const longPressTriggered = useRef(false);
  const ignoreLongPressReleaseClick = useRef(false);
  const clearPress = () => {
    if (pressTimer.current !== null) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };
  const openMenu = (x: number, y: number) => {
    setMenu({
      x: Math.max(8, Math.min(x, window.innerWidth - 224)),
      y: Math.max(8, Math.min(y, window.innerHeight - 190)),
    });
  };

  useEffect(() => {
    if (!menu) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menu]);

  const makePayment = () => {
    setMenu(null);
    if (card && amountMinor > 0) onMakePayment(card);
  };
  const viewCard = () => {
    setMenu(null);
    if (card) onViewCard(card);
  };
  const editCard = () => {
    setMenu(null);
    if (card) onEditCard(card);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (longPressTriggered.current) {
            longPressTriggered.current = false;
            return;
          }
          if (!card) return;
          if (amountMinor > 0) onMakePayment(card);
          else onViewCard(card);
        }}
        onContextMenu={event => {
          event.preventDefault();
          if (card) openMenu(event.clientX, event.clientY);
        }}
        onTouchStart={event => {
          if (!card) return;
          clearPress();
          longPressTriggered.current = false;
          const touch = event.touches[0];
          const x = touch.clientX;
          const y = touch.clientY;
          pressTimer.current = window.setTimeout(() => {
            longPressTriggered.current = true;
            ignoreLongPressReleaseClick.current = true;
            openMenu(x, y);
          }, 520);
        }}
        onTouchMove={clearPress}
        onTouchEnd={() => {
          clearPress();
          if (longPressTriggered.current) window.setTimeout(() => { longPressTriggered.current = false; ignoreLongPressReleaseClick.current = false; }, 700);
        }}
        onTouchCancel={clearPress}
        aria-label={`${title}, ${formatAmount(amountMinor)}. ${dueStatus?.label || 'No dues'}. Tap to ${amountMinor > 0 ? 'make payment' : 'view card details'}; long press for more actions.`}
        className="flex w-full min-w-0 items-center justify-between gap-3 border-b border-neutral-800/80 px-2.5 py-2 text-left last:border-b-0 transition-colors hover:bg-neutral-800/50 active:bg-neutral-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{title}</span>
          <span className="mt-0.5 block text-[11px] text-neutral-500">{dueDate ? `Due ${day(dueDate)}` : 'No dues'}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end">
          <span className="text-sm font-semibold tabular-nums">{formatAmount(amountMinor)}</span>
          {dueStatus ? <span className={`mt-0.5 text-[10px] font-medium ${dueStatus.color}`}>{dueStatus.label}</span> : <span className="mt-0.5 text-[10px] font-medium text-neutral-500">No dues</span>}
        </span>
      </button>
      {menu && card && createPortal(
        <div className="fixed inset-0 z-[90]" onClick={() => { if (ignoreLongPressReleaseClick.current) { ignoreLongPressReleaseClick.current = false; return; } setMenu(null); }} onContextMenu={event => event.preventDefault()}>
          <div
            data-dues-context-menu
            role="menu"
            aria-label={`${title} actions`}
            onClick={event => event.stopPropagation()}
            style={{ left: menu.x, top: menu.y }}
            className="fixed z-[91] w-56 rounded-2xl border border-neutral-700 bg-neutral-900 p-1.5 text-neutral-100 shadow-2xl shadow-black/40"
          >
            <button type="button" role="menuitem" disabled={amountMinor <= 0} onClick={makePayment} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"><Wallet size={17} className="text-violet-300"/>Make payment</button>
            <button type="button" role="menuitem" onClick={viewCard} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-neutral-800"><CreditCard size={17} className="text-neutral-400"/>View card details</button>
            <button type="button" role="menuitem" onClick={editCard} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-neutral-800"><Pencil size={17} className="text-neutral-400"/>Edit card</button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}


export default function DashboardView(props: Props) {
  const { Activity, CalendarDays, ChevronDown, ChevronRight, CreditCard, Empty, Link, ModalLink, Plus, TxnRow, onCopyTxn, onDeleteTxn, onEditTxn, onViewTxn, activeCards, budgetMinor, budgetMonth, budgetPct, calendarMonthSpend, cards, cardsExpanded, currentSpend, dashboard, dashboardMoney, day, excessPct, fillBudgetPct, followingBudgetSpend, goTab, money, monthLabel, nextBudgetMonth, nextBudgetPct, nextBudgetSpend, nextExcessPct, nextFillBudgetPct, nextMonthUnpaid, overviewIndex, overviewTrackRef, previousBudgetMonth, previousDues, setActiveCard, setCardsExpanded, setCycle, setEditTxn, setOverviewIndex, setSummaryExpanded, summaryExpanded, statements = [], onMakePaymentForCard, onViewCardDetails, onEditCardFromDues } = props;
  const latestTransactions = dashboard?.latest ?? [];
  const [activityTab, setActivityTab] = useState<'dues' | 'recent'>(() => {
    if (typeof window === 'undefined') return 'dues';
    try {
      return window.localStorage.getItem('ccm-dashboard-activity-tab') === 'recent' ? 'recent' : 'dues';
    } catch {
      return 'dues';
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem('ccm-dashboard-activity-tab', activityTab);
    } catch {
      // Keep the in-memory selection when browser storage is unavailable.
    }
  }, [activityTab]);
  // The display preference is configured in Settings and shared through localStorage.
  const [duesDisplayMode] = useState<'dues' | 'all'>(() => {
    if (typeof window === 'undefined') return 'dues';
    try {
      return window.localStorage.getItem('ccm-dashboard-dues-display-mode') === 'all' ? 'all' : 'dues';
    } catch {
      return 'dues';
    }
  });
  const recentTransactions = latestTransactions;
  // Recent Spent shows the forecast amount expected to be billed/attributed for payment next month.
  // Reuse the dashboard forecast already used by Monthly Overview; do not aggregate transactions again.
  const recentSpentMinor = nextBudgetSpend;
  const outstandingStatements = useMemo(() => statements
    .filter((statement: any) => Number(statement.outstanding_minor || 0) > 0)
    .sort((a: any, b: any) => String(a.due_date || '').localeCompare(String(b.due_date || ''))), [statements]);
  const totalDuesMinor = outstandingStatements.reduce((total: number, statement: any) => total + Number(statement.outstanding_minor || 0), 0);
  const duesByCard = useMemo(() => {
    const grouped = new Map<number, any[]>();
    for (const statement of outstandingStatements) {
      const cardId = Number(statement.card_id);
      const existing = grouped.get(cardId) || [];
      existing.push(statement);
      grouped.set(cardId, existing);
    }
    return grouped;
  }, [outstandingStatements]);
  return (
    <>
        
        <section className="mb-2">
          <div ref={overviewTrackRef} className="overview-carousel flex snap-x snap-mandatory gap-0 overflow-x-auto scrollbar-hide" onScroll={e=>{const el=e.currentTarget;setOverviewIndex(Math.round(el.scrollLeft/Math.max(1,el.clientWidth)))}}>
            <article className="overview-slide min-w-full snap-start overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/80">
              <button onClick={()=>setSummaryExpanded(v=>!v)} className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left"><div><div className="flex items-center gap-2 text-sm font-semibold"><Activity size={17} className="monthly-overview-icon text-violet-300"/> Monthly overview</div><div className="mt-0.5 pl-6 text-[10px] text-neutral-500">{monthLabel(previousBudgetMonth)} – {monthLabel(budgetMonth)}</div></div><ChevronDown className={`shrink-0 text-neutral-500 transition-transform ${summaryExpanded?'rotate-180':''}`} size={20}/></button>
              {summaryExpanded&&<div className="px-2.5 pb-2"><div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)] items-end gap-2"><div><div className="text-[11px] leading-tight text-neutral-500 whitespace-nowrap">Unpaid dues</div><div className="mt-0.5 text-lg font-bold leading-tight tracking-tight tabular-nums">{dashboardMoney(previousDues)}</div></div><div className="text-right"><div className="text-[11px] leading-tight text-neutral-500 whitespace-nowrap">Billed / Budget</div><div className="mt-0.5 text-lg font-bold leading-tight tracking-tight tabular-nums">{dashboardMoney(currentSpend)} <span className="text-neutral-500">/</span> <span className="text-neutral-300">{budgetMinor>0?dashboardMoney(budgetMinor):'Not set'}</span></div></div></div>
                {budgetMinor>0||currentSpend>0?<><div className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full bg-neutral-700"><div style={{width:`${fillBudgetPct}%`,background:'#22c55e',transition:'width .25s ease'}}/><div style={{width:`${excessPct}%`,background:'#ef4444',transition:'width .25s ease'}}/></div><div className="mt-1 flex items-center justify-between gap-2 text-[10px] leading-tight"><span className={`budget-usage-status ${currentSpend>budgetMinor?'is-over font-semibold text-red-300':'is-under font-semibold text-emerald-300'}`}>{budgetMinor>0?`${budgetPct.toFixed(1)}% used`:(currentSpend>0?'No budget set · spending exceeds budget':'0% of budget used')}</span><span className="text-right text-neutral-400">{currentSpend>budgetMinor?`${dashboardMoney(currentSpend-budgetMinor)} over`:`${dashboardMoney(Math.max(0,budgetMinor-currentSpend))} remaining`}</span></div></>:<button onClick={()=>{goTab('settings');setTimeout(()=>document.getElementById('budget-setting')?.scrollIntoView({behavior:'smooth',block:'center'}),50)}} className="mt-2 flex w-full items-center justify-between rounded-lg border border-dashed border-neutral-700 px-2 py-1.5 text-left"><span className="text-sm text-neutral-400">Set a budget for active billing cycles</span><ChevronRight size={17} className="text-violet-300"/></button>}
                <div className="mt-1.5 grid grid-cols-2 gap-1.5"><div className="flex min-w-0 items-center justify-between gap-1 rounded-md bg-neutral-800/60 px-2 py-1"><span className="min-w-0 truncate text-[10px] leading-tight text-neutral-400">Next month</span><span className="shrink-0 text-xs font-semibold tabular-nums">{dashboardMoney(nextBudgetSpend)}</span></div><div className="flex min-w-0 items-center justify-between gap-1 rounded-md bg-neutral-800/60 px-2 py-1"><span className="min-w-0 truncate text-[10px] leading-tight text-neutral-400">Calendar spent</span><span className="shrink-0 text-xs font-semibold tabular-nums">{dashboardMoney(calendarMonthSpend)}</span></div></div>
              </div>}
            </article>
            <article className="overview-slide min-w-full snap-start overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/80">
              <button onClick={()=>setSummaryExpanded(v=>!v)} className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left"><div><div className="flex items-center gap-2 text-sm font-semibold"><Activity size={17} className="monthly-overview-icon text-violet-300"/> Monthly overview</div><div className="mt-0.5 pl-6 text-[10px] text-neutral-500">{monthLabel(budgetMonth)} – {monthLabel(nextBudgetMonth)}</div></div><ChevronDown className={`shrink-0 text-neutral-500 transition-transform ${summaryExpanded?'rotate-180':''}`} size={20}/></button>
              {summaryExpanded&&<div className="px-2.5 pb-2"><div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)] items-end gap-2"><div><div className="text-[11px] leading-tight text-neutral-500 whitespace-nowrap">Unpaid dues</div><div className="mt-0.5 text-lg font-bold leading-tight tracking-tight tabular-nums">{dashboardMoney(nextMonthUnpaid)}</div></div><div className="text-right"><div className="text-[11px] leading-tight text-neutral-500 whitespace-nowrap">Spent / Budget</div><div className="mt-0.5 text-lg font-bold leading-tight tracking-tight tabular-nums">{dashboardMoney(nextBudgetSpend)} <span className="text-neutral-500">/</span> <span className="text-neutral-300">{budgetMinor>0?dashboardMoney(budgetMinor):'Not set'}</span></div></div></div>
                {budgetMinor>0||nextBudgetSpend>0?<><div className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full bg-neutral-700"><div style={{width:`${nextFillBudgetPct}%`,background:'#22c55e',transition:'width .25s ease'}}/><div style={{width:`${nextExcessPct}%`,background:'#ef4444',transition:'width .25s ease'}}/></div><div className="mt-1 flex items-center justify-between gap-2 text-[10px] leading-tight"><span className={`budget-usage-status ${nextBudgetSpend>budgetMinor?'is-over font-semibold text-red-300':'is-under font-semibold text-emerald-300'}`}>{budgetMinor>0?`${nextBudgetPct.toFixed(1)}% used`:(nextBudgetSpend>0?'No budget set · spending exceeds budget':'0% of budget used')}</span><span className="text-right text-neutral-400">{nextBudgetSpend>budgetMinor?`${dashboardMoney(nextBudgetSpend-budgetMinor)} over`:`${dashboardMoney(Math.max(0,budgetMinor-nextBudgetSpend))} remaining`}</span></div></>:<button onClick={()=>{goTab('settings');setTimeout(()=>document.getElementById('budget-setting')?.scrollIntoView({behavior:'smooth',block:'center'}),50)}} className="mt-2 flex w-full items-center justify-between rounded-lg border border-dashed border-neutral-700 px-2 py-1.5 text-left"><span className="text-sm text-neutral-400">Set a budget for active billing cycles</span><ChevronRight size={17} className="text-violet-300"/></button>}
                <div className="mt-1.5 grid grid-cols-2 gap-1.5"><div className="flex min-w-0 items-center justify-between gap-1 rounded-md bg-neutral-800/60 px-2 py-1"><span className="min-w-0 truncate text-[10px] leading-tight text-neutral-400">Next month</span><span className="shrink-0 text-xs font-semibold tabular-nums">{dashboardMoney(followingBudgetSpend)}</span></div><div className="flex min-w-0 items-center justify-between gap-1 rounded-md bg-neutral-800/60 px-2 py-1"><span className="min-w-0 truncate text-[10px] leading-tight text-neutral-400">Calendar spent</span><span className="shrink-0 text-xs font-semibold tabular-nums">{dashboardMoney(calendarMonthSpend)}</span></div></div>
              </div>}
            </article>
          </div>
          <div className="mt-0.5 flex items-center justify-center gap-1.5" aria-label={`Monthly overview ${overviewIndex+1} of 2`}>
            <button type="button" onClick={()=>overviewTrackRef.current?.scrollTo({left:0,behavior:'smooth'})} aria-label="Show previous billing period" className={`h-1.5 rounded-full transition-all ${overviewIndex===0?'w-5 bg-violet-500':'w-1.5 bg-neutral-500/50'}`}/>
            <button type="button" onClick={()=>overviewTrackRef.current?.scrollTo({left:overviewTrackRef.current.clientWidth,behavior:'smooth'})} aria-label="Show current billing period" className={`h-1.5 rounded-full transition-all ${overviewIndex===1?'w-5 bg-violet-500':'w-1.5 bg-neutral-500/50'}`}/>
          </div>
        </section>

        {/* Individual card details are managed in the Cards tab. Monthly Overview remains the dashboard's financial summary. */}

        <section className="dashboard-activity-card overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 p-1.5">
          <div className="dashboard-activity-tabs" role="group" aria-label="Dashboard activity tabs">
            <div className="grid grid-cols-2 gap-1" role="tablist" aria-label="Dashboard activity">
            <button type="button" role="tab" aria-selected={activityTab==='dues'} onClick={()=>setActivityTab('dues')} className={`flex min-w-0 items-center justify-between gap-1.5 rounded-xl border-0 px-2.5 py-2 text-left transition-colors ${activityTab==='dues'?'bg-red-600 text-white dashboard-dues-tab':'dashboard-dues-tab hover:bg-red-500/5'}`}>
              <span className="truncate text-xs font-semibold">Dues Bill</span><span className="shrink-0 text-xs font-bold tabular-nums">{dashboardMoney(totalDuesMinor)}</span>
            </button>
            <button type="button" role="tab" aria-selected={activityTab==='recent'} onClick={()=>setActivityTab('recent')} className={`flex min-w-0 items-center justify-between gap-1.5 rounded-xl border-0 px-2.5 py-2 text-left transition-colors ${activityTab==='recent'?'bg-emerald-600 text-white dashboard-recent-tab':'dashboard-recent-tab hover:bg-emerald-500/5'}`}>
              <span className="truncate text-xs font-semibold">Recent Spent</span><span className="shrink-0 text-xs font-bold tabular-nums">{dashboardMoney(recentSpentMinor)}</span>
            </button>
            </div>
          </div>
          <div className="px-0 pb-0" role="tabpanel">
            {activityTab==='dues' ? (
              <>
                {duesDisplayMode==='dues' ? (
                  outstandingStatements.length===0 ? <Empty title="No outstanding bills" detail="Your unpaid statement bills will appear here."/> :
                  <div className="dashboard-activity-list dashboard-dues-list max-h-[340px] overflow-y-auto overscroll-contain">
                    {outstandingStatements.map((statement: any)=>{
                      const card=cards.find((item: Card)=>item.id===Number(statement.card_id));
                      return <DuesBillRow key={statement.id} card={card} title={statement.card_name || card?.name || 'Credit card'} dueDate={statement.due_date} amountMinor={Number(statement.outstanding_minor || 0)} dueStatus={statementDueStatus(statement.due_date)} day={day} formatAmount={dashboardMoney} onMakePayment={onMakePaymentForCard} onViewCard={onViewCardDetails} onEditCard={onEditCardFromDues}/>;
                    })}
                  </div>
                ) : activeCards.length===0 ? <Empty title="No cards available" detail="Add a credit card to see it here."/> :
                  <div className="dashboard-activity-list dashboard-dues-list max-h-[340px] overflow-y-auto overscroll-contain">
                    {activeCards.map((card: Card)=>{
                      const cardStatements=duesByCard.get(card.id) || [];
                      const outstandingMinor=cardStatements.reduce((sum: number, statement: any)=>sum+Number(statement.outstanding_minor || 0),0);
                      const nextDueStatement=cardStatements[0];
                      const dueStatus=nextDueStatement ? statementDueStatus(nextDueStatement.due_date) : null;
                      return <DuesBillRow key={card.id} card={card} title={card.name} dueDate={nextDueStatement?.due_date} amountMinor={outstandingMinor} dueStatus={dueStatus} day={day} formatAmount={dashboardMoney} onMakePayment={onMakePaymentForCard} onViewCard={onViewCardDetails} onEditCard={onEditCardFromDues}/>;
                    })}
                  </div>
                }
              </>
            )  : recentTransactions.length===0 ? <Empty title="No transactions yet" detail="Add your first expense using the + button."/> :
              <div className="dashboard-activity-list max-h-[340px] overflow-y-auto overscroll-contain">{recentTransactions.map((t: any,index: number)=><TxnRow key={t.id} txn={t} stripeIndex={index} card={cards.find(c=>c.id===t.card_id)} to={`/transactions/${t.id}`} onNavigate={()=>setActiveCard(cards.find(c=>c.id===t.card_id)||null)} onCopyTxn={onCopyTxn} onDeleteTxn={onDeleteTxn} onEditTxn={onEditTxn} onViewTxn={onViewTxn}/>)}</div>}
          </div>
          <div className="mt-2 flex justify-center border-t border-neutral-800 px-2 pb-1.5 pt-2.5"><button onClick={()=>goTab(activityTab==='dues'?'card':'transactions')} className="dashboard-view-all text-xs font-semibold text-violet-300">View all</button></div>
        </section>
      </>
  );
}
