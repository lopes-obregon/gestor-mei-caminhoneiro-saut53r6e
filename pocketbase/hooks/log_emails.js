// Hook to log email sending attempts and any errors
onRecordAfterCreateSuccess((e) => {
  const record = e.record
  console.log('[email_logger] New user created:', record.id, record.getEmail())
}, 'users')
