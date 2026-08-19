/// Adiciona o campo `phone` (texto, opcional) à coleção `users` — usado para
/// armazenar o WhatsApp do caminhoneiro no cadastro.
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!col.fields.getByName('phone')) {
      col.fields.add(
        new TextField({
          name: 'phone',
          required: false,
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    const field = col.fields.getByName('phone')
    if (field) {
      col.fields.remove(field)
      app.save(col)
    }
  },
)
