migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!usersCol.fields.getByName('payment_status')) {
      usersCol.fields.add(
        new SelectField({
          name: 'payment_status',
          values: ['paid', 'pending', 'overdue'],
          maxSelect: 1,
        }),
      )
    }

    if (!usersCol.fields.getByName('external_id')) {
      usersCol.fields.add(new TextField({ name: 'external_id' }))
    }

    app.save(usersCol)

    const tripsCol = app.findCollectionByNameOrId('trips')
    tripsCol.listRule =
      '@request.auth.id != \'\' && user_id = @request.auth.id && @request.auth.payment_status = "paid"'
    tripsCol.viewRule =
      '@request.auth.id != \'\' && user_id = @request.auth.id && @request.auth.payment_status = "paid"'
    tripsCol.createRule = '@request.auth.id != \'\' && @request.auth.payment_status = "paid"'
    tripsCol.updateRule =
      '@request.auth.id != \'\' && user_id = @request.auth.id && @request.auth.payment_status = "paid"'
    tripsCol.deleteRule =
      '@request.auth.id != \'\' && user_id = @request.auth.id && @request.auth.payment_status = "paid"'
    app.save(tripsCol)

    const expensesCol = app.findCollectionByNameOrId('expenses')
    expensesCol.listRule =
      '@request.auth.id != \'\' && user_id = @request.auth.id && @request.auth.payment_status = "paid"'
    expensesCol.viewRule =
      '@request.auth.id != \'\' && user_id = @request.auth.id && @request.auth.payment_status = "paid"'
    expensesCol.createRule = '@request.auth.id != \'\' && @request.auth.payment_status = "paid"'
    expensesCol.updateRule =
      '@request.auth.id != \'\' && user_id = @request.auth.id && @request.auth.payment_status = "paid"'
    expensesCol.deleteRule =
      '@request.auth.id != \'\' && user_id = @request.auth.id && @request.auth.payment_status = "paid"'
    app.save(expensesCol)

    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'lopesobregonrenan@gmail.com')
      admin.set('payment_status', 'paid')
      app.save(admin)
    } catch (_) {}
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const psField = usersCol.fields.getByName('payment_status')
    if (psField) usersCol.fields.remove(psField)
    const eidField = usersCol.fields.getByName('external_id')
    if (eidField) usersCol.fields.remove(eidField)
    app.save(usersCol)

    const tripsCol = app.findCollectionByNameOrId('trips')
    tripsCol.listRule = "@request.auth.id != '' && user_id = @request.auth.id"
    tripsCol.viewRule = "@request.auth.id != '' && user_id = @request.auth.id"
    tripsCol.createRule = "@request.auth.id != ''"
    tripsCol.updateRule = "@request.auth.id != '' && user_id = @request.auth.id"
    tripsCol.deleteRule = "@request.auth.id != '' && user_id = @request.auth.id"
    app.save(tripsCol)

    const expensesCol = app.findCollectionByNameOrId('expenses')
    expensesCol.listRule = "@request.auth.id != '' && user_id = @request.auth.id"
    expensesCol.viewRule = "@request.auth.id != '' && user_id = @request.auth.id"
    expensesCol.createRule = "@request.auth.id != ''"
    expensesCol.updateRule = "@request.auth.id != '' && user_id = @request.auth.id"
    expensesCol.deleteRule = "@request.auth.id != '' && user_id = @request.auth.id"
    app.save(expensesCol)
  },
)
