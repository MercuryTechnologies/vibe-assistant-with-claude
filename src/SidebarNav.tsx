import React from 'react';

export interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  badgeCount?: number;
  items?: SidebarItem[];
}

export interface SidebarSection {
  id: string;
  label?: string;
  items: SidebarItem[];
}

interface SidebarNavProps {
  orgName: string;
  sections: SidebarSection[];
  activePath: string;
  collapsedIds: string[];
  onToggleGroup: (id: string) => void;
  onNavigate: (href: string) => void;
}

// Font Awesome 6 icon classes mapped to item IDs
const getIconClass = (itemId: string): string => {
  const iconMap: Record<string, string> = {
    'home': 'fa-solid fa-house',
    'tasks': 'fa-solid fa-inbox',
    'transactions': 'fa-solid fa-list',
    'insights': 'fa-solid fa-chart-column',
    'payments': 'fa-solid fa-arrow-right-arrow-left',
    'cards': 'fa-solid fa-credit-card',
    'capital': 'fa-solid fa-chart-line',
    'accounts': 'fa-solid fa-building-columns',
    'bill-pay': 'fa-solid fa-envelope-open-text',
    'invoicing': 'fa-solid fa-file-invoice-dollar',
    'reimbursements': 'fa-solid fa-money-bill-transfer',
    'accounting': 'fa-solid fa-book-open',
    'transfers': 'fa-solid fa-arrow-right',
    'wires': 'fa-solid fa-globe',
  };
  return iconMap[itemId] || 'fa-solid fa-circle';
};

const SidebarNav: React.FC<SidebarNavProps> = ({
  orgName,
  sections,
  activePath,
  collapsedIds,
  onToggleGroup,
  onNavigate,
}) => {
  // Check if any child of a group is active
  const isChildActive = (item: SidebarItem): boolean => {
    if (!item.items) return false;
    return item.items.some(child => child.href === activePath);
  };

  return (
    <aside className="w-[216px] min-w-[216px] max-w-[216px] bg-[#f9f9fb] border-r border-[rgba(112,115,147,0.1)] flex flex-col fixed top-0 left-0 h-screen overflow-y-auto">
      {/* Org switcher */}
      <div className="py-3 border-b border-[rgba(112,115,147,0.1)]">
        <div className="px-3">
          <div className="flex items-center justify-between pl-1 pr-2 py-1 rounded-lg">
            <div className="flex items-center gap-2">
              {/* Logo */}
              <div className="w-8 h-8 rounded bg-white border border-[rgba(112,115,147,0.06)] flex items-center justify-center p-1.5">
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <circle cx="12" cy="12" r="10" stroke="#71718e" strokeWidth="1.5" fill="none"/>
                  <path d="M12 6v6l4 2" stroke="#71718e" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              
              {/* Org name */}
              <span className="text-[15px] leading-6 text-[#41415a] font-normal">{orgName}</span>
            </div>
            
            {/* Up/down chevron */}
            <div className="w-5 h-5 flex items-center justify-center text-[#70707d]">
              <i className="fa-solid fa-sort text-[11px]"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 pt-6">
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className={`flex flex-col gap-1 ${sectionIndex > 0 ? 'mt-6' : ''}`}>
            {/* Section header */}
            {section.label && (
              <div className="px-5 py-2">
                <span className="text-[13px] leading-5 text-[#70707d] tracking-[0.1px]">
                  {section.label}
                </span>
              </div>
            )}
            
            {/* Section items */}
            {section.items.map((item) => {
              const isActive = item.href === activePath;
              const hasActiveChild = isChildActive(item);
              const isCollapsed = collapsedIds.includes(item.id);
              const isGroup = item.items && item.items.length > 0;
              
              return (
                <div key={item.id} className="px-3">
                  {isGroup ? (
                    // Expandable group item
                    <button
                      onClick={() => onToggleGroup(item.id)}
                      className={`
                        w-full flex items-center justify-between rounded-lg cursor-pointer
                        ${hasActiveChild ? 'bg-[#f2f2f7]' : 'hover:bg-[#f2f2f7]'}
                      `}
                    >
                      <div className="flex items-center gap-3 pl-2 pr-1 py-1.5">
                        {/* Icon */}
                        <div className={`w-6 h-6 flex items-center justify-center ${hasActiveChild ? 'text-[#4d68eb]' : 'text-[#71718e]'}`}>
                          <i className={`${item.icon || getIconClass(item.id)} text-[13px]`}></i>
                        </div>
                        
                        {/* Label */}
                        <span className={`text-[15px] leading-6 ${hasActiveChild ? 'text-[#1f1f30] font-demi' : 'text-[#41415a]'}`}>
                          {item.label}
                        </span>
                      </div>

                      {/* Chevron */}
                      <div className="w-9 h-full flex items-center justify-center text-[#71718e]">
                        <i className={`fa-solid ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} text-[13px]`}></i>
                      </div>
                    </button>
                  ) : (
                    // Regular nav item
                    <button
                      onClick={() => item.href && onNavigate(item.href)}
                      className={`
                        w-full flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer
                        ${isActive ? 'bg-[#f2f2f7]' : 'hover:bg-[#f2f2f7]'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className={`w-6 h-6 flex items-center justify-center ${isActive ? 'text-[#4d68eb]' : 'text-[#71718e]'}`}>
                          <i className={`${item.icon || getIconClass(item.id)} text-[13px]`}></i>
                        </div>
                        
                        {/* Label */}
                        <span className={`text-[15px] leading-6 ${isActive ? 'text-[#1f1f30] font-demi' : 'text-[#41415a]'}`}>
                          {item.label}
                        </span>
                      </div>

                      {/* Badge */}
                      {item.badgeCount !== undefined && (
                        <div className="bg-[#e8e8ee] text-[#41415a] text-[12px] leading-5 px-1.5 min-w-[20px] h-5 flex items-center justify-center rounded">
                          {item.badgeCount}
                        </div>
                      )}
                    </button>
                  )}

                  {/* Collapsible children for groups */}
                  {isGroup && (
                    <div
                      className={`overflow-hidden transition-all duration-200 ${
                        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
                      }`}
                    >
                      <div className="mt-1">
                        {item.items?.map((childItem) => {
                          const childIsActive = childItem.href === activePath;
                          
                          return (
                            <button
                              key={childItem.id}
                              onClick={() => childItem.href && onNavigate(childItem.href)}
                              className={`
                                w-full flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer
                                ${childIsActive ? 'bg-[#f2f2f7]' : 'hover:bg-[#f2f2f7]'}
                              `}
                            >
                              <div className="flex items-center gap-3">
                                {/* Icon */}
                                <div className={`w-6 h-6 flex items-center justify-center ${childIsActive ? 'text-[#4d68eb]' : 'text-[#71718e]'}`}>
                                  <i className={`${childItem.icon || getIconClass(childItem.id)} text-[13px]`}></i>
                                </div>
                                
                                {/* Label */}
                                <span className={`text-[15px] leading-6 ${childIsActive ? 'text-[#1f1f30] font-demi' : 'text-[#41415a]'}`}>
                                  {childItem.label}
                                </span>
                              </div>

                              {/* Badge */}
                              {childItem.badgeCount !== undefined && (
                                <div className="bg-[#e8e8ee] text-[#41415a] text-[12px] leading-5 px-1.5 min-w-[20px] h-5 flex items-center justify-center rounded">
                                  {childItem.badgeCount}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default SidebarNav;
