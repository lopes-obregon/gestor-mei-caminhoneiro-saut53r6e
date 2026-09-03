import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Camera, Loader2, AlertCircle, RefreshCw, Check } from 'lucide-react'
import { extractReceipt, resizeImage, type ExtractedData } from '@/services/extract'
import { CATEGORY_LABELS } from '@/types'
import { ExtractReceiptOcr } from '@/services/ocr'

const FIELD_LABELS: Record<string, string> = {
  amount: 'Valor',
  date: 'Data',
  category: 'Categoria',
  description: 'Descrição',
  company: 'Empresa',
  origin: 'Origem',
  destination: 'Destino',
  distance_km: 'Distância (km)',
  gross_value: 'Valor do Frete',
  advance_value: 'Adiantamento',
  advance_type: 'Tipo Adiantamento',
}

function formatFieldValue(key: string, value: any): string {
  if (value == null) return '-'
  if (key === 'category' && typeof value === 'string') {
    return CATEGORY_LABELS[value as keyof typeof CATEGORY_LABELS] || value
  }
  if (key === 'date' && typeof value === 'string') {
    const d = new Date(value + 'T00:00:00')
    return isNaN(d.getTime()) ? value : d.toLocaleDateString('pt-BR')
  }
  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
  return String(value)
}

export function DocumentScanner({
  type,
  onExtracted,
}: {
  type: 'expense' | 'trip'
  onExtracted: (data: ExtractedData) => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [data, setData] = useState<ExtractedData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setData(null)
    setImagePreview(null)
    setError(false)
    setErrorMessage(null)
    setLoading(false)
  }

  const handleFile = async (file: File) => {
    setLoading(true)
    setError(false)
    setErrorMessage(null)
    setData(null)
    setImagePreview(null)
    setOpen(true)
    try {
      const base64 = await resizeImage(file)
      setImagePreview(base64)
      const result = await ExtractReceiptOcr(file);
      console.log("Resultado do OCR com filtros:", result); // Log the result for debugging
      setData(result)
    } catch (err: any) {
      setError(true)
      setErrorMessage(
        err?.message ||
          'Não foi possível ler os dados. Por favor, tire uma foto mais clara e tente novamente.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (data) onExtracted(data)
    setOpen(false)
    reset()
  }

  const handleRetake = () => {
    reset()
    setOpen(false)
    setTimeout(() => fileInputRef.current?.click(), 100)
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
      >
        <Camera className="w-4 h-4 mr-2" />
        Escanear Documento
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!loading) {
            setOpen(v)
            if (!v) reset()
          }
        }}
      >
        <DialogContent className="max-w-md">
          {loading && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Lendo documento...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center gap-4 py-8">
              <AlertCircle className="w-8 h-8 text-destructive" />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Documento escaneado"
                  className="w-full max-h-36 object-contain rounded-lg border opacity-60"
                />
              )}
              <p className="text-sm text-center text-muted-foreground">
                {errorMessage ||
                  'Não foi possível ler os dados. Por favor, tire uma foto mais clara e tente novamente.'}
              </p>
              <Button onClick={handleRetake} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          )}

          {data && !loading && !error && (
            <>
              <DialogHeader>
                <DialogTitle>Dados Extraídos</DialogTitle>
                <DialogDescription>
                  Revise os dados antes de confirmar. Todos os campos permanecem editáveis.
                </DialogDescription>
              </DialogHeader>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Documento escaneado"
                  className="w-full max-h-40 object-contain rounded-lg border"
                />
              )}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(data).map(([key, value]) => {
                  if (value == null || value === '' || value === 0) return null
                  return (
                    <div key={key} className="flex justify-between gap-2 text-sm border-b pb-1">
                      <span className="text-muted-foreground">{FIELD_LABELS[key] || key}</span>
                      <span className="font-medium text-right">{formatFieldValue(key, value)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleRetake}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Nova foto
                </Button>
                <Button className="flex-1" onClick={handleConfirm}>
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
