/* eslint-env browser */
/* global $ */

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

  $(document).on('click', 'a[data-delete]', function (event) {
    event.preventDefault()

    const $el = $(this)
    const href = $el.attr('href')
    const $target = $($el.data('delete'))

    if (confirm('Are you sure?')) {
      $target.css({ pointerEvents: 'none' }) // setting the `disabled` attr doesn't work
      fetchJSON('DELETE', href).then(() => {
        $target.slideUp()
      })
    }
  })
})()
