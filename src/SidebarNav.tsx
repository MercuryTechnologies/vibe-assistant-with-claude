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

// Default Font Awesome icon classes (using available outline/regular icons)
const getIconClass = (itemId: string): string => {
  const iconMap: Record<string, string> = {
    'home': 'far fa-home',
    'tasks': 'fas fa-list-check', // tasks icon doesn't exist in regular
    'transactions': 'fas fa-exchange-alt', // exchange-alt doesn't exist in regular
    'insights': 'fas fa-chart-line', // chart-line doesn't exist in regular
    'payments': 'far fa-credit-card',
    'cards': 'far fa-credit-card',
    'capital': 'fas fa-dollar-sign', // coins doesn't exist in regular
    'accounts': 'far fa-building',
    'bill-pay': 'far fa-file-alt', // file-invoice-dollar doesn't exist in regular
    'invoicing': 'far fa-file-alt', // file-invoice doesn't exist in regular
    'reimbursements': 'far fa-file-alt', // receipt doesn't exist in regular
    'accounting': 'fas fa-calculator', // calculator doesn't exist in regular
    'transfers': 'fas fa-arrow-right', // arrow-right doesn't exist in regular
    'wires': 'fas fa-network-wired', // network-wired doesn't exist in regular
  };
  return iconMap[itemId] || 'far fa-circle';
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
    <aside className="w-60 min-w-60 max-w-60 bg-[#FAFAFB] border-r border-[#ECEEF0] flex flex-col fixed top-0 left-0 h-screen overflow-y-auto">
      {/* Org switcher */}
      <div className="px-3 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-6 h-6 rounded-full bg-white border border-[#ECEEF0] flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <i className="fas fa-building text-gray-400 text-xs"></i>
              </div>
            </div>
            
            {/* Org name */}
            <span className="text-sm font-medium text-[#2B2E33]">{orgName}</span>
          </div>
          
          {/* Dropdown chevron */}
          <button
            className="w-7 h-7 flex items-center justify-center text-[#7A7F87] hover:text-[#2B2E33] hover:bg-[#F2F3F7] rounded transition-colors"
            aria-label="Switch organization"
          >
            <i className="fas fa-chevron-down text-xs"></i>
          </button>
        </div>
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 px-3 pb-4">
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className={sectionIndex > 0 ? 'mt-4' : ''}>
            {/* Section header */}
            {section.label && (
              <h3 className="text-[13px] font-medium text-[#7A7F87] tracking-[0.2px] mb-2 mt-4 first:mt-0">
                {section.label}
              </h3>
            )}
            
            {/* Section items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = item.href === activePath;
                const hasActiveChild = isChildActive(item);
                const isCollapsed = collapsedIds.includes(item.id);
                const isGroup = item.items && item.items.length > 0;
                
                // Determine colors based on state
                const getItemColors = () => {
                  if (isActive) {
                    return {
                      text: 'text-[#695CF6] font-medium',
                      icon: 'text-[#695CF6]',
                      bg: 'bg-[#EEF0FF]',
                    };
                  }
                  
                  if (hasActiveChild) {
                    return {
                      text: 'text-[#695CF6] font-medium',
                      icon: 'text-[#695CF6]',
                      bg: 'bg-transparent',
                    };
                  }
                  
                  return {
                    text: 'text-[#2B2E33] hover:text-[#2B2E33]',
                    icon: 'text-[#7A7F87] hover:text-[#2B2E33]',
                    bg: 'bg-transparent hover:bg-[#F2F3F7]',
                  };
                };

                const colors = getItemColors();

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        if (isGroup) {
                          onToggleGroup(item.id);
                        } else if (item.href) {
                          onNavigate(item.href);
                        }
                      }}
                      className={`
                        w-full flex items-center justify-between h-10 px-[10px] pr-[10px] 
                        rounded transition-all duration-150 text-sm font-medium
                        ${colors.bg} ${colors.text}
                        cursor-pointer
                      `}
                      aria-expanded={isGroup ? !isCollapsed : undefined}
                      aria-haspopup={isGroup ? 'true' : undefined}
                      role={isGroup ? 'button' : 'menuitem'}
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className={`w-[18px] h-[18px] flex items-center justify-center ${colors.icon} transition-colors duration-150`}>
                          <i className={item.icon || getIconClass(item.id)}></i>
                        </div>
                        
                        {/* Label */}
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Badge */}
                        {item.badgeCount && (
                          <div className="bg-[#EEF0FF] text-[#695CF6] text-xs font-medium px-2 py-1 rounded min-w-[20px] h-[20px] flex items-center justify-center">
                            {item.badgeCount}
                          </div>
                        )}
                        
                        {/* Chevron for groups */}
                        {isGroup && (
                          <div className={`w-4 h-4 flex items-center justify-center transition-transform duration-150 ${colors.icon} ${!isCollapsed ? 'rotate-90' : ''}`}>
                            <i className="fas fa-chevron-right text-xs"></i>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Collapsible children */}
                    {isGroup && (
                      <div
                        className={`overflow-hidden transition-all duration-200 ${
                          isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'
                        }`}
                        aria-hidden={isCollapsed}
                      >
                        <div className="mt-1 space-y-1">
                          {item.items?.map((childItem) => {
                            const childIsActive = childItem.href === activePath;
                            
                            // Child item colors
                            const childColors = childIsActive ? {
                              text: 'text-[#695CF6] font-medium',
                              icon: 'text-[#695CF6]',
                              bg: 'bg-[#EEF0FF]',
                            } : {
                              text: 'text-[#2B2E33] hover:text-[#2B2E33]',
                              icon: 'text-[#7A7F87] hover:text-[#2B2E33]',
                              bg: 'bg-transparent hover:bg-[#F2F3F7]',
                            };

                            return (
                              <button
                                key={childItem.id}
                                onClick={() => childItem.href && onNavigate(childItem.href)}
                                className={`
                                  w-full flex items-center justify-between h-10 pl-[28px] pr-[10px] 
                                  rounded transition-all duration-150 text-sm font-medium
                                  ${childColors.bg} ${childColors.text}
                                  cursor-pointer
                                `}
                                role="menuitem"
                              >
                                <div className="flex items-center gap-3">
                                  {/* Icon */}
                                  <div className={`w-[18px] h-[18px] flex items-center justify-center ${childColors.icon} transition-colors duration-150`}>
                                    <i className={childItem.icon || getIconClass(childItem.id)}></i>
                                  </div>
                                  
                                  {/* Label */}
                                  <span>{childItem.label}</span>
                                </div>

                                {/* Badge */}
                                {childItem.badgeCount && (
                                  <div className="bg-[#EEF0FF] text-[#695CF6] text-xs font-medium px-2 py-1 rounded min-w-[20px] h-[20px] flex items-center justify-center">
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
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default SidebarNav;