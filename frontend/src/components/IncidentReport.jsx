import { useState, useEffect } from 'react';
import { Upload, MapPin, ThumbsUp, Flag, Loader2, X } from 'lucide-react';
import { fetchHazards, createHazardReport, getCurrentPosition, SERVER_ORIGIN } from '../lib/api';

const HAZARD_TYPES = ['Flooding', 'Waterlogging', 'Landslide Risk', 'Road Blocked', 'Power Outage', 'Other'];

function IncidentReport() {
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [hazardType, setHazardType] = useState(HAZARD_TYPES[0]);
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const loadReports = async () => {
    setLoadingReports(true);
    setLoadError('');
    try {
      const data = await fetchHazards();
      setReports(data);
    } catch (err) {
      setLoadError(err.message || 'Could not load reports.');
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => { loadReports(); }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setSelectedImage(null);
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    if (!newDesc || !newLocation) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      // Get current location coordinates safely
      let coords = { lat: null, lng: null };
      try {
        coords = await getCurrentPosition();
      } catch (locationErr) {
        console.warn('Geolocation warning/fallback:', locationErr);
      }

      // Sends FormData through createHazardReport (handles Cloudinary file upload on server)
      const created = await createHazardReport({
        hazardType,
        description: newDesc,
        locationLabel: newLocation,
        latitude: coords.lat,
        longitude: coords.lng
      }, selectedFile);

      setReports([created, ...reports]);
      setNewDesc('');
      setNewLocation('');
      setSelectedImage(null);
      setSelectedFile(null);
    } catch (err) {
      setSubmitError(err.message || 'Could not submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = (id) => {
    setReports(reports.map(rep => {
      if (rep._id !== id) return rep;
      
      const isVerified = !rep._isVerified;
      const currentCount = rep._localVerifications || 0;
      
      return {
        ...rep,
        _isVerified: isVerified,
        _localVerifications: isVerified ? currentCount + 1 : Math.max(0, currentCount - 1)
      };
    }));
  };

  // Helper function: Handles Cloudinary direct URLs seamlessly vs Local fallback paths
  const getImageUrl = (imgPath) => {
    if (!imgPath) return '';
    return imgPath.startsWith('http') ? imgPath : `${SERVER_ORIGIN}${imgPath}`;
  };

  return (
    <div className="glass">
      <h3 className="panel-title">
        <Upload size={20} /> Upload Ground Incident
      </h3>

      <form className="form" onSubmit={handleAddReport}>
        <div className="field">
          <select value={hazardType} onChange={(e) => setHazardType(e.target.value)}>
            {HAZARD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Exact Landmark / District Location"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          className="input"
          required
        />
        <textarea
          placeholder="Describe ground conditions (water level, road status)..."
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          className="input"
          required
        />
        <div>
          <label className="label" style={{ display: 'block', margin: '0 0 0.5rem' }}>
            Upload Photo (Optional):
          </label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="input" />
          {selectedImage && (
            <div className="preview">
              <img
                src={selectedImage}
                alt="Preview"
                className="photo"
                style={{ maxHeight: '180px' }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="btn btn-alert remove-img"
                title="Remove photo"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {submitError && <div className="note note-error">{submitError}</div>}

        <button type="submit" className="btn btn-alert btn-block" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Uploading & Submitting...
            </>
          ) : 'Submit Alert'}
        </button>
      </form>

      <h4 className="subhead">Live Community Feed</h4>

      {loadingReports && <p className="muted">Loading reports...</p>}
      {loadError && <div className="note note-error">{loadError}</div>}
      {!loadingReports && reports.length === 0 && !loadError && (
        <p className="muted">No active reports yet — be the first to report ground conditions.</p>
      )}

      <div className="feed">
        {reports.map((rep) => {
          const imgPath = rep.imageUrl || rep.image;
          return (
            <div key={rep._id || `${rep.createdAt}-${rep.locationLabel}`} className="inset">
              <div className="feed-head">
                <span>
                  <MapPin size={16} /> {rep.locationLabel || 'Unspecified location'} · <small className="hazard-tag">{rep.hazardType}</small>
                </span>
                <small className="muted" style={{ fontWeight: 500 }}>{rep.createdAt ? new Date(rep.createdAt).toLocaleString() : ''}</small>
              </div>

              <p className="soft" style={{ margin: '0.5rem 0' }}>{rep.description}</p>

              {imgPath && (
                <img
                  src={getImageUrl(imgPath)}
                  alt="Reported hazard"
                  className="photo"
                  style={{ maxHeight: '220px', marginBottom: '0.5rem' }}
                />
              )}

              <div className="feed-foot">
                <small className="posted-by" style={{ marginTop: 0 }}>Reported by: {rep.reportedBy?.name || 'Anonymous'}</small>
                <div className="row-actions">
                  <button
                    onClick={() => handleVerify(rep._id)}
                    className={rep._isVerified ? 'chip ok-solid' : 'chip'}
                  >
                    <ThumbsUp size={14} /> {rep._isVerified ? 'Verified' : 'Verify'} ({rep._localVerifications || 0})
                  </button>
                  <button onClick={() => alert("Report flagged for review.")} className="chip bad">
                    <Flag size={14} /> Flag
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IncidentReport;
