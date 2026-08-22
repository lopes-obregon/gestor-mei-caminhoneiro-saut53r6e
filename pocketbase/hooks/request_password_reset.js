routerAdd('POST', '/backend/v1/request-password-reset', (e) => {
  const body = e.requestInfo().body || {}
  const email = (body.email || '').trim()

  if (!email) {
    return e.json(400, { error: 'email is required' })
  }

  let user = null
  try {
    user = $app.findAuthRecordByEmail('_pb_users_auth_', email)
  } catch (_) {
    // Retornar 200 sempre para não expor se o email existe,
    // mas sinaliza not_found para o frontend orientar o usuário
    return e.json(200, { success: true, not_found: true })
  }

  // Gerar código de 6 dígitos, salvar verification_code e verification_code_expires (10 min)
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const now = Math.floor(Date.now() / 1000)
  const expires = now + 10 * 60

  user.set('verification_code', code)
  user.set('verification_code_expires', expires)

  try {
    $app.save(user)
  } catch (err) {
    $app.logger().error('Failed to save reset code', 'email', email, 'error', err.message || '')
    return e.json(200, { success: true })
  }

  const cfClientId = $os.getenv('CF_ACCESS_CLIENT_ID') || $os.getenv('CF_Access_Client_Id') || ''
  const cfClientSecret =
    $os.getenv('CF_ACCESS_CLIENT_SECRET') || $os.getenv('CF_Access_Client_Secret') || ''

  try {
    const res = $http.send({
      url: 'https://api.vlsolucoesia.com.br/backend/v1/send-code',
      method: 'POST',
      headers: {
        'CF-Access-Client-Id': cfClientId,
        'CF-Access-Client-Secret': cfClientSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        code: code,
        name: user.getString('name'),
        external_id: user.getString('external_id'),
        expires_in_minutes: 10,
        type: 'password_reset',
      }),
      timeout: 15,
    })

    if (res.statusCode >= 200 && res.statusCode < 300) {
      $app.logger().info('Password reset code sent successfully', 'email', email)
    } else {
      $app
        .logger()
        .error(
          'Failed to send password reset code via API',
          'status',
          res.statusCode,
          'body',
          res.raw || '',
          'email',
          email,
        )
    }
  } catch (err) {
    $app
      .logger()
      .error('HTTP error sending password reset code', 'error', err.message || '', 'email', email)
  }

  return e.json(200, { success: true })
})
