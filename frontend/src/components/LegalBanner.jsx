import React from 'react';
import { ShieldAlert } from 'lucide-react';

function LegalBanner() {
  return (
    <div style={styles.banner}>
      <ShieldAlert size={24} color="#dc2626" />
      <div>
        <strong>LEGAL WARNING:</strong> Spreading fake news, unverified rumors, or false emergency requests is a severe offence under the Disaster Management Act and IT Act. Violations will be logged and reported to authorities.
      </div>
    </div>
  );
}

const styles = {
  banner: { display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#fef2f2', borderLeft: '6px solid #dc2626', color: '#991b1b', padding: '1rem 2rem', fontSize: '0.88rem' }
};

export default LegalBanner;