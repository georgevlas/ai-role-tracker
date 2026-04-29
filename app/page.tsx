const placeholderRoles = [
  { title: "CTO", company: "Acme Tech", status: "Lead" },
  { title: "CIO", company: "Northstar Group", status: "Interviewing" },
  { title: "VP Engineering", company: "Blue Orbit", status: "Applied" }
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
            <li key={`${role.title}-${role.company}`}>
              <strong>{role.title}</strong> - {role.company} ({role.status})
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
