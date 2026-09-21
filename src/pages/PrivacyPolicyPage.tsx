export default function PrivacyPolicyPage() {
  const metadata = {
    title: 'Política de Privacidade | VlsoluçõesIA',
    description: 'Política de Privacidade do Gestor Caminhoneiro.',
    companyName: 'VlsoluçõesIA',
    companyWebsite: '',
    ownerName: 'Renan',
    whatsappLink: 'https://wa.me/5567981538470',
  }
  //const companyName = "VlsoluçõesIA";
  const dynamic = 'force-dynamic'
  const updatedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeZone: 'America/Cuiaba',
  }).format(new Date())

  return (
    <div>
      <article className="legal-content">
        <p className="eyebrow">{metadata.companyName}</p>
        <h1>Política de Privacidade</h1>
        <p className="legal-updated">Última atualização: {updatedAt}</p>
        <p>
          Esta Política de Privacidade explica como a {metadata.companyName} trata dados pessoais no
          contexto do Gestor Caminhoneiro e de seus canais de atendimento e relacionamento
          comercial.
        </p>
        <h2>1. Dados que podemos tratar</h2>
        <p>
          Podemos tratar informações fornecidas por você em conversas, como nome, identificador do
          perfil, conteúdo de mensagens e dados necessários para atender sua solicitação. Também
          podemos usar informações públicas disponibilizadas no perfil profissional, como nome de
          usuário, biografia e localização informada no perfil.
        </p>
        <h2>2. Finalidades</h2>
        <p>
          Usamos esses dados para responder contatos, apresentar informações solicitadas sobre o
          Gestor Caminhoneiro, encaminhar interessados aos canais adequados e manter histórico de
          atendimento.
        </p>
        <h2>3. Mensagens e preferências</h2>
        <p>
          Se você pedir para não receber novas mensagens, registraremos essa preferência e não
          entraremos em contato novamente por essa automação. Você pode fazer esse pedido
          diretamente na conversa.
        </p>
        <h2>4. Armazenamento e segurança</h2>
        <p>
          Os registros operacionais são armazenados em ambiente controlado pela{' '}
          {metadata.companyName}, com acesso restrito ao necessário para operação, suporte e
          segurança. Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados
          contra acesso não autorizado, perda ou uso indevido.
        </p>
        <h2>5. Compartilhamento</h2>
        <p>
          Não vendemos dados pessoais. Podemos utilizar provedores técnicos necessários à operação
          dos canais de comunicação e infraestrutura, de acordo com as configurações e regras
          aplicáveis desses serviços.
        </p>
        <h2>6. Seus direitos e contato</h2>
        <p>
          Você pode solicitar esclarecimentos, acesso, correção ou eliminação de dados aplicáveis,
          bem como pedir o encerramento de contatos. Para isso, fale com {metadata.ownerName} pelo{' '}
          <a href={metadata.whatsappLink}>WhatsApp</a>.
        </p>
        <h2>7. Alterações desta política</h2>
        <p>
          Podemos atualizar esta Política de Privacidade quando necessário. A versão vigente estará
          sempre disponível nesta página.
        </p>
        <p className="legal-footer">
          <strong>{metadata.companyName}</strong>
          <br />
          <a href={metadata.companyWebsite}>{metadata.companyWebsite}</a>
        </p>
      </article>
    </div>
  )
}

/*
export default function PrivacyPolicyPage() {
  const business = getBusiness();
  
  return <main className="legal-page"><article className="legal-content">
    <a className="back-link" href="/">← Voltar à Central Comercial</a>
    <p className="eyebrow">{business.companyName}</p><h1>Política de Privacidade</h1><p className="legal-updated">Última atualização: {updatedAt}</p>
    <p>Esta Política de Privacidade explica como a {business.companyName} trata dados pessoais no contexto do Gestor Caminhoneiro e de seus canais de atendimento e relacionamento comercial.</p>
    <h2>1. Dados que podemos tratar</h2><p>Podemos tratar informações fornecidas por você em conversas, como nome, identificador do perfil, conteúdo de mensagens e dados necessários para atender sua solicitação. Também podemos usar informações públicas disponibilizadas no perfil profissional, como nome de usuário, biografia e localização informada no perfil.</p>
    <h2>2. Finalidades</h2><p>Usamos esses dados para responder contatos, apresentar informações solicitadas sobre o Gestor Caminhoneiro, encaminhar interessados aos canais adequados e manter histórico de atendimento.</p>
    <h2>3. Mensagens e preferências</h2><p>Se você pedir para não receber novas mensagens, registraremos essa preferência e não entraremos em contato novamente por essa automação. Você pode fazer esse pedido diretamente na conversa.</p>
    <h2>4. Armazenamento e segurança</h2><p>Os registros operacionais são armazenados em ambiente controlado pela {business.companyName}, com acesso restrito ao necessário para operação, suporte e segurança. Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados contra acesso não autorizado, perda ou uso indevido.</p>
    <h2>5. Compartilhamento</h2><p>Não vendemos dados pessoais. Podemos utilizar provedores técnicos necessários à operação dos canais de comunicação e infraestrutura, de acordo com as configurações e regras aplicáveis desses serviços.</p>
    <h2>6. Seus direitos e contato</h2><p>Você pode solicitar esclarecimentos, acesso, correção ou eliminação de dados aplicáveis, bem como pedir o encerramento de contatos. Para isso, fale com {business.ownerName} pelo <a href={business.whatsappLink}>WhatsApp</a>.</p>
    <h2>7. Alterações desta política</h2><p>Podemos atualizar esta Política de Privacidade quando necessário. A versão vigente estará sempre disponível nesta página.</p>
    <p className="legal-footer"><strong>{business.companyName}</strong><br /><a href={business.companyWebsite}>{business.companyWebsite}</a></p>
  </article></main>;
}
privacy.css*/
