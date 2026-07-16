migrate(
  (app) => {
    const trips = new Collection({
      name: 'trips',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'company', type: 'text', required: true },
        { name: 'origin', type: 'text', required: true },
        { name: 'destination', type: 'text', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'distance_km', type: 'number', required: true },
        { name: 'gross_value', type: 'number', required: true },
        { name: 'advance_value', type: 'number' },
        {
          name: 'advance_type',
          type: 'select',
          values: ['toll', 'fuel', 'cash', 'none'],
          maxSelect: 1,
        },
        { name: 'status', type: 'select', values: ['pending', 'completed'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(trips)

    const expenses = new Collection({
      name: 'expenses',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'trip_id', type: 'relation', collectionId: trips.id, maxSelect: 1 },
        {
          name: 'category',
          type: 'select',
          values: [
            'fuel',
            'toll',
            'food',
            'helper',
            'installment',
            'insurance',
            'tracker',
            'tax',
            'maintenance_parts',
            'maintenance_labor',
            'tires',
            'other',
          ],
          maxSelect: 1,
          required: true,
        },
        { name: 'amount', type: 'number', required: true },
        { name: 'description', type: 'text' },
        { name: 'date', type: 'date', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(expenses)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('expenses'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('trips'))
    } catch (e) {}
  },
)
