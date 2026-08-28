import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { checkUserSync } from '@/services/sync'
import { cn } from '@/lib/utils'
import { formatDocument, validateDocument } from '@/lib/document'
import {
  Truck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  User,
  FileText,
  MailWarning,
  Phone,
} from 'lucide-react'

/** Formata um número de telefone brasileiro enquanto o usuário digita: (XX) XXXXX-XXXX. */
export const formatPhone = (value: string): string => {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'

export default function Login() {
  const { signIn, signUp, signOut, isAuthenticated, requestVerification } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [document, setDocument] = useState('')
  const [phone, setPhone] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [termsError, setAcceptedTermsError] = useState('')
  const [termsModalOpen, setTermsModalOpen] = useState(false)
  const [nameError, setNameError] = useState('')
  const [documentError, setDocumentError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginFailed, setLoginFailed] = useState(false)
  const [checkingSync, setCheckingSync] = useState(false)
  const [syncResult, setSyncResult] = useState('')
  const [syncError, setSyncError] = useState(false)
  const [resendingVerification, setResendingVerification] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [attemps, setAttemps] = useState(0)
  const [lockoutTime, setLockoutTime] = useState(0)
  const [isTimeBlocked, setIsTimeBlocked] = useState(false)

  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [lockoutTime])

  if (isAuthenticated) return <Navigate to="/" />
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginFailed(false)
    setSyncResult('')
    if (lockoutTime > 0) {
      toast({
        variant: 'destructive',
        title: 'Acesso temporariamente bloqueado',
        description: `Você excedeu o número máximo de tentativas. Tente novamente em ${lockoutTime} segundos.`,
      })
      return;

    }
    setLoading(true) //liga o loading para mostrar o spinner no botão
    
    if (!isLogin) {
      if (!name.trim()) {
        setNameError('Nome é obrigatório')
        setLoading(false)
        return
      }
      setNameError('')

      if (!document.trim() || !validateDocument(document)) {
        setDocumentError('Informe um CPF ou CNPJ válido')
        setLoading(false)
        return
      }
      setDocumentError('')

      if (!acceptedTerms) {
        setAcceptedTermsError('Você deve aceitar os Termos de Uso para continuar')
        setLoading(false)
        return
      }
      setAcceptedTermsError('')
    }
try{

  if (isLogin) {
    const { error, user: loggedUser } = await signIn(email, password)
    if (error) {
      const newAttemps = attemps + 1
      setAttemps(newAttemps)
      setLoginFailed(true)
      setNeedsVerification(error?.code === 'UNVERIFIED_EXPIRED')

      // Se exceder 5 tentativas, bloqueia por 60 segundos;
      if (newAttemps >= 5) {
        setLockoutTime(60)
        setAttemps(0) // Reset attempts after lockout
        setIsTimeBlocked(true)
        toast({
          variant: 'destructive',
          title: 'Muitas tentativas incorretas',
          description:
            'Você excedeu o número máximo de tentativas. Tente novamente em 60 segundos.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro de autenticação',
          description: error.message || 'Verifique suas credenciais e tente novamente.',
        })
      }
    } else {
      setAttemps(0) // Reset attempts on successful login
      setIsTimeBlocked(false);
      const record = loggedUser || pb.authStore.record
      if (record?.payment_status !== 'paid') {
        signOut()
        navigate('/restricted-access')
        return
      }
    }
  } else {
    const { error } = await signUp(name.trim(), email, password, document, phone || undefined)
    if (error) {
      const isEmailNotUnique =
        error?.data?.data?.email?.code === 'validation_not_unique' ||
        error?.data?.email?.code === 'validation_not_unique' ||
        error?.response?.data?.email?.code === 'validation_not_unique' ||
        error?.data?.email?.message?.toLowerCase().includes('unique') ||
        error?.data?.data?.email?.message?.toLowerCase().includes('unique')

      if (isEmailNotUnique) {
        toast({
          variant: 'destructive',
          title: 'E-mail já cadastrado',
          description:
            "Este e-mail já está cadastrado. Tente fazer login ou use 'Esqueci minha senha'.",
        })
      } else {
        // Extrair mensagem específica ou geral do backend
        const fieldData = error?.data?.data || error?.data || error?.response?.data
        let errorDescription = error?.message || 'Erro ao criar conta. Tente novamente.'

        if (fieldData && typeof fieldData === 'object') {
          const fieldErrors = Object.entries(fieldData)
            .map(([field, detail]: [string, any]) => {
              const msg = detail?.message || detail
              if (typeof msg === 'string') {
                const fieldLabel =
                  field === 'email'
                    ? 'E-mail'
                    : field === 'password'
                      ? 'Senha'
                      : field === 'document'
                        ? 'CPF/CNPJ'
                        : field === 'name'
                          ? 'Nome'
                          : field
                return `${fieldLabel}: ${msg}`
              }
              return null
            })
            .filter(Boolean)

          if (fieldErrors.length > 0) {
            errorDescription = fieldErrors.join('. ')
          }
        }

        toast({
          variant: 'destructive',
          title: 'Erro ao criar conta',
          description: errorDescription,
        })
      }
    } else {
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Enviamos um código de verificação para seu e-mail.',
      })
      navigate(`/auth/verify-code?email=${encodeURIComponent(email)}`)
      return
    }
  }
} catch (err) {
    console.error('Erro inesperado:', err)
} finally {
setLoading(false)
}
  }

  const handleResendVerification = async () => {
    if (!email) return
    setResendingVerification(true)
    try {
      await pb.send('/backend/v1/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
        headers: { 'Content-Type': 'application/json' },
      })
      toast({
        title: 'Código enviado!',
        description: 'Verifique sua caixa de entrada para o código de verificação.',
      })
      navigate(`/auth/verify-code?email=${encodeURIComponent(email.trim())}`)
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao reenviar',
        description: 'Não foi possível reenviar o código de verificação.',
      })
    } finally {
      setResendingVerification(false)
    }
  }

  const handleCheckSync = async () => {
    setCheckingSync(true)
    setSyncResult('')
    setSyncError(false)
    try {
      const result = await checkUserSync(email)
      if (result.synced && result.user) {
        const userName = result.user.name || ''
        const userStatus = result.user.payment_status || ''
        setSyncResult(`Usuário sincronizado: ${userName} – ${userStatus}`)
      } else {
        setSyncResult('Usuário não encontrado no sistema externo. Contate o suporte.')
        setSyncError(true)
      }
    } catch {
      setSyncResult('Erro ao conectar com o sistema. Tente novamente mais tarde.')
      setSyncError(true)
    }
    setCheckingSync(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-2">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Gestor Caminhoneiro</CardTitle>
          <CardDescription>Acesse sua conta para gerenciar seus fretes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="document">CPF ou CNPJ</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="document"
                    type="text"
                    required
                    value={document}
                    onChange={(e) => {
                      setDocument(formatDocument(e.target.value))
                      if (documentError) setDocumentError('')
                    }}
                    placeholder="000.000.000-00 ou A1.B2C.3D4/E5F6-01"
                    className={cn('pl-9', documentError && 'border-destructive')}
                  />
                </div>
                {documentError && <p className="text-sm text-destructive">{documentError}</p>}
              </div>
            )}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (nameError) setNameError('')
                    }}
                    placeholder="Seu nome completo"
                    className={cn('pl-9', nameError && 'border-destructive')}
                  />
                </div>
                {nameError && <p className="text-sm text-destructive">{nameError}</p>}
              </div>
            )}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="pl-9"
                    maxLength={15}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                {isLogin && (
                  <Link
                    to="/auth/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Esqueci minha senha
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
              />
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <div className="flex items-start gap-2 pt-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => {
                      setAcceptedTerms(Boolean(checked))
                      if (termsError) setAcceptedTermsError('')
                    }}
                    className="mt-0.5"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-xs text-muted-foreground cursor-pointer select-none"
                    >
                      Li e aceito os{' '}
                      <button
                        type="button"
                        className="text-primary hover:underline font-medium p-0 h-auto bg-transparent border-none"
                        onClick={(e) => {
                          e.preventDefault()
                          setTermsModalOpen(true)
                        }}
                      >
                        Termos de Uso
                      </button>
                    </label>
                  </div>
                </div>
                {termsError && <p className="text-xs text-destructive">{termsError}</p>}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={lockoutTime > 0 || loading}>
              {isTimeBlocked ? `Aguarde ${lockoutTime}s` : loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          {loginFailed && isLogin && (
            <div className="mt-4 space-y-3 animate-fade-in-up">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                <span>Falha na autenticação. Deseja verificar a sincronização?</span>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={checkingSync || !email}
                onClick={handleCheckSync}
              >
                {checkingSync ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar Sincronização'
                )}
              </Button>
              {syncResult && (
                <div
                  className={cn(
                    'flex items-start gap-2 text-sm p-3 rounded-lg animate-fade-in',
                    syncError ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
                  )}
                >
                  {syncError ? (
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  )}
                  <span>{syncResult}</span>
                </div>
              )}
            </div>
          )}

          {isLogin && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={resendingVerification || !email}
              onClick={handleResendVerification}
            >
              {resendingVerification ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <MailWarning className="w-4 h-4 mr-2" />
                  Reenviar e-mail de verificação
                </>
              )}
            </Button>
          )}

          {needsVerification && isLogin && (
            <div className="mt-4 flex items-start gap-2 text-sm p-3 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 animate-fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Sua conta expirou por falta de verificação. Reenvie o e-mail de verificação acima ou
                entre em contato com o suporte.
              </span>
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => {
                setIsLogin(!isLogin)
                setLoginFailed(false)
                setSyncResult('')
                setNameError('')
                setDocumentError('')
                setAcceptedTermsError('')
                setNeedsVerification(false)
                setPhone('')
              }}
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Terms of Use Modal */}
      <Dialog open={termsModalOpen} onOpenChange={setTermsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Termos de Uso - Gestor Caminhoneiro</DialogTitle>
            <DialogDescription>
              Leia atentamente os termos e condições de uso do software abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-sm text-muted-foreground my-2 border rounded-md p-4 bg-muted/20">
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                CLÁUSULA 1ª – DO OBJETO E SEU USO
              </h4>
              <p>
                A LICENCIANTE cede à LICENCIADA o licenciamento para utilização do software Gestor
                Caminhoneiro. A LICENCIADA se responsabiliza pelo hardware necessário para a correta
                execução do software ora licenciado e afirma ter avaliado o software e ter
                conhecimento de suas funcionalidades assim como eventuais limitações.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                CLÁUSULA 2ª – DA ATUALIZAÇÃO OU MANUTENÇÃO
              </h4>
              <p>
                O software poderá ser objeto de atualização corretiva, de otimização ou de
                melhorias. Caso a solicitação seja originada pela LICENCIADA em caráter de melhoria
                pontual que não esteja impedindo o correto funcionamento, poderá haver cobrança
                adicional previamente acordada; correções de falhas impeditivas não terão custo
                adicional.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">CLÁUSULA 3ª – DO PRAZO</h4>
              <p>
                A licença é por prazo indeterminado. Em caso de rescisão do contrato por qualquer
                uma das partes, a LICENCIADA pagará o valor correspondente ao tempo de licença
                efetivamente utilizado caso ainda pendente de pagamento.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">CLÁUSULA 4ª – DA RETRIBUIÇÃO</h4>
              <p>
                Pela licença cedida, a LICENCIADA pagará à LICENCIANTE a quantia acordada conforme o
                plano selecionado.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                CLÁUSULA 5ª – DA PROPRIEDADE INTELECTUAL
              </h4>
              <p>
                Todos os direitos de propriedade intelectual pertencem à LICENCIANTE e/ou seus
                fornecedores. Em caso de término ou rescisão deste Contrato, o uso do Software deve
                ser interrompido imediatamente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                CLÁUSULA 6ª – DAS OBRIGAÇÕES DA LICENCIANTE
              </h4>
              <p>
                Constituem obrigações da LICENCIANTE: I. Fornecer o software na forma e modo
                ajustados; II. Auxiliar a LICENCIADA na solução de quaisquer dúvidas existentes;
                III. Corrigir qualquer erro ou defeito relatado referente ao software.
              </p>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              onClick={() => {
                setAcceptedTerms(true)
                setAcceptedTermsError('')
                setTermsModalOpen(false)
              }}
            >
              Entendi e Aceito os Termos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
