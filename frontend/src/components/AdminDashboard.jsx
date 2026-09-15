import React, { useEffect, useState } from 'react';
import API from '../api';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/admin/requests');
      setRequests(data.requests);
    } catch (err) {
      alert(err.response?.data?.message || 'Error fetching requests');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await API.patch(`/admin/requests/${id}`, { status });
      fetchRequests();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard - Volunteer & Candidate Requests</h2>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>User</th>
            <th>Type</th>
            <th>Details / Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req._id}>
              <td>{req.user?.name || req.name} ({req.user?.email || req.email})</td>
              <td>{req.type}</td>
              <td>{req.details}</td>
              <td><strong>{req.status}</strong></td>
              <td>
                <button onClick={() => handleStatus(req._id, 'Approved')}>Approve</button>
                <button onClick={() => handleStatus(req._id, 'Rejected')} style={{ marginLeft: '8px' }}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;