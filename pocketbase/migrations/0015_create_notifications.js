migrate(
  (app) => {
    const notifications = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: null,
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: null,
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'message',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['payment', 'system', 'alert'],
          maxSelect: 1,
        },
        {
          name: 'read',
          type: 'bool',
          required: false,
        },
        {
          name: 'payload',
          type: 'json',
          required: false,
        },
        {
          name: 'created',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: [
        'CREATE INDEX idx_notifications_user_read_created ON notifications (user_id, read, created DESC)',
      ],
    })
    app.save(notifications)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('notifications')
      app.delete(collection)
    } catch (_) {}
  },
)
