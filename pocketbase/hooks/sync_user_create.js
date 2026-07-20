onRecordAfterCreateSuccess((e) => {
  const apiUrl = $secrets.get('EXTERNAL_SYSTEM_API_URL')
  const authToken = $secrets.get('EXTERNAL_SYSTEM_AUTH_TOKEN')

  if (!apiUrl || !authToken) {
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
        Authorization: authToken,
      },
      body: JSON.stringify({
        id: record.id,
        name: record.getString('name'),
        email: record.getString('email'),
        payment_status: record.getString('payment_status'),
      }),
      timeout: 15,
    })
  } catch (err) {
    $app.logger().error('outgoing sync failed on user create', 'userId', record.id)
  }

  return e.next()
}, 'users')
