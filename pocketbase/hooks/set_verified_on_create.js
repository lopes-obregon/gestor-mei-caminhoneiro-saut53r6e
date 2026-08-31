// Todo novo usuário já nasce verificado e com payment_status = "paid".
// Usa onRecordCreate (hook de banco) porque onRecordCreateRequest roda ANTES
// da validação do formulário e alterar "verified" ali dispara
// validation_values_mismatch (issue #6051 do PocketBase).
onRecordCreate((e) => {
  e.record.setVerified(true)
  e.record.set('payment_status', 'paid')
  //$app.save(e.record)
  e.record.next();// deixa o PocketBase persistir o registro normalmente
}, 'users')
