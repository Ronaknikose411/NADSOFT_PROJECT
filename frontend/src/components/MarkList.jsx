import { useState } from 'react';

function MarkList({ marks, onDelete, onUpdate }) {
  const [editMark, setEditMark] = useState(null);

  // Transform marks array into an object for easier column rendering
  const transformMarks = (marksArray) => {
    const markObj = { Biology: '-', English: '-', Chemistry: '-', Physics: '-', Maths: '-' };
    marksArray.forEach(mark => {
      if (mark.subject && mark.score !== undefined) {
        markObj[mark.subject] = mark.score;
      }
    });
    return markObj;
  };

  const handleEditChange = (e, subject) => {
    const score = e.target.value;
    // Only update if score is a valid number or empty (to allow clearing)
    if (score === '' || (!isNaN(Number(score)) && Number(score) >= 0 && Number(score) <= 100)) {
      const updatedMarks = editMark.marks.filter(mark => mark.subject !== subject);
      if (score !== '') {
        updatedMarks.push({ subject, score: Number(score) });
      }
      setEditMark({ ...editMark, marks: updatedMarks });
    }
  };

  const handleEditSubmit = () => {
    // Filter valid marks (non-empty subject and valid score)
    const validMarks = editMark.marks.filter(
      mark => mark.subject && !isNaN(Number(mark.score)) && mark.score >= 0 && mark.score <= 100
    );
    if (validMarks.length === 0) {
      alert('At least one valid mark (subject and score) is required.');
      return;
    }
    onUpdate({ ...editMark, marks: validMarks });
    setEditMark(null);
  };

  if (!Array.isArray(marks) || marks.length === 0) {
    return (
      <div className="alert alert-info">
        No marks available to display.
      </div>
    );
  }

  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>Parent ID</th>
          <th>Name</th>
          <th>Biology</th>
          <th>English</th>
          <th>Chemistry</th>
          <th>Physics</th>
          <th>Maths</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {marks.map((student) => {
          const markObj = transformMarks(student.marks);
          return (
            <tr key={student.parentId}>
              {editMark && editMark.parentId === student.parentId ? (
                <>
                  <td>{student.parentId}</td>
                  <td>{student.name}</td>
                  {['Biology', 'English', 'Chemistry', 'Physics', 'Maths'].map(subject => (
                    <td key={subject}>
                      <input
                        type="number"
                        className="form-control"
                        placeholder={subject}
                        value={
                          editMark.marks.find(mark => mark.subject === subject)?.score || ''
                        }
                        onChange={(e) => handleEditChange(e, subject)}
                        min="0"
                        max="100"
                      />
                    </td>
                  ))}
                  <td>
                    <button className="btn btn-success me-2" onClick={handleEditSubmit}>
                      Save
                    </button>
                    <button
                      className="btn btn-secondary me-2"
                      onClick={() => setEditMark(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => onDelete(student.parentId)}
                    >
                      Delete
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{student.parentId}</td>
                  <td>{student.name}</td>
                  <td>{markObj.Biology}</td>
                  <td>{markObj.English}</td>
                  <td>{markObj.Chemistry}</td>
                  <td>{markObj.Physics}</td>
                  <td>{markObj.Maths}</td>
                  <td>
                    <button
                      className="btn btn-warning me-2"
                      onClick={() => setEditMark(student)}
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
          );
        })}
      </tbody>
    </table>
  );
}

export default MarkList;