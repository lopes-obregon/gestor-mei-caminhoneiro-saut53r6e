routerAdd('POST', '/backend/v1/mensagem', (e) => {
  const authToken = $secrets.get('EXTERNAL_SYSTEM_AUTH_TOKEN')
  if (!authToken) {
    return e.json(503, { error: 'external system auth not configured' })
  }

  const authHeader = e.request.header.get('Authorization') || ''
  if (authHeader !== authToken && authHeader !== 'Bearer ' + authToken) {
    return e.unauthorizedError('invalid auth token')
  }

  const body = e.requestInfo().body || {}
  const externalId = (body.external_id || '').toString().trim()
  const email = (body.email || '').toString().trim()
  const status = (body.status || '').toString().trim().toLowerCase()
  const expiryDate = (body.expiry_date || '').toString().trim()
  const daysRemaining =
    body.days_remaining !== undefined && body.days_remaining !== null ? body.days_remaining : ''

  if (!externalId && !email) {
    return e.badRequestError('external_id or email is required')
  }

  let user = null

  // 1. Buscar usuário primeiro por external_id
  if (externalId) {
    try {
      user = $app.findFirstRecordByData('users', 'external_id', externalId)
    } catch (_) {}
  }

  // 2. Se não achar, buscar por email
  if (!user && email) {
    try {
      user = $app.findAuthRecordByEmail('_pb_users_auth_', email)
    } catch (_) {}
  }

  // 3. Se não encontrar usuário, retornar 404
  if (!user) {
    return e.json(404, { error: 'subscriber not found' })
  }

  // 4. Mapear status para payment_status válido
  let paymentStatus = ''
  if (status === 'paid' || status === 'pago' || status === 'active' || status === 'ativo') {
    paymentStatus = 'paid'
  } else if (status === 'pending' || status === 'pendente' || status === 'trial') {
    paymentStatus = 'pending'
  } else if (
    status === 'overdue' ||
    status === 'atrasado' ||
    status === 'expired' ||
    status === 'expirado' ||
    status === 'suspended' ||
    status === 'suspenso' ||
    status === 'canceled' ||
    status === 'cancelled'
  ) {
    paymentStatus = 'overdue'
  } else if (status) {
    paymentStatus = status
  }

  if (paymentStatus) {
    user.set('payment_status', paymentStatus)
    $app.saveNoValidate(user)
  }

  // 5. Montar mensagem amigável
  let message = ''
  if (paymentStatus === 'paid') {
    message = expiryDate
      ? '✅ Sua conta está ativa! Pagamento confirmado. Acesso liberado até ' + expiryDate + '.'
      : '✅ Sua conta está ativa! Pagamento confirmado. Acesso liberado.'
  } else if (paymentStatus === 'pending') {
    message =
      daysRemaining !== ''
        ? '⏳ Seu pagamento está pendente. Restam ' +
          daysRemaining +
          ' dias. Regularize para não perder o acesso.'
        : '⏳ Seu pagamento está pendente. Regularize para não perder o acesso.'
  } else if (paymentStatus === 'overdue') {
    message =
      '🚫 Seu acesso foi suspenso por falta de pagamento. Entre em contato para regularizar.'
  } else {
    message = 'Notificação de atualização da conta: ' + (status || 'status atualizado') + '.'
  }

  // 6. Criar notificação
  const notificationsCol = $app.findCollectionByNameOrId('notifications')
  const notification = new Record(notificationsCol)
  notification.set('user_id', user.id)
  notification.set('title', 'Atualização da sua conta')
  notification.set('message', message)
  notification.set('type', 'payment')
  notification.set('read', false)
  notification.set('payload', body)

  $app.save(notification)

  return e.json(200, {
    success: true,
    user_id: user.id,
    notification_id: notification.id,
  })
})
