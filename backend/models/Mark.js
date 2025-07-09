const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Student = require('./Student');

const Mark = sequelize.define('Mark', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 0,
      max: 100,
    },
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Student,
      key: 'parentId', // Reference Student.parentId
    },
  },
}, {
  tableName: 'marks',
  timestamps: true,
});

Mark.belongsTo(Student, { foreignKey: 'parentId', targetKey: 'parentId' });
Student.hasMany(Mark, { foreignKey: 'parentId', sourceKey: 'parentId' });

module.exports = Mark;