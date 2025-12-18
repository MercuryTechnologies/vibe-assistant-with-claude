import * as React from 'react';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';

type GlobalNavProps = {
  initials?: string; // avatar fallback, default "xx"
  onMoveMoneyClick?: () => void;
  onNotificationsClick?: () => void;
};

export default function GlobalNav({
  initials = 'xx',
  onMoveMoneyClick,
  onNotificationsClick,
}: GlobalNavProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'k');
      if (isCmdK) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="mx-auto w-full px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Search */}
          <div className="w-[450px]">
            <label className="relative block">
              <span className="absolute inset-y-0 left-3 flex items-center">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </span>
              <input
                ref={inputRef}
                type="search"
                aria-label="Search"
                placeholder="Search or jump to"
                className="
                  w-full h-9 pl-9 pr-16 rounded-lg
                  bg-gray-100 border border-gray-200
                  text-sm text-gray-700 placeholder:text-gray-400
                  outline-none
                  focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100
                "
              />
              {/* ⌘K hint */}
              <span
                className="
                  pointer-events-none select-none
                  absolute inset-y-0 right-2 my-auto h-6
                  px-2 rounded-md border border-gray-200
                  text-[11px] leading-[22px] text-gray-600
                  bg-white
                "
                aria-hidden="true"
              >
                ⌘ K
              </span>
            </label>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            {/* Move Money */}
            <button
              type="button"
              onClick={onMoveMoneyClick}
              aria-haspopup="menu"
              aria-expanded="false"
              className="
                h-9 inline-flex items-center
                px-3 rounded-full border border-gray-200
                text-sm font-medium text-indigo-600
                hover:bg-gray-50 active:bg-gray-100
                focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300
              "
            >
              Move Money
              <ChevronDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
            </button>

            {/* Notifications */}
            <button
              type="button"
              aria-label="Notifications"
              onClick={onNotificationsClick}
              className="
                relative h-9 w-9 inline-flex items-center justify-center
                rounded-full hover:bg-gray-50 active:bg-gray-100
                border border-transparent
                focus:outline-none focus:ring-2 focus:ring-indigo-100
              "
            >
              <BellIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
              {/* Pink dot - hidden for now */}
              {/* <span
                className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-pink-500 ring-2 ring-white"
                aria-hidden="true"
              /> */}
            </button>

            {/* Avatar */}
            <button
              type="button"
              aria-label="Account"
              className="
                h-9 w-9 rounded-full
                inline-flex items-center justify-center
                bg-indigo-200 text-[13px] font-medium text-slate-700
                hover:brightness-105 active:brightness-95
                focus:outline-none focus:ring-2 focus:ring-indigo-100
              "
            >
              {initials}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
