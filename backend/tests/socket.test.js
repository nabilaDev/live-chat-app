const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');

describe('Socket.io — real-time events', () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  // ✅ Test 1 — le serveur reçoit bien send_message
  it('should receive send_message event', (done) => {
    const payload = {
      id: '123',
      room: 'general',
      author: 'nabila',
      message: 'Hello!'
    };

    serverSocket.on('send_message', (data) => {
      expect(data.message).toBe('Hello!');
      expect(data.author).toBe('nabila');
      done();
    });

    clientSocket.emit('send_message', payload);
  });

  // ✅ Test 2 — typing indicator
  it('should receive typing event', (done) => {
    serverSocket.on('typing', (data) => {
      expect(data.username).toBe('nabila');
      expect(data.room).toBe('general');
      done();
    });

    clientSocket.emit('typing', { room: 'general', username: 'nabila' });
  });

  // ✅ Test 3 — join_room event
  it('should receive join_room event', (done) => {
    serverSocket.on('join_room', (data) => {
      expect(data.room).toBe('general');
      expect(data.username).toBe('nabila');
      done();
    });

    clientSocket.emit('join_room', { room: 'general', username: 'nabila' });
  });

});