import { useState, useEffect, useCallback} from 'react';
import { useParams, Link} from 'react-router-dom';
import apiClient from '../api/client';
import StatusBadge from '../components/StatusBadge';


export default function ApplicationDetail() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reviewer Decision State
  const [decisionMode, setDecisionMode] = useState(false);
  const [decision, setDecision] = useState('Approved');
  const [comment, setComment] = useState('');

  const fetchApplication = useCallback(() => {
    apiClient.get(`/applications/${id}`)
      .then(res => setApplication(res.data))
      .catch(() => setError("Failed to load application details."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  // --- State Transition Handlers ---
  
  const handleAction = async (endpoint, payload = null) => {
    setActionLoading(true);
    setError(null);
    try {
      if (payload) {
        await apiClient.post(`/applications/${id}/${endpoint}`, payload);
      } else {
        await apiClient.post(`/applications/${id}/${endpoint}`);
      }
      setDecisionMode(false); // Close decision form if it was open
      fetchApplication(); // Refresh the data to get the new status
    } catch (err) {
      setError(err.response?.data?.detail || "Action failed.");
      setActionLoading(false);
    }
  };

  const handleReviewDecision = (e) => {
    e.preventDefault();
    if ((decision === 'Rejected' || decision === 'Need More Information') && !comment.trim()) {
      setError(`A comment is required when deciding: ${decision}`);
      return;
    }
    handleAction('record-decision', { decision, comment });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  if (error && !application) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!application) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{application.tracking_number}</h2>
          <p className="text-sm text-gray-500 mt-1">Created on {new Date(application.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <StatusBadge status={application.status} />
        </div>
      </div>

      {/* Global Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Application Details */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Application Information</h3>
          
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Company Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{application.company_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Applicant</dt>
              <dd className="mt-1 text-sm text-gray-900">{application.applicant_name} ({application.applicant_email})</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Application Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{application.application_type}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{application.description}</dd>
            </div>
            
            {application.reviewer_comment && (
              <div className="sm:col-span-2 bg-gray-50 p-4 rounded-md border border-gray-200">
                <dt className="text-sm font-bold text-gray-700 mb-1">Reviewer Comment</dt>
                <dd className="text-sm text-gray-900">{application.reviewer_comment}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Right Column: Actions (The State Machine UI) */}
        <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Actions</h3>
          
          <div className="flex flex-col space-y-3">
            {/* 1. DRAFT OR NEED MORE INFO ACTIONS */}
            {(application.status === 'Draft' || application.status === 'Need More Information') && (
              <>
                <Link 
                  to={`/edit/${application.id}`}
                  className="w-full text-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition block"
                >
                  Edit Application
                </Link>
                <button 
                  onClick={() => handleAction('submit')}
                  disabled={actionLoading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {actionLoading ? 'Processing...' : 'Submit Application'}
                </button>
              </>
            )}

            {/* 2. SUBMITTED ACTIONS */}
            {application.status === 'Submitted' && (
              <button 
                onClick={() => handleAction('start-review')}
                disabled={actionLoading}
                className="w-full bg-yellow-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-600 disabled:opacity-50 transition"
              >
                {actionLoading ? 'Processing...' : 'Start Review'}
              </button>
            )}

            {/* 3. UNDER REVIEW ACTIONS */}
            {application.status === 'Under Review' && !decisionMode && (
              <button 
                onClick={() => setDecisionMode(true)}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
              >
                Record Decision
              </button>
            )}

            {/* 4. TERMINAL STATES */}
            {(application.status === 'Approved' || application.status === 'Rejected') && (
              <p className="text-sm text-gray-500 text-center italic">
                This application has reached a final state and cannot be modified.
              </p>
            )}

            {/* --- INLINE DECISION FORM --- */}
            {decisionMode && (
              <form onSubmit={handleReviewDecision} className="mt-4 border-t pt-4 border-gray-200">
                <div className="mb-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Decision</label>
                  <select 
                    value={decision} 
                    onChange={(e) => setDecision(e.target.value)}
                    className="w-full text-sm rounded-md border-gray-300 shadow-sm p-2 border"
                  >
                    <option value="Approved">Approve</option>
                    <option value="Need More Information">Need More Information</option>
                    <option value="Rejected">Reject</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Comment {(decision === 'Rejected' || decision === 'Need More Information') && <span className="text-red-500">*</span>}
                  </label>
                  <textarea 
                    rows={3} 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide feedback..."
                    className="w-full text-sm rounded-md border-gray-300 shadow-sm p-2 border"
                    required={decision === 'Rejected' || decision === 'Need More Information'}
                  />
                </div>

                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setDecisionMode(false)}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}