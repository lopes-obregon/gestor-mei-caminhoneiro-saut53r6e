migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let adminId
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'lopesobregonrenan@gmail.com')
      adminId = admin.id
    } catch (_) {
      const record = new Record(users)
      record.setEmail('lopesobregonrenan@gmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Renan Lopes')
      app.save(record)
      adminId = record.id
    }

    try {
      app.findFirstRecordByData('trips', 'company', 'TransLog S.A.')
      return
    } catch (_) {}

    const trips = app.findCollectionByNameOrId('trips')
    const tripRecord = new Record(trips)
    tripRecord.set('user_id', adminId)
    tripRecord.set('company', 'TransLog S.A.')
    tripRecord.set('origin', 'São Paulo/SP')
    tripRecord.set('destination', 'Curitiba/PR')
    tripRecord.set('date', new Date().toISOString())
    tripRecord.set('distance_km', 400)
    tripRecord.set('gross_value', 3500)
    tripRecord.set('advance_value', 500)
    tripRecord.set('advance_type', 'fuel')
    tripRecord.set('status', 'completed')
    app.save(tripRecord)

    const expenses = app.findCollectionByNameOrId('expenses')

    const exp1 = new Record(expenses)
    exp1.set('user_id', adminId)
    exp1.set('trip_id', tripRecord.id)
    exp1.set('category', 'fuel')
    exp1.set('amount', 1200)
    exp1.set('description', 'Abastecimento SP')
    exp1.set('date', new Date().toISOString())
    app.save(exp1)

    const exp2 = new Record(expenses)
    exp2.set('user_id', adminId)
    exp2.set('trip_id', tripRecord.id)
    exp2.set('category', 'toll')
    exp2.set('amount', 150)
    exp2.set('description', 'Pedágios Régis Bittencourt')
    exp2.set('date', new Date().toISOString())
    app.save(exp2)

    const exp3 = new Record(expenses)
    exp3.set('user_id', adminId)
    exp3.set('category', 'tax')
    exp3.set('amount', 76.6)
    exp3.set('description', 'DAS MEI Mensal')
    exp3.set('date', new Date().toISOString())
    app.save(exp3)
  },
  (app) => {
    try {
      app
        .db()
        .newQuery(
          "DELETE FROM expenses WHERE description IN ('Abastecimento SP', 'Pedágios Régis Bittencourt', 'DAS MEI Mensal')",
        )
        .execute()
      app.db().newQuery("DELETE FROM trips WHERE company = 'TransLog S.A.'").execute()
    } catch (_) {}
  },
)
