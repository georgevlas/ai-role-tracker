const placeholderRoles = [
  "CTO - Acme Tech (Lead)",
  "CIO - Northstar Group (Interviewing)",
  "VP Engineering - Blue Orbit (Applied)"
];

export default function HomePage() {
  return (
    <main className="container">
      <header className="panel">
        <h1>AI Role Tracker</h1>
        <p>Track leadership opportunities, notes, and follow-ups in one place.</p>
        <button type="button">Add Opportunity</button>
      </header>

      <section className="panel">
        <h2>Role Opportunities</h2>
        <ul className="list">
          {placeholderRoles.map((role) => (
            <li key={role}>{role}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
