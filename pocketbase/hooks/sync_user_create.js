onRecordAfterCreateSuccess((e) => {
  const baseUrl = $secrets.get('API_VL_LOCUCOES')
  const authToken = $secrets.get('API_VL_LOCUCOES_AUTH_TOKEN')
  console.log('baseUrl: ', baseUrl)
  if (!baseUrl || !authToken) {
    return e.next()
  }

  const record = e.record
  if (!record) {
    return e.next()
  }

  let url = baseUrl
  if (url.endsWith('/')) url = url.slice(0, -1)
  url = url + '/users'
  console.log(url)
  try {
    $http.send({
      url: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
