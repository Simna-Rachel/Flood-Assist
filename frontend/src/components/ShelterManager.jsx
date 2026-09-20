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

  if (loading) return <div className="glass"><p className="muted">Loading shelters…</p></div>;

  return (
    <div className="glass">
      <h3 className="panel-title">Shelter Management</h3>

      {message && (
        <div className="note note-info" style={{ marginBottom: '1rem' }}>
          {message}
        </div>
      )}

      {conflict && (
        <div className="note note-error" style={{ display: 'block', marginBottom: '1rem' }}>
          <p><strong>Conflict:</strong> someone else already updated this shelter.</p>
          <p>Server now has: occupancy {conflict.serverRecord.currentOccupancy}, status {conflict.serverRecord.status}</p>
          <p>Your change was: occupancy {conflict.yourChange.currentOccupancy}, status {conflict.yourChange.status}</p>
          <div className="row-actions" style={{ marginTop: '0.75rem' }}>
            <button onClick={resolveKeepMine} className="btn btn-aqua btn-sm">Keep my change</button>
            <button onClick={resolveKeepTheirs} className="chip">Keep server's change</button>
          </div>
        </div>
      )}

      {shelters.length === 0 && <p className="muted">No shelters found.</p>}

      <div className="feed" style={{ gap: '0.75rem' }}>
        {shelters.map((shelter) => {
          const edit = editing[shelter._id];
          return (
            <div key={shelter._id} className="inset">
              <strong>{shelter.nameEn}</strong> — {shelter.district}
              <div className="muted small">
                Capacity: {shelter.capacity} · version: {shelter.version ?? 0}
              </div>

              {!edit ? (
                <div className="edit-row">
                  <span className="soft">Occupancy: {shelter.currentOccupancy} · Status: {shelter.status}</span>{' '}
                  <button className="chip" onClick={() => startEdit(shelter)}>Edit</button>
                </div>
              ) : (
                <div className="edit-row">
                  <input
                    type="number"
                    className="input"
                    value={edit.currentOccupancy}
                    onChange={(e) => handleFieldChange(shelter._id, 'currentOccupancy', e.target.value)}
                  />
                  <select
                    className="input"
                    value={edit.status}
                    onChange={(e) => handleFieldChange(shelter._id, 'status', e.target.value)}
                  >
                    <option value="open">open</option>
                    <option value="full">full</option>
                    <option value="closed">closed</option>
                  </select>
                  <button className="btn btn-aqua btn-sm" onClick={() => saveEdit(shelter)}>Save</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ShelterManager;
