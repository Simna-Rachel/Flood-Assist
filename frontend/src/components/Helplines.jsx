import React from 'react';
import { PhoneCall } from 'lucide-react';

function Helplines() {
  return (
    <div style={styles.card}>
      <h3><PhoneCall size={20} /> Emergency Helplines & Relief Camps</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
        <div>
          <h4>Control Rooms</h4>
          <ul>
            <li><strong>State Emergency:</strong> 1070</li>
            <li><strong>District Control Room:</strong> 1077</li>
            <li><strong>Police Emergency:</strong> 112</li>
            <li><strong>Fire & Rescue:</strong> 101</li>
          </ul>
        </div>
        <div>
          <h4>Shelter Camps</h4>
          <ul>
            <li><strong>Ernakulam:</strong> St. Albert's Camp</li>
            <li><strong>Wayanad:</strong> GHSS Kalpetta Camp</li>
            <li><strong>Kottayam:</strong> CMS College Shelter</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
};

export default Helplines;