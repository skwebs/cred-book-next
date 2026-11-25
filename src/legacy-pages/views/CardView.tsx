import { useState } from 'react';
import { Download, MoreHorizontal } from 'lucide-react';
import type { Card, GroupedTransactions, Txn, StateSetter } from './view-types';
import StatementExportDialog from './StatementExportDialog';

type Props = {
  [key: string]: any;
  activeCard: Card | null;
  cycleTxns: Txn[];
  shownCycleTxns: Txn[];
  groupedCycleTxns: GroupedTransactions;
  setActiveCard: StateSetter<Card | null>;
};

function compactCycleRange(start: string, end: string, day: (value: string) => string) {
  const parse = (value: string) => {
    const match = day(value).match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
    return match ? { day: match[1], month: match[2], year: match[3] } : null;
  };
  const from = parse(start);
  const to = parse(end);
  if (!from || !to) return `${day(start)} – ${day(end)}`;
  if (from.year === to.year) return `${from.day} ${from.month} – ${to.day} ${to.month} ${to.year}`;
  return `${from.day} ${from.month} ${from.year} – ${to.day} ${to.month} ${to.year}`;
}

export default function CardView(props: Props) {
  const [exportOpen, setExportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const {
    Check, ChevronDown, Empty, Modal, ModalLink, Pencil, Plus,
    Search, ShieldCheck, TxnRow, Wallet, X, activeCard, cardTxnQuery, currentEnd,
    currentStart, cycle, cycleSheetOpen, cycleTxns, day, groupedCycleTxns, money,
    monthLabel, notify, perform, request, rupeesToMinor, selectedStatement,
    setActiveCard, setCardTxnQuery, setCycleSheetOpen, setEditTxn, shownCycleTxns,
  } = props;

  const cycleExpensesMinor = cycleTxns.reduce((total, txn) => total + txn.amount_minor, 0);
  const cycleStart = selectedStatement?.cycle_start || currentStart;
  const cycleEnd = selectedStatement?.cycle_end || currentEnd;

  const confirmStatement = () => {
    if (!selectedStatement) return;
    const raw = window.prompt(
      'Enter the total amount shown on the bank statement (₹):',
      selectedStatement.bank_amount_minor != null
        ? String(selectedStatement.bank_amount_minor / 100)
        : String(selectedStatement.amount_minor / 100),
    );
    if (raw === null) return;
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount < 0) {
      notify('Enter a valid statement amount.', 'error');
      return;
    }
    void perform(
      () => request('statement-action', 'POST', {
        id: selectedStatement.id,
        operation: 'confirm',
        bank_amount_minor: rupeesToMinor(raw),
      }),
      'Statement confirmed against bank statement',
    );
  };

  const toggleStatementLock = () => {
    if (!selectedStatement) return;
    if (selectedStatement.is_locked) {
      if (confirm('Unlock this statement so transactions in this cycle can be edited?')) {
        void perform(() => request('statement-action', 'POST', {
          id: selectedStatement.id,
          operation: 'unlock',
        }), 'Statement unlocked');
      }
      return;
    }
    if (confirm('Lock this statement? Transactions in this cycle will require unlocking before they can be changed.')) {
      void perform(() => request('statement-action', 'POST', {
        id: selectedStatement.id,
        operation: 'lock',
      }), 'Statement locked');
    }
  };

  return activeCard ? <div className="card-detail-page">
    <section className="card-detail-toolbar transaction-sticky-search -mx-4 -mt-4 mb-4 border-b px-4 py-2" aria-label="Card transaction tools">
      {!searchOpen ? <div className="card-detail-toolbar-track">
        <button
          type="button"
          className="card-detail-icon-button"
          onClick={() => setSearchOpen(true)}
          aria-label="Search transactions"
          title="Search transactions"
        >
          <Search size={21} aria-hidden="true"/>
        </button>

        <button
          type="button"
          className="card-detail-cycle-compact"
          onClick={() => setCycleSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={cycleSheetOpen}
          aria-label={`Billing cycle ${day(cycleStart)} to ${day(cycleEnd)}. Change billing cycle`}
        >
          <span className="card-detail-cycle-compact-label">Billing cycle</span>
          <span className="card-detail-cycle-compact-value">
            <span>{compactCycleRange(cycleStart, cycleEnd, day)}</span>
            <ChevronDown size={16} aria-hidden="true"/>
          </span>
        </button>

        <button
          type="button"
          className="card-detail-icon-button card-detail-download-button"
          onClick={() => setExportOpen(true)}
          aria-label="Download statement"
          title="Download statement"
        >
          <Download size={20} aria-hidden="true"/>
        </button>

        <button
          type="button"
          className="card-detail-icon-button"
          onClick={() => setMoreOpen(true)}
          aria-label="More card actions"
          title="More"
        >
          <MoreHorizontal size={22} aria-hidden="true"/>
        </button>
      </div> : <div className="card-detail-search-expanded">
        <Search size={21} aria-hidden="true" className="shrink-0"/>
        <input
          autoFocus
          className="card-detail-search-input"
          aria-label="Search this card's transactions"
          placeholder="Search this card's transactions"
          value={cardTxnQuery}
          onChange={event => setCardTxnQuery(event.target.value)}
        />
        <button
          type="button"
          className="card-detail-search-close"
          onClick={() => setSearchOpen(false)}
          aria-label="Close search"
        ><X size={20}/></button>
      </div>}
    </section>

    <div className="mb-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold">Transactions</h2>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-neutral-500">{money(cycleExpensesMinor)}</span>
      </div>
      <p className="mt-1 text-xs text-neutral-500">Allocated by settlement date · {day(cycleStart)} – {day(cycleEnd)}</p>
    </div>

    {shownCycleTxns.length === 0 ? <Empty title={cycleTxns.length === 0 ? "No transactions in this cycle" : "No matching transactions"} detail={cycleTxns.length === 0 ? "Transactions appear here according to this card's settlement-date billing rules." : "Try another search term or clear the search."}/> : <div className="space-y-6">
      {groupedCycleTxns.map(([month, dates]) => <section key={month}>
        <div className="transaction-month-sticky sticky z-10 -mx-1 mb-2 flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/95 px-1 py-2 backdrop-blur">
          <h3 className="font-bold">{monthLabel(month)}</h3>
          <span className="text-xs font-medium tabular-nums text-neutral-400">{money(dates.reduce((sum, [, list]) => sum + list.reduce((total, txn) => total + txn.amount_minor, 0), 0))}</span>
        </div>
        <div className="space-y-3">
          {dates.map(([date, list]) => <div key={date} className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/80 px-3 py-2">
              <h4 className="text-xs font-semibold text-neutral-300">{day(date)}</h4>
              <span className="text-xs tabular-nums text-neutral-500">{money(list.reduce((total, txn) => total + txn.amount_minor, 0))}</span>
            </div>
            {list.map((txn, index) => <TxnRow key={txn.id} txn={txn} stripeIndex={index} card={activeCard} to={`/transactions/${txn.id}`} onNavigate={() => setActiveCard(activeCard)} onCopyTxn={props.onCopyTxn} onDeleteTxn={props.onDeleteTxn} onEditTxn={props.onEditTxn} onViewTxn={props.onViewTxn}/>) }
          </div>)}
        </div>
      </section>)}
    </div>}

    {moreOpen && <Modal title="More card actions" onClose={() => setMoreOpen(false)} bottomSheet>
      <div className="card-detail-more-list">
        <ModalLink to="/payments/new" onClick={() => setActiveCard(activeCard)} className="card-detail-more-action">
          <Wallet size={20}/><span>Pay bill</span>
        </ModalLink>
        <ModalLink to={`/cards/${activeCard.id}/edit`} className="card-detail-more-action">
          <Pencil size={20}/><span>Edit card</span>
        </ModalLink>
        <ModalLink to="/transactions/new" onClick={() => { setActiveCard(activeCard); setEditTxn(null); }} className="card-detail-more-action">
          <Plus size={20}/><span>Add transaction</span>
        </ModalLink>
        {selectedStatement && <>
          <div className="card-detail-more-divider"/>
          <button type="button" className="card-detail-more-action" onClick={confirmStatement}>
            <Check size={20}/><span>{selectedStatement.confirmed_at ? 'Reconfirm statement' : 'Confirm statement'}</span>
          </button>
          <button type="button" className="card-detail-more-action" onClick={toggleStatementLock} disabled={!selectedStatement.is_locked && !selectedStatement.confirmed_at}>
            <ShieldCheck size={20}/><span>{selectedStatement.is_locked ? 'Unlock billing cycle' : 'Lock billing cycle'}</span>
          </button>
        </>}
      </div>
    </Modal>}

    <StatementExportDialog key={`${activeCard.id}:${cycle}`} open={exportOpen} onClose={() => setExportOpen(false)} cards={[activeCard]} statements={selectedStatement ? [selectedStatement] : []} fixedCardId={activeCard.id} initialMode="cycle" initialCycleId={selectedStatement ? `statement-${selectedStatement.id}` : `current-${activeCard.id}`} request={request} notify={notify} searchQuery={cardTxnQuery}/>
  </div> : null;
}
