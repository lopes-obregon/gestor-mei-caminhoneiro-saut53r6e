import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Truck,
  ShieldCheck,
  Calendar,
  Lock,
  FileText,
  UserCheck,
  MessageSquare,
  Share2,
  RefreshCw,
  ArrowLeft,
  Home,
  MessageCircle,
  ExternalLink,
  HelpCircle,
} from 'lucide-react'

export default function PrivacyPolicyPage() {
  const { isAuthenticated } = useAuth()

  const metadata = {
    title: 'Política de Privacidade | VlsoluçõesIA',
    description: 'Política de Privacidade do Gestor Caminhoneiro.',
    companyName: 'VlsoluçõesIA',
    companyWebsite: '',
    ownerName: 'Renan',
    whatsappLink: 'https://wa.me/5567981538470',
    whatsappDisplay: '(67) 98153-8470',
  }

  const updatedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeZone: 'America/Cuiaba',
  }).format(new Date())

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            to={isAuthenticated ? '/' : '/login'}
            className="flex items-center gap-2.5 text-primary font-bold text-lg hover:opacity-90 transition-opacity"
          >
            <div className="bg-primary/10 p-2 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <span>Gestor Caminhoneiro</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to={isAuthenticated ? '/' : '/login'}>
                {isAuthenticated ? (
                  <>
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">Voltar ao Início</span>
                    <span className="sm:hidden">Início</span>
                  </>
                ) : (
                  <>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Voltar ao Login</span>
                    <span className="sm:hidden">Login</span>
                  </>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-6 sm:py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
          {/* Header Card / Banner */}
          <Card className="border-primary/20 shadow-sm overflow-hidden">
            <div className="bg-primary/5 border-b border-primary/10 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                >
                  {metadata.companyName}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Última atualização: {updatedAt}</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary text-primary-foreground hidden sm:flex shrink-0">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    Política de Privacidade
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Esta Política de Privacidade explica como a {metadata.companyName} trata dados
                    pessoais no contexto do Gestor Caminhoneiro e de seus canais de atendimento e
                    relacionamento comercial.
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-8">
              {/* Section 1 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    1. Dados que podemos tratar
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-8">
                  Podemos tratar informações fornecidas por você em conversas, como nome,
                  identificador do perfil, conteúdo de mensagens e dados necessários para atender
                  sua solicitação. Também podemos usar informações públicas disponibilizadas no
                  perfil profissional, como nome de usuário, biografia e localização informada no
                  perfil.
                </p>
              </section>

              <Separator />

              {/* Section 2 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">2. Finalidades</h2>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-8">
                  Usamos esses dados para responder contatos, apresentar informações solicitadas
                  sobre o Gestor Caminhoneiro, encaminhar interessados aos canais adequados e manter
                  histórico de atendimento.
                </p>
              </section>

              <Separator />

              {/* Section 3 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    3. Mensagens e preferências
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-8">
                  Se você pedir para não receber novas mensagens, registraremos essa preferência e
                  não entraremos em contato novamente por essa automação. Você pode fazer esse
                  pedido diretamente na conversa.
                </p>
              </section>

              <Separator />

              {/* Section 4 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    <Lock className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    4. Armazenamento e segurança
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-8">
                  Os registros operacionais são armazenados em ambiente controlado pela{' '}
                  {metadata.companyName}, com acesso restrito ao necessário para operação, suporte e
                  segurança. Adotamos medidas técnicas e organizacionais razoáveis para proteger os
                  dados contra acesso não autorizado, perda ou uso indevido.
                </p>
              </section>

              <Separator />

              {/* Section 5 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">5. Compartilhamento</h2>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-8">
                  Não vendemos dados pessoais. Podemos utilizar provedores técnicos necessários à
                  operação dos canais de comunicação e infraestrutura, de acordo com as
                  configurações e regras aplicáveis desses serviços.
                </p>
              </section>

              <Separator />

              {/* Section 6 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    6. Seus direitos e contato
                  </h2>
                </div>
                <div className="space-y-4 pl-8">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Você pode solicitar esclarecimentos, acesso, correção ou eliminação de dados
                    aplicáveis, bem como pedir o encerramento de contatos. Para isso, fale com{' '}
                    <span className="font-medium text-foreground">{metadata.ownerName}</span> pelo{' '}
                    <a
                      href={metadata.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                    >
                      WhatsApp
                      <ExternalLink className="h-3 w-3 inline" />
                    </a>
                    .
                  </p>

                  <div className="p-4 rounded-xl bg-muted/50 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600 shrink-0">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Canal de Contato Direto
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {metadata.ownerName} • {metadata.whatsappDisplay}
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto gap-2"
                    >
                      <a href={metadata.whatsappLink} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" />
                        Conversar no WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Section 7 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    7. Alterações desta política
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-8">
                  Podemos atualizar esta Política de Privacidade quando necessário. A versão vigente
                  estará sempre disponível nesta página.
                </p>
              </section>
            </CardContent>
          </Card>

          {/* Footer Card */}
          <Card className="border bg-card/60">
            <CardContent className="p-6 text-center text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">{metadata.companyName}</p>
              {metadata.companyWebsite ? (
                <p>
                  <a
                    href={metadata.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {metadata.companyWebsite}
                  </a>
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground/80">
                Gestor Caminhoneiro — Sistema de Gestão Financeira para MEI Caminhoneiro
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="border-t bg-card py-4 px-4 text-center text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            &copy; {new Date().getFullYear()} {metadata.companyName}. Todos os direitos reservados.
          </span>
          <div className="flex items-center gap-4">
            <Link
              to={isAuthenticated ? '/' : '/login'}
              className="hover:text-foreground hover:underline transition-colors"
            >
              {isAuthenticated ? 'Início' : 'Login'}
            </Link>
            <span>•</span>
            <span className="text-foreground font-medium">Política de Privacidade</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
