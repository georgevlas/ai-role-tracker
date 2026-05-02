"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

type OpportunityStatus = "Lead" | "Applied" | "Interviewing" | "Offer" | "Closed";
type OpportunityPriority = "High" | "Medium" | "Low";

type Opportunity = {
  id: string;
  title: string;
  company: string;
  status: OpportunityStatus;
  priority: OpportunityPriority;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhone: string;
  sourceChannel: string;
  followUpDate: string;
  notes: string;
};

const statusOptions: OpportunityStatus[] = [
  "Lead",
  "Applied",
  "Interviewing",
  "Offer",
  "Closed"
];
const priorityOptions: OpportunityPriority[] = ["High", "Medium", "Low"];

const placeholderRoles: Opportunity[] = [
  {
    id: "seed-1",
    title: "CTO",
    company: "Acme Tech",
    status: "Lead",
    priority: "High",
    recruiterName: "Sarah Lee",
    recruiterEmail: "sarah@example.com",
    recruiterPhone: "",
    sourceChannel: "LinkedIn",
    followUpDate: "2026-05-10",
    notes: "Initial recruiter intro complete."
  },
  {
    id: "seed-2",
    title: "CIO",
    company: "Northstar Group",
    status: "Interviewing",
    priority: "Medium",
    recruiterName: "",
    recruiterEmail: "",
    recruiterPhone: "",
    sourceChannel: "recruiter",
    followUpDate: "2026-05-03",
    notes: ""
  },
  {
    id: "seed-3",
    title: "VP Engineering",
    company: "Blue Orbit",
    status: "Applied",
    priority: "Low",
    recruiterName: "",
    recruiterEmail: "",
    recruiterPhone: "",
    sourceChannel: "direct application",
    followUpDate: "",
    notes: "Follow up next week."
  }
];
const storageKey = "ai-role-tracker-opportunities";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function downloadFile(filename: string, contents: string, mimeType: string) {
  const blob = new Blob([contents], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

function escapeCsvValue(value: string) {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

function isOpportunityStatus(value: unknown): value is OpportunityStatus {
  return value === "Lead" || value === "Applied" || value === "Interviewing" || value === "Offer" || value === "Closed";
}

function isOpportunityPriority(value: unknown): value is OpportunityPriority {
  return value === "High" || value === "Medium" || value === "Low";
}

function normalizeImportedOpportunity(item: unknown): Opportunity | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const candidate = item as Partial<Opportunity>;
  if (
    typeof candidate.title !== "string" ||
    typeof candidate.company !== "string" ||
    !isOpportunityStatus(candidate.status) ||
    !isOpportunityPriority(candidate.priority)
  ) {
    return null;
  }

  return {
    id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : createId(),
    title: candidate.title.trim(),
    company: candidate.company.trim(),
    status: candidate.status,
    priority: candidate.priority,
    recruiterName: typeof candidate.recruiterName === "string" ? candidate.recruiterName : "",
    recruiterEmail: typeof candidate.recruiterEmail === "string" ? candidate.recruiterEmail : "",
    recruiterPhone: typeof candidate.recruiterPhone === "string" ? candidate.recruiterPhone : "",
    sourceChannel: typeof candidate.sourceChannel === "string" ? candidate.sourceChannel : "",
    followUpDate: typeof candidate.followUpDate === "string" ? candidate.followUpDate : "",
    notes: typeof candidate.notes === "string" ? candidate.notes : ""
  };
}

export default function HomePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(placeholderRoles);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<OpportunityStatus>("Lead");
  const [priority, setPriority] = useState<OpportunityPriority>("Medium");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [recruiterPhone, setRecruiterPhone] = useState("");
  const [sourceChannel, setSourceChannel] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | OpportunityStatus>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | OpportunityPriority>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editStatus, setEditStatus] = useState<OpportunityStatus>("Lead");
  const [editPriority, setEditPriority] = useState<OpportunityPriority>("Medium");
  const [editRecruiterName, setEditRecruiterName] = useState("");
  const [editRecruiterEmail, setEditRecruiterEmail] = useState("");
  const [editRecruiterPhone, setEditRecruiterPhone] = useState("");
  const [editSourceChannel, setEditSourceChannel] = useState("");
  const [editFollowUpDate, setEditFollowUpDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [editError, setEditError] = useState("");
  const [importError, setImportError] = useState("");
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

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
          .map((item) => {
            const normalizedPriority: OpportunityPriority =
              item.priority === "High" || item.priority === "Low" ? item.priority : "Medium";
            return {
              id: item.id || createId(),
              title: item.title as string,
              company: item.company as string,
              status: item.status as OpportunityStatus,
              priority: normalizedPriority,
              recruiterName: typeof item.recruiterName === "string" ? item.recruiterName : "",
              recruiterEmail: typeof item.recruiterEmail === "string" ? item.recruiterEmail : "",
              recruiterPhone: typeof item.recruiterPhone === "string" ? item.recruiterPhone : "",
              sourceChannel: typeof item.sourceChannel === "string" ? item.sourceChannel : "",
              followUpDate: typeof item.followUpDate === "string" ? item.followUpDate : "",
              notes: typeof item.notes === "string" ? item.notes : ""
            };
          });
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

    if (!nextTitle || !nextCompany || !status || !priority) {
      setFormError("Title, company, status, and priority are required.");
      return;
    }
    setFormError("");

    const newOpportunity: Opportunity = {
      id: createId(),
      title: nextTitle,
      company: nextCompany,
      status,
      priority,
      recruiterName: recruiterName.trim(),
      recruiterEmail: recruiterEmail.trim(),
      recruiterPhone: recruiterPhone.trim(),
      sourceChannel: sourceChannel.trim(),
      followUpDate,
      notes: notes.trim()
    };

    setOpportunities((current) => [newOpportunity, ...current]);
    setTitle("");
    setCompany("");
    setStatus("Lead");
    setPriority("Medium");
    setRecruiterName("");
    setRecruiterEmail("");
    setRecruiterPhone("");
    setSourceChannel("");
    setFollowUpDate("");
    setNotes("");
  }

  function handleDelete(id: string) {
    setOpportunities((current) => current.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  }

  function startEdit(item: Opportunity) {
    setEditingId(item.id);
    setEditError("");
    setEditTitle(item.title);
    setEditCompany(item.company);
    setEditStatus(item.status);
    setEditPriority(item.priority);
    setEditRecruiterName(item.recruiterName);
    setEditRecruiterEmail(item.recruiterEmail);
    setEditRecruiterPhone(item.recruiterPhone);
    setEditSourceChannel(item.sourceChannel);
    setEditFollowUpDate(item.followUpDate);
    setEditNotes(item.notes);
  }

  function handleSaveEdit(id: string) {
    const nextTitle = editTitle.trim();
    const nextCompany = editCompany.trim();
    if (!nextTitle || !nextCompany || !editStatus || !editPriority) {
      setEditError("Title, company, status, and priority are required.");
      return;
    }
    setEditError("");

    setOpportunities((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              title: nextTitle,
              company: nextCompany,
              status: editStatus,
              priority: editPriority,
              recruiterName: editRecruiterName.trim(),
              recruiterEmail: editRecruiterEmail.trim(),
              recruiterPhone: editRecruiterPhone.trim(),
              sourceChannel: editSourceChannel.trim(),
              followUpDate: editFollowUpDate,
              notes: editNotes.trim()
            }
          : item
      )
    );
    setEditingId(null);
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredOpportunities = opportunities
    .filter((role) => {
      const matchesSearch =
        normalizedSearchTerm.length === 0 ||
        role.title.toLowerCase().includes(normalizedSearchTerm) ||
        role.company.toLowerCase().includes(normalizedSearchTerm);
      const matchesStatus = statusFilter === "All" || role.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || role.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      const aTime = a.followUpDate ? new Date(a.followUpDate).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.followUpDate ? new Date(b.followUpDate).getTime() : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });

  function handleExportCsv() {
    const csvHeaders = [
      "title",
      "company",
      "status",
      "priority",
      "followUpDate",
      "recruiterName",
      "recruiterEmail",
      "recruiterPhone",
      "source",
      "notes"
    ];

    const csvRows = opportunities.map((item) =>
      [
        item.title,
        item.company,
        item.status,
        item.priority,
        item.followUpDate,
        item.recruiterName,
        item.recruiterEmail,
        item.recruiterPhone,
        item.sourceChannel,
        item.notes
      ]
        .map((value) => escapeCsvValue(value))
        .join(",")
    );

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");
    downloadFile("ai-role-tracker-export.csv", csvContent, "text/csv;charset=utf-8;");
  }

  function handleExportJson() {
    const jsonContent = JSON.stringify(opportunities, null, 2);
    downloadFile("ai-role-tracker-export.json", jsonContent, "application/json;charset=utf-8;");
  }

  function handleImportClick() {
    setImportError("");
    importFileInputRef.current?.click();
  }

  async function handleImportJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const fileContents = await file.text();
      const parsedValue = JSON.parse(fileContents) as unknown;
      if (!Array.isArray(parsedValue)) {
        setImportError("Invalid JSON format. Expected an array of opportunities.");
        return;
      }

      const normalizedItems = parsedValue.map((item) => normalizeImportedOpportunity(item));
      if (normalizedItems.some((item) => item === null)) {
        setImportError("Invalid opportunity data. Please import a valid export file.");
        return;
      }

      setOpportunities(normalizedItems as Opportunity[]);
      setEditingId(null);
      setImportError("");
    } catch {
      setImportError("Unable to import file. Please upload a valid JSON file.");
    } finally {
      event.target.value = "";
    }
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
            onChange={(event) => {
              setTitle(event.target.value);
              setFormError("");
            }}
          />
          <input
            placeholder="Company"
            value={company}
            onChange={(event) => {
              setCompany(event.target.value);
              setFormError("");
            }}
          />
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as OpportunityStatus);
              setFormError("");
            }}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(event) => {
              setPriority(event.target.value as OpportunityPriority);
              setFormError("");
            }}
          >
            {priorityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={followUpDate}
            onChange={(event) => setFollowUpDate(event.target.value)}
          />
          <input
            placeholder="Recruiter name (optional)"
            value={recruiterName}
            onChange={(event) => setRecruiterName(event.target.value)}
          />
          <input
            type="email"
            placeholder="Recruiter email (optional)"
            value={recruiterEmail}
            onChange={(event) => setRecruiterEmail(event.target.value)}
          />
          <input
            placeholder="Recruiter phone (optional)"
            value={recruiterPhone}
            onChange={(event) => setRecruiterPhone(event.target.value)}
          />
          <input
            placeholder="Source/channel (optional)"
            value={sourceChannel}
            onChange={(event) => setSourceChannel(event.target.value)}
          />
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <button type="submit">Add Opportunity</button>
          {formError ? <p>{formError}</p> : null}
        </form>
      </section>

      <section className="panel">
        <h2>Role Opportunities</h2>
        <div className="row">
          <button type="button" onClick={handleExportCsv}>
            Export CSV
          </button>
          <button type="button" onClick={handleExportJson}>
            Export JSON
          </button>
          <button type="button" onClick={handleImportClick}>
            Import JSON
          </button>
          <input
            ref={importFileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportJson}
            style={{ display: "none" }}
          />
        </div>
        {importError ? <p>{importError}</p> : null}
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
          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value as "All" | OpportunityPriority)
            }
          >
            <option value="All">All priorities</option>
            {priorityOptions.map((option) => (
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
                  <input
                    value={editTitle}
                    onChange={(event) => {
                      setEditTitle(event.target.value);
                      setEditError("");
                    }}
                  />
                  <input
                    value={editCompany}
                    onChange={(event) => {
                      setEditCompany(event.target.value);
                      setEditError("");
                    }}
                  />
                  <select
                    value={editStatus}
                    onChange={(event) => {
                      setEditStatus(event.target.value as OpportunityStatus);
                      setEditError("");
                    }}
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <select
                    value={editPriority}
                    onChange={(event) => {
                      setEditPriority(event.target.value as OpportunityPriority);
                      setEditError("");
                    }}
                  >
                    {priorityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={editFollowUpDate}
                    onChange={(event) => setEditFollowUpDate(event.target.value)}
                  />
                  <input
                    placeholder="Recruiter name (optional)"
                    value={editRecruiterName}
                    onChange={(event) => setEditRecruiterName(event.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Recruiter email (optional)"
                    value={editRecruiterEmail}
                    onChange={(event) => setEditRecruiterEmail(event.target.value)}
                  />
                  <input
                    placeholder="Recruiter phone (optional)"
                    value={editRecruiterPhone}
                    onChange={(event) => setEditRecruiterPhone(event.target.value)}
                  />
                  <input
                    placeholder="Source/channel (optional)"
                    value={editSourceChannel}
                    onChange={(event) => setEditSourceChannel(event.target.value)}
                  />
                  <textarea value={editNotes} onChange={(event) => setEditNotes(event.target.value)} />
                  <div className="row">
                    <button type="button" onClick={() => handleSaveEdit(role.id)}>
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                  {editError ? <p>{editError}</p> : null}
                </div>
              ) : (
                <>
                  <strong>{role.title}</strong> - {role.company} ({role.status}) | Priority:{" "}
                  {role.priority} | Follow-up: {role.followUpDate || "Not set"}
                  {role.recruiterName || role.recruiterEmail || role.recruiterPhone || role.sourceChannel ? (
                    <p>
                      Contact: {role.recruiterName || "N/A"}
                      {role.recruiterEmail ? ` | ${role.recruiterEmail}` : ""}
                      {role.recruiterPhone ? ` | ${role.recruiterPhone}` : ""}
                      {role.sourceChannel ? ` | Source: ${role.sourceChannel}` : ""}
                    </p>
                  ) : null}
                  {role.notes ? <p>{role.notes}</p> : null}
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
