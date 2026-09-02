routerAdd(
  'POST',
  '/backend/v1/extract-receipt',
  (e) => {
    const body = e.requestInfo().body || {}
    const image = body.image
    const docType = body.type

    if (!image) return e.badRequestError('image is required')

    let systemPrompt = ''
    let userPrompt = ''
    // console.log('docType:', docType) OK
    if (docType === 'trip') {
      systemPrompt =
        'You are an OCR assistant specialized in reading Brazilian truck driver freight documents (conhecimento de transporte, CT-e, manifestos). Extract data and return ONLY valid JSON with no markdown.'
      userPrompt =
        'Extract these fields from the freight document image:\n- company: transport company or client name (string)\n- origin: origin city (string)\n- destination: destination city (string)\n- date: date in YYYY-MM-DD format (string)\n- distance_km: distance in km (number, 0 if not found)\n- gross_value: gross freight value in BRL (number, 0 if not found)\n- advance_value: advance payment in BRL (number, 0 if not found)\n- advance_type: one of "fuel", "toll", "cash", "none"\n\nReturn ONLY a JSON object. Use null for strings not found and 0 for numbers not found.'
    } else {
      systemPrompt =
        'You are an OCR assistant specialized in reading Brazilian truck driver expense receipts (fuel receipts, toll tickets, maintenance invoices). Extract data and return ONLY valid JSON with no markdown.'
      userPrompt = `Extract these fields from the receipt/invoice image:
- amount: total value in BRL as a plain number, no currency symbol (e.g. 50.00). Brazilian receipts use comma as decimal separator and period as thousands separator (e.g. "R$1.234,56" = 1234.56).
- date: the receipt date converted to YYYY-MM-DD. Brazilian receipts use DD/MM/YYYY format.
- category: one of "fuel", "toll", "food", "helper", "installment", "insurance", "tracker", "tax", "maintenance_parts", "maintenance_labor", "tires", "other". Infer from the establishment name (e.g. "POSTO"/"AUTO POSTO" = fuel, "PEDÁGIO"/"SEM PARAR"/"CONECTCAR" = toll, "BORRACHARIA" = tires).
- description: the establishment name and city if visible (string).

Return ONLY a JSON object, nothing else. Use null for strings not found and 0 for numbers not found.

Example:
Input: a receipt showing "POSTO SHELL LTDA - CAMPO GRANDE/MS", "R$300,50", "15/03/2026"
Output: {"amount": 300.50, "date": "2026-03-15", "category": "fuel", "description": "Posto Shell - Campo Grande/MS"}`
    }

    let result
    console.log('cHEGOU AQUI!')
    try {
      console.log('Entrou no try!')
      console.log('AI:', $ai)
      result = $ai.chat({
        model: 'fast',
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
      console.log('result:', result)
    } catch (err) {
      return e.json(502, { error: 'AI temporarily unavailable' })
    }

    const content = result.choices[0].message.content
    console.log('-------------------------------------)')
    console.log('content:', content)
    let parsed
    try {
      const cleaned = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim()
      parsed = JSON.parse(cleaned)
    } catch (err) {
      const match = content.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          parsed = JSON.parse(match[0])
        } catch (e2) {
          return e.json(422, {
            error:
              'Não foi possível ler os dados. Por favor, tire uma foto mais clara e tente novamente.',
          })
        }
      } else {
        return e.json(422, {
          error:
            'Não foi possível ler os dados. Por favor, tire uma foto mais clara e tente novamente.',
        })
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
          'Não foi possível ler os dados. Por favor, tire uma foto mais clara e tente novamente.',
      })
    }

    return e.json(200, { data: parsed })
  },
  $apis.requireAuth(),
)
