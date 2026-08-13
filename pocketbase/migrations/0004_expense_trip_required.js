// Torna o campo `trip_id` (relação com `trips`) obrigatório na coleção `expenses`,
// garantindo que toda despesa esteja vinculada a uma viagem específica.
//
// Estratégia:
//  1. Backfill de despesas órfãs (sem trip_id): associa cada uma à viagem mais
//     próxima do mesmo usuário (por data), para não perder o vínculo histórico.
//     Se não houver nenhuma viagem para o usuário, cria uma viagem placeholder
//     e a vincula — evita órfãos.
//  2. Torna o campo `trip_id` required.
migrate((app) => {
  const expensesCol = app.findCollectionByNameOrId('expenses')
  const tripsCol = app.findCollectionByNameOrId('trips')

  // --- 1. Backfill de despesas órfãs (sem trip_id) ---
  const orphanRecords = app.findRecordsByFilter(
    'expenses',
    'trip_id = null',
    '-date',
    0,
    0
  )

  for (const exp of orphanRecords) {
    const userId = exp.getString('user_id')
    const expDate = exp.getString('date')

    let tripId = ''

    // Busca as viagens do mesmo usuário (ordenadas por data desc).
    if (userId !== '') {
      const tripRecords = app.findRecordsByFilter(
        'trips',
        'user_id = "' + userId + '"',
        '-date',
        200,
        0
      )

      if (tripRecords.length > 0) {
        // Prefere a viagem cuja data seja <= à da despesa (mais recente possível).
        let bestId = ''
        if (expDate !== '') {
          for (const t of tripRecords) {
            const td = t.getString('date')
            if (td !== '' && td <= expDate) {
              bestId = t.id
              break
            }
          }
        }
        if (bestId === '') {
          bestId = tripRecords[tripRecords.length - 1].id
        }
        tripId = bestId
      }

      // Se não há viagem para o usuário, cria uma placeholder.
      if (tripId === '') {
        const newTrip = new Record(tripsCol)
        newTrip.set('user_id', userId)
        newTrip.set('company', 'Viagem não registrada')
        newTrip.set('origin', '—')
        newTrip.set('destination', '—')
        newTrip.set('date', expDate !== '' ? expDate : new Date().toISOString())
        newTrip.set('distance_km', 0)
        newTrip.set('gross_value', 0)
        newTrip.set('advance_value', 0)
        newTrip.set('advance_type', 'none')
        newTrip.set('status', 'completed')
        app.save(newTrip)
        tripId = newTrip.id
      }
    }

    if (tripId !== '') {
      exp.set('trip_id', tripId)
      app.save(exp)
    }
  }

  // --- 2. Torna trip_id obrigatório ---
  const tripField = expensesCol.fields.getByName('trip_id')
  if (tripField) {
    tripField.required = true
    if (typeof tripField.setMinSelect === 'function') {
      tripField.setMinSelect(1)
    } else {
      tripField.minSelect = 1
    }
    if (typeof tripField.setMaxSelect === 'function') {
      tripField.setMaxSelect(1)
    } else {
      tripField.maxSelect = 1
    }
  }
  app.save(expensesCol)
}, (app) => {
  const expensesCol = app.findCollectionByNameOrId('expenses')
  const tripField = expensesCol.fields.getByName('trip_id')
  if (tripField) {
    tripField.required = false
    if (typeof tripField.setMinSelect === 'function') {
      tripField.setMinSelect(0)
    } else {
      tripField.minSelect = 0
    }
  }
  app.save(expensesCol)
})
