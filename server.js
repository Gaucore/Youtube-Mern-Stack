const http = require('http');
const app = require('./app');
const mongoose = require('mongoose');

const server = http.createServer(app);
const port = process.env.PORT || 4000;

// Check MongoDB connection before starting the server
mongoose.connection.once('open', () => {
    console.log('MongoDB connection established successfully');

    // Start the server after MongoDB connection is established
    server.listen(port, () => {
        console.log("Server is running on port " + port);
    });
});

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});