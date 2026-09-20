import { useState, useEffect } from 'react';
import {
  PhoneCall,
  Building2,
  PlusCircle,
  Loader2,
  Lock
} from 'lucide-react';

import {
  fetchShelters,
  createShelterEntry,
  getCurrentPosition
} from '../lib/api';

const CAN_PUBLISH_ROLES = [
  'volunteer',
  'ward_member',
  'official',
  'admin'
];

function Helplines({ user }) {
  const [shelters, setShelters] = useState([]);
  const [loadingShelters, setLoadingShelters] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [newDistrict, setNewDistrict] = useState('');
  const [newCampName, setNewCampName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newCapacity, setNewCapacity] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const canPublish = CAN_PUBLISH_ROLES.includes(user?.role);

  const loadShelters = async () => {
    setLoadingShelters(true);
    setLoadError('');

    try {
      const data = await fetchShelters();
      setShelters(data || []);
    } catch (err) {
      setLoadError(err.message || 'Could not load shelters.');
    } finally {
      setLoadingShelters(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, []);

  const handleAddShelter = async (e) => {
    e.preventDefault();

    if (
      !newDistrict ||
      !newCampName ||
      !newContact ||
      !newCapacity
    ) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const { lat, lng } = await getCurrentPosition();

      const created = await createShelterEntry({
        nameEn: newCampName,
        district: newDistrict,
        lat,
        lng,
        capacity: newCapacity,
        contactPhone: newContact
      });

      setShelters([
        created.data,
        ...shelters
      ]);

      setNewDistrict('');
      setNewCampName('');
      setNewContact('');
      setNewCapacity('');

    } catch (err) {
      setSubmitError(
        err.message || 'Could not publish shelter.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stack">

      {/* Emergency Control Rooms */}
      <div className="glass">

        <h3 className="panel-title">
          <PhoneCall size={20} />
          Emergency Control Rooms
        </h3>

        <ul className="grid-2">
          <li className="inset">
            <strong>State Emergency:</strong> 1070
          </li>

          <li className="inset">
            <strong>District Control Room:</strong> 1077
          </li>

          <li className="inset">
            <strong>Police Emergency:</strong> 112
          </li>

          <li className="inset">
            <strong>Fire & Rescue:</strong> 101
          </li>
        </ul>

      </div>

      {/* Add Shelter Form */}
      <div className="glass">

        <h3 className="panel-title">
          <PlusCircle size={20} />
          Add Active Relief Shelter
        </h3>

        {canPublish ? (

          <form onSubmit={handleAddShelter} className="form">

            {/* District */}
            <input
              type="text"
              placeholder="District / Area (e.g. Ernakulam)"
              value={newDistrict}
              onChange={(e) => setNewDistrict(e.target.value)}
              className="input"
              required
            />

            {/* Camp Name */}
            <input
              type="text"
              placeholder="Camp Name (e.g. Town Hall Relief Camp)"
              value={newCampName}
              onChange={(e) => setNewCampName(e.target.value)}
              className="input"
              required
            />

            {/* Capacity */}
            <input
              type="number"
              min="1"
              placeholder="Capacity (number of people)"
              value={newCapacity}
              onChange={(e) => setNewCapacity(e.target.value)}
              className="input"
              required
            />

            {/* Contact */}
            <input
              type="text"
              placeholder="Camp Helpline / Contact Number"
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              className="input"
              required
            />

            {/* Error */}
            {submitError && (
              <div className="note note-error">
                {submitError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-aqua btn-block"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Publishing...
                </>
              ) : (
                'Publish Camp Details'
              )}
            </button>

          </form>

        ) : (

          <div className="note note-muted">
            <Lock size={16} />
            <span>
              Only Volunteers, Ward Members, and Officials
              can publish shelters. Ask your Ward Member
              to add one, or request a Volunteer role in
              Settings.
            </span>
          </div>

        )}

      </div>

      {/* Active Relief Camps */}
      <div className="glass">

        <h3 className="panel-title">
          <Building2 size={20} />
          Active Relief Camps Directory
        </h3>

        {loadingShelters && (
          <p className="muted">
            Loading shelters...
          </p>
        )}

        {loadError && (
          <div className="note note-error">
            {loadError}
          </div>
        )}

        {!loadingShelters &&
          shelters.length === 0 &&
          !loadError && (
            <p className="muted">
              No shelters published yet.
            </p>
          )}

        <div className="shelter-grid">
          {shelters.map((camp) => (
            <div key={camp._id} className="inset">

              <span className="badge">
                {camp.district}
              </span>

              <h4 className="camp-name">
                {camp.nameEn}
              </h4>

              <p className="camp-info">
                📞 {camp.contactPhone}
              </p>

              <p className="camp-info">
                👥 Capacity: {camp.capacity}
                {' '}
                ({camp.currentOccupancy || 0} occupied)
              </p>

              <small className="posted-by">
                Posted by: {camp.addedBy?.name || 'Unknown'}
                {' '}
                (
                {(camp.addedBy?.role || '')
                  .replace('_', ' ')}
                )
              </small>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

export default Helplines;
