routerAdd('POST', '/backend/v1/sync-users', (e) => {
  const authToken = $secrets.get('EXTERNAL_SYSTEM_AUTH_TOKEN')
  if (!authToken) {
    return e.json(503, { error: 'sync not configured' })
  }

  const authHeader = e.request.header.get('Authorization') || ''
  //if (authHeader !== authToken) {
  if (authHeader !== 'Bearer ' + authToken) {
    return e.unauthorizedError('invalid auth token')
  }

  const body = e.requestInfo().body || {}
  const email = body.email || ''
  let externalId = body.external_id || ''

  if (!email && !externalId) {
    return e.badRequestError('email or external_id is required')
  }

  // Gera um external_id automaticamente quando não for informado no body
  const generateExternalId = function () {
    return 'usr_' + $security.randomString(8).toLowerCase()
  }

  let record = null

  if (email) {
    try {
      record = $app.findAuthRecordByEmail('_pb_users_auth_', email)
    } catch (_) {}
  }

  if (!record && externalId) {
    try {
      record = $app.findFirstRecordByData('users', 'external_id', externalId)
    } catch (_) {}
  }

  if (record) {
    if (body.name) record.set('name', body.name)
    if (body.payment_status) record.set('payment_status', body.payment_status)
    // Garante que o usuário sempre tenha um external_id
    if (!externalId && !record.getString('external_id')) {
      externalId = generateExternalId()
    }
    if (externalId) record.set('external_id', externalId)
    $app.saveNoValidate(record)
    return e.json(200, {
      action: 'updated',
      id: record.id,
      external_id: record.getString('external_id'),
    })
  }

  if (!email) {
    return e.badRequestError('email is required to create a new user')
  }

  if (!externalId) {
    externalId = generateExternalId()
  }

  const usersCol = $app.findCollectionByNameOrId('_pb_users_auth_')
  const newRecord = new Record(usersCol)
  newRecord.setEmail(email)
  newRecord.setPassword($security.randomString(16))
  newRecord.setVerified(true)
  if (body.name) newRecord.set('name', body.name)
  if (body.payment_status) newRecord.set('payment_status', body.payment_status)
  newRecord.set('external_id', externalId)
  $app.save(newRecord)
  return e.json(201, { action: 'created', id: newRecord.id, external_id: externalId })
})
