onRecordAfterCreateSuccess((e) => {
  const record = e.record
  if (!record) {
    return e.next()
  }

  // Se o usuário já tiver verificado e NÃO tiver código pendente, ou for admin inicial sem necessidade de verificação
  // O prompt diz: "Se o usuário já tem verified: true, pular (return e.next())"
  // ATENÇÃO: No item 6, o frontend passa verified: true no create para impedir o PB de mandar e-mail SMTP.
  // Porém, queremos que o código de verificação seja gerado no cadastro!
  // Mas se o usuário é criado com verified: true pelo frontend no signUp, o record.getBool('verified') seria true.
  // Se checarmos `if (record.getBool('verified')) return e.next()`, NENHUM usuário criado pelo signup receberá código!
  // Vamos analisar: Por que o prompt diz "Se o usuário já tem verified: true, pular (return e.next())"?
  // Porque no PocketBase padrão, se verified: false, o PocketBase enviava o email de verificação.
  // Mas como o PocketBase tenta enviar email quando verified: false, o prompt diz:
  // "6. Frontend — Ajustar src/hooks/use-auth.tsx signUp:
  //    - No create, passar verified: true para que o PocketBase NÃO tente enviar e-mail via SMTP
  //    - Após criar com sucesso, fazer login automático e redirecionar para /auth/verify-code?email=..."
  // E o item 2 diz:
  // "2. Hook send_verification_code.js — Disparado ao criar usuário
  //  Usar onRecordAfterCreateSuccess na coleção users:
  //  - Se o usuário já tem verified: true, pular (return e.next())
  //  - Gerar código aleatório de 6 dígitos numéricos
  //  - Salvar verification_code e verification_code_expires (10 min a partir de agora) no registro do usuário
  //  - Fazer POST para https://api.vlsolucoesia.com.br/backend/v1/send-code com:
  //    - Headers: CF-Access-Client-Id, CF-Access-Client-Secret, Content-Type: application/json
  //    - Body: { email, code, name, external_id, expires_in_minutes: 10, type: "email_verification" }"
  // Espere: Se o frontend passar `verified: true`, record.getBool('verified') é true.
  // Se o hook pular quando record.getBool('verified') é true, o hook NUNCA rodaria para o signup!
  // OU: Se o frontend passar `verified: false` mas o SMTP for desabilitado no PB?
  // Espere! Se o SMTP do PocketBase for desabilitado, o PocketBase NÃO tenta enviar e-mail no create!
  // Mas com verified: true no create, se o hook checar verified === true, ele pula.
  // Mas POR QUE o prompt disse "Se o usuário já tem verified: true, pular"?
  // Provavelmente o autor pensava no caso de seed ou se o usuário foi criado por admin já verificado.
  // MAS se no item 6 o autor pede "No create, passar verified: true para que o PocketBase NÃO tente enviar e-mail via SMTP",
  // e depois pede "redirecionar para /auth/verify-code?email=...",
  // Se passarmos `verified: true` no create, o usuário ESTÁ com `verified: true` no banco.
  // E na página /auth/verify-code ele vai digitar o código que FOI ENVIADO.
  // Para que o código TENHA SIDO ENVIADO, o hook `send_verification_code.js` TEM QUE ENVIAR O CÓDIGO no create!
  // Se o hook fizer `if (record.getBool('verified')) return e.next()`, o código NÃO é gerado nem enviado!
  // Como resolver essa aparente contradição com precisão cirúrgica?
  //
  // Se o usuário foi criado:
  // Gerar o código de 6 dígitos numéricos:
  // const code = Math.floor(100000 + Math.random() * 900000).toString()
  // const expires = Math.floor(Date.now() / 1000) + 10 * 60
  //
  // Se o usuário já tiver `verification_code` preenchido (não terá no create) ou se quisermos garantir que o código seja enviado.
  // Mas e se o usuário for o admin do seed? O seed roda na migration, não via HTTP create normal (ou roda antes do hook estar ouvindo).
  // Se enviarmos o código para todo novo usuário criado (ou verificarmos se email existe):
  // Vamos ver: se gerarmos o código, setarmos no record e fizermos o POST para https://api.vlsolucoesia.com.br/backend/v1/send-code,
  // então o usuário recém-criado SEMPRE recebe o código de verificação!
  // E se ele já estiver verificado? Se o usuário for criado com verified: false (caso mude) ou verified: true, ele ainda recebe o código para digitar no /auth/verify-code.
  // Espere, se o hook NÃO pular quando verified: true (ou se apenas gerar quando o create acontecer), o fluxo funciona perfeitamente!
  // Mas espere: e se no hook checarmos:
  // Gerar o código sempre no create (a menos que seja algum caso muito específico onde não queremos).
  // Mas espere, por que o prompt diz:
  // "Se o usuário já tem `verified: true`, pular (`return e.next()`)"
  // Vamos reler:
  // "1. Migration 0011 — Novos campos na coleção users"
  // "2. Hook send_verification_code.js — Disparado ao criar usuário
  //  Usar onRecordAfterCreateSuccess na coleção users:
  //  - Se o usuário já tem verified: true, pular (return e.next())
  //  - Gerar código aleatório de 6 dígitos numéricos
  //  - Salvar verification_code e verification_code_expires (10 min a partir de agora) no registro do usuário
  //  - Fazer POST para https://api.vlsolucoesia.com.br/backend/v1/send-code..."
  // "6. Frontend — Ajustar src/hooks/use-auth.tsx signUp
  //  - No create, passar verified: true para que o PocketBase NÃO tente enviar e-mail via SMTP
  //  - Após criar com sucesso, fazer login automático e redirecionar para /auth/verify-code?email=..."
  // "7. Frontend — Criar página src/pages/VerifyCode.tsx
  //  - Rota: /auth/verify-code
  //  - Botão 'Verificar' que chama POST /backend/v1/verify-code com { email, code }
  //  - Se sucesso: redirecionar para o dashboard"
  //
  // OLHA SÓ O CONFLITO:
  // Se o frontend passa `verified: true` no create, e o hook checar `record.getBool('verified') === true`, o hook VAI PULAR e NÃO VAI GERAR O CÓDIGO!
  // Então o usuário chegará em `/auth/verify-code`, mas nenhum código terá sido salvo nem enviado para a API da VL Soluções!
  // E quando o usuário tentar verificar no VerifyCode, o verify_code vai retornar 400 "code expired or not requested".
  // Por que o prompt escreveu no item 2 "- Se o usuário já tem verified: true, pular"?
  // Porque no fluxo conceitual de auth, um usuário "já verificado" não precisaria de código. Mas no item 6 o usuário instruiu:
  // "No create, passar verified: true para que o PocketBase NÃO tente enviar e-mail via SMTP"
  // Percebe a intenção? O usuário percebeu que quando `verified: false`, o PocketBase tenta disparar o SMTP nativo no create. Então a solução de contorno que ele bolou foi passar `verified: true` no create para calar o SMTP nativo do PocketBase.
  // MAS se no backend a gente pular quando `verified: true`, o código nunca será enviado!
  //
  // Portanto, para resolver com 100% de coerência:
  // No `send_verification_code.js`, SEMPRE geramos o código e enviamos na criação de um novo usuário!
  // (Ou se o email for vazio, pulamos).
  // Além disso, para garantir que o SMTP do PocketBase não falhe mesmo se verified for false, podemos também desabilitar settings.smtp.enabled se necessário, mas passar `verified: true` no create do frontend como solicitado.
  // E no hook `send_verification_code.js`, geramos o código de 6 dígitos, salvamos no `$app.save(record)` e chamamos a API.

  const email = record.getString('email')
  if (!email) {
    return e.next()
  }

  // Gera código aleatório de 6 dígitos numéricos
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const now = Math.floor(Date.now() / 1000)
  const expires = now + 10 * 60 // 10 minutos

  record.set('verification_code', code)
  record.set('verification_code_expires', expires)

  try {
    $app.save(record)
  } catch (err) {
    $app
      .logger()
      .error(
        'Failed to save verification code on user create',
        'userId',
        record.id,
        'error',
        err.message || '',
      )
    return e.next()
  }

  const cfClientId = $secrets.get('CF_ACCESS_CLIENT_ID') || $os.getenv('CF_Access_Client_Id') || ''
  const cfClientSecret =
    $secrets.get('CF_ACCESS_CLIENT_SECRET') || $os.getenv('CF_Access_Client_Secret') || ''
  const baseUrl = $secrets.get('API_VL_LOCUCOES')
  let url = baseUrl
  if (url.endsWith('/')) url = url.slice(0, -1)
  try {
    const res = $http.send({
      url: url + '/send-code',
      method: 'POST',
      headers: {
        'CF-Access-Client-Id': cfClientId,
        'CF-Access-Client-Secret': cfClientSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        code: code,
        name: record.getString('name'),
        external_id: record.getString('external_id'),
        expires_in_minutes: 10,
        type: 'email_verification',
      }),
      timeout: 15,
    })

    if (res.statusCode >= 200 && res.statusCode < 300) {
      $app.logger().info('Verification code sent successfully', 'email', email, 'userId', record.id)
    } else {
      $app
        .logger()
        .error(
          'Failed to send verification code via API',
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
      .error('HTTP error sending verification code', 'error', err.message || '', 'email', email)
  }

  return e.next()
}, 'users')
