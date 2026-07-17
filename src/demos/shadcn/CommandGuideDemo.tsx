import { useEffect, useState } from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import {
  Bell,
  Calculator,
  Calendar,
  ClipboardPaste,
  Code,
  Copy,
  CreditCard,
  FileText,
  Folder,
  FolderPlus,
  HelpCircle,
  Home,
  Image,
  Inbox,
  LayoutGrid,
  List,
  Plus,
  Scissors,
  Search,
  Settings,
  Smile,
  Trash,
  User,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from 'lucide-react'
import './ShadcnDemo.css'

export type CommandGuideExample =
  | 'basic'
  | 'shortcuts'
  | 'groups'
  | 'scrollable'
  | 'rtl'

type CommandItemDefinition = {
  label: string
  shortcut?: string
  icon?: LucideIcon
  disabled?: boolean
}

type CommandGroupDefinition = {
  heading: string
  items: CommandItemDefinition[]
}

const BASIC_GROUPS: CommandGroupDefinition[] = [
  {
    heading: 'Suggestions',
    items: [
      { label: 'Calendar' },
      { label: 'Search Emoji' },
      { label: 'Calculator' },
    ],
  },
]

const SHORTCUT_GROUPS: CommandGroupDefinition[] = [
  {
    heading: 'Settings',
    items: [
      { label: 'Profile', shortcut: '⌘P', icon: User },
      { label: 'Billing', shortcut: '⌘B', icon: CreditCard },
      { label: 'Settings', shortcut: '⌘S', icon: Settings },
    ],
  },
]

const GROUPED_COMMANDS: CommandGroupDefinition[] = [
  {
    heading: 'Suggestions',
    items: [
      { label: 'Calendar', icon: Calendar },
      { label: 'Search Emoji', icon: Smile },
      { label: 'Calculator', icon: Calculator },
    ],
  },
  ...SHORTCUT_GROUPS,
]

const SCROLLABLE_GROUPS: CommandGroupDefinition[] = [
  {
    heading: 'Navigation',
    items: [
      { label: 'Home', shortcut: '⌘H', icon: Home },
      { label: 'Inbox', shortcut: '⌘I', icon: Inbox },
      { label: 'Documents', shortcut: '⌘D', icon: FileText },
      { label: 'Folders', shortcut: '⌘F', icon: Folder },
    ],
  },
  {
    heading: 'Actions',
    items: [
      { label: 'New File', shortcut: '⌘N', icon: Plus },
      { label: 'New Folder', shortcut: '⇧⌘N', icon: FolderPlus },
      { label: 'Copy', shortcut: '⌘C', icon: Copy },
      { label: 'Cut', shortcut: '⌘X', icon: Scissors },
      { label: 'Paste', shortcut: '⌘V', icon: ClipboardPaste },
      { label: 'Delete', shortcut: '⌫', icon: Trash },
    ],
  },
  {
    heading: 'View',
    items: [
      { label: 'Grid View', icon: LayoutGrid },
      { label: 'List View', icon: List },
      { label: 'Zoom In', shortcut: '⌘+', icon: ZoomIn },
      { label: 'Zoom Out', shortcut: '⌘-', icon: ZoomOut },
    ],
  },
  {
    heading: 'Account',
    items: [
      { label: 'Profile', shortcut: '⌘P', icon: User },
      { label: 'Billing', shortcut: '⌘B', icon: CreditCard },
      { label: 'Settings', shortcut: '⌘S', icon: Settings },
      { label: 'Notifications', icon: Bell },
      { label: 'Help & Support', icon: HelpCircle },
    ],
  },
  {
    heading: 'Tools',
    items: [
      { label: 'Calculator', icon: Calculator },
      { label: 'Calendar', icon: Calendar },
      { label: 'Image Editor', icon: Image },
      { label: 'Code Editor', icon: Code },
    ],
  },
]

const RTL_GROUPS: CommandGroupDefinition[] = [
  {
    heading: 'اقتراحات',
    items: [
      { label: 'التقويم', icon: Calendar },
      { label: 'البحث عن الرموز التعبيرية', icon: Smile },
      { label: 'الآلة الحاسبة', icon: Calculator, disabled: true },
    ],
  },
  {
    heading: 'الإعدادات',
    items: [
      { label: 'الملف الشخصي', shortcut: '⌘P', icon: User },
      { label: 'الفوترة', shortcut: '⌘B', icon: CreditCard },
      { label: 'الإعدادات', shortcut: '⌘S', icon: Settings },
    ],
  },
]

function CommandSurface({
  groups,
  dir = 'ltr',
  dialog = false,
}: {
  groups: CommandGroupDefinition[]
  dir?: 'ltr' | 'rtl'
  dialog?: boolean
}) {
  const [query, setQuery] = useState('')

  return (
    <CommandPrimitive
      className={`sx-command sx-nova ${dialog ? 'sx-command-dialog-command' : ''}`}
      dir={dir}
    >
      <div className="sx-command-input-wrapper">
        <Search aria-hidden="true" />
        <CommandPrimitive.Input
          autoFocus={dialog}
          value={query}
          onValueChange={setQuery}
          placeholder={dir === 'rtl' ? 'اكتب أمرًا أو ابحث...' : 'Type a command or search...'}
          dir={dir}
        />
      </div>
      <CommandPrimitive.List className="sx-command-list">
        <CommandPrimitive.Empty className="sx-command-empty">
          {dir === 'rtl' ? 'لم يتم العثور على نتائج.' : 'No results found.'}
        </CommandPrimitive.Empty>
        {groups.map((group, index) => (
          <div key={group.heading}>
            {index > 0 ? <CommandPrimitive.Separator className="sx-command-separator" /> : null}
            <CommandPrimitive.Group className="sx-command-group" heading={group.heading}>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <CommandPrimitive.Item
                    className="sx-command-item"
                    disabled={item.disabled}
                    key={item.label}
                  >
                    {Icon ? <Icon aria-hidden="true" /> : null}
                    <span>{item.label}</span>
                    {item.shortcut ? <kbd>{item.shortcut}</kbd> : null}
                  </CommandPrimitive.Item>
                )
              })}
            </CommandPrimitive.Group>
          </div>
        ))}
      </CommandPrimitive.List>
    </CommandPrimitive>
  )
}

function CommandDialogExample({ groups }: { groups: CommandGroupDefinition[] }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <div className="sx-command-example-trigger sx-nova">
      <button
        type="button"
        className="sx-button sx-button-outline sx-button-size-default"
        onClick={() => setOpen(true)}
      >
        Open Menu
      </button>
      {open ? (
        <div
          className="sx-command-dialog-overlay"
          onPointerDown={() => setOpen(false)}
          role="presentation"
        >
          <div
            aria-label="Command menu"
            aria-modal="true"
            className="sx-command-dialog-panel"
            onPointerDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <CommandSurface groups={groups} dialog />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function CommandGuideDemo({ example }: { example: CommandGuideExample }) {
  const specimen = {
    basic: <CommandDialogExample groups={BASIC_GROUPS} />,
    shortcuts: <CommandDialogExample groups={SHORTCUT_GROUPS} />,
    groups: <CommandDialogExample groups={GROUPED_COMMANDS} />,
    scrollable: <CommandDialogExample groups={SCROLLABLE_GROUPS} />,
    rtl: <CommandSurface groups={RTL_GROUPS} dir="rtl" />,
  }[example]

  return (
    <div className="sh-demo" data-id={`command-${example}`}>
      <div className="sx-preview" data-id={`command-${example}`}>
        <div className="sx-native">{specimen}</div>
      </div>
    </div>
  )
}
