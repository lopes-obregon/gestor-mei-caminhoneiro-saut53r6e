routerAdd(
  'POST',
  '/backend/v1/agent-chat',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const userId = e.auth?.id
      if (!userId) return e.unauthorizedError('auth required')

      const message = typeof body.message === 'string' ? body.message.trim() : ''
      if (!message) return e.badRequestError('message is required')

      const conversationId = body.conversation_id || null

      const result = $ai.agent('analista-de-despesas').chat({
        user_id: userId,
        conversation_id: conversationId,
        message: message,
      })

      return e.json(200, {
        conversation_id: result.conversation_id,
        content: result.content,
        citations: result.citations || [],
        message_id: result.message_id,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, {
          error: 'Serviço de inteligência artificial temporariamente indisponível.',
        })
      }
      if (err instanceof SkipAiAgentsError) {
        const status = err.status || 500
        return e.json(status, {
          error:
            status >= 500
              ? 'Erro interno ao consultar o assistente.'
              : err.message || 'Requisição inválida para o assistente.',
        })
      }
      if (err instanceof SkipAiError) {
        const status = err.status || 502
        return e.json(status, {
          error: 'Assistente temporariamente indisponível. Tente novamente em instantes.',
        })
      }
      console.log('Error in agent-chat hook:', err)
      return e.json(500, {
        error: 'Ocorreu um erro ao processar sua pergunta. Tente novamente.',
      })
    }
  },
  $apis.requireAuth(),
)
