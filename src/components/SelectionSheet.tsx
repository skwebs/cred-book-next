import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';

export type SelectionOption = { value: string; label: string; description?: string; disabled?: boolean };

type SelectionSheetProps = {
  open: boolean;
  title: string;
  value: string;
  options: SelectionOption[];
  onChange: (value: string) => void;
  onClose: () => void;
  description?: string;
};

export function SelectionSheet({ open, title, value, options, onChange, onClose, description }: SelectionSheetProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="selection-sheet-backdrop fixed inset-0 z-120 flex items-end justify-center p-3 backdrop-blur-sm sm:items-center" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-label={title} className="selection-sheet w-full max-w-lg overflow-hidden rounded-4xl border shadow-2xl">
        <header className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="text-base font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label={`Close ${title}`} className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800"><X size={20}/></button>
        </header>
        <div className="max-h-[min(58dvh,560px)] space-y-2 overflow-y-auto p-4">
          <div role="radiogroup" aria-label={title} className="space-y-2">
            {options.map(option => {
              const selected = option.value === value;
              return <button key={option.value} type="button" role="radio" aria-checked={selected} disabled={option.disabled} onClick={() => { onChange(option.value); onClose(); }} className={`selection-sheet-option flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${selected ? 'selection-sheet-option-selected' : ''}`}>
                <span className="min-w-0"><span className="block text-sm font-semibold">{option.label}</span>{option.description && <span className="mt-1 block text-xs leading-5 text-neutral-400">{option.description}</span>}</span>
                <span className={`selection-radio shrink-0 ${selected ? 'is-selected' : ''}`} aria-hidden="true">{selected && <span className="selection-radio-dot"/>}</span>
              </button>;
            })}
          </div>
          {description && <p className="pt-1 text-xs leading-5 text-neutral-500">{description}</p>}
        </div>
      </section>
    </div>, document.body
  );
}

type SelectionControlProps = {
  title: string;
  value: string;
  options: SelectionOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

export function SelectionControl({ title, value, options, onChange, disabled = false, className = '' }: SelectionControlProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(option => option.value === value)?.label || options[0]?.label || 'Select';
  return <>
    <button type="button" disabled={disabled} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} className={`flex w-full min-w-0 items-center justify-between gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 px-3.5 py-3 text-left text-base text-neutral-100 disabled:opacity-50 ${className}`}>
      <span className="min-w-0 whitespace-nowrap">{selectedLabel}</span><ChevronDown size={18} className="shrink-0 text-neutral-400"/>
    </button>
    <SelectionSheet open={open} title={title} value={value} options={options} onChange={onChange} onClose={() => setOpen(false)}/>
  </>;
}
