onRecordBeforeCreate((e) => {
  const record = e.record
  if (!record) {
    return e.next()
  }

  record.set('verified', true)

  return e.next()
}, 'users')
