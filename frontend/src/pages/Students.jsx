import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import StudentList from '../components/StudentList.jsx';
import StudentForm from '../components/StudentForm.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';

function Students() {
  const [students, setStudents] = useState([]);
  const [searchParentId, setSearchParentId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStudents = useCallback(async (currentPage = page, currentLimit = limit) => {
    try {
      const response = await axios.get(`http://localhost:5656/api/students/viewall?page=${currentPage}&limit=${currentLimit}`);
      console.log('fetchStudents response:', JSON.stringify(response.data, null, 2));
      const { data, meta } = response.data;
      const studentData = Array.isArray(data) ? data : [];
      setStudents(studentData);
      setTotal(meta.total || 0);
      setTotalPages(meta.totalPages || 1);
      setPage(meta.page || 1);
      setLimit(meta.limit || 5);
      if (studentData.length === 0) {
        setMessage('No students found in the database.');
      } else {
        setMessage('');
      }
    } catch (error) {
      console.error('Error fetching students:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setMessage(`Error fetching students: ${error.response?.data?.error || error.message}`);
      setStudents([]);
      setTotal(0);
      setTotalPages(1);
      setTimeout(() => setMessage(''), 5000);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

 const handleSearch = async () => {
  if (!searchParentId) {
    fetchStudents(1, limit); // Reset to page 1 when clearing search
    setMessage('');
    return;
  }
  try {
    const response = await axios.get(`http://localhost:5656/api/students/view/${searchParentId}`);
    console.log('handleSearch response:', JSON.stringify(response.data, null, 2));
    const data = response.data ? [response.data] : []; // Wrap the student object in an array
    setStudents(data);
    setTotal(data.length);
    setTotalPages(1);
    setPage(1);
    if (data.length === 0) {
      setMessage(`No student found for Parent ID: ${searchParentId}`);
    } else {
      setMessage(`Found ${data.length} student(s) for Parent ID: ${searchParentId}`);
    }
  } catch (error) {
    console.error('Error searching student:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    setStudents([]);
    setTotal(0);
    setTotalPages(1);
    setMessage(`Error searching student: ${error.response?.data?.error || error.message}`);
    setTimeout(() => setMessage(''), 5000);
  }
};
  const handleDelete = (parentId) => {
    setSelectedStudent(parentId);
    setModalAction('delete');
    setShowModal(true);
  };

  const handleUpdate = (student) => {
    console.log('Preparing to update student:', JSON.stringify(student, null, 2));
    setSelectedStudent(student);
    setModalAction('update');
    setShowModal(true);
  };

  const confirmAction = async () => {
    try {
      if (modalAction === 'delete') {
        await axios.delete(`http://localhost:5656/api/students/delete/${selectedStudent}`);
        setMessage('Student deleted successfully');
      } else if (modalAction === 'update' && selectedStudent) {
        const payload = {
          name: selectedStudent.name,
          email: selectedStudent.email,
          age: Number(selectedStudent.age),
          parentId: selectedStudent.parentId,
        };
        console.log('Updating student with payload:', JSON.stringify(payload, null, 2));
        await axios.put(`http://localhost:5656/api/students/update/${selectedStudent.parentId}`, payload);
        setMessage('Student updated successfully');
      }
      fetchStudents(page, limit); // Refresh with current page and limit
      setShowModal(false);
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error performing action:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleAddSuccess = (newStudent) => {
    console.log('New student added:', JSON.stringify(newStudent, null, 2));
    setMessage('Student added successfully');
    fetchStudents(page, limit); // Refresh with current page and limit
    setShowAddModal(false);
    setTimeout(() => setMessage(''), 5000);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchStudents(newPage, limit);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    setPage(1); // Reset to page 1 when limit changes
    fetchStudents(1, newLimit);
  };

  const limitOptions = [5, 10, 15, 20]; // Multiples of 5

  return (
    <div className="container mt-4">
      <h2>Students</h2>
      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`} role="alert">
          {message}
        </div>
      )}
      <div className="d-flex justify-content-between mb-3">
        <div className="input-group w-50">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Parent ID"
            value={searchParentId}
            onChange={(e) => setSearchParentId(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            Search
          </button>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add Student
        </button>
      </div>
      <div className="mb-3">
        <label htmlFor="limitSelect" className="form-label">Students per page:</label>
        <select
          id="limitSelect"
          className="form-select w-auto d-inline-block ms-2"
          value={limit}
          onChange={handleLimitChange}
        >
          {limitOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <StudentList students={students} onDelete={handleDelete} onUpdate={handleUpdate} />
      {total > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            Showing {students.length} of {total} students
          </div>
          <nav>
            <ul className="pagination">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </button>
              </li>
              {[...Array(totalPages).keys()].map(i => (
                <li key={i + 1} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
      <StudentForm
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmAction}
        action={modalAction}
      />
    </div>
  );
}

export default Students;