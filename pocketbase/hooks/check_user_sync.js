routerAdd('POST', '/backend/v1/check-user-sync', (e) => {
  const baseUrl = $secrets.get('API_VL_LOCUCOES')
  const authToken = $secrets.get('EXTERNAL_SYSTEM_AUTH_TOKEN')

  if (!baseUrl || !authToken) {
    return e.json(503, { error: 'sync not configured' })
  }

  const body = e.requestInfo().body || {}
  const email = body.email || ''
  const externalId = body.external_id || ''

  if (!email && !externalId) {
    return e.badRequestError('email or external_id is required')
  }

  let url = baseUrl
  if (url.endsWith('/')) url = url.slice(0, -1)

  let resolvedExternalId = externalId

  if (!resolvedExternalId && email) {
    try {
      const localUser = $app.findAuthRecordByEmail('_pb_users_auth_', email)
      resolvedExternalId = localUser.getString('external_id')
    } catch (_) {}
  }

  if (resolvedExternalId) {
    try {
      const res = $http.send({
        url: url + '/users/' + resolvedExternalId,
        method: 'GET',
        headers: { Authorization: 'Bearer ' + authToken },
        timeout: 15,
      })
      if (res.statusCode >= 200 && res.statusCode < 300) {
        return e.json(200, { synced: true, user: res.json })
      }
      if (res.statusCode !== 404) {
        return e.json(502, { error: 'external system error' })
      }
    } catch (err) {
      return e.json(502, { error: 'failed to connect to external system' })
    }
  }

  if (email) {
    try {
      const res = $http.send({
        url: url + '/users?email=' + encodeURIComponent(email),
        method: 'GET',
        headers: { Authorization: 'Bearer ' + authToken },
        timeout: 15,
      })
      if (res.statusCode >= 200 && res.statusCode < 300) {
        return e.json(200, { synced: true, user: res.json })
      }
    } catch (err) {
      return e.json(502, { error: 'failed to connect to external system' })
    }
  }

  return e.json(200, { synced: false, user: null })
})
