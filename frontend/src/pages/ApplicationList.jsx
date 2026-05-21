import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function ApplicationList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data when the component mounts
  useEffect(() => {
    apiClient.get('/applications/')
      .then((response) => {
        setApplications(response.data);
      })
      .catch((err) => {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications. Please make sure the backend is running.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 1. Handle Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg">Loading applications...</div>
      </div>
    );
  }

  // 2. Handle Error State
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // 3. Handle Empty State
  if (applications.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new application draft.</p>
        <div className="mt-6">
          <Link to="/new" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
            + New Application
          </Link>
        </div>
      </div>
    );
  }

  // 4. Render the Data Table
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Applications</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking #</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  <Link to={`/${app.id}`}>{app.tracking_number}</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{app.applicant_name}</div>
                  <div className="text-xs text-gray-500">{app.company_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {app.application_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/${app.id}`} className="text-gray-400 hover:text-gray-900">
                    View &rarr;
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}