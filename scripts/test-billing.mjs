import assert from 'node:assert/strict';
import { cycleFor, datesForStoredCycle, isCurrentMonthCycle, isStatementGeneratedInMonth, calculateStatementTotals, budgetAttributionDate, isBudgetAttributedToMonth } from '../api/billing.js';
const end={billing_rule:'end',billing_day:15,due_days:20};
assert.deepEqual(cycleFor(end,'2026-11-15'),{start:'2026-10-16',end:'2026-11-15',statement_date:'2026-11-16',due_date:'2026-12-05'});
assert.deepEqual(cycleFor(end,'2026-11-16'),{start:'2026-11-16',end:'2026-12-15',statement_date:'2026-12-16',due_date:'2027-01-04'});
const start={billing_rule:'start',billing_day:15,due_days:20};
assert.deepEqual(cycleFor(start,'2026-11-14'),{start:'2026-10-15',end:'2026-11-14',statement_date:'2026-11-15',due_date:'2026-12-04'});
assert.deepEqual(cycleFor(start,'2026-11-15'),{start:'2026-11-15',end:'2026-12-14',statement_date:'2026-12-15',due_date:'2027-01-03'});
const end31={billing_rule:'end',billing_day:31,due_days:0};
assert.deepEqual(cycleFor(end31,'2024-02-29'),{start:'2024-02-01',end:'2024-02-29',statement_date:'2024-03-01',due_date:'2024-02-29'});
assert.deepEqual(cycleFor(end31,'2024-03-01'),{start:'2024-03-01',end:'2024-03-31',statement_date:'2024-04-01',due_date:'2024-03-31'});
console.log('Billing tests passed: start/end conventions, generation date, month rollover, leap-year boundaries.');

// Dashboard overview attribution: statement generation month, not cycle-end month.
const hdfcOctober = cycleFor({billing_rule:'start',billing_day:1,due_days:20},'2026-10-15');
assert.deepEqual(hdfcOctober,{start:'2026-10-01',end:'2026-10-31',statement_date:'2026-11-01',due_date:'2026-11-20'});
assert.equal(isStatementGeneratedInMonth(hdfcOctober.statement_date,'2026-11'),true);
assert.equal(isCurrentMonthCycle(hdfcOctober,'2026-11'),false);
const novemberOngoing = cycleFor({billing_rule:'start',billing_day:1,due_days:20},'2026-11-16');
assert.equal(isStatementGeneratedInMonth(novemberOngoing.statement_date,'2026-11'),false);
assert.equal(isCurrentMonthCycle(novemberOngoing,'2026-11'),true);
const axisOctober = cycleFor({billing_rule:'start',billing_day:11,due_days:20},'2026-10-20');
assert.equal(axisOctober.start.slice(0,7),'2026-10');
assert.equal(axisOctober.statement_date.slice(0,7),'2026-11');
assert.equal(isStatementGeneratedInMonth(axisOctober.statement_date,'2026-11'),true);
// HDFC: October cycle, statement delivered 1 Nov, due 20 Nov.
assert.equal(isStatementGeneratedInMonth(hdfcOctober.statement_date,'2026-11'),true);
// A statement generated on 16 Nov belongs to November even when due in December.
const indusNovember = cycleFor({billing_rule:'end',billing_day:15,due_days:20},'2026-11-15');
assert.deepEqual(indusNovember,{start:'2026-10-16',end:'2026-11-15',statement_date:'2026-11-16',due_date:'2026-12-05'});
assert.equal(isStatementGeneratedInMonth(indusNovember.statement_date,'2026-11'),true);
assert.equal(isStatementGeneratedInMonth(indusNovember.statement_date,'2026-12'),false);
console.log('Dashboard attribution tests passed: statement-generation month, including bills due next month.');


// HDFC-style month-end card: 31 Oct closes at end of day, statement is generated 1 Nov.
const hdfcEndOfDay = cycleFor({billing_rule:'end',billing_day:31,due_days:20},'2026-10-31');
assert.deepEqual(hdfcEndOfDay,{start:'2026-10-01',end:'2026-10-31',statement_date:'2026-11-01',due_date:'2026-11-20'});

// Statement-centric dashboard totals: statement month owns the immutable billed value;
// outstanding carries across months and includes partial/overdue balances until paid.
const ledger = [
  {id:1,statement_date:'2026-10-01',due_date:'2026-10-20',bill_amount_minor:50000,outstanding_minor:5000},
  {id:2,statement_date:'2026-11-01',due_date:'2026-11-20',bill_amount_minor:100000,outstanding_minor:25000},
  {id:3,statement_date:'2026-11-16',due_date:'2026-12-05',bill_amount_minor:21000,outstanding_minor:21000},
  {id:4,statement_date:'2026-11-20',due_date:'2026-12-10',bill_amount_minor:70000,outstanding_minor:70000},
];
assert.deepEqual(calculateStatementTotals(ledger,'2026-11','2026-11-17'),{
  billedMinor:121000,
  outstandingMinor:51000,
});
assert.deepEqual(calculateStatementTotals(ledger,'2026-12','2026-11-17'),{
  billedMinor:0,
  outstandingMinor:51000,
});
assert.deepEqual(calculateStatementTotals([
  {...ledger[1],outstanding_minor:0},
  {...ledger[2],outstanding_minor:0},
],'2026-11','2026-11-30'),{
  billedMinor:121000,
  outstandingMinor:0,
});
console.log('Statement ledger tests passed: immutable billed totals, partial payments, carry-forward outstanding, and future statement exclusion.');


// Existing HDFC month-end statement rows can retain stale dates because the
// previous INSERT ... ON CONFLICT DO NOTHING path never updated their metadata.
const hdfcCard = {billing_rule:'end',billing_day:31,due_days:20};
assert.deepEqual(datesForStoredCycle(hdfcCard,'2026-10-01','2026-10-31'),{
  statement_date:'2026-11-01', due_date:'2026-11-20'
});
assert.equal(datesForStoredCycle(hdfcCard,'2026-10-01','2026-11-30'),null,
  'Do not rewrite historical cycles that no longer match the current card rule');

// The dashboard values must agree when the same November statements are unpaid.
const novemberStatements = [
  {id:'hdfc-tata-neu',statement_date:'2026-11-01',bill_amount_minor:393200,outstanding_minor:393200},
  {id:'other-november-bills',statement_date:'2026-11-16',bill_amount_minor:994800,outstanding_minor:994800},
];
assert.deepEqual(calculateStatementTotals(novemberStatements,'2026-11','2026-11-17'),{
  billedMinor:1388000,
  outstandingMinor:1388000,
});
console.log('Regression passed: HDFC ₹3,932 October cycle is attributed to 1 Nov statement month; no-payment billed and unpaid totals both equal ₹13,880.');

// Per-card budget attribution changes only the reporting month, not cycle boundaries.
const attributionCycle = cycleFor({billing_rule:'end',billing_day:15,due_days:20},'2026-11-15');
assert.equal(attributionCycle.statement_date,'2026-11-16');
assert.equal(attributionCycle.due_date,'2026-12-05');
assert.equal(budgetAttributionDate(attributionCycle,{budget_attribution:'statement'}),'2026-11-16');
assert.equal(budgetAttributionDate(attributionCycle,{budget_attribution:'due'}),'2026-12-05');
assert.equal(isBudgetAttributedToMonth(attributionCycle,{budget_attribution:'statement'},'2026-11'),true);
assert.equal(isBudgetAttributedToMonth(attributionCycle,{budget_attribution:'due'},'2026-11'),false);
assert.equal(isBudgetAttributedToMonth(attributionCycle,{budget_attribution:'due'},'2026-12'),true);
console.log('Budget attribution tests passed: statement-month and due-month modes remain independent of billing-cycle boundaries.');
