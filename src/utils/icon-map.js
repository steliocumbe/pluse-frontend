/**
 * Mapping from Metronic Keenicons class names (`ki-<name>`) to Lucide
 * component names. Add entries here as new icons are needed.
 *
 * Usage:
 *   <AppIcon name="ki-element-11" />     <!-- Metronic name (auto-translated) -->
 *   <AppIcon name="users" />             <!-- direct Lucide name -->
 */
export const KI_TO_LUCIDE = {
  // Layout / navigation
  'element-11': 'LayoutDashboard',
  'category': 'LayoutGrid',
  'menu': 'Menu',
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  'arrow-up': 'ArrowUp',
  'arrow-down': 'ArrowDown',
  'cross': 'X',
  'check': 'Check',
  'plus': 'Plus',
  'minus': 'Minus',

  // Users / people
  'people': 'Users',
  'user': 'User',
  'user-tick': 'UserCheck',
  'user-edit': 'UserPen',
  'profile-circle': 'CircleUser',
  'profile-user': 'UserCircle',

  // Security / auth
  'shield-tick': 'ShieldCheck',
  'shield': 'Shield',
  'key': 'Key',
  'lock': 'Lock',
  'unlock': 'Unlock',
  'eye': 'Eye',
  'eye-slash': 'EyeOff',

  // Communication
  'sms': 'Mail',
  'message-text': 'MessageSquare',
  'phone': 'Phone',
  'notification': 'Bell',
  'notification-on': 'BellRing',

  // Actions
  'pencil': 'Pencil',
  'trash': 'Trash2',
  'save-2': 'Save',
  'document': 'FileText',
  'folder': 'Folder',
  'cloud-add': 'CloudUpload',
  'cloud-download': 'CloudDownload',
  'magnifier': 'Search',
  'filter': 'Filter',
  'setting-2': 'Settings',
  'setting-3': 'SlidersHorizontal',

  // Domain — security / surveillance / fleet (PLUSE-specific)
  'home-2': 'House',
  'shop': 'Store',
  'compass': 'Compass',
  'geolocation': 'MapPin',
  'map': 'Map',
  'route': 'Route',
  'time': 'Clock',
  'calendar': 'Calendar',
  'calendar-tick': 'CalendarCheck',
  'qr-code': 'QrCode',
  'flag': 'Flag',

  // Money / billing
  'dollar': 'DollarSign',
  'wallet': 'Wallet',
  'bank': 'Landmark',
  'chart-line': 'LineChart',
  'chart-pie-3': 'PieChart',
  'chart-simple': 'BarChart3',

  // Misc
  'information-2': 'Info',
  'information-3': 'CircleHelp',
  'check-circle': 'CircleCheck',
  'cross-circle': 'CircleX',
  'warning-2': 'TriangleAlert',
  'sun': 'Sun',
  'moon': 'Moon',
  'monitor': 'Monitor',
}

/**
 * Resolve an icon name to a Lucide component name.
 * Accepts:
 *   - "ki-element-11"   (Metronic style, with prefix)
 *   - "element-11"      (Metronic style, without prefix)
 *   - "users"           (kebab-case Lucide; converted to PascalCase)
 *   - "Users"           (already PascalCase Lucide)
 */
export function resolveIconName(name) {
  if (!name) return null
  let key = String(name).trim()
  if (key.startsWith('ki-')) key = key.slice(3)
  if (key.startsWith('ki-filled-')) key = key.slice('ki-filled-'.length)
  if (key.startsWith('ki-outline-')) key = key.slice('ki-outline-'.length)
  if (key.startsWith('ki-duotone-')) key = key.slice('ki-duotone-'.length)
  if (key.startsWith('ki-solid-')) key = key.slice('ki-solid-'.length)

  if (KI_TO_LUCIDE[key]) return KI_TO_LUCIDE[key]

  // Already PascalCase? Use as-is.
  if (/^[A-Z][A-Za-z0-9]*$/.test(key)) return key

  // kebab-case → PascalCase
  return key
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}
