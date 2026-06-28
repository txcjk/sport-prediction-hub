import { useEffect, useRef, useState } from 'react';

export default function ProbabilityBar({ label, value, colorClass = 'bg-emerald-400' }) {
  const [width, setWidth] = useState(0);
  const barRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-8 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          ref={barRef}
          className={`h-full rounded-full transition-all duration-800 ease-out ${colorClass}`}
          style={{
            width: `${width}%`,
            transition: 'width 0.8s ease-out',
          }}
        />
      </div>
      <span className={`text-xs font-semibold w-8 text-right ${colorClass.replace('bg-', 'text-')}`}>
        {value}%
      </span>
    </div>
  );
}
