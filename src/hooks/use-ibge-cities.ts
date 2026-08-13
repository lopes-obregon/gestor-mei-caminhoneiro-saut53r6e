import { useEffect, useState } from 'react'

export interface City {
  /** Formato amigável: "São Paulo - SP" */
  label: string
  /** Nome do município */
  name: string
  /** Sigla da UF */
  uf: string
}

// Cache em memória: a API retorna ~5570 municípios e não deve ser
// chamada novamente a cada digitação nem a cada montagem de campo.
let cache: City[] | null = null
let inflight: Promise<City[]> | null = null

async function fetchCities(): Promise<City[]> {
  if (cache) return cache
  if (inflight) return inflight

  inflight = fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
    .then(async (res) => {
      if (!res.ok) throw new Error('Falha ao buscar municípios do IBGE')
      const data = await res.json()
      const cities: City[] = (data as any[])
        .map((m) => {
          const uf = m?.microrregiao?.mesorregiao?.UF?.sigla ?? ''
          const name = m?.nome ?? ''
          return { name, uf, label: uf ? `${name} - ${uf}` : name }
        })
        .filter((c) => c.name)
        .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
      cache = cities
      return cities
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

/**
 * Carrega a lista de municípios brasileiros via API do IBGE e mantém
 * a lista em cache (módulo) para evitar refazer a requisição.
 */
export function useIbgeCities() {
  const [cities, setCities] = useState<City[]>(cache ?? [])
  const [loading, setLoading] = useState(!cache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (cache) {
      setCities(cache)
      setLoading(false)
      return
    }
    setLoading(true)
    fetchCities()
      .then((list) => {
        if (active) {
          setCities(list)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Erro')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { cities, loading, error }
}
