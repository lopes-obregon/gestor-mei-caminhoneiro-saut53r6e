/// Corrige a configuração SMTP do Gmail para STARTTLS na porta 587.
///
/// As migrations 0006, 0008 e 0009 configuraram smtp.gmail.com:587 com
/// `tls: true`. No PocketBase, `tls: true` significa TLS implícito (porta
/// 465); para a porta 587 com STARTTLS o correto é `tls: false` — o
/// PocketBase faz o upgrade automático para TLS via STARTTLS.
///
/// Com `tls: true` na porta 587 a conexão SMTP falha, e como o PocketBase
/// tenta enviar o e-mail de verificação durante a criação do usuário, o
/// POST /api/collections/users/records inteiro retorna HTTP 400
/// "Failed to create record." com `data: {}` (sem erros de validação).
///
/// Esta migration reconfigura o SMTP com `tls: false`.
migrate(
  (app) => {
    const email = $os.getenv('EMAIL')
    const password = $os.getenv('PASSWORD_GMAIL')
    const siteUrl = $os.getenv('SITE_URL')

    if (!email || !password) {
      console.log(
        '[0010_fix_smtp_starttls] Secrets EMAIL / PASSWORD_GMAIL não encontradas — pulando configuração de SMTP.',
      )
      return
    }

    const settings = app.settings()

    // SMTP — smtp.gmail.com:587 com STARTTLS.
    // No PocketBase `tls: false` na porta 587 deixa o servidor decidir o
    // upgrade STARTTLS; `tls: true` força TLS implícito (porta 465) e quebra
    // a conexão aqui.
    settings.smtp.enabled = true
    settings.smtp.host = 'smtp.gmail.com'
    settings.smtp.port = 587
    settings.smtp.username = email
    settings.smtp.password = password
    settings.smtp.tls = false // ← CORREÇÃO PRINCIPAL (STARTTLS na porta 587)
    settings.smtp.authMethod = '' // PLAIN (padrão do PocketBase)

    // Remetente — usa o mesmo e-mail autenticado como sender address.
    settings.meta.senderAddress = email
    settings.meta.senderName = 'Gestor MEI Caminhoneiro'

    // appURL — quando SITE_URL está disponível, aponta os links de
    // verificação/redefinição de senha enviados por e-mail para o frontend
    // React em vez do admin do PocketBase.
    if (siteUrl) {
      settings.meta.appURL = siteUrl
    }

    app.save(settings)
    console.log('[0010_fix_smtp_starttls] SMTP corrigido (tls=false / STARTTLS) para ' + email)
  },
  (app) => {
    // Reverte para os defaults do PocketBase (SMTP desabilitado).
    const settings = app.settings()
    settings.smtp.enabled = false
    app.save(settings)
  },
)
