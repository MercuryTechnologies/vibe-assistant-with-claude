import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faChartBar,
  faCreditCard,
  faBuilding,
  faEnvelope,
  faFileText,
  faSquare,
  faInbox,
  faList,
  faArrowRightArrowLeft,
  faChartLine,
  faRotateRight,
  faBookOpen,
  faChevronDown,
  faChevronUp,
  faChevronLeft,
  faLayerGroup,
  faPalette,
  faFont,
  faTerminal,
} from '@/icons';
import { componentRegistry, getComponentId } from '@/lib/component-registry';
import { useDataSettings, formatCurrency } from '@/context/DataContext';

export function Sidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  const isPaymentsRoute = location.pathname.startsWith('/payments');
  const isAccountsRoute = location.pathname.startsWith('/accounts');
  const isDesignSystemRoute = isActive('/components') || location.pathname.startsWith('/components/') || isActive('/colors') || isActive('/typography') || isActive('/border-radius');
  
  const [componentsExpanded, setComponentsExpanded] = useState(true);
  
  const [paymentsExpanded, setPaymentsExpanded] = useState(isPaymentsRoute);
  const [accountsExpanded, setAccountsExpanded] = useState(isAccountsRoute);
  
  // Auto-expand when navigating to a component page
  useEffect(() => {
    if (location.pathname.startsWith('/components/') || isActive('/components/list')) {
      setComponentsExpanded(true);
    }
  }, [location.pathname]);
  
  // Auto-expand payments when navigating to a payments route
  useEffect(() => {
    if (isPaymentsRoute) {
      setPaymentsExpanded(true);
    }
  }, [isPaymentsRoute]);

  // Auto-expand accounts when navigating to an accounts route
  useEffect(() => {
    if (isAccountsRoute) {
      setAccountsExpanded(true);
    }
  }, [isAccountsRoute]);

  const primaryNavigationItems = [
    { path: '/dashboard', label: 'Home', icon: faHome },
    { path: '/command', label: 'Command', icon: faTerminal },
    { path: '/tasks', label: 'Tasks', icon: faInbox, badge: 3 },
    { path: '/transactions', label: 'Transactions', icon: faList },
    { path: '/insights', label: 'Insights', icon: faChartBar },
    { path: '/cards', label: 'Cards', icon: faCreditCard },
    { path: '/capital', label: 'Capital', icon: faChartLine },
  ];

  // Get dynamic account balances from DataContext
  const { getAccountBalances } = useDataSettings();
  const dynamicAccounts = getAccountBalances();
  
  const accountsData = [
    { id: 'credit-card', label: 'Credit Card', balance: null, hasPage: false },
    ...dynamicAccounts.map(acc => ({
      id: acc.id,
      label: acc.name,
      balance: formatCurrency(acc.balance),
      // Treasury and Credit Card don't have detail pages
      hasPage: acc.type !== 'treasury',
    })),
  ];

  const paymentsSubmenuItems = [
    { path: '/payments/recipients', label: 'Recipients' },
    { path: '/payments/taxes', label: 'Taxes', badge: 'New' },
    { path: '/payments/wire-drawdowns', label: 'Wire Drawdowns' },
    { path: '/payments/ach-authorizations', label: 'ACH Authorizations' },
  ];

  const workflowItems = [
    { path: '/workflows/bill-pay', label: 'Bill Pay', icon: faEnvelope },
    { path: '/workflows/invoicing', label: 'Invoicing', icon: faFileText },
    { path: '/workflows/reimbursements', label: 'Reimbursements', icon: faRotateRight },
    { path: '/workflows/accounting', label: 'Accounting', icon: faBookOpen },
  ];

  // Design System Components List - dynamically derived from the component registry
  const designSystemComponents = useMemo(() => 
    componentRegistry.map(comp => ({
      name: comp.name,
      id: getComponentId(comp.name),
    })).sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  // If we're on a design system route, show the design system sidebar
  if (isDesignSystemRoute) {
  return (
    <aside className="ds-sidebar">
      {/* Back to Vibes Button */}
      <div className="ds-sidebar-header">
        <Link to="/dashboard">
          <button className="ds-sidebar-btn">
            <div className="ds-sidebar-btn-content">
              <span className="ds-sidebar-icon-wrapper">
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  className="ds-sidebar-icon"
                />
              </span>
              <span className="ds-sidebar-btn-label">Back to Vibes</span>
            </div>
          </button>
        </Link>
      </div>

      {/* Design System Pages */}
      <nav className="ds-sidebar-nav">
        {/* Overview */}
        <Link to="/components">
          <button
            className={`ds-sidebar-btn ${
              isActive('/components') && !location.pathname.startsWith('/components/') && !isActive('/components/list')
                ? 'active' 
                : ''
            }`}
          >
            <div className="ds-sidebar-btn-content">
              <span className="ds-sidebar-icon-wrapper">
                <FontAwesomeIcon
                  icon={faLayerGroup}
                  className="ds-sidebar-icon"
                />
              </span>
              <span className="ds-sidebar-btn-label">Overview</span>
            </div>
          </button>
        </Link>

        {/* Colors */}
        <Link to="/colors">
          <button
            className={`ds-sidebar-btn ${isActive('/colors') ? 'active' : ''}`}
          >
            <div className="ds-sidebar-btn-content">
              <span className="ds-sidebar-icon-wrapper">
                <FontAwesomeIcon
                  icon={faPalette}
                  className="ds-sidebar-icon"
                />
              </span>
              <span className="ds-sidebar-btn-label">Colors</span>
            </div>
          </button>
        </Link>

        {/* Typography */}
        <Link to="/typography">
          <button
            className={`ds-sidebar-btn ${isActive('/typography') ? 'active' : ''}`}
          >
            <div className="ds-sidebar-btn-content">
              <span className="ds-sidebar-icon-wrapper">
                <FontAwesomeIcon
                  icon={faFont}
                  className="ds-sidebar-icon"
                />
              </span>
              <span className="ds-sidebar-btn-label">Typography</span>
            </div>
          </button>
        </Link>

        {/* Border Radius */}
        <Link to="/border-radius">
          <button
            className={`ds-sidebar-btn ${isActive('/border-radius') ? 'active' : ''}`}
          >
            <div className="ds-sidebar-btn-content">
              <span className="ds-sidebar-icon-wrapper">
                <FontAwesomeIcon
                  icon={faSquare}
                  className="ds-sidebar-icon"
                />
              </span>
              <span className="ds-sidebar-btn-label">Border Radius</span>
            </div>
          </button>
        </Link>

        {/* Components Expandable Section */}
        <div>
          <button
            onClick={() => setComponentsExpanded(!componentsExpanded)}
            className={`ds-sidebar-btn ${
              location.pathname.startsWith('/components/') || isActive('/components/list')
                ? 'active'
                : ''
            }`}
          >
            <div className="ds-sidebar-btn-content">
              <span className="ds-sidebar-icon-wrapper">
                <FontAwesomeIcon
                  icon={faLayerGroup}
                  className="ds-sidebar-icon"
                />
              </span>
              <span className="ds-sidebar-btn-label">Components</span>
            </div>
            <span className={`ds-sidebar-chevron ${componentsExpanded ? 'expanded' : ''}`}>
              <FontAwesomeIcon icon={faChevronDown} />
            </span>
          </button>
          
          {/* Expanded Components List */}
          {componentsExpanded && (
            <div className="ds-sidebar-submenu">
              <Link to="/components/list">
                <button
                  className={`ds-sidebar-btn ${isActive('/components/list') ? 'active' : ''}`}
                  style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: '20px', padding: '4px 8px' }}
                >
                  <span className="ds-sidebar-btn-label">All Components</span>
                </button>
              </Link>
              {designSystemComponents.map((component) => {
                const isComponentActive = location.pathname === `/components/${component.id}`;
                return (
                  <Link
                    key={component.id}
                    to={`/components/${component.id}`}
                  >
                    <button
                      className={`ds-sidebar-btn ${isComponentActive ? 'active' : ''}`}
                      style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: '20px', padding: '4px 8px' }}
                    >
                      <span className="ds-sidebar-btn-label">{component.name}</span>
                    </button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        </nav>
      </aside>
    );
  }

  return (
    <aside className="ds-sidebar">
      {/* Company Selector */}
      <div className="ds-sidebar-header" style={{ height: '64px' }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ds-company-selector">
              <div className="ds-company-logo">
                <img 
                  src="/logo.svg" 
                  alt="Maker Inc." 
                  className="ds-company-logo-img"
                />
              </div>
              <span className="ds-company-selector-name">Maker Inc.</span>
              <FontAwesomeIcon 
                icon={faChevronDown} 
                className="ds-company-selector-chevron" 
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="ds-company-dropdown"
          >
            <DropdownMenuItem className="ds-dropdown-menu-item">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="ds-dropdown-menu-item">
              Docs & Statements
            </DropdownMenuItem>
            <DropdownMenuSeparator className="ds-dropdown-separator" />
            <DropdownMenuItem className="ds-dropdown-menu-item">
              Apply for a new account
            </DropdownMenuItem>
            <DropdownMenuItem className="ds-dropdown-menu-item">
              Link existing account
            </DropdownMenuItem>
            <DropdownMenuSeparator className="ds-dropdown-separator" />
            <DropdownMenuItem className="ds-dropdown-menu-item">
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation Items */}
      <nav className="ds-sidebar-nav">
        {/* Home, Command, Tasks, Transactions, Insights */}
        {primaryNavigationItems.slice(0, 5).map((item) => {
          const icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link key={item.path} to={item.path}>
              <button
                className={`ds-sidebar-btn ${active ? 'active' : ''}`}
              >
                <div className="ds-sidebar-btn-content">
                  <span className="ds-sidebar-icon-wrapper">
                    <FontAwesomeIcon
                      icon={icon}
                      className="ds-sidebar-icon"
                    />
                  </span>
                  <span className="ds-sidebar-btn-label">{item.label}</span>
                </div>
                {item.badge && (
                  <Badge type="pearl" className="ds-sidebar-btn-badge">
                    {item.badge}
                  </Badge>
                )}
              </button>
            </Link>
          );
        })}

        {/* Payments Expandable Section */}
        <div>
          <button
            onClick={() => setPaymentsExpanded(!paymentsExpanded)}
            className={`ds-sidebar-btn ${isPaymentsRoute ? 'active' : ''}`}
          >
            <div className="ds-sidebar-btn-content">
              <span className="ds-sidebar-icon-wrapper">
                <FontAwesomeIcon
                  icon={faArrowRightArrowLeft}
                  className="ds-sidebar-icon"
                />
              </span>
              <span className="ds-sidebar-btn-label">Payments</span>
            </div>
            <span className="ds-sidebar-chevron">
              <FontAwesomeIcon 
                icon={paymentsExpanded ? faChevronUp : faChevronDown}
              />
            </span>
          </button>
          
          {/* Expanded Payments Submenu */}
          {paymentsExpanded && (
            <div className="ds-sidebar-submenu">
              {paymentsSubmenuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link key={item.path} to={item.path}>
                    <button
                      className={`ds-sidebar-btn ${active ? 'active' : ''}`}
                    >
                      <span className="ds-sidebar-btn-label">{item.label}</span>
                      {item.badge && (
                        <Badge type="pearl" className="ds-sidebar-btn-badge">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Cards, Capital */}
        {primaryNavigationItems.slice(5).map((item) => {
          const icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link key={item.path} to={item.path}>
              <button
                className={`ds-sidebar-btn ${active ? 'active' : ''}`}
              >
                <div className="ds-sidebar-btn-content">
                  <span className="ds-sidebar-icon-wrapper">
                    <FontAwesomeIcon
                      icon={icon}
                      className="ds-sidebar-icon"
                    />
                  </span>
                  <span className="ds-sidebar-btn-label">{item.label}</span>
                </div>
              </button>
            </Link>
          );
        })}

        {/* Accounts Expandable Section */}
        <div>
          <button
            onClick={() => setAccountsExpanded(!accountsExpanded)}
            className={`ds-sidebar-btn ${location.pathname.startsWith('/accounts') ? 'active' : ''}`}
          >
            <div className="ds-sidebar-btn-content">
              <span className="ds-sidebar-icon-wrapper">
                <FontAwesomeIcon
                  icon={faBuilding}
                  className="ds-sidebar-icon"
                />
              </span>
              <span className="ds-sidebar-btn-label">Accounts</span>
            </div>
            <span className="ds-sidebar-chevron">
              <FontAwesomeIcon 
                icon={accountsExpanded ? faChevronUp : faChevronDown}
              />
            </span>
          </button>
          
          {/* Expanded Accounts List */}
          {accountsExpanded && (
            <div className="ds-sidebar-submenu" style={{ gap: '2px' }}>
              {accountsData.map((account) => {
                const isAccountActive = location.pathname === `/accounts/${account.id}`;
                const content = (
                  <div
                    className={`ds-account-list-item ${account.hasPage ? 'ds-account-list-item-clickable' : ''} ${isAccountActive ? 'active' : ''}`}
                  >
                    <div className="ds-account-list-name">
                      {account.label}
                    </div>
                    {account.balance && (
                      <div className="ds-account-list-balance">
                        {account.balance}
                      </div>
                    )}
                  </div>
                );

                if (account.hasPage) {
                  return (
                    <Link key={account.id} to={`/accounts/${account.id}`}>
                      {content}
                    </Link>
                  );
                }

                return <div key={account.id}>{content}</div>;
              })}
            </div>
          )}
        </div>

        {/* Workflows Section */}
        <div className="ds-sidebar-section">
          <div className="ds-sidebar-section-title">
            Workflows
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {workflowItems.map((item) => {
              const icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link key={item.path} to={item.path}>
                  <button
                    className={`ds-sidebar-btn ${active ? 'active' : ''}`}
                  >
                    <div className="ds-sidebar-btn-content">
                      <span className="ds-sidebar-icon-wrapper">
                        <FontAwesomeIcon
                          icon={icon}
                          className="ds-sidebar-icon"
                        />
                      </span>
                      <span className="ds-sidebar-btn-label">{item.label}</span>
                    </div>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Design System Section at Bottom */}
      <div className="ds-sidebar-footer">
        <Link to="/components">
          <button
            className={`ds-sidebar-btn ${isDesignSystemRoute ? 'active' : ''}`}
          >
            <div className="ds-sidebar-btn-content">
              <span className="ds-sidebar-icon-wrapper">
                <FontAwesomeIcon
                  icon={faLayerGroup}
                  className="ds-sidebar-icon"
                />
              </span>
              <span className="ds-sidebar-btn-label">Design System</span>
            </div>
          </button>
        </Link>
      </div>
    </aside>
  );
}
