import { useState, useEffect } from 'react';
import axios from 'axios';

function MarkForm({ show, onClose, onSuccess, parentId }) {
  const [marks, setMarks] = useState([{ subject: '', score: '' }]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localParentId, setLocalParentId] = useState(parentId || '');

  useEffect(() => {
    setLocalParentId(parentId || '');
    setMarks([{ subject: '', score: '' }]);
    setError('');
  }, [parentId, show]);

  const handleMarkChange = (index, field, value) => {
    const updatedMarks = [...marks];
    updatedMarks[index] = { ...updatedMarks[index], [field]: value };
    setMarks(updatedMarks);
  };

  const addMarkField = () => {
    if (marks.length < 5) {
      setMarks([...marks, { subject: '', score: '' }]);
    }
  };

  const removeMarkField = (index) => {
    if (marks.length > 1) {
      setMarks(marks.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!localParentId) {
      setError('Parent ID is required.');
      setIsSubmitting(false);
      return;
    }

    const validMarks = marks.filter(mark => mark.subject && mark.score);
    if (validMarks.length === 0) {
      setError('At least one valid subject and score are required.');
      setIsSubmitting(false);
      return;
    }

    for (const mark of validMarks) {
      if (isNaN(Number(mark.score)) || Number(mark.score) < 0 || Number(mark.score) > 100) {
        setError(`Score for ${mark.subject} must be a number between 0 and 100.`);
        setIsSubmitting(false);
        return;
      }
    }

    const payload = { marks: validMarks.map(mark => ({ subject: mark.subject, score: Number(mark.score) })) };
    console.log('Submitting mark data:', { parentId: String(localParentId), payload: JSON.stringify(payload, null, 2) });

    try {
      await axios.get(`http://localhost:5656/api/students/view/${String(localParentId)}`);
      const response = await axios.post(`http://localhost:5656/api/students/mark/add/${String(localParentId)}`, payload);
      console.log('Add mark response:', JSON.stringify(response.data, null, 2));
      if (response.status === 201) {
        setMarks([{ subject: '', score: '' }]);
        setError('');
        setLocalParentId(parentId || '');
        onSuccess(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error adding mark:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.error || error.message;
      setError(`Error adding mark: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
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
              <h5 className="modal-title">Add Marks</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  onClose();
                  setError('');
                  setMarks([{ subject: '', score: '' }]);
                  setLocalParentId(parentId || '');
                }}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Parent ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={localParentId}
                    onChange={(e) => setLocalParentId(e.target.value)}
                    placeholder="Enter Parent ID"
                  />
                </div>
                {marks.map((mark, index) => (
                  <div key={index} className="mb-3">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Subject"
                        value={mark.subject}
                        onChange={(e) => handleMarkChange(index, 'subject', e.target.value)}
                      />
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Score"
                        value={mark.score}
                        onChange={(e) => handleMarkChange(index, 'score', e.target.value)}
                        min="0"
                        max="100"
                      />
                      {marks.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => removeMarkField(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {marks.length < 5 && (
                  <button
                    type="button"
                    className="btn btn-secondary mb-3"
                    onClick={addMarkField}
                  >
                    Add Another Mark
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Marks'}
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

export default MarkForm;