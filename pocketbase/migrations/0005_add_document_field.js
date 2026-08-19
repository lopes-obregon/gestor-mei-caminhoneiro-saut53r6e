migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!col.fields.getByName('document')) {
      col.fields.add(
        new TextField({
          name: 'document',
          required: false,
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    const field = col.fields.getByName('document')
    if (field) {
      col.fields.remove(field)
      app.save(col)
    }
  },
)
