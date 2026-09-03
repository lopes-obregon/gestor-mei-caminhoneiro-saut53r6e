routerAdd(
  'POST',
  '/backend/v1/extract-receipt',
  (e) => {
    const body = e.requestInfo().body || {}
    const image = body.image
    const docType = body.type

    if (!image) return e.badRequestError('image is required')

    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')

    let systemPrompt = ''
    let userPrompt = ''
    if (docType === 'trip') {
      systemPrompt =
        'Você é um assistente especialista em OCR e extração de dados de documentos de frete e transporte rodoviário de cargas no Brasil (CT-e, Conhecimento de Transporte, MDF-e, Contrato de Frete). Responda EXCLUSIVAMENTE com um objeto JSON válido, sem qualquer texto adicional ou blocos de código markdown.'
      userPrompt =
        'Analise a imagem deste documento de frete e extraia os seguintes campos:\n- company: nome da transportadora, embarcador ou cliente (string ou null se não encontrar)\n- origin: cidade e UF de origem (string ou null)\n- destination: cidade e UF de destino (string ou null)\n- date: data do documento no formato YYYY-MM-DD (string ou null). Converta de DD/MM/AAAA para YYYY-MM-DD.\n- distance_km: distância em km (número, 0 se não encontrar)\n- gross_value: valor bruto do frete em BRL como número decimal com ponto (ex: 1500.00, 0 se não encontrar)\n- advance_value: adiantamento em BRL como número decimal com ponto (ex: 500.00, 0 se não encontrar)\n- advance_type: "fuel", "toll", "cash" ou "none"\n\nRetorne APENAS o JSON puro no formato: {"company": ..., "origin": ..., "destination": ..., "date": ..., "distance_km": ..., "gross_value": ..., "advance_value": ..., "advance_type": ...}'
    } else {
      systemPrompt =
        'Você é um assistente especialista em OCR e extração de dados de comprovantes fiscais e térmicos brasileiros (cupons fiscais NFC-e/SAT, comprovantes de maquininha de cartão "VIA CLIENTE", recibos de pedágio e postos de combustível). Responda EXCLUSIVAMENTE com um objeto JSON válido, sem nenhum texto explicativo antes ou depois e sem markdown.'
      userPrompt = `Analise a imagem deste comprovante ou recibo térmico brasileiro e extraia os dados:

Regras de extração:
1. "description": Nome limpo e claro do estabelecimento comercial (ex: "Auto Posto Dakota - Dourados/MS", "Posto Ipiranga", "Pedágio CCR"). Procure atenciosamente por nomes de postos de combustível ("AUTO POSTO", "POSTO", bandeiras como Shell, Ipiranga, Petrobras, BR, etc.) e cidades/UF. Desconsidere o nome da adquirente/maquininha (ex: "Laranjinha", "Cielo", "Rede", "Stone", "PagSeguro").
2. "amount": Valor total pago em Reais (BRL) como número decimal com ponto (ex: 50.00, 1234.56). Comprovantes brasileiros usam vírgula como separador decimal (ex: "R$ 50,00" -> 50.00, "R$ 1.250,50" -> 1250.50). Remova símbolos monetários e converta a vírgula para ponto.
3. "date": Data da transação no formato estrito "YYYY-MM-DD". Comprovantes brasileiros usam "DD/MM/AAAA" ou "DD/MM/AA" (ex: "31/08/2026" -> "2026-08-31").
4. "category": Identifique a categoria da despesa dentre: "fuel", "toll", "food", "helper", "installment", "insurance", "tracker", "tax", "maintenance_parts", "maintenance_labor", "tires", "other".
   - "fuel": postos de combustível, abastecimento, diesel, gasolina, "AUTO POSTO", "POSTO DE MOLAS", Shell, Ipiranga, etc.
   - "toll": pedágios, praças de pedágio, Sem Parar, ConectCar, Veloe, AutoBAn, CCR, etc.
   - "food": restaurantes, lanchonetes, churrascarias, refeições em postos.
   - "tires": borracharia, recapagem, pneus.
   - "maintenance_parts" / "maintenance_labor": oficinas, autopeças, mecânica.

Retorne APENAS um objeto JSON no formato:
{
  "amount": 50.00,
  "date": "2026-08-31",
  "category": "fuel",
  "description": "Auto Posto Dakota - Dourados/MS"
}
Use null para strings não encontradas e 0 para valores numéricos não encontrados.`
    }

    const promptMessage = `${systemPrompt}\n\n${userPrompt}`

    let content = ''

    // 1. Tentar primeiro via Skip Cloud Agent nativo 'analista-de-despesas'
    try {
      const agentRes = $ai.agent('analista-de-despesas').chat({
        user_id: userId,
        message: promptMessage,
        images: [image],
      })
      if (agentRes && typeof agentRes.content === 'string') {
        content = agentRes.content
      }
    } catch (agentErr) {
      console.log('Agent call failed, attempting fallback to $ai.chat:', agentErr)
    }

    // 2. Se o agente não retornou conteúdo ou falhou, usar fallback direto via $ai.chat
    if (!content) {
      try {
        const chatRes = $ai.chat({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                { type: 'text', text: userPrompt },
                { type: 'image_url', image_url: { url: image } },
              ],
            },
          ],
        })
        if (
          chatRes &&
          chatRes.choices &&
          chatRes.choices[0] &&
          chatRes.choices[0].message &&
          typeof chatRes.choices[0].message.content === 'string'
        ) {
          content = chatRes.choices[0].message.content
        }
      } catch (chatErr) {
        console.log('Fallback $ai.chat also failed:', chatErr)
        return e.json(502, {
          error:
            'Serviço de análise de imagem temporariamente indisponível. Tente novamente em instantes.',
        })
      }
    }

    if (!content) {
      return e.json(422, {
        error:
          'Não foi possível ler os dados da imagem. Por favor, tire uma foto mais clara e tente novamente.',
      })
    }

    let parsed = null
    try {
      let cleaned = content.trim()
      // Remove markdown blocks ```json ... ```
      cleaned = cleaned
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim()
      parsed = JSON.parse(cleaned)
    } catch (err) {
      // Tentar encontrar o bloco JSON mais abrangente entre { e }
      const firstBrace = content.indexOf('{')
      const lastBrace = content.lastIndexOf('}')
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          const jsonSubstring = content.substring(firstBrace, lastBrace + 1)
          parsed = JSON.parse(jsonSubstring)
        } catch (e2) {
          parsed = null
        }
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return e.json(422, {
        error:
          'Não foi possível extrair dados válidos do documento. Por favor, tire uma foto mais nítida e enquadrada.',
      })
    }

    // Normalização e sanitização defensiva dos campos extraídos
    if (docType === 'expense') {
      // Normalizar amount se vier como string (ex: "50,00" ou "R$ 50,00")
      if (typeof parsed.amount === 'string') {
        const cleanedAmount = parsed.amount
          .replace(/[^\d,\.]/g, '')
          .replace(/\./g, '')
          .replace(',', '.')
        const num = parseFloat(cleanedAmount)
        parsed.amount = !isNaN(num) ? num : 0
      } else if (typeof parsed.amount === 'number') {
        parsed.amount = parsed.amount
      } else {
        parsed.amount = 0
      }

      // Normalizar data se vier em formato DD/MM/YYYY
      if (typeof parsed.date === 'string') {
        const dMatch = parsed.date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
        if (dMatch) {
          parsed.date = `${dMatch[3]}-${dMatch[2]}-${dMatch[1]}`
        }
      }
    } else if (docType === 'trip') {
      ;['gross_value', 'advance_value', 'distance_km'].forEach((f) => {
        if (typeof parsed[f] === 'string') {
          const cleanedNum = parsed[f]
            .replace(/[^\d,\.]/g, '')
            .replace(/\./g, '')
            .replace(',', '.')
          const num = parseFloat(cleanedNum)
          parsed[f] = !isNaN(num) ? num : 0
        } else if (typeof parsed[f] !== 'number') {
          parsed[f] = 0
        }
      })

      if (typeof parsed.date === 'string') {
        const dMatch = parsed.date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
        if (dMatch) {
          parsed.date = `${dMatch[3]}-${dMatch[2]}-${dMatch[1]}`
        }
      }
    }

    let hasAnyData = false
    const keys = Object.keys(parsed)
    for (let i = 0; i < keys.length; i++) {
      const v = parsed[keys[i]]
      if (v !== null && v !== undefined && v !== '' && v !== 0) {
        hasAnyData = true
        break
      }
    }

    if (!hasAnyData) {
      return e.json(422, {
        error:
          'Nenhum dado legível foi encontrado no documento. Por favor, verifique a iluminação e tire outra foto.',
      })
    }

    return e.json(200, { data: parsed })
  },
  $apis.requireAuth(),
)
