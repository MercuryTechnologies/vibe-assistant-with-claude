import { useDeferredValue, useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/hooks';
import { Icon } from '@/components/ui/icon';
import { DSButton } from '@/components/ui/ds-button';
import {
  faBell,
  faCreditCard,
  faUser,
  faFile,
  faMagnifyingGlass,
  faChevronDown,
  faXmark,
  faGlobe,
  faList,
  faUniversity,
  faUserCircle,
} from '@/icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface KeyboardKeyProps {
  children: React.ReactNode;
}

function KeyboardKey({ children }: KeyboardKeyProps) {
  return (
    <span 
      className="flex items-center justify-center rounded-sm px-1"
      style={{ 
        height: 20, 
        minWidth: 20, 
        backgroundColor: 'rgba(112,115,147,0.06)', 
        fontFamily: 'var(--font-sans)',
        fontSize: 11, 
        fontWeight: 500,
        color: 'var(--neutral-base-500)' 
      }}
    >
      {children}
    </span>
  );
}

interface UpdatesButtonProps {
  hasUpdates?: boolean;
}

function UpdatesButton({ hasUpdates = true }: UpdatesButtonProps) {
  return (
    <button
      className="relative flex items-center justify-center rounded-full transition-colors"
      style={{ 
        height: 40, 
        width: 40, 
        backgroundColor: 'rgba(112,115,147,0.06)' 
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(112,115,147,0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(112,115,147,0.06)'}
      aria-label="Notifications"
    >
      <Icon 
        icon={faBell} 
        size="default"
        style={{ color: 'var(--neutral-base-500)' }}
      />
      {hasUpdates && (
        <span 
          className="absolute rounded-full"
          style={{ 
            top: 2, 
            right: 6, 
            height: 8, 
            width: 8, 
            backgroundColor: 'var(--red-magic-600)' 
          }}
        />
      )}
    </button>
  );
}

interface FilterChipProps {
  icon: IconDefinition;
  label: string;
}

function FilterChip({ icon, label }: FilterChipProps) {
  return (
    <button 
      className="flex items-center gap-1 rounded-sm transition-colors"
      style={{ 
        height: 24, 
        padding: '2px 6px', 
        backgroundColor: 'rgba(112,115,147,0.1)' 
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(112,115,147,0.16)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(112,115,147,0.1)'}
    >
      <Icon 
        icon={icon} 
        size="small"
        style={{ color: 'var(--neutral-base-500)' }}
      />
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: '20px', letterSpacing: '0.2px', color: 'var(--neutral-base-700)' }}>
        {label}
      </span>
    </button>
  );
}

interface ResultItemProps {
  icon: IconDefinition;
  text: string;
  rightText?: string;
  isActive?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
}

function ResultItem({ icon, text, rightText, isActive = false, onClick, onMouseEnter }: ResultItemProps) {
  return (
    <div className="flex w-full items-center justify-center px-2">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onMouseEnter={onMouseEnter}
        onClick={onClick}
        className="flex w-full items-center justify-between rounded-md transition-colors"
        style={{ 
          padding: '8px 8px 8px 4px',
          backgroundColor: isActive ? 'rgba(112,115,147,0.06)' : 'transparent'
        }}
        aria-selected={isActive}
      >
        <div className="flex items-start gap-1">
          <Icon
            icon={icon}
            size="default"
            style={{ color: 'var(--neutral-base-500)' }}
          />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: '24px', color: 'var(--neutral-base-700)' }}>{text}</span>
        </div>
        {rightText ? (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: '20px', letterSpacing: '0.2px', color: 'var(--neutral-base-500)' }}>
            {rightText}
          </span>
        ) : null}
      </button>
    </div>
  );
}

export function TopNav() {
  const { user, fullName, initials } = useUser();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(searchQuery);

  const normalizeSearchToken = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  type SearchItem = {
    id: string;
    group: 'Pages' | 'Actions';
    icon: IconDefinition;
    title: string;
    keywords: string[];
    jumpLabel?: string;
    onSelect: () => void;
  };

  function fuzzyScore(needleRaw: string, haystackRaw: string) {
    const needle = normalizeSearchToken(needleRaw);
    const hay = normalizeSearchToken(haystackRaw);
    if (!needle) return 0;
    if (!hay) return 0;
    if (needle.length > hay.length) return 0;

    if (hay === needle) return 10000;
    if (hay.startsWith(needle)) return 9000 - Math.min(hay.length, 100);

    let score = 0;
    let lastMatch = -1;
    let consecutive = 0;
    for (let i = 0, j = 0; i < needle.length; i++) {
      const ch = needle[i]!;
      let found = -1;
      while (j < hay.length) {
        if (hay[j] === ch) {
          found = j;
          break;
        }
        j++;
      }
      if (found === -1) return 0;

      if (found === lastMatch + 1) {
        consecutive++;
        score += 40 + consecutive * 10;
      } else {
        consecutive = 0;
        score += 20;
      }

      score += Math.max(0, 15 - found);

      lastMatch = found;
      j = found + 1;
    }

    return 1000 + score;
  }

  const searchItems = useMemo<SearchItem[]>(() => {
    const closeAndNavigate = (path: string) => {
      navigate(path);
      closeSearch();
    };

    const pages: SearchItem[] = [
      { id: 'page:ds', group: 'Pages', icon: faList, title: 'Design System', jumpLabel: 'ds', keywords: ['design system', 'components', 'ui'], onSelect: () => closeAndNavigate('/components') },
      { id: 'page:dashboard', group: 'Pages', icon: faList, title: 'Dashboard', jumpLabel: 'dashboard', keywords: ['home'], onSelect: () => closeAndNavigate('/dashboard') },
      { id: 'page:tasks', group: 'Pages', icon: faList, title: 'Tasks', jumpLabel: 'tasks', keywords: ['todo', 'to do'], onSelect: () => closeAndNavigate('/tasks') },
      { id: 'page:transactions', group: 'Pages', icon: faList, title: 'Transactions', jumpLabel: 'transactions', keywords: ['payments'], onSelect: () => closeAndNavigate('/transactions') },
      { id: 'page:cards', group: 'Pages', icon: faList, title: 'Cards', jumpLabel: 'cards', keywords: ['credit', 'debit'], onSelect: () => closeAndNavigate('/cards') },
      { id: 'page:typography', group: 'Pages', icon: faList, title: 'Typography', jumpLabel: 'typography', keywords: ['fonts', 'type'], onSelect: () => closeAndNavigate('/typography') },
      { id: 'page:colors', group: 'Pages', icon: faList, title: 'Colors', jumpLabel: 'colors', keywords: ['palette'], onSelect: () => closeAndNavigate('/colors') },
      { id: 'page:border-radius', group: 'Pages', icon: faList, title: 'Border Radius', jumpLabel: 'radius', keywords: ['rounding', 'border radius'], onSelect: () => closeAndNavigate('/border-radius') },
      { id: 'page:components-list', group: 'Pages', icon: faList, title: 'Components (List)', jumpLabel: 'componentslist', keywords: ['gallery', 'list'], onSelect: () => closeAndNavigate('/components/list') },
    ];

    const actions: SearchItem[] = [
      { id: 'action:send-money', group: 'Actions', icon: faList, title: 'Send money', keywords: ['send', 'payment', 'transfer'], onSelect: () => closeSearch() },
      { id: 'action:add-recipient', group: 'Actions', icon: faList, title: 'Add new recipient', keywords: ['recipient', 'payee', 'contact'], onSelect: () => closeSearch() },
    ];

    return [...pages, ...actions];
  }, [navigate]);

  const visibleResults = useMemo(() => {
    const raw = deferredQuery.trim();
    const isJump = raw.startsWith('/');
    const needle = raw.replace(/^\/+/, '').trim();

    if (!needle) {
      const suggested = searchItems.filter((i) => i.group === 'Pages').slice(0, 6);
      return { isJump, needle, results: suggested };
    }

    const pool = isJump ? searchItems.filter((i) => i.group === 'Pages') : searchItems;

    const scored = pool
      .map((item) => {
        const fields = [item.title, ...(item.jumpLabel ? [item.jumpLabel] : []), ...item.keywords];
        let best = 0;
        for (const f of fields) best = Math.max(best, fuzzyScore(needle, f));
        return { item, score: best };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((x) => x.item);

    return { isJump, needle, results: scored };
  }, [deferredQuery, searchItems]);

  function closeSearch() {
    setIsSearchOpen(false);
    setSearchQuery('');
    setActiveResultIndex(0);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery('');
        setActiveResultIndex(0);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isK = e.key.toLowerCase() === 'k';
      if (!isK) return;
      if (!(e.metaKey || e.ctrlKey)) return;

      e.preventDefault();
      setIsSearchOpen(true);
      setSearchQuery('');
      setActiveResultIndex(0);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    setActiveResultIndex(0);
  }, [searchQuery, isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;
    if (visibleResults.results.length === 0) {
      setActiveResultIndex(0);
      return;
    }
    setActiveResultIndex((i) => Math.max(0, Math.min(i, visibleResults.results.length - 1)));
  }, [visibleResults.results.length, isSearchOpen]);

  return (
    <header 
      className="flex w-full items-center justify-between bg-white px-6"
      style={{ height: 64, borderBottom: '1px solid rgba(112,115,147,0.1)' }}
    >
      <div className="flex flex-1 items-start justify-between min-h-px min-w-0">
        {/* Omnisearch Bar */}
        <div className="relative" ref={searchContainerRef}>
          {/* Search Trigger (shown when closed) */}
          {!isSearchOpen && (
            <button
              className="relative flex items-center justify-between rounded-md transition-colors"
              style={{ 
                height: 40, 
                width: 450, 
                border: '1px solid rgba(112,115,147,0.16)', 
                backgroundColor: 'var(--neutral-base-50)',
                padding: '0 16px'
              }}
              aria-label="Search or jump to"
              onClick={() => {
                setIsSearchOpen(true);
                setSearchQuery('');
                setActiveResultIndex(0);
              }}
            >
              <div className="flex items-center gap-3" style={{ height: 32 }}>
                <Icon 
                  icon={faMagnifyingGlass} 
                  size="default"
                  style={{ color: 'var(--neutral-base-400)' }}
                />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: '24px', color: 'var(--neutral-base-400)' }}>
                  Search or jump to
                </span>
              </div>
              <div className="flex items-center gap-1">
                <KeyboardKey>⌘</KeyboardKey>
                <KeyboardKey>K</KeyboardKey>
              </div>
            </button>
          )}

          {/* Search Dropdown (shown when open) */}
          {isSearchOpen && (
            <div 
              className="absolute top-0 left-0 z-50 overflow-hidden rounded-md bg-white"
              style={{ 
                width: 700, 
                boxShadow: '0px 8px 12px 0px rgba(4,4,52,0.03), 0px 14px 20px 0px rgba(4,4,52,0.03)' 
              }}
            >
              {/* Search Input */}
              <div 
                className="relative flex items-center justify-between bg-white rounded-t-md"
                style={{ border: '1px solid rgba(112,115,147,0.1)', padding: '4px 16px' }}
              >
                <div className="flex flex-1 items-center gap-3" style={{ height: 32 }}>
                  <Icon 
                    icon={faMagnifyingGlass} 
                    size="default"
                    style={{ color: 'var(--neutral-base-500)' }}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search or jump to"
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: '24px', color: 'var(--neutral-base-700)', border: 'none' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        closeSearch();
                        return;
                      }

                      if (e.key === 'ArrowDown') {
                        if (visibleResults.results.length > 0) {
                          e.preventDefault();
                          setActiveResultIndex((i) => (i + 1) % visibleResults.results.length);
                        }
                        return;
                      }

                      if (e.key === 'ArrowUp') {
                        if (visibleResults.results.length > 0) {
                          e.preventDefault();
                          setActiveResultIndex((i) => (i - 1 + visibleResults.results.length) % visibleResults.results.length);
                        }
                        return;
                      }

                      if (e.key === 'Enter') {
                        if (visibleResults.results.length > 0) {
                          e.preventDefault();
                          const selected = visibleResults.results[Math.min(activeResultIndex, visibleResults.results.length - 1)];
                          selected?.onSelect();
                        }
                      }
                    }}
                  />
                </div>
                <DSButton
                  variant="tertiary"
                  size="small"
                  iconOnly
                  onClick={() => closeSearch()}
                >
                  <Icon 
                    icon={faXmark} 
                    size="default"
                    style={{ color: 'var(--neutral-base-500)' }}
                  />
                </DSButton>
                {/* Focus indicator line */}
                <div className="absolute inset-x-0 bottom-0" style={{ height: 2, backgroundColor: '#4d68eb' }} />
              </div>

              {/* Filter Bar */}
              <div style={{ borderLeft: '1px solid rgba(112,115,147,0.1)', borderRight: '1px solid rgba(112,115,147,0.1)', borderBottom: '1px solid rgba(112,115,147,0.1)', paddingBottom: 16 }}>
                <div className="px-4" style={{ paddingBottom: 8, paddingTop: 12 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: '20px', letterSpacing: '0.1px', color: 'var(--neutral-base-500)' }}>
                    Searching for
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 px-4">
                  <FilterChip icon={faGlobe} label="Pages" />
                  <FilterChip icon={faList} label="Transactions" />
                  <FilterChip icon={faUniversity} label="Accounts" />
                  <FilterChip icon={faCreditCard} label="Cards" />
                  <FilterChip icon={faUser} label="Recipients" />
                  <FilterChip icon={faUserCircle} label="Team" />
                  <FilterChip icon={faFile} label="Statements" />
                </div>
              </div>

              {/* Results */}
              <div style={{ borderLeft: '1px solid rgba(112,115,147,0.1)', borderRight: '1px solid rgba(112,115,147,0.1)', paddingBottom: 8 }}>
                <div className="px-4" style={{ paddingBottom: 8, paddingTop: 12 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: '20px', letterSpacing: '0.1px', color: 'var(--neutral-base-500)' }}>
                    {visibleResults.needle ? 'Results' : 'Suggested'}
                  </span>
                </div>

                {visibleResults.results.length > 0 ? (
                  visibleResults.results.map((item, idx) => (
                    <ResultItem
                      key={item.id}
                      icon={item.icon}
                      text={item.title}
                      rightText={visibleResults.isJump && item.jumpLabel ? `/${item.jumpLabel}` : undefined}
                      isActive={idx === activeResultIndex}
                      onMouseEnter={() => setActiveResultIndex(idx)}
                      onClick={item.onSelect}
                    />
                  ))
                ) : (
                  <div className="px-4" style={{ paddingBottom: 12, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: '20px', letterSpacing: '0.1px', color: 'var(--neutral-base-500)' }}>
                    No results found.
                  </div>
                )}
              </div>

              {/* Footer */}
              <div 
                className="flex items-center justify-between rounded-b-md px-4"
                style={{ border: '1px solid rgba(112,115,147,0.1)', padding: '8px 16px' }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <KeyboardKey>/</KeyboardKey>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: '20px', letterSpacing: '0.2px', color: 'var(--neutral-base-500)' }}>
                      Filter
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <KeyboardKey>↑</KeyboardKey>
                    <KeyboardKey>↓</KeyboardKey>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: '20px', letterSpacing: '0.2px', color: 'var(--neutral-base-500)' }}>
                      Navigate
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <KeyboardKey>↵</KeyboardKey>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: '20px', letterSpacing: '0.2px', color: 'var(--neutral-base-500)' }}>
                      Select
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1" style={{ fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: '20px', letterSpacing: '0.2px' }}>
                  <span style={{ color: 'var(--neutral-base-500)' }}>Not what you're looking for?</span>
                  <span style={{ color: 'var(--neutral-base-500)' }}>Try the</span>
                  <a href="#" style={{ color: '#5266eb', textDecoration: 'none', background: 'none' }}>Help Center</a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Content */}
        <div className="flex items-center justify-end gap-6 self-stretch">
          {/* Move Money Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center justify-center gap-2 rounded-full bg-white transition-colors"
                style={{ 
                  height: 40, 
                  border: '1px solid rgba(112,115,147,0.16)', 
                  padding: '8px 28px 8px 32px' 
                }}
              >
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 480, lineHeight: '24px', color: 'var(--purple-magic-600)' }}>
                  Move Money
                </span>
                <Icon 
                  icon={faChevronDown} 
                  size="default"
                  style={{ color: 'var(--neutral-base-700)' }}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent style={{ width: 224 }} align="end">
              <DropdownMenuItem>Send Money</DropdownMenuItem>
              <DropdownMenuItem>Request Money</DropdownMenuItem>
              <DropdownMenuItem>Transfer Between Accounts</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Pay Bills</DropdownMenuItem>
              <DropdownMenuItem>Wire Transfer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications and User Menu */}
          <div className="flex h-full items-center justify-center gap-4">
            {/* Notifications Button */}
            <UpdatesButton hasUpdates />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-start rounded-sm"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <Avatar style={{ height: 40, width: 40 }}>
                    <AvatarFallback style={{ backgroundColor: 'var(--purple-magic-600)', color: 'white', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500 }}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent style={{ width: 224 }} align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-label-demi" style={{ lineHeight: 1 }}>{fullName}</p>
                    <p className="text-tiny text-muted-foreground" style={{ lineHeight: 1 }}>
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
