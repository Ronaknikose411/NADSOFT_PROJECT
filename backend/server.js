const express = require('express');
const sequelize = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const markRoutes = require('./routes/markRoutes');
const cors = require('cors'); // Add cors package
require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// Make Sequelize instance available to controllers
app.set('sequelize', sequelize);


app.use('/api/students', studentRoutes);
app.use('/api/students/mark', markRoutes);
// Sync database and start server
const PORT = process.env.PORT || 5656;
sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error('Unable to connect to the database:', err));