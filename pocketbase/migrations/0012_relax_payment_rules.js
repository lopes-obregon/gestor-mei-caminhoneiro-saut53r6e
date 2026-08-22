migrate(
  (app) => {
    // Permite acesso de usuários autenticados dentro do período de trial de 30 dias
    // (conta criada há menos de 30 dias) mesmo sem payment_status = "paid".
    // 30 dias = 2592000 segundos. strftime aplica o modificador SQLite "-30 days".
    // Usamos strftime nos dois lados com o mesmo formato para comparação cronológica
    // correta entre strings de data.
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
  (app) => {
    // Reverte para a regra anterior (somente paid).
    const paidRule = '@request.auth.payment_status = "paid"'

    const tripsCol = app.findCollectionByNameOrId('trips')
    tripsCol.listRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    tripsCol.viewRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    tripsCol.createRule = "@request.auth.id != '' && " + paidRule
    tripsCol.updateRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    tripsCol.deleteRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    app.save(tripsCol)

    const expensesCol = app.findCollectionByNameOrId('expenses')
    expensesCol.listRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    expensesCol.viewRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    expensesCol.createRule = "@request.auth.id != '' && " + paidRule
    expensesCol.updateRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    expensesCol.deleteRule = "@request.auth.id != '' && user_id = @request.auth.id && " + paidRule
    app.save(expensesCol)
  },
)
