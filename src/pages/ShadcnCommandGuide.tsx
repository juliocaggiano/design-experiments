import {
  CommandGuideDemo,
  type CommandGuideExample,
} from '../demos/shadcn/CommandGuideDemo'
import { CodeTabs } from './detail-kit'

const INSTALL_CLI = 'npx shadcn@latest add command'

const INSTALL_MANUAL = `npm install cmdk

Copy the Command component source from the Code section below into:
components/ui/command.tsx

Then update its import paths to match your project setup.`

const USAGE = `import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

<Command className="max-w-sm rounded-lg border">
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search Emoji</CommandItem>
      <CommandItem>Calculator</CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Settings">
      <CommandItem>Profile</CommandItem>
      <CommandItem>Billing</CommandItem>
      <CommandItem>Settings</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`

const COMPOSITION = `Command
├── CommandInput
└── CommandList
    ├── CommandEmpty
    ├── CommandGroup
    │   ├── CommandItem
    │   └── CommandItem
    ├── CommandSeparator
    └── CommandGroup
        ├── CommandItem
        └── CommandItem`

const EXAMPLES: {
  id: CommandGuideExample
  title: string
  description: string
  tall?: boolean
}[] = [
  {
    id: 'basic',
    title: 'Basic',
    description: 'A simple command menu in a dialog.',
  },
  {
    id: 'shortcuts',
    title: 'Shortcuts',
    description: 'Settings actions paired with visible keyboard shortcuts.',
  },
  {
    id: 'groups',
    title: 'Groups',
    description: 'A command menu with groups, icons, shortcuts, and separators.',
  },
  {
    id: 'scrollable',
    title: 'Scrollable',
    description: 'A command menu with enough actions to demonstrate the constrained scrolling list.',
  },
  {
    id: 'rtl',
    title: 'RTL',
    description: 'The complete primary command layout rendered right-to-left in Arabic.',
    tall: true,
  },
]

export function ShadcnCommandGuide() {
  return (
    <section className="flex min-w-0 flex-col gap-8">
      <header className="border-b border-[var(--border-line)] pb-2">
        <h2 className="font-semibold text-[var(--text-primary)]">Complete guide</h2>
      </header>

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-[var(--text-primary)]">About</h3>
        <p className="text-pretty text-[var(--text-primary)]">
          The Command component provides a searchable menu for quick actions. It uses{' '}
          <a
            href="https://github.com/dip/cmdk"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2"
          >
            cmdk
          </a>{' '}
          by{' '}
          <a
            href="https://www.dip.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2"
          >
            Dip
          </a>
          .
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-[var(--text-primary)]">Installation</h3>
        <CodeTabs tabs={[
          { file: 'CLI', code: INSTALL_CLI },
          { file: 'Manual', code: INSTALL_MANUAL },
        ]} />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-[var(--text-primary)]">Usage</h3>
        <CodeTabs tabs={[{ file: 'usage.tsx', code: USAGE }]} />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-[var(--text-primary)]">Composition</h3>
        <pre className="overflow-x-auto rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-4 font-mono text-[13px] leading-[1.7] text-[var(--text-body)]">
          {COMPOSITION}
        </pre>
      </div>

      <div className="flex flex-col gap-8">
        {EXAMPLES.map((example) => (
          <section className="flex min-w-0 flex-col gap-3" key={example.id}>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-[var(--text-primary)]">{example.title}</h3>
              <p className="text-[13px] text-[var(--text-secondary)]">{example.description}</p>
            </div>
            <div
              className={`relative overflow-hidden rounded-xl border border-[var(--border-line)] bg-white ${
                example.tall ? 'h-[392px] max-sm:h-[360px]' : 'h-48'
              }`}
            >
              <CommandGuideDemo example={example.id} />
            </div>
          </section>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-[var(--text-primary)]">API reference</h3>
        <p className="text-pretty text-[var(--text-primary)]">
          See the{' '}
          <a
            href="https://github.com/dip/cmdk"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2"
          >
            cmdk documentation
          </a>{' '}
          for the underlying command-menu API.
        </p>
      </div>
    </section>
  )
}
