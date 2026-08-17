routerAdd('GET', '/backend/v1/subscribers', (e) => {
  //camado de segurança para caso alguem consigo a url do back seja bloqueado o acesso.
  const authToken = $secrets.get('EXTERNAL_SYSTEM_AUTH_TOKEN')
  if (!authToken) {
    return e.json(503, { error: 'sync not configured' })
  }

  const authHeader = e.request.header.get('Authorization') || ''
  if (authHeader !== 'Bearer ' + authToken) {
    return e.unauthorizedError('invalid auth token')
  }

  const usersCol = $app.findCollectionByNameOrId('_pb_users_auth_')
  const records = $app.findRecordsByFilter('users', 'id != ""', '-created', 0, 0)

  const subscribers = records.map(function (record) {
    return {
      external_id: record.getString('external_id'),
      email: record.getString('email'),
      name: record.getString('name'),
      payment_status: record.getString('payment_status'),
    }
  })

  return e.json(200, subscribers)
})
