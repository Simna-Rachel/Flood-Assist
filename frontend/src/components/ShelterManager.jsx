import { useEffect, useState } from 'react';
import { fetchShelters, updateShelterEntry } from '../lib/api';

// Lets volunteers/officials update a shelter's occupancy/status.
// This is the screen that actually exercises the offline queue +
// conflict-detection logic end to end.
function ShelterManager() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({}); // { [shelterId]: { currentOccupancy, status } }
  const [conflict, setConflict] = useState(null); // { shelterId, serverRecord, yourChange }
  const [message, setMessage] = useState('');

  const loadShelters = async () => {
    setLoading(true);
    try {
      const data = await fetchShelters();
      setShelters(data);
    } catch (err) {
      setMessage(err.message || 'Could not load shelters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, []);

  const startEdit = (shelter) => {
    setEditing((prev) => ({
      ...prev,
      [shelter._id]: {
        currentOccupancy: shelter.currentOccupancy,
        status: shelter.status
      }
    }));
  };

  const handleFieldChange = (shelterId, field, value) => {
    setEditing((prev) => ({
      ...prev,
      [shelterId]: { ...prev[shelterId], [field]: value }
    }));
  };

  const saveEdit = async (shelter) => {
    const edit = editing[shelter._id];
    setMessage('');
    try {
      const result = await updateShelterEntry({
        id: shelter._id,
        currentOccupancy: Number(edit.currentOccupancy),
        status: edit.status,
        baseVersion: shelter.version // the version this screen last saw
      });

      if (result.queued) {
        setMessage(`Saved offline — will sync for "${shelter.nameEn}" once you're back online.`);
      } else {
        setMessage(`"${shelter.nameEn}" updated.`);
        await loadShelters(); // refresh to show the new version
      }

      setEditing((prev) => {
        const next = { ...prev };
        delete next[shelter._id];
        return next;
      });
    } catch (err) {
      // 409 = someone else already changed this shelter since we loaded it
      if (err.status === 409 && err.body) {
        setConflict({
          shelterId: shelter._id,
          serverRecord: err.body.serverRecord,
          yourChange: edit
        });
      } else {
        setMessage(err.message || 'Update failed.');
      }
    }
  };

  const resolveKeepMine = async () => {
    const server = conflict.serverRecord;
    await updateShelterEntry({
      id: conflict.shelterId,
      currentOccupancy: Number(conflict.yourChange.currentOccupancy),
      status: conflict.yourChange.status,
      baseVersion: server.version // now matches the latest, so it goes through
    });
    setConflict(null);
    await loadShelters();
  };

  const resolveKeepTheirs = async () => {
    setConflict(null);
    await loadShelters(); // just drop our change, take what's on the server
  };

  if (loading) return <p>Loading shelters…</p>;

  return (
    <div style={{ maxWidth: '700px', margin: '1rem auto' }}>
      <h3>Shelter Management</h3>

      {message && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '8px', borderRadius: '6px', marginBottom: '1rem' }}>
          {message}
        </div>
      )}

      {conflict && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '12px', borderRadius: '6px', marginBottom: '1rem' }}>
          <p><strong>Conflict:</strong> someone else already updated this shelter.</p>
          <p>Server now has: occupancy {conflict.serverRecord.currentOccupancy}, status {conflict.serverRecord.status}</p>
          <p>Your change was: occupancy {conflict.yourChange.currentOccupancy}, status {conflict.yourChange.status}</p>
          <button onClick={resolveKeepMine} style={{ marginRight: '8px' }}>Keep my change</button>
          <button onClick={resolveKeepTheirs}>Keep server's change</button>
        </div>
      )}

      {shelters.length === 0 && <p>No shelters found.</p>}

      {shelters.map((shelter) => {
        const edit = editing[shelter._id];
        return (
          <div key={shelter._id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
            <strong>{shelter.nameEn}</strong> — {shelter.district}
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Capacity: {shelter.capacity} · version: {shelter.version ?? 0}
            </div>

            {!edit ? (
              <div style={{ marginTop: '8px' }}>
                <span>Occupancy: {shelter.currentOccupancy} · Status: {shelter.status}</span>{' '}
                <button onClick={() => startEdit(shelter)}>Edit</button>
              </div>
            ) : (
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  value={edit.currentOccupancy}
                  onChange={(e) => handleFieldChange(shelter._id, 'currentOccupancy', e.target.value)}
                  style={{ width: '80px' }}
                />
                <select
                  value={edit.status}
                  onChange={(e) => handleFieldChange(shelter._id, 'status', e.target.value)}
                >
                  <option value="open">open</option>
                  <option value="full">full</option>
                  <option value="closed">closed</option>
                </select>
                <button onClick={() => saveEdit(shelter)}>Save</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ShelterManager;