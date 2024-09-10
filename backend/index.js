const express = require('express');
const cors = require('cors');
const boardRoutes = require('./routes/boardRoutes');
const taskRoutes = require('./routes/taskRoutes'); // if you have this

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Register the board routes under /api
app.use('/api', boardRoutes);
app.use('/api', taskRoutes);  // if you have this

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
