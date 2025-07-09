const Mark = require('../models/Mark');
const Student = require('../models/Student');
const { Op } = require('sequelize');

const FIXED_SUBJECTS = ['Maths', 'Physics', 'Chemistry', 'English', 'Biology'];

exports.createMarks = async (req, res) => {
  try {
    const parentId = req.params.parentId;
    let { marks } = req.body;

    console.log('createMarks - Received parentId:', parentId, 'Payload:', JSON.stringify(req.body, null, 2));

    if (!parentId) return res.status(400).json({ error: 'Parent ID is required' });

    const student = await Student.findOne({ where: { parentId: parseInt(parentId) } });
    if (!student) {
      console.log(`Student not found for parentId: ${parentId}`);
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!marks) marks = req.body;
    if (!Array.isArray(marks)) marks = [marks];

    if (marks.length === 0 || marks.length > 5) {
      return res.status(400).json({ error: 'At least 1 and at most 5 marks are required for Maths, Physics, Chemistry, English, and Biology' });
    }

    const subjects = marks.map(mark => mark.subject.trim().toLowerCase());
    const invalidSubjects = subjects.filter(subject => !FIXED_SUBJECTS.map(s => s.toLowerCase()).includes(subject));
    if (invalidSubjects.length > 0) {
      return res.status(400).json({ error: `Invalid subjects: ${invalidSubjects.join(', ')}. Only Maths, Physics, Chemistry, English, and Biology are allowed` });
    }

    const uniqueSubjects = new Set(subjects);
    if (uniqueSubjects.size !== subjects.length) {
      return res.status(400).json({ error: 'Duplicate subjects are not allowed in the same request' });
    }

    const existingMarks = await Mark.findAll({
      where: { parentId: parseInt(parentId) },
      attributes: ['subject'],
    });
    const existingSubjects = existingMarks.map(mark => mark.subject.toLowerCase());
    const duplicateSubjects = subjects.filter(subject => existingSubjects.includes(subject));
    if (duplicateSubjects.length > 0) {
      return res.status(400).json({ error: `Marks already exist for subjects: ${duplicateSubjects.join(', ')}` });
    }

    for (const mark of marks) {
      if (typeof mark.score !== 'number' || mark.score < 0 || mark.score > 100) {
        return res.status(400).json({ error: `Score for ${mark.subject} must be between 0 and 100` });
      }
    }

    const markData = marks.map(mark => ({
      subject: mark.subject.trim(),
      score: parseInt(mark.score),
      parentId: parseInt(parentId),
    }));

    const createdMarks = await Mark.bulkCreate(markData, { returning: true, validate: true });
    console.log('Created marks:', JSON.stringify(createdMarks, null, 2));
    res.status(201).json({
      message: 'Marks created successfully',
      data: [
        { parentId: parseInt(parentId), name: student.name },
        ...createdMarks.map(mark => ({
          id: mark.id,
          subject: mark.subject,
          score: mark.score,
        })),
      ],
    });
  } catch (error) {
    console.error('createMarks error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: `Failed to create marks: ${error.message}` });
  }
};

exports.getMarksByParentId = async (req, res) => {
  try {
    const parentId = req.params.parentId;
    console.log('getMarksByParentId - Received parentId:', parentId);

    if (!parentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const marks = await Mark.findAll({
      where: { parentId: parseInt(parentId) },
      attributes: ['id', 'subject', 'score', 'parentId'],
    });

    if (!marks || marks.length === 0) {
      console.log(`No marks found for parentId: ${parentId}`);
      return res.status(404).json({ error: 'No marks found for this student' });
    }

    const student = await Student.findOne({ where: { parentId: parseInt(parentId) } });
    res.status(200).json({
      message: 'Marks retrieved successfully',
      data: [
        { parentId: parseInt(parentId), name: student?.name || 'N/A' },
        ...marks.map(mark => ({
          id: mark.id,
          subject: mark.subject,
          score: mark.score,
        })),
      ],
    });
  } catch (error) {
    console.error('getMarksByParentId error:', error);
    res.status(500).json({ error: `Failed to retrieve marks: ${error.message}` });
  }
};

exports.updateMarks = async (req, res) => {
  try {
    const parentId = req.params.parentId;
    const { marks } = req.body;
    console.log('updateMarks - Received parentId:', parentId, 'Payload:', JSON.stringify(req.body, null, 2));

    if (!parentId) return res.status(400).json({ error: 'Student ID is required' });
    const student = await Student.findOne({ where: { parentId: parseInt(parentId) } });
    if (!student) {
      console.log(`Student not found for parentId: ${parentId}`);
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!marks || !Array.isArray(marks) || marks.length === 0 || marks.length > 5) {
      return res.status(400).json({ error: 'At least 1 and at most 5 marks are required for Maths, Physics, Chemistry, English, and Biology' });
    }

    const subjects = marks.map(mark => mark.subject.trim().toLowerCase());
    const invalidSubjects = subjects.filter(subject => !FIXED_SUBJECTS.map(s => s.toLowerCase()).includes(subject));
    if (invalidSubjects.length > 0) {
      return res.status(400).json({ error: `Invalid subjects: ${invalidSubjects.join(', ')}. Only Maths, Physics, Chemistry, English, and Biology are allowed` });
    }

    const uniqueSubjects = new Set(subjects);
    if (uniqueSubjects.size !== subjects.length) {
      return res.status(400).json({ error: 'Duplicate subjects are not allowed in the same request' });
    }

    for (const mark of marks) {
      if (typeof mark.score !== 'number' || mark.score < 0 || mark.score > 100) {
        return res.status(400).json({ error: `Score for ${mark.subject} must be between 0 and 100` });
      }
    }

    await Mark.destroy({
      where: {
        parentId: parseInt(parentId),
        subject: marks.map(mark => mark.subject.trim()),
      },
    });

    const markData = marks.map(mark => ({
      subject: mark.subject.trim(),
      score: parseInt(mark.score),
      parentId: parseInt(parentId),
    }));

    const updatedMarks = await Mark.bulkCreate(markData, { returning: true, validate: true });
    console.log('Updated marks:', JSON.stringify(updatedMarks, null, 2));
    res.status(200).json({
      message: 'Marks updated successfully',
      data: [
        { parentId: parseInt(parentId), name: student.name },
        ...updatedMarks.map(mark => ({
          id: mark.id,
          subject: mark.subject,
          score: mark.score,
        })),
      ],
    });
  } catch (error) {
    console.error('updateMarks error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: `Failed to update marks: ${error.message}` });
  }
};

exports.deleteMarks = async (req, res) => {
  try {
    const parentId = req.params.parentId;
    console.log('deleteMarks - Received parentId:', parentId);

    if (!parentId) return res.status(400).json({ error: 'Student ID is required' });
    const student = await Student.findOne({ where: { parentId: parseInt(parentId) } });
    if (!student) {
      console.log(`Student not found for parentId: ${parentId}`);
      return res.status(404).json({ error: 'Student not found' });
    }

    const deletedCount = await Mark.destroy({ where: { parentId: parseInt(parentId) } });
    console.log(`Deleted ${deletedCount} marks for parentId: ${parentId}`);
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'No marks found for this student' });
    }

    res.status(200).json({
      message: `Successfully deleted ${deletedCount} mark(s)`,
    });
  } catch (error) {
    console.error('deleteMarks error:', error);
    res.status(500).json({ error: `Failed to delete marks: ${error.message}` });
  }
};

exports.getAllStudentsWithMarks = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * limit;

    // Count distinct parentIds
    const totalStudents = await Mark.count({
      distinct: true,
      col: 'parentId',
    });

    // Get distinct parentIds for the current page
    const parentIds = await Mark.findAll({
      attributes: ['parentId'],
      group: ['parentId'],
      order: [['parentId', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      raw: true,
    }).then(results => results.map(result => result.parentId));

    if (!parentIds || parentIds.length === 0) {
      console.log('No marks found for the requested page');
      return res.status(404).json({ error: 'No marks found' });
    }

    // Fetch marks for the selected parentIds
    const marks = await Mark.findAll({
      where: { parentId: { [Op.in]: parentIds } },
      include: [{ model: Student, attributes: ['name', 'parentId'], required: false }],
      attributes: ['subject', 'score', 'parentId'],
    });

    if (!marks || marks.length === 0) {
      console.log('No marks found for the selected parentIds');
      return res.status(404).json({ error: 'No marks found' });
    }

    // Group marks by parentId
    const groupedData = {};
    marks.forEach(mark => {
      const parentId = mark.parentId;
      if (!groupedData[parentId]) {
        groupedData[parentId] = {
          parentId,
          name: mark.Student?.name || 'N/A',
          marks: [],
        };
      }
      groupedData[parentId].marks.push({
        subject: mark.subject,
        score: mark.score,
      });
    });

    const data = Object.values(groupedData).map(group => ({
      parentId: group.parentId,
      name: group.name,
      marks: group.marks,
    }));

    res.status(200).json({
      message: 'All marks retrieved successfully',
      data,
      meta: {
        total: totalStudents,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalStudents / limit),
      },
    });
  } catch (error) {
    console.error('getAllStudentsWithMarks error:', error);
    res.status(500).json({ error: `Failed to retrieve marks: ${error.message}` });
  }
};