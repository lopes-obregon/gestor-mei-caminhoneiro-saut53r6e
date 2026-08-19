/// Configure SMTP (Gmail) and sender address from the EMAIL / PASSWORD_GMAIL
/// environment secrets.
migrate(
  (app) => {
    const email = $os.getenv('EMAIL')
    const password = $os.getenv('PASSWORD_GMAIL')
    const siteUrl = $os.getenv('SITE_URL')

    if (!email || !password) {
      console.log(
        '[0009_configure_smtp] Secrets EMAIL / PASSWORD_GMAIL não encontradas — pulando configuração de SMTP.',
      )
      return
    }

    const settings = app.settings()

    // SMTP — smtp.gmail.com:587 com StartTLS (tls=true no PocketBase para SSL/TLS em conexões SMTP)
    settings.smtp.enabled = true
    settings.smtp.host = 'smtp.gmail.com'
    settings.smtp.port = 587
    settings.smtp.username = email
    settings.smtp.password = password
    settings.smtp.tls = true
    settings.smtp.authMethod = '' // PLAIN (padrão)

    // Remetente
    settings.meta.senderAddress = email
    settings.meta.senderName = 'Gestor MEI Caminhoneiro'

    if (siteUrl) {
      settings.meta.appURL = siteUrl
    }

    app.save(settings)
    console.log('[0009_configure_smtp] SMTP configurado com tls=true para ' + email)
  },
  (app) => {
    const settings = app.settings()
    settings.smtp.enabled = false
    app.save(settings)
  },
)
