onRecordAfterCreateSuccess((e) => {
  const baseUrl = $secrets.get('API_VL_LOCUCOES')
  //const authToken = $secrets.get('API_VL_LOCUCOES_AUTH_TOKEN')
  console.log('baseUrl: ', baseUrl)

  return e.next()
}, 'users')
