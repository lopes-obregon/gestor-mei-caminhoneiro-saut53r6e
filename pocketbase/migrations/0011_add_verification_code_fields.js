migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!col.fields.getByName('verification_code')) {
      col.fields.add(
        new TextField({
          name: 'verification_code',
          required: false,
        }),
      )
    }

    if (!col.fields.getByName('verification_code_expires')) {
      col.fields.add(
        new NumberField({
          name: 'verification_code_expires',
          required: false,
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    const fieldCode = col.fields.getByName('verification_code')
    if (fieldCode) {
      col.fields.remove(fieldCode)
    }
    const fieldExpires = col.fields.getByName('verification_code_expires')
    if (fieldExpires) {
      col.fields.remove(fieldExpires)
    }
    app.save(col)
  },
)
