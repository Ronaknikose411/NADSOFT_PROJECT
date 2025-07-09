import { useState } from 'react';

function StudentList({ students, onDelete, onUpdate }) {
  const [editStudent, setEditStudent] = useState(null);

  const handleEditChange = (e, field) => {
    setEditStudent({ ...editStudent, [field]: e.target.value });
  };

  const handleEditSubmit = () => {
    onUpdate(editStudent);
    setEditStudent(null);
  };

  if (!Array.isArray(students) || students.length === 0) {
    return (
      <div className="alert alert-info">
        No students available to display.
      </div>
    );
  }

  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>Parent ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Age</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student, index) => (
          <tr key={student.parentId || student.id || index}>
            {editStudent && editStudent.parentId === student.parentId ? (
              <>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={editStudent.parentId}
                    onChange={(e) => handleEditChange(e, 'parentId')}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={editStudent.name}
                    onChange={(e) => handleEditChange(e, 'name')}
                  />
                </td>
                <td>
                  <input
                    type="email"
                    className="form-control"
                    value={editStudent.email}
                    onChange={(e) => handleEditChange(e, 'email')}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={editStudent.age}
                    onChange={(e) => handleEditChange(e, 'age')}
                  />
                </td>
                <td>
                  <button className="btn btn-success me-2" onClick={handleEditSubmit}>
                    Save
                  </button>
                  <button className="btn btn-secondary" onClick={() => setEditStudent(null)}>
                    Cancel
                  </button>
                </td>
              </>
            ) : (
              <>
                <td>{student.parentId}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.age}</td>
                <td>
                  <button
                    className="btn btn-warning me-2"
                    onClick={() => setEditStudent(student)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => onDelete(student.parentId)}
                  >
                    Delete
                  </button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default StudentList;