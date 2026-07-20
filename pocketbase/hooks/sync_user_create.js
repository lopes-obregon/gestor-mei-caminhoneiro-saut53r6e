onRecordAfterCreateSuccess((e) => {
  const defaultUrl =
    'https://gestao-de-empresa-de-sistemas-e4fd0.shrd00.internal.goskip.dev/backend/v1/sync-users'
  const apiUrl = $secrets.get('EXTERNAL_SYSTEM_API_URL') || defaultUrl
  const authToken = $secrets.get('EXTERNAL_SYSTEM_AUTH_TOKEN')

  if (!authToken) {
    return e.next()
  }

  const record = e.record
  if (!record) {
    return e.next()
  }

  try {
    $http.send({
      url: apiUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authToken,
      },
      body: JSON.stringify({
        external_id: record.getString('external_id'),
        name: record.getString('name'),
        email: record.getString('email'),
        payment_status: record.getString('payment_status'),
      }),
      timeout: 15,
    })
  } catch (err) {
    $app
      .logger()
      .error('outgoing sync failed on user create', 'userId', record.id, 'error', err.message || '')
  }

  return e.next()
}, 'users')
