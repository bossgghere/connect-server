// Import required modules
const express = require('express');
const cors = require('cors');

// Initialize the express application
const app = express();

// Use CORS middleware to allow requests from any origin
app.use(cors());

// Middleware to parse JSON bodies of incoming requests
app.use(express.json());

// Default route to test the server
app.get('/', (req, res) => {
    res.send('Express app is running!');
});

// An endpoint that receives a request and performs a task (e.g., logging)
app.post('/perform-task', (req, res) => {
    // Log the incoming request data
    console.log('Received data:', req.body);

    // Here, you can perform any task you want, e.g., call a service, process data, etc.
    // Example: Let's assume the task is just echoing back the received data.
    const result = {
        message: 'Task performed successfully!',
        receivedData: req.body
    };

    // Respond back with a success message and the received data
    res.status(200).json(result);
});

// Specify the port for the server to listen on
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});