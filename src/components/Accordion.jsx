import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './Accordion.css';

export default function Accordion({ items, defaultOpen = 0 }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="accordion">
      {items.map((item, i) => (
        <div className={`accordion__item ${open === i ? 'is-open' : ''}`} key={item.title}>
          <button type="button" className="accordion__trigger" onClick={() => setOpen(open === i ? -1 : i)}>
            {item.title}
            <ChevronDown size={16} className="accordion__chevron" />
          </button>
          <div className="accordion__panel">
            <div className="accordion__panel-inner">{item.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
