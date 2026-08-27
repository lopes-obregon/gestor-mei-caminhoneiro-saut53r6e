// Todo novo usuário já nasce verificado e com payment_status = "paid".
// O "mês grátis" passa a ser refletido diretamente como pagamento ativo,
// dispensando a janela de 30 dias baseada em strftime.
onRecordCreate((e) => {
  const record = e.record
  if (!record) {
    return e.next()
  }

  record.set('verified', true)
  record.set('payment_status', 'paid')

  return e.next()
}, 'users')
