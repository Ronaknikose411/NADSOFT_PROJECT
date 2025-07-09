const express = require('express');
const router = express.Router();
const markController = require('../controllers/markController');

router.post('/add/:parentId', markController.createMarks);
router.get('/view/:parentId', markController.getMarksByParentId);
router.put('/update/:parentId', markController.updateMarks);
router.delete('/delete/:parentId', markController.deleteMarks);
router.get('/viewallwithmarks', markController.getAllStudentsWithMarks);

module.exports = router;