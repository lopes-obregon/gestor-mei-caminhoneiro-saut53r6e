import pb from '@/lib/pocketbase/client'

export interface ExtractedData {
  amount?: number | null
  date?: string | null
  category?: string | null
  description?: string | null
  company?: string | null
  origin?: string | null
  destination?: string | null
  distance_km?: number | null
  gross_value?: number | null
  advance_value?: number | null
  advance_type?: string | null
}

export interface ExtractResult {
  data: ExtractedData
}

export const extractReceipt = async (
  imageBase64: string,
  type: 'expense' | 'trip',
): Promise<ExtractResult> => {
  try {
    return await pb.send('/backend/v1/extract-receipt', {
      method: 'POST',
      body: JSON.stringify({ image: imageBase64, type }),
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    const errorData = err?.response?.data || err?.data
    const serverMessage =
      (typeof errorData === 'object' && errorData?.error) ||
      (typeof errorData === 'string' && errorData) ||
      err?.response?.message ||
      err?.message

    if (
      serverMessage &&
      !serverMessage.startsWith('HTTP ') &&
      !serverMessage.includes('Fetch Error')
    ) {
      throw new Error(serverMessage)
    }

    if (err?.status === 422) {
      throw new Error(
        'Não foi possível ler os dados da imagem. Por favor, tire uma foto mais clara e tente novamente.',
      )
    }

    if (err?.status === 502 || err?.status === 503) {
      throw new Error(
        'Serviço de análise temporariamente indisponível. Tente novamente em instantes.',
      )
    }

    throw new Error(
      serverMessage || 'Erro ao processar imagem. Verifique sua conexão e tente novamente.',
    )
  }
}

export async function resizeImage(file: File, maxSize: number = 1280): Promise<string> {
  const img = new Image()
  const url = URL.createObjectURL(file)
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
  URL.revokeObjectURL(url)

  let { width, height } = img
  if (width > height && width > maxSize) {
    height = Math.round((height * maxSize) / width)
    width = maxSize
  } else if (height > maxSize) {
    width = Math.round((width * maxSize) / height)
    height = maxSize
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', 0.85)
}
