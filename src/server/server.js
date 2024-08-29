const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Serve styles from the "styles" directory
app.use('/styles', express.static(path.join(__dirname, 'styles')));

const port = 8000;

app.listen(port, () => {
    console.log(`Server running on localhost:${port}`);
});

app.get('/', (req, res) => {
    res.sendFile(path.resolve('dist/index.html'));
});

app.post('/addData', (req, res) => {
    const data = req.body;
    console.log('Data received:', data);
    res.send(data); // Send back the data to the client
});

app.get('/getData', (req, res) => {
    res.send({ msg: 'Hello from the server!' });
});
