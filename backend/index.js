const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes'); // Ensure this is correct

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', taskRoutes); // This should correctly register your routes

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
