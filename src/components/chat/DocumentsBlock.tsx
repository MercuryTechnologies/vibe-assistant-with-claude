import type { DocumentsMetadata, DocumentRow } from '@/chat/types';
import { Icon } from '@/components/ui/icon';
import { DSButton } from '@/components/ui/ds-button';
import { faFileText, faDownload, faCalendar } from '@/icons';

interface DocumentsBlockProps {
  data: DocumentsMetadata;
  context?: 'rhc' | 'command';
  className?: string;
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Get icon color based on document type
 */
function getTypeColor(type: DocumentRow['type']): string {
  switch (type) {
    case 'statement':
      return 'var(--purple-magic-600)';
    case 'tax':
      return 'var(--color-warning)';
    case 'receipt':
      return 'var(--color-success)';
    default:
      return 'var(--ds-icon-secondary)';
  }
}

/**
 * DocumentsBlock - Displays documents and statements
 */
export function DocumentsBlock({ 
  data, 
  context = 'rhc',
  className = '' 
}: DocumentsBlockProps) {
  const isCompact = context === 'rhc';
  
  const handleDownload = (doc: DocumentRow) => {
    // In a real app, this would trigger a download
    console.log('Downloading document:', doc.id);
  };
  
  return (
    <div className={`chat-documents ${className}`} style={{ marginTop: 12 }}>
      {data.title && (
        <h4 className="text-label-demi" style={{ 
          color: 'var(--ds-text-default)', 
          marginBottom: 8 
        }}>
          {data.title}
        </h4>
      )}
      
      <div className="flex flex-col gap-2">
        {data.documents.map((doc) => (
          <div 
            key={doc.id}
            className="flex items-center justify-between gap-3"
            style={{
              padding: '12px',
              backgroundColor: 'var(--ds-bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: 'var(--ds-bg-default)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Icon 
                  icon={faFileText} 
                  style={{ color: getTypeColor(doc.type) }} 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-body-sm" style={{ color: 'var(--ds-text-default)' }}>
                  {doc.name}
                </span>
                <div className="flex items-center gap-2">
                  <Icon icon={faCalendar} size="small" style={{ color: 'var(--ds-icon-tertiary)' }} />
                  <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>
                    {formatDate(doc.date)}
                  </span>
                  {!isCompact && doc.accountName && (
                    <>
                      <span style={{ color: 'var(--ds-text-tertiary)' }}>·</span>
                      <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>
                        {doc.accountName}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <DSButton
              variant="tertiary"
              size="small"
              iconOnly
              aria-label="Download document"
              onClick={() => handleDownload(doc)}
            >
              <Icon icon={faDownload} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
            </DSButton>
          </div>
        ))}
      </div>
    </div>
  );
}
