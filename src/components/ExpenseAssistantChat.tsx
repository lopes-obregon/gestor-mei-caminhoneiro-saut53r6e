import { useState, useRef, useEffect } from 'react'
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  FileText,
  Truck,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import pb from '@/lib/pocketbase/client'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  text: string
  time: string
}

const INITIAL_GREETING: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Olá, parceiro da estrada! Sou o seu Analista de Despesas e Assistente MEI.\n\nPosso te ajudar a usar todas as funções do sistema (viagens, despesas, escaneamento de notas) e tirar qualquer dúvida sobre a legislação do MEI Caminhoneiro (Lei 188/2021, DAS, CT-e, limite de faturamento, INSS e aposentadoria).\n\nComo posso te ajudar hoje?',
  time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
}

const SUGGESTED_QUESTIONS = [
  { icon: Truck, label: 'Como cadastrar viagem e despesa?' },
  { icon: FileText, label: 'Qual o limite de faturamento do MEI Caminhoneiro?' },
  { icon: HelpCircle, label: 'Como funciona o escaneamento de nota por IA?' },
  { icon: Sparkles, label: 'Quais os benefícios do INSS no MEI Caminhoneiro?' },
]

export function ExpenseAssistantChat() {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING])
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (open) {
      setTimeout(scrollToBottom, 100)
    }
  }, [open, messages, loading])

  const handleSend = async (messageToSend?: string) => {
    const rawText = messageToSend ?? inputMessage
    const text = rawText.trim()
    if (!text || loading) return

    const userMessageId = `user-${Date.now()}`
    const nowTime = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })

    const newUserMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      text,
      time: nowTime,
    }

    setMessages((prev) => [...prev, newUserMsg])
    if (!messageToSend) {
      setInputMessage('')
    }
    setLoading(true)

    try {
      const baseUrl = import.meta.env.VITE_POCKETBASE_URL || ''
      const res = await fetch(`${baseUrl}/backend/v1/agent-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: pb.authStore.token || '',
        },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.error || `Erro ao comunicar com o assistente (${res.status})`)
      }

      if (data.conversation_id) {
        setConversationId(data.conversation_id)
      }

      const botMessageId = data.message_id || `bot-${Date.now()}`
      const botResponseText =
        typeof data.content === 'string' && data.content.trim()
          ? data.content.trim()
          : 'Desculpe, não consegui gerar uma resposta no momento. Pode reformular a pergunta?'

      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          role: 'assistant',
          text: botResponseText,
          time: new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ])
    } catch (err: any) {
      const errorMsg =
        err?.message || 'Não foi possível obter resposta no momento. Tente novamente em instantes.'
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ ${errorMsg}`,
          time: new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }

  const handleResetChat = () => {
    setMessages([
      {
        ...INITIAL_GREETING,
        id: `welcome-${Date.now()}`,
        time: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ])
    setConversationId(null)
  }

  // Conteúdo do chat compartilhado entre desktop (card flutuante) e mobile (Sheet)
  const chatBody = (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header interno */}
      <div className="p-3.5 border-b bg-muted/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/20">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground leading-none">
                Analista de Despesas
              </h3>
              <Badge
                variant="secondary"
                className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary"
              >
                MEI IA
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
              Tire dúvidas do app e da legislação do MEI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleResetChat}
            title="Reiniciar conversa"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(false)}
            title="Fechar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Área de mensagens */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3.5 pr-2">
          {messages.map((m) => {
            const isBot = m.role === 'assistant'
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
              >
                {isBot && (
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isBot
                      ? 'bg-muted/70 text-foreground rounded-tl-sm border border-border/50'
                      : 'bg-primary text-primary-foreground rounded-tr-sm ml-auto'
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{m.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      isBot ? 'text-muted-foreground/75' : 'text-primary-foreground/75'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
                {!isBot && (
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mb-0.5">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            )
          })}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-2.5 items-start">
              <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="bg-muted/70 text-muted-foreground rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs flex items-center gap-2 border border-border/50">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Analisando e digitando resposta...</span>
              </div>
            </div>
          )}

          {/* Sugestões de perguntas (quando há apenas mensagem de boas-vindas) */}
          {messages.length === 1 && !loading && (
            <div className="pt-2 space-y-1.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-1">
                Sugestões rápidas
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(q.label)}
                    className="flex items-center gap-2 p-2 rounded-lg text-left text-xs bg-muted/40 hover:bg-muted text-foreground border border-border/40 transition-colors"
                  >
                    <q.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="line-clamp-2">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input inferior */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="p-3 border-t bg-card/60 backdrop-blur-sm shrink-0 flex items-center gap-2"
      >
        <Input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Tire dúvidas sobre despesas, viagens ou MEI..."
          disabled={loading}
          className="text-xs sm:text-sm h-10 focus-visible:ring-primary"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!inputMessage.trim() || loading}
          className="h-10 w-10 shrink-0"
          title="Enviar pergunta"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  )

  return (
    <>
      {/* Botão Flutuante (FAB) fixo */}
      {/* Em mobile: bottom-20 (acima da bottom nav bar de 16h) e left-4 para não bater com o botão de QuickAdd (+) que fica no bottom-20 right-4 */}
      {/* Em desktop: bottom-6 right-6 */}
      <div className="fixed z-40 bottom-20 left-4 md:bottom-6 md:right-6 md:left-auto">
        <Button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="h-12 w-12 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center p-0 transition-transform active:scale-95 group relative"
          aria-label="Abrir Analista de Despesas e Assistente MEI"
          title="Assistente IA - Analista de Despesas"
        >
          {open ? (
            <X className="h-6 w-6 transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <>
              <MessageCircle className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </>
          )}
        </Button>
      </div>

      {/* Painel de Chat Responsivo */}
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="h-[85vh] p-0 flex flex-col rounded-t-2xl overflow-hidden border-t"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Analista de Despesas</SheetTitle>
              <SheetDescription>Assistente Virtual e Jurídico MEI</SheetDescription>
            </SheetHeader>
            {chatBody}
          </SheetContent>
        </Sheet>
      ) : (
        open && (
          <div className="fixed bottom-20 right-6 z-40 w-[400px] h-[540px] max-h-[calc(100vh-120px)] bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-200">
            {chatBody}
          </div>
        )
      )}
    </>
  )
}
