 "use client";

import { FormEvent, useEffect, useState } from "react";

type OpportunityStatus = "Lead" | "Applied" | "Interviewing" | "Offer" | "Closed";

type Opportunity = {
  title: string;
  company: string;
  status: OpportunityStatus;
};

const statusOptions: OpportunityStatus[] = [
  "Lead",
  "Applied",
  "Interviewing",
  "Offer",
  "Closed"
];

const placeholderRoles: Opportunity[] = [
  { title: "CTO", company: "Acme Tech", status: "Lead" },
  { title: "CIO", company: "Northstar Group", status: "Interviewing" },
  { title: "VP Engineering", company: "Blue Orbit", status: "Applied" }
];
const storageKey = "ai-role-tracker-opportunities";

export default function HomePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(placeholderRoles);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<OpportunityStatus>("Lead");

  useEffect(() => {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      return;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as Opportunity[];
      if (Array.isArray(parsedValue)) {
        setOpportunities(parsedValue);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(opportunities));
  }, [opportunities]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextTitle = title.trim();
    const nextCompany = company.trim();

    if (!nextTitle || !nextCompany) {
      return;
    }

    const newOpportunity: Opportunity = {
      title: nextTitle,
      company: nextCompany,
      status
    };

    setOpportunities((current) => [newOpportunity, ...current]);
    setTitle("");
    setCompany("");
    setStatus("Lead");
  }

  return (
    <main className="container">
      <header className="panel">
        <h1>AI Role Tracker</h1>
        <p>Track leadership opportunities, notes, and follow-ups in one place.</p>
      </header>

      <section className="panel">
        <h2>Add Opportunity</h2>
        <form className="grid" onSubmit={handleSubmit}>
          <input
            placeholder="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <input
            placeholder="Company"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as OpportunityStatus)}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button type="submit">Add Opportunity</button>
        </form>
      </section>

      <section className="panel">
        <h2>Role Opportunities</h2>
        <ul className="list">
          {opportunities.map((role) => (
            <li key={`${role.title}-${role.company}-${role.status}`}>
              <strong>{role.title}</strong> - {role.company} ({role.status})
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
