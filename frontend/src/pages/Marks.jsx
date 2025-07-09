import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MarkList from '../components/MarkList.jsx';
import MarkForm from '../components/MarkForm.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';

function Marks() {
  const [marks, setMarks] = useState([]);
  const [searchParentId, setSearchParentId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedMark, setSelectedMark] = useState(null);
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addParentId, setAddParentId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMarks = useCallback(async (currentPage = page, currentLimit = limit) => {
    try {
      const response = await axios.get(`http://localhost:5656/api/students/mark/viewallwithmarks?page=${currentPage}&limit=${currentLimit}`);
      console.log('fetchMarks response:', JSON.stringify(response.data, null, 2));
      const { data, meta } = response.data;
      const markData = Array.isArray(data) ? data : [];
      setMarks(markData);
      setTotal(meta.total || 0);
      setTotalPages(meta.totalPages || 1);
      setPage(meta.page || 1);
      setLimit(meta.limit || 5);
      if (markData.length === 0) {
        setMessage('No marks found in the database.');
      } else {
        setMessage('');
      }
    } catch (error) {
      console.error('Error fetching marks:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setMessage(`Error retrieving marks: ${error.response?.data?.error || error.message}`);
      setMarks([]);
      setTotal(0);
      setTotalPages(1);
      setTimeout(() => setMessage(''), 5000);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchMarks();
  }, [fetchMarks]);

  const handleSearch = async () => {
    if (!searchParentId) {
      fetchMarks(1, limit); // Reset to page 1 when clearing search
      setMessage('');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5656/api/students/mark/view/${searchParentId}`);
      console.log('handleSearch response:', JSON.stringify(response.data, null, 2));
      const data = response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0
        ? [{
            parentId: parseInt(searchParentId),
            name: response.data.data[0].name || 'N/A',
            marks: response.data.data.slice(1).map(mark => ({
              subject: mark.subject,
              score: mark.score,
            })),
          }]
        : [];
      setMarks(data);
      setTotal(data.length);
      setTotalPages(1);
      setPage(1);
      if (data.length === 0) {
        setMessage(`No marks found for Parent ID: ${searchParentId}`);
      } else {
        setMessage(`Found marks for Parent ID: ${searchParentId}`);
      }
    } catch (error) {
      console.error('Error searching marks:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setMessage(`Error searching marks: ${error.response?.data?.error || error.message}`);
      setMarks([]);
      setTotal(0);
      setTotalPages(1);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDelete = (parentId) => {
    setSelectedMark(parentId);
    setModalAction('delete');
    setShowModal(true);
  };

  const handleUpdate = (mark) => {
    console.log('Preparing to update mark:', JSON.stringify(mark, null, 2));
    setSelectedMark(mark);
    setModalAction('update');
    setShowModal(true);
  };

  const confirmAction = async () => {
    try {
      if (modalAction === 'delete') {
        await axios.delete(`http://localhost:5656/api/students/mark/delete/${selectedMark}`);
        setMessage('Marks deleted successfully!');
      } else if (modalAction === 'update' && selectedMark) {
        const payload = {
          marks: selectedMark.marks.filter(
            mark => mark.subject && !isNaN(Number(mark.score)) && mark.score >= 0 && mark.score <= 100
          ),
        };
        if (payload.marks.length === 0) {
          setMessage('Error: At least one valid mark is required.');
          setTimeout(() => setMessage(''), 5000);
          return;
        }
        console.log('Updating marks with payload:', JSON.stringify(payload, null, 2));
        await axios.put(`http://localhost:5656/api/students/mark/update/${selectedMark.parentId}`, payload);
        setMessage('Marks updated successfully!');
      }
      fetchMarks(page, limit);
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

  const handleAddSuccess = (newMark) => {
    console.log('New mark added:', JSON.stringify(newMark, null, 2));
    setMessage('Marks added successfully!');
    fetchMarks(page, limit);
    setShowAddModal(false);
    setAddParentId('');
    setTimeout(() => setMessage(''), 5000);
  };

 

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchMarks(newPage, limit);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    setPage(1);
    fetchMarks(1, newLimit);
  };

  const limitOptions = [5, 10, 15, 20];

  return (
    <div className="container mt-4">
      <h2>Marks Management</h2>
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
          onClick={() => {
            setAddParentId('');
            setShowAddModal(true);
          }}
        >
          Add Marks
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
      <MarkList
        marks={marks}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
      {total > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            Showing {marks.length} of {total} students
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
      <MarkForm
        show={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddParentId('');
        }}
        onSuccess={handleAddSuccess}
        parentId={addParentId}
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

export default Marks;