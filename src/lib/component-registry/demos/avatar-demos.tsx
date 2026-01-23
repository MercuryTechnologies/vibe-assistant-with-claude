import { DSAvatar } from '@/components/ui/ds-avatar';

/**
 * Demo component showing all DSAvatar variants and sizes
 */
export function DSAvatarAllStatesDemo() {
  const letters = ['A', 'G', 'M', 'S', 'W'];
  const digits = ['0', '4', '7'];

  return (
    <div className="flex flex-col gap-6">
      {/* Trx (Transaction) Avatars - Letters */}
      <div className="flex flex-col gap-3">
        <span className="text-label-demi" style={{ color: 'var(--ds-text-secondary)' }}>
          Transaction Avatars (Letters)
        </span>
        <div className="flex items-center gap-4">
          {/* Small */}
          <div className="flex flex-col gap-2 items-center">
            <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Small</span>
            <div className="flex items-center gap-2">
              {letters.map((letter) => (
                <DSAvatar key={letter} type="trx" name={letter} size="small" />
              ))}
            </div>
          </div>
          {/* Large */}
          <div className="flex flex-col gap-2 items-center">
            <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Large</span>
            <div className="flex items-center gap-2">
              {letters.map((letter) => (
                <DSAvatar key={letter} type="trx" name={letter} size="large" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trx (Transaction) Avatars - Digits */}
      <div className="flex flex-col gap-3">
        <span className="text-label-demi" style={{ color: 'var(--ds-text-secondary)' }}>
          Transaction Avatars (Digits)
        </span>
        <div className="flex items-center gap-4">
          {/* Small */}
          <div className="flex flex-col gap-2 items-center">
            <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Small</span>
            <div className="flex items-center gap-2">
              {digits.map((digit) => (
                <DSAvatar key={digit} type="trx" name={digit} size="small" />
              ))}
            </div>
          </div>
          {/* Large */}
          <div className="flex flex-col gap-2 items-center">
            <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Large</span>
            <div className="flex items-center gap-2">
              {digits.map((digit) => (
                <DSAvatar key={digit} type="trx" name={digit} size="large" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Role Avatars */}
      <div className="flex flex-col gap-3">
        <span className="text-label-demi" style={{ color: 'var(--ds-text-secondary)' }}>
          Role Avatars
        </span>
        <div className="flex items-center gap-4">
          {/* Small */}
          <div className="flex flex-col gap-2 items-center">
            <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Small</span>
            <div className="flex items-center gap-2">
              <DSAvatar type="role-admin" size="small" />
              <DSAvatar type="role-custom" size="small" />
              <DSAvatar type="role-bookkeeper" size="small" />
              <DSAvatar type="role-card-only" size="small" />
            </div>
          </div>
          {/* Large */}
          <div className="flex flex-col gap-2 items-center">
            <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Large</span>
            <div className="flex items-center gap-2">
              <DSAvatar type="role-admin" size="large" />
              <DSAvatar type="role-custom" size="large" />
              <DSAvatar type="role-bookkeeper" size="large" />
              <DSAvatar type="role-card-only" size="large" />
            </div>
          </div>
        </div>
      </div>

      {/* Special Avatars */}
      <div className="flex flex-col gap-3">
        <span className="text-label-demi" style={{ color: 'var(--ds-text-secondary)' }}>
          Special Avatars
        </span>
        <div className="flex items-center gap-4">
          {/* Small */}
          <div className="flex flex-col gap-2 items-center">
            <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Small</span>
            <div className="flex items-center gap-2">
              <DSAvatar type="mercury" size="small" />
              <DSAvatar type="merchant" size="small" />
              <DSAvatar type="financial-institution" size="small" />
            </div>
          </div>
          {/* Large */}
          <div className="flex flex-col gap-2 items-center">
            <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Large</span>
            <div className="flex items-center gap-2">
              <DSAvatar type="mercury" size="large" />
              <DSAvatar type="merchant" size="large" />
              <DSAvatar type="financial-institution" size="large" />
            </div>
          </div>
        </div>
      </div>

      {/* Image Avatars */}
      <div className="flex flex-col gap-3">
        <span className="text-label-demi" style={{ color: 'var(--ds-text-secondary)' }}>
          Image Avatars
        </span>
        <div className="flex items-center gap-4">
          {/* Small */}
          <div className="flex flex-col gap-2 items-center">
            <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Small</span>
            <div className="flex items-center gap-2">
              <DSAvatar type="image" size="small" />
              <DSAvatar type="image" size="small" src="https://i.pravatar.cc/100?u=1" />
            </div>
          </div>
          {/* Large */}
          <div className="flex flex-col gap-2 items-center">
            <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Large</span>
            <div className="flex items-center gap-2">
              <DSAvatar type="image" size="large" />
              <DSAvatar type="image" size="large" src="https://i.pravatar.cc/100?u=2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Demo component showing Trx avatars in small size
 */
export function DSAvatarTrxSmallDemo() {
  const names = ['Acme Corp', 'Bank of America', 'Costco', 'Delta Airlines', 'eBay'];

  return (
    <div className="flex items-center gap-3">
      {names.map((name) => (
        <DSAvatar key={name} type="trx" name={name} size="small" />
      ))}
    </div>
  );
}

/**
 * Demo component showing Trx avatars in large size
 */
export function DSAvatarTrxLargeDemo() {
  const names = ['Acme Corp', 'Bank of America', 'Costco', 'Delta Airlines', 'eBay'];

  return (
    <div className="flex items-center gap-3">
      {names.map((name) => (
        <DSAvatar key={name} type="trx" name={name} size="large" />
      ))}
    </div>
  );
}

/**
 * Demo component showing Role avatars
 */
export function DSAvatarRoleDemo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center gap-1">
        <DSAvatar type="role-admin" size="large" />
        <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Admin</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <DSAvatar type="role-custom" size="large" />
        <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Custom</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <DSAvatar type="role-bookkeeper" size="large" />
        <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Bookkeeper</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <DSAvatar type="role-card-only" size="large" />
        <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Card Only</span>
      </div>
    </div>
  );
}

/**
 * Demo component showing Special avatars (Mercury, Merchant, Financial Institution)
 */
export function DSAvatarSpecialDemo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center gap-1">
        <DSAvatar type="mercury" size="large" />
        <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Mercury</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <DSAvatar type="merchant" size="large" />
        <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Merchant</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <DSAvatar type="financial-institution" size="large" />
        <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>Bank</span>
      </div>
    </div>
  );
}
