/// O "mês grátis" deixa de ser uma janela de 30 dias calculada por strftime
/// e passa a ser refletido diretamente como payment_status = "paid".
/// 1) Marca TODOS os usuários existentes como "paid".
/// 2) Simplifica as apiRules de trips e expenses: apenas auth + payment_status = "paid".
migrate(
  (app) => {
    // 1. Atualiza todos os usuários que ainda não estão como "paid".
    app
      .db()
      .newQuery(
        "UPDATE users SET payment_status = 'paid' WHERE payment_status IS NULL OR payment_status != 'paid'",
      )
      .execute()

    // 2. Simplifica as apiRules de trips e expenses (remove a janela de 30 dias).
    const ownerPaid =
      '@request.auth.id != \'\' && user_id = @request.auth.id && @request.auth.payment_status = "paid"'
    const authPaid = '@request.auth.id != \'\' && @request.auth.payment_status = "paid"'

    const tripsCol = app.findCollectionByNameOrId('trips')
    tripsCol.listRule = ownerPaid
    tripsCol.viewRule = ownerPaid
    tripsCol.createRule = authPaid
    tripsCol.updateRule = ownerPaid
    tripsCol.deleteRule = ownerPaid
    app.save(tripsCol)

    const expensesCol = app.findCollectionByNameOrId('expenses')
    expensesCol.listRule = ownerPaid
    expensesCol.viewRule = ownerPaid
    expensesCol.createRule = authPaid
    expensesCol.updateRule = ownerPaid
    expensesCol.deleteRule = ownerPaid
    app.save(expensesCol)
  },
  (app) => {
    // Restaura as regras anteriores (com janela de 30 dias) da migration 0012.
    const trialOrPaid =
      "(@request.auth.payment_status = \"paid\" || strftime('%Y-%m-%d %H:%M:%S', @request.auth.created) > strftime('%Y-%m-%d %H:%M:%S', 'now', '-30 days'))"

    const tripsCol = app.findCollectionByNameOrId('trips')
    tripsCol.listRule = "@request.auth.id != '' && user_id = @request.auth.id && " + trialOrPaid
    tripsCol.viewRule = "@request.auth.id != '' && user_id = @request.auth.id && " + trialOrPaid
    tripsCol.createRule = "@request.auth.id != '' && " + trialOrPaid
    tripsCol.updateRule = "@request.auth.id != '' && user_id = @request.auth.id && " + trialOrPaid
    tripsCol.deleteRule = "@request.auth.id != '' && user_id = @request.auth.id && " + trialOrPaid
    app.save(tripsCol)

    const expensesCol = app.findCollectionByNameOrId('expenses')
    expensesCol.listRule = "@request.auth.id != '' && user_id = @request.auth.id && " + trialOrPaid
    expensesCol.viewRule = "@request.auth.id != '' && user_id = @request.auth.id && " + trialOrPaid
    expensesCol.createRule = "@request.auth.id != '' && " + trialOrPaid
    expensesCol.updateRule =
      "@request.auth.id != '' && user_id = @request.auth.id && " + trialOrPaid
    expensesCol.deleteRule =
      "@request.auth.id != '' && user_id = @request.auth.id && " + trialOrPaid
    app.save(expensesCol)
  },
)
