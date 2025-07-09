const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.post('/add', studentController.createStudent);
router.get('/viewall', studentController.getAllStudents);
router.get('/view/:parentId', studentController.getStudentByParentId);
router.put('/update/:parentId', studentController.updateStudent);
router.delete('/delete/:parentId', studentController.deleteStudent);

module.exports = router;