import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GroupedTable, type GroupedData } from '@/components/ui/grouped-table';
import { sampleGroupItems, type DemoTransaction } from '../sample-data';

const sampleGroups: GroupedData<DemoTransaction>[] = [
  { groupKey: 'taxes', groupLabel: 'Taxes', items: sampleGroupItems, moneyIn: 8211, moneyOut: 8211 },
  { groupKey: 'ops-payroll', groupLabel: 'Ops/Payroll', items: sampleGroupItems.slice(0, 2), moneyIn: 6047, moneyOut: 6047 },
  { groupKey: 'ar', groupLabel: 'AR', items: sampleGroupItems.slice(1), moneyIn: 5757, moneyOut: 5757 },
  { groupKey: 'ap', groupLabel: 'AP', items: sampleGroupItems, moneyIn: 3108, moneyOut: 3108 },
  { groupKey: 'treasury', groupLabel: 'Treasury', items: sampleGroupItems.slice(0, 1), moneyIn: 854, moneyOut: 854 },
];

export function GroupedTableDefaultDemo() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  const handleToggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };
  
  return (
    <div className="border rounded-md overflow-hidden" style={{ borderColor: "var(--color-border-default)" }}>
      <GroupedTable
        groups={sampleGroups}
        expandedGroups={expandedGroups}
        onToggleGroup={handleToggleGroup}
        onExpandGroup={handleToggleGroup}
        getItemKey={(item) => item.id}
        renderItems={(items) => (
          <div style={{ paddingLeft: 48, backgroundColor: "var(--ds-bg-default-hovered)" }}>
            {items.map((item, idx) => {
              const isLast = idx === items.length - 1
              const isPositive = item.amount >= 0

              return (
                <div
                  key={item.id}
                  className="flex items-center px-4"
                  style={{
                    height: 49,
                    borderBottom: isLast ? "none" : "1px solid var(--color-border-default)",
                  }}
                >
                  <span className="text-body flex-1" style={{ color: "var(--ds-text-default)" }}>
                    {item.merchant}
                  </span>
                  <span
                    className="text-body"
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      color: isPositive ? "var(--color-success)" : "var(--ds-text-default)",
                    }}
                  >
                    {isPositive ? "" : "−"}${Math.abs(item.amount).toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      />
    </div>
  );
}

export const groupedTableVariantComponents: Record<string, React.ComponentType> = {
  'Default': GroupedTableDefaultDemo,
};
