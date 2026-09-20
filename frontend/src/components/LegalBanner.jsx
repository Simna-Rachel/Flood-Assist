import { ShieldAlert } from 'lucide-react';

function LegalBanner() {
  return (
    <div className="legal-banner">
      <ShieldAlert size={24} color="#dc2626" />
      <div>
        <strong>LEGAL WARNING:</strong> Spreading fake news, unverified rumors, or false emergency requests is a severe offence under the Disaster Management Act and IT Act. Violations will be logged and reported to authorities.
      </div>
    </div>
  );
}

export default LegalBanner;
