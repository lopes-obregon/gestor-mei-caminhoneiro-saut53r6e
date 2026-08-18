routerAdd('DELETE', '/backend/v1/subscribers/{externalId}', (e) => {
  // 1. Validar o token de autenticação
  const authToken = $secrets.get('EXTERNAL_SYSTEM_AUTH_TOKEN')
  if (!authToken) {
    console.log('EXTERNAL_SYSTEM_AUTH_TOKEN not configured')
    return e.json(503, { error: 'sync not configured' })
  }

  const authHeader = e.request.header.get('Authorization') || ''
  if (authHeader !== 'Bearer ' + authToken) {
    console.log('invalid auth token for delete subscriber')
    return e.unauthorizedError('invalid auth token')
  }

  // 2. Buscar o usuário pelo external_id
  const externalId = e.request.pathValue('externalId') || ''
  console.log('deleting subscriber:', externalId)

  if (!externalId) {
    return e.json(400, { error: 'external_id is required' })
  }

  let record = null
  try {
    record = $app.findFirstRecordByData('users', 'external_id', externalId)
  } catch (_) {}

  // 3. Se o usuário não existir, retornar 404
  if (!record) {
    console.log('subscriber not found:', externalId)
    return e.json(404, { error: 'subscriber not found', external_id: externalId })
  }

  const userId = record.id
  console.log('found subscriber:', userId, externalId)

  // 4a. Buscar e deletar todas as trips (viagens) do usuário
  let tripsDeleted = 0
  try {
    const trips = $app.findRecordsByFilter('trips', 'user_id = "' + userId + '"', '', 0, 0)
    console.log('found trips to delete:', trips.length, 'for user:', userId)
    for (const trip of trips) {
      console.log('deleting trip:', trip.id)
      $app.delete(trip)
      tripsDeleted++
    }
  } catch (err) {
    console.log('error deleting trips for user:', userId, String(err))
  }
  console.log('trips deleted:', tripsDeleted, 'for user:', userId)

  // 4b. Buscar e deletar todas as expenses (despesas) do usuário
  let expensesDeleted = 0
  try {
    const expenses = $app.findRecordsByFilter('expenses', 'user_id = "' + userId + '"', '', 0, 0)
    console.log('found expenses to delete:', expenses.length, 'for user:', userId)
    for (const expense of expenses) {
      console.log('deleting expense:', expense.id)
      $app.delete(expense)
      expensesDeleted++
    }
  } catch (err) {
    console.log('error deleting expenses for user:', userId, String(err))
  }
  console.log('expenses deleted:', expensesDeleted, 'for user:', userId)

  // 4c. Por fim, deletar o próprio usuário
  $app.delete(record)
  console.log('deleted subscriber:', userId, externalId)

  // 5. Retornar 200 com o resumo da cascata
  return e.json(200, {
    action: 'deleted',
    external_id: externalId,
    id: userId,
    trips_deleted: tripsDeleted,
    expenses_deleted: expensesDeleted,
  })
})
