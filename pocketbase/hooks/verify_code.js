routerAdd('POST', '/backend/v1/verify-code', (e) => {
  const body = e.requestInfo().body || {}
  const email = (body.email || '').trim()
  const code = (body.code || '').trim()

  if (!email || !code) {
    return e.json(400, { error: 'email and code are required' })
  }

  let user = null
  try {
    user = $app.findAuthRecordByEmail('_pb_users_auth_', email)
  } catch (_) {
    return e.json(404, { error: 'user not found' })
  }

  const storedCode = user.getString('verification_code')
  const expires = user.getInt('verification_code_expires')
  const now = Math.floor(Date.now() / 1000)

  if (!storedCode || !expires || expires < now) {
    return e.json(400, { error: 'code expired or not requested' })
  }

  if (storedCode !== code) {
    return e.json(400, { error: 'invalid code' })
  }

  // Se válido: setar verified: true, limpar verification_code e verification_code_expires, salvar registro
  user.setVerified(true)
  user.set('verification_code', '')
  user.set('verification_code_expires', 0)

  try {
    $app.save(user)
    return e.json(200, { success: true })
  } catch (err) {
    $app.logger().error('Failed to verify user code', 'email', email, 'error', err.message || '')
    return e.json(500, { error: 'failed to update user' })
  }
})
