import { useEffect, useRef, useState } from "react";

function Dropdown({ label, items = [], align = "left", buttonClassName = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`font-label text-sm font-medium transition-all hover:-translate-y-0.5 hover:text-primary ${buttonClassName}`.trim()}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        {label}
      </button>
      {isOpen ? (
        <div
          className={`absolute top-full z-40 mt-3 min-w-[180px] rounded-xl border border-outline-variant/20 bg-surface-container-highest p-2 shadow-xl ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              className="w-full rounded-lg px-3 py-2 text-left text-xs text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              onClick={item.onClick}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default Dropdown;
