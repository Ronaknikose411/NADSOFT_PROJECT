const Student = require('../models/Student');

// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const { name, email, age, parentId } = req.body;
    const student = await Student.create({ name, email, age, parentId });
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all students with pagination
exports.getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query; // Changed default limit to 5
    const offset = (page - 1) * limit;
    const { count, rows } = await Student.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']],
    });
    res.json({
      data: rows,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get a single student by parentId with marks
exports.getStudentByParentId = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { parentId: req.params.parentId },
      include: [{ model: require('../models/Mark'), attributes: ['subject', 'score'] }],
    });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const student = await Student.findOne({ where: { parentId: req.params.parentId } });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    await student.update({ name, email, age });
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a student
// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { parentId: req.params.parentId } });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    await student.destroy();
    res.status(200).json({ message: 'Student deleted successfully',student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

