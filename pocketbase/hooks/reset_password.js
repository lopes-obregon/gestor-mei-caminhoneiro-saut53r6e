routerAdd('POST', '/backend/v1/reset-password', (e) => {
  const body = e.requestInfo().body || {}
  const email = (body.email || '').trim()
  const code = (body.code || '').trim()
  const newPassword = body.new_password || ''

  if (!email || !code || !newPassword) {
    return e.json(400, { error: 'email, code and new_password are required' })
  }

  if (newPassword.length < 8) {
    return e.json(400, { error: 'password must be at least 8 characters' })
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

  // Se válido: atualizar senha do usuário, limpar verification_code e verification_code_expires
  user.setPassword(newPassword)
  user.set('verification_code', '')
  user.set('verification_code_expires', 0)

  try {
    $app.save(user)
    return e.json(200, { success: true })
  } catch (err) {
    $app.logger().error('Failed to reset user password', 'email', email, 'error', err.message || '')
    return e.json(500, { error: 'failed to update password' })
  }
})
