'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { BuildingsIcon, FileTextIcon, MagnifyingGlassIcon, UserIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { NAV_GROUPS, NAV_ITEMS } from '@/constants/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCustomerSearchQuery } from '@/features/customers/queries/useCustomersQuery'
import { projectsApi } from '@/features/projects/services/projects.service'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

const MIN_QUERY = 2

/**
 * App-wide search (Ctrl/Cmd + K): customers by name, BR/TR or mobile,
 * projects by name/code, and pages. Picking a result opens it.
 */
export function GlobalSearch() {
  const router = useRouter()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const term = useDebouncedValue(query.trim(), 250)
  const searching = term.length >= MIN_QUERY

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const customers = useCustomerSearchQuery(term, { enabled: open && searching })
  const projects = useQuery({
    queryKey: ['global-search', 'projects', term],
    queryFn: () => projectsApi.list(term),
    enabled: open && searching,
    staleTime: 30_000,
  })

  const pages = useMemo(() => {
    const allowed = (item: { allowedRoles?: string[] }) => !item.allowedRoles || (user ? item.allowedRoles.includes(user.role) : false)
    const all = [...NAV_ITEMS, ...NAV_GROUPS.flatMap((group) => group.items)].filter(allowed)
    const needle = query.trim().toLowerCase()
    return needle ? all.filter((item) => item.label.toLowerCase().includes(needle)) : all
  }, [query, user])

  function go(href: string) {
    setOpen(false)
    setQuery('')
    router.push(href)
  }

  const customerRows = searching ? (customers.data?.data ?? []).slice(0, 8) : []
  const projectRows = searching ? (projects.data ?? []).slice(0, 5) : []
  const loading = searching && (customers.isFetching || projects.isFetching)

  return (
    <>
      <Button
        variant="outline"
        size="compact"
        onClick={() => setOpen(true)}
        className="hidden w-56 justify-start gap-2 text-muted-foreground lg:inline-flex"
        aria-label="Search (Ctrl+K)"
      >
        <MagnifyingGlassIcon size={14} />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-border bg-muted px-1.5 text-[10px] font-medium">Ctrl K</kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground lg:hidden"
        aria-label="Search (Ctrl+K)"
        title="Search (Ctrl+K)"
      >
        <MagnifyingGlassIcon size={17} />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setQuery('')
        }}
        title="Search"
        description="Search customers, projects and pages"
        className="top-1/2 -translate-y-1/2 sm:max-w-xl"
      >
        {/* Results come from the server, so cmdk's own filtering is off. */}
        <Command shouldFilter={false}>
          <CommandInput value={query} onValueChange={setQuery} placeholder="Customer name, BR/TR, mobile, project or page…" />
          <CommandList className="max-h-[60vh]">
            <CommandEmpty>
              {query.trim().length < MIN_QUERY
                ? 'Type at least 2 characters to search customers and projects.'
                : loading
                  ? 'Searching…'
                  : 'No matches.'}
            </CommandEmpty>

            {customerRows.length ? (
              <CommandGroup heading="Customers">
                {customerRows.map((customer) => (
                  <CommandItem key={customer.id} value={`customer-${customer.id}`} onSelect={() => go(`/customers/${customer.id}`)}>
                    <UserIcon size={15} className="text-muted-foreground" />
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate font-medium">{customer.customerConnection.customerName || 'Unnamed customer'}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {[customer.customerConnection.trBpNo, customer.customerConnection.mobileNo, customer.projectName].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {projectRows.length ? (
              <CommandGroup heading="Projects">
                {projectRows.map((project) => (
                  <CommandItem key={project.id} value={`project-${project.id}`} onSelect={() => go(`/projects/${project.id}`)}>
                    <BuildingsIcon size={15} className="text-muted-foreground" />
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate font-medium">{project.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{[project.code, project.city, project.client].filter(Boolean).join(' · ')}</span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {pages.length ? (
              <CommandGroup heading="Pages">
                {pages.slice(0, query.trim() ? 6 : 20).map((item) => (
                  <CommandItem key={item.href} value={`page-${item.href}`} onSelect={() => go(item.href)}>
                    <FileTextIcon size={15} className="text-muted-foreground" />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
