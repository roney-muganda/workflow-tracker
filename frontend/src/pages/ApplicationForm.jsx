import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';

export default function ApplicationForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // If there is an ID in the URL, we are in Edit mode
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_email: '',
    company_name: '',
    application_type: 'Recordation', // Default value
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);

  const applicationTypes = [
    'Recordation',
    'Renewal',
    'Change of Ownership',
    'Change of Name',
    'Discontinuation',
  ];

  // If in edit mode, fetch the existing application data
  useEffect(() => {
    if (isEditMode) {
      apiClient.get(`/applications/${id}`)
        .then((response) => {
          // Only Drafts and Need More Info can be edited based on our backend rules
          if (response.data.status !== 'Draft' && response.data.status !== 'Need More Information') {
            setError("Only Draft or 'Need More Information' applications can be edited.");
          } else {
            setFormData({
              applicant_name: response.data.applicant_name,
              applicant_email: response.data.applicant_email,
              company_name: response.data.company_name,
              application_type: response.data.application_type,
              description: response.data.description,
            });
          }
        })
        .catch(() => setError("Failed to load application data."))
        .finally(() => setFetching(false));
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        await apiClient.put(`/applications/${id}`, formData);
        navigate(`/${id}`); // Go back to details page
      } else {
        const response = await apiClient.post('/applications/', formData);
        navigate(`/${response.data.id}`); // Go to the new details page
      }
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center text-gray-500">Loading form...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Application' : 'New Application'}
        </h2>
        <Link to="/" className="text-sm text-blue-600 hover:underline">Cancel</Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Disable form if there is a blocking error (e.g., trying to edit an Approved app) */}
      <form onSubmit={handleSubmit} className={error && isEditMode ? 'opacity-50 pointer-events-none' : ''}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              name="company_name"
              required
              value={formData.company_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Applicant Name</label>
            <input
              type="text"
              name="applicant_name"
              required
              value={formData.applicant_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Applicant Email</label>
            <input
              type="email"
              name="applicant_email"
              required
              value={formData.applicant_email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Application Type</label>
            <select
              name="application_type"
              value={formData.application_type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
            >
              {applicationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="Provide details about your application..."
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-white font-medium rounded-md shadow-sm 
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Draft')}
          </button>
        </div>
      </form>
    </div>
  );
}