/// Configure SMTP (Gmail) and sender address from the EMAIL / PASSWORD_GMAIL
/// environment secrets. Skipped (with a warning) when the secrets are missing.
migrate(
  (app) => {
    const email = $os.getenv('EMAIL')
    const password = $os.getenv('PASSWORD_GMAIL')
    const siteUrl = $os.getenv('SITE_URL')

    if (!email || !password) {
      console.log(
        '[0006_configure_smtp] Secrets EMAIL / PASSWORD_GMAIL não encontradas — pulando configuração de SMTP.',
      )
      return
    }

    const settings = app.settings()

    // SMTP — smtp.gmail.com:587 usa StartTLS (tls=false deixa o servidor decidir o upgrade).
    settings.smtp.enabled = true
    settings.smtp.host = 'smtp.gmail.com'
    settings.smtp.port = 587
    settings.smtp.username = email
    settings.smtp.password = password
    settings.smtp.tls = false
    settings.smtp.authMethod = '' // PLAIN (padrão do PocketBase)

    // Remetente — usa o mesmo e-mail autenticado como sender address.
    settings.meta.senderAddress = email
    settings.meta.senderName = 'Gestor Caminhoneiro'

    // appURL — quando SITE_URL está disponível, aponta os links de
    // verificação/redefinição de senha enviados por e-mail para o frontend
    // React em vez do admin do PocketBase.
    if (siteUrl) {
      settings.meta.appURL = siteUrl
    }

    app.save(settings)
    console.log('[0006_configure_smtp] SMTP configurado para ' + email)
  },
  (app) => {
    // Reverte para os defaults do PocketBase (SMTP desabilitado).
    const settings = app.settings()
    settings.smtp.enabled = false
    settings.smtp.host = ''
    settings.smtp.port = 0
    settings.smtp.username = ''
    settings.smtp.password = ''
    settings.smtp.tls = true
    settings.smtp.authMethod = ''
    settings.meta.senderAddress = ''
    settings.meta.senderName = ''
    // Não reverter appURL — pode ter sido definida manualmente no admin.
    app.save(settings)
  },
)
