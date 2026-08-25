migrate(
  (app) => {
    // 1. Atualizar regras de API de trips para exigir payment_status = "paid"
    const paidRule = '@request.auth.payment_status = "paid"'

    const tripsCol = app.findCollectionByNameOrId('trips')
    tripsCol.listRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    tripsCol.viewRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    tripsCol.createRule = "@request.auth.id != '' && " + paidRule
    tripsCol.updateRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    tripsCol.deleteRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    app.save(tripsCol)

    // 2. Atualizar regras de API de expenses para exigir payment_status = "paid"
    const expensesCol = app.findCollectionByNameOrId('expenses')
    expensesCol.listRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    expensesCol.viewRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    expensesCol.createRule = "@request.auth.id != '' && " + paidRule
    expensesCol.updateRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    expensesCol.deleteRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    app.save(expensesCol)

    // 3. Atualizar todos os usuários existentes para payment_status = "paid"
    app.db().newQuery("UPDATE users SET payment_status = 'paid'").execute()
  },
  (app) => {
    // Rollback para trial se necessário
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
