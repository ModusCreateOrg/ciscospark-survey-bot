const userId = 'someId'

socket = io('/')
socket.on('connect', () => socket.emit('join', userId))
socket.on('survey updated', (data) => console.log('SHOULD get this', data))
