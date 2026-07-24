onRecordAfterUpdateSuccess((e) => {
  const baseUrl = $secrets.get('API_VL_LOCUCOES')
  const authToken = $secrets.get('API_VL_LOCUCOES_AUTH_TOKEN')

  if (!baseUrl || !authToken) {
    return e.next()
  }

  const record = e.record
  if (!record) {
    return e.next()
  }

  const nameChanged = record.getString('name') !== record.original().getString('name')
  const emailChanged = record.getString('email') !== record.original().getString('email')
  const paymentStatusChanged =
    record.getString('payment_status') !== record.original().getString('payment_status')
  const externalIdChanged =
    record.getString('external_id') !== record.original().getString('external_id')

  if (!nameChanged && !emailChanged && !paymentStatusChanged && !externalIdChanged) {
    return e.next()
  }

  let url = baseUrl
  if (url.endsWith('/')) url = url.slice(0, -1)
  url = url + '/users'

  try {
    $http.send({
      url: url,
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
      .error('outgoing sync failed on user update', 'userId', record.id, 'error', err.message || '')
  }

  return e.next()
}, 'users')
