routerAdd('DELETE', '/backend/v1/subscribers/{externalId}', (e) => {
  const authToken = $secrets.get('EXTERNAL_SYSTEM_AUTH_TOKEN')
  if (!authToken) {
    return e.json(503, { error: 'sync not configured' })
  }

  const authHeader = e.request.header.get('Authorization') || ''
  if (authHeader !== 'Bearer ' + authToken) {
    return e.unauthorizedError('invalid auth token')
  }

  const externalId = e.request.pathValue('externalId') || ''
  console.log('deleting subscriber:', externalId)

  if (!externalId) {
    return e.json(400, { error: 'external_id is required' })
  }

  let record = null
  try {
    record = $app.findFirstRecordByData('users', 'external_id', externalId)
  } catch (_) {}

  if (!record) {
    console.log('subscriber not found:', externalId)
    return e.json(404, { error: 'subscriber not found', external_id: externalId })
  }

  console.log('found subscriber:', record.id, externalId)
  $app.delete(record)
  console.log('deleted subscriber:', record.id, externalId)

  return e.json(200, {
    action: 'deleted',
    external_id: externalId,
    id: record.id,
  })
})
