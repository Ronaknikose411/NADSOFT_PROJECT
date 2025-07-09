import { useState } from 'react';
import axios from 'axios';

function StudentForm({ show, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, email, age: Number(age), parentId: Number(parentId) };
    console.log('Submitting student data:', payload);
    try {
      const response = await axios.post('http://localhost:5656/api/students/add', payload);
      console.log('Add student response:', response.data);
      setName('');
      setEmail('');
      setAge('');
      setParentId('');
      setError('');
      onSuccess(response.data);
      onClose(); // Close the modal after successful submission
    } catch (error) {
      console.error('Error adding student:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setError(`Error adding student: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <>
      <div
        className={`modal fade ${show ? 'show' : ''}`}
        style={{ display: show ? 'block' : 'none' }}
        tabIndex="-1"
        aria-hidden={!show}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Student</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  onClose();
                  setError('');
                }}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-control"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Parent ID</label>
                  <input
                    type="number"
                    className="form-control"
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)} // Fixed: Changed setName to setParentId
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Add Student
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show"></div>}
    </>
  );
}

export default StudentForm;