"use client";

import { FormEvent, useEffect, useState } from "react";

type OpportunityStatus = "Lead" | "Applied" | "Interviewing" | "Offer" | "Closed";

type Opportunity = {
  id: string;
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
  { id: "seed-1", title: "CTO", company: "Acme Tech", status: "Lead" },
  { id: "seed-2", title: "CIO", company: "Northstar Group", status: "Interviewing" },
  { id: "seed-3", title: "VP Engineering", company: "Blue Orbit", status: "Applied" }
];
const storageKey = "ai-role-tracker-opportunities";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function HomePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(placeholderRoles);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<OpportunityStatus>("Lead");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | OpportunityStatus>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editStatus, setEditStatus] = useState<OpportunityStatus>("Lead");

  useEffect(() => {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      return;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as Array<Partial<Opportunity>>;
      if (Array.isArray(parsedValue)) {
        const normalizedItems = parsedValue
          .filter((item) => item.title && item.company && item.status)
          .map((item) => ({
            id: item.id || createId(),
            title: item.title as string,
            company: item.company as string,
            status: item.status as OpportunityStatus
          }));
        if (normalizedItems.length > 0) {
          setOpportunities(normalizedItems);
        }
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
      id: createId(),
      title: nextTitle,
      company: nextCompany,
      status
    };

    setOpportunities((current) => [newOpportunity, ...current]);
    setTitle("");
    setCompany("");
    setStatus("Lead");
  }

  function handleDelete(id: string) {
    setOpportunities((current) => current.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  }

  function startEdit(item: Opportunity) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditCompany(item.company);
    setEditStatus(item.status);
  }

  function handleSaveEdit(id: string) {
    const nextTitle = editTitle.trim();
    const nextCompany = editCompany.trim();
    if (!nextTitle || !nextCompany) {
      return;
    }

    setOpportunities((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              title: nextTitle,
              company: nextCompany,
              status: editStatus
            }
          : item
      )
    );
    setEditingId(null);
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredOpportunities = opportunities.filter((role) => {
    const matchesSearch =
      normalizedSearchTerm.length === 0 ||
      role.title.toLowerCase().includes(normalizedSearchTerm) ||
      role.company.toLowerCase().includes(normalizedSearchTerm);
    const matchesStatus = statusFilter === "All" || role.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="filters">
          <input
            placeholder="Search by title or company"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "All" | OpportunityStatus)
            }
          >
            <option value="All">All</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <ul className="list">
          {filteredOpportunities.map((role) => (
            <li key={role.id}>
              {editingId === role.id ? (
                <div className="grid">
                  <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
                  <input
                    value={editCompany}
                    onChange={(event) => setEditCompany(event.target.value)}
                  />
                  <select
                    value={editStatus}
                    onChange={(event) => setEditStatus(event.target.value as OpportunityStatus)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="row">
                    <button type="button" onClick={() => handleSaveEdit(role.id)}>
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <strong>{role.title}</strong> - {role.company} ({role.status})
                  <div className="row">
                    <button type="button" onClick={() => startEdit(role)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(role.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
