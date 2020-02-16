const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path'); 
const documents = {};
// setInterval(() => {
//     console.log(documents)
// }, 10000);
io.on('connection', socket => {
    let previousId;
    const safeJoin = currentId => {
        socket.leave(previousId);
        socket.join(currentId, () => console.log(`Socket ${socket.id} joined room ${currentId}`));
        previousId = currentId;
    }

    socket.on('getDoc', docId => {
        safeJoin(docId);
        socket.emit('document', documents[docId]);
    });

    socket.on('addDoc', doc => {
        documents[doc.id] = doc;
        safeJoin(doc.id);
        io.emit('documents', Object.keys(documents));
        socket.emit('document', doc);
    });

    socket.on('editDoc', doc => {
        documents[doc.id] = doc;
        socket.to(doc.id).emit('document', doc);
    });

    io.emit('documents', Object.keys(documents));

    console.log(`Socket ${socket.id} has connected`);
});
// app.use('/api', api);     // <- define api end point

// Catch all other routes and return the index file
app.get('*', function(req, res) {
   res.sendFile(path.join(__dirname, 'dist/socket-app/index.html'));
});

http.listen(4444, () => {
    console.log('Listening on port 4444');
});