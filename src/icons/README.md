# Font Awesome Pro Icons

This directory contains the Font Awesome Pro 7.1.0 icon definitions for the Mercury Design System.

## License

Font Awesome Pro is a commercial product. See `LICENSE.txt` for details.

## Usage

Import icons from `@/icons`:

```tsx
import { faHome, faChevronDown, faCheck } from '@/icons';
import { Icon } from '@/components/ui/icon';

<Icon icon={faHome} />
<Icon icon={faChevronDown} size="small" />
```

## Adding New Icons

1. Edit `generate-icons.cjs` and add the new icon to the `iconMapping` object:

```js
const iconMapping = {
  // ... existing icons ...
  'new-icon-name': ['faNewIconName', 'solid'], // or 'regular'
};
```

2. Run the generator:

```bash
node src/icons/generate-icons.cjs
```

3. Import and use the new icon:

```tsx
import { faNewIconName } from '@/icons';
```

## Files

- `index.ts` - Auto-generated TypeScript icon definitions
- `generate-icons.cjs` - Script to generate icon definitions from metadata
- `icons.json` - Font Awesome Pro metadata (source data)
- `LICENSE.txt` - Font Awesome Pro license

## Available Icons

See `index.ts` for the complete list of available icons.

### Regular Style (far)
- faHome, faChartBar, faCreditCard, faBuilding, faEnvelope, faFileText
- faBookmark, faBell, faUser, faFile, faCalendar, faSquare
- faCircle, faCircleQuestion, faClock, faPaperPlane

### Solid Style (fas)
- faInbox, faList, faArrowRightArrowLeft, faChartLine, faRotateRight
- faBookOpen, faChevronDown, faChevronUp, faChevronLeft, faChevronRight
- faLayerGroup, faPalette, faFont, faMagnifyingGlass, faXmark
- faGlobe, faBuildingColumns, faUserCircle, faArrowTrendUp, faArrowTrendDown
- faRightLeft, faPlus, faEllipsis, faSnowflake, faPencil, faCopy
- faLink, faCircleCheck, faGreaterThanEqual, faDollarSign, faSpinner
- faGavel, faPaperclip, faEquals, faLessThanEqual, faTag
- faArrowUp, faSort, faSliders, faDownload, faCaretDown, faCheck
- faUniversity (alias for faBuildingColumns)
