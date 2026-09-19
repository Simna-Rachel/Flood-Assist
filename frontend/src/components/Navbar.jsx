<nav className="glass-navbar">
  <div className="navbar-brand">
    <img src={logo} alt="Logo" />
    <h2>NattilAlert</h2>
  </div>
  <div className="navbar-links">
    <button onClick={() => setActiveTab('weather')}>Live Weather</button>
    <button onClick={() => setActiveTab('report')}>Report Hazard</button>
    <button onClick={() => setActiveTab('helpline')}>Helplines</button>
    {canApprove && (
      <button onClick={() => setActiveTab('approvals')}>Approvals</button>
    )}
    <button onClick={() => setActiveTab('settings')}>Settings</button>
  </div>
</nav>