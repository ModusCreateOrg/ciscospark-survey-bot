(function () {
  window.fetchJSON = (method, url, json) =>
    fetch(url, {
      method,
      credentials: 'include',
      body: json && JSON.stringify(json),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      if (!response.ok) throw new Error(response.statusText)
      return response.json()
    })

  $(document).on('click', '[link-href]', function () {
    window.location = $(this).attr('link-href')
  })
})()
