import { useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useIbgeCities, type City } from '@/hooks/use-ibge-cities'

interface CityAutocompleteProps {
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}

/**
 * Campo de origem/destino com autocomplete de municípios brasileiros
 * (API do IBGE). A lista completa é carregada uma única vez e filtrada
 * localmente conforme o usuário digita.
 */
export function CityAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  required,
}: CityAutocompleteProps) {
  const { cities, loading } = useIbgeCities()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Se o usuário selecionou um item, `value` é o label completo.
  // Quando o campo está "aberto" para edição, mostramos o que ele digita.
  const displayValue = open ? query : value

  const filtered = useMemo<City[]>(() => {
    if (!cities.length) return []
    const q = query.trim().toLowerCase()
    if (!q) return cities.slice(0, 100) // primeiros resultados ao abrir vazio
    return cities.filter((c) => c.label.toLowerCase().includes(q)).slice(0, 100)
  }, [cities, query])

  const selectCity = (city: City) => {
    onChange(city.label)
    setQuery('')
    setActiveIndex(-1)
    setOpen(false)
    inputRef.current?.blur()
  }

  const handleFocus = () => {
    setQuery(value)
    setOpen(true)
  }

  const handleBlur = () => {
    // atraso para permitir clique no item antes de fechar
    setTimeout(() => {
      // Se o que está no input não corresponder a uma seleção, mantém o valor cru digitado
      setOpen(false)
      setActiveIndex(-1)
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && filtered[activeIndex]) {
        e.preventDefault()
        selectCity(filtered[activeIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          required={required}
          value={displayValue}
          placeholder={loading ? 'Carregando municípios...' : placeholder}
          disabled={loading}
          onChange={(e) => {
            setQuery(e.target.value)
            onChange(e.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {open && filtered.length > 0 && (
          <div className="absolute z-50 mt-1 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md max-h-60">
            {filtered.map((city, idx) => (
              <button
                key={`${city.uf}-${city.name}`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectCity(city)
                }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={cn(
                  'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                  idx === activeIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {city.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
