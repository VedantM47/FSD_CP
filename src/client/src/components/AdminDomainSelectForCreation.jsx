import React from "react";
import { useState } from "react";
import "../styles/AdminDomainSelectForCreation.css";

export function AdminDomainSelectForCreation({
  onDomainsChange,
  initialDomains = [],
}) {
  const [selectedDomains, setSelectedDomains] = useState(initialDomains);
  const [newDomain, setNewDomain] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [templates, setTemplates] = useState({});
  const [showTemplates, setShowTemplates] = useState(false);

  // BUG FIX: Sync internal state when the parent provides a new initialDomains
  // (e.g. edit mode: parent loads hackathon data and passes existing domains).
  // We use a ref so we only apply the prop-driven sync ONCE — after that the
  // component is the source of truth and we must not overwrite user edits.
  const syncedRef = React.useRef(false);
  React.useEffect(() => {
    if (!syncedRef.current && initialDomains.length > 0) {
      setSelectedDomains(initialDomains);
      syncedRef.current = true;
    }
  }, [initialDomains]);

  // Fetch templates on mount
  React.useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/hackathons/templates/domains");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || getDefaultTemplates());
      } else {
        setTemplates(getDefaultTemplates());
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      setTemplates(getDefaultTemplates());
    }
  };

  // Fallback templates if API fails
  const getDefaultTemplates = () => ({
    tech: {
      label: "Technology Track",
      domains: [
        { id: "ai-ml", name: "AI/ML" },
        { id: "web-dev", name: "Web Development" },
        { id: "mobile", name: "Mobile Apps" },
        { id: "blockchain", name: "Blockchain" },
        { id: "iot", name: "IoT" },
        { id: "ar-vr", name: "AR/VR" },
      ],
    },
    social: {
      label: "Impact Track",
      domains: [
        { id: "healthcare", name: "Healthcare" },
        { id: "education", name: "Education" },
        { id: "environment", name: "Environment" },
        { id: "finance", name: "FinTech" },
        { id: "social-good", name: "Social Good" },
      ],
    },
    business: {
      label: "Business Track",
      domains: [
        { id: "productivity", name: "Productivity" },
        { id: "ecommerce", name: "E-Commerce" },
        { id: "logistics", name: "Logistics" },
        { id: "entertainment", name: "Entertainment" },
      ],
    },
  });

  const addDomain = () => {
    if (!newDomain.trim()) {
      alert("Domain name is required");
      return;
    }

    const domainId = newDomain.toLowerCase().replace(/\s+/g, "-");

    // Check duplicate
    if (selectedDomains.some((d) => d.id === domainId)) {
      alert("This domain already exists");
      return;
    }

    const newDomainObj = {
      id: domainId,
      name: newDomain.trim(),
      description: description.trim(),
      icon: icon || "",
      order: selectedDomains.length + 1,
    };

    const updatedDomains = [...selectedDomains, newDomainObj];
    setSelectedDomains(updatedDomains);
    onDomainsChange?.(updatedDomains);

    // Reset form
    setNewDomain("");
    setIcon("");
    setDescription("");
    setShowForm(false);
  };

  const removeDomain = (domainId) => {
    const updatedDomains = selectedDomains.filter((d) => d.id !== domainId);
    setSelectedDomains(updatedDomains);
    onDomainsChange?.(updatedDomains);
  };

  const applyTemplate = (templateKey) => {
    const template = templates[templateKey];
    if (!template) return;

    const newDomains = template.domains.map((domain, index) => ({
      id: domain.id,
      name: domain.name,
      icon: domain.icon,
      description: "",
      order: selectedDomains.length + index + 1,
    }));

    const updatedDomains = [...selectedDomains, ...newDomains];
    setSelectedDomains(updatedDomains);
    onDomainsChange?.(updatedDomains);
    setShowTemplates(false);
  };

  return (
    <div className="admin-domain-select-for-creation">
      <div className="section-header">
        <h3>Select Domains for Hackathon</h3>
        <p className="section-description">
          Choose domains that participants can work on. You can add more domains
          later.
        </p>
      </div>

      <div className="domain-actions">
        <button
          type="button"
          className="btn-add-domain"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "✕ Cancel" : "+ Add Domain"}
        </button>

        <button
          type="button"
          className="btn-templates"
          onClick={() => setShowTemplates(!showTemplates)}
        >
          {showTemplates ? "✕ Hide" : "Use Template"}
        </button>
      </div>

      {/* Add Domain Form */}
      {showForm && (
        <div className="add-domain-form-creation">
          <div className="form-group-creation">
            <label>Domain Name *</label>
            <input
              type="text"
              placeholder="e.g., AI/ML, Web Development"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addDomain()}
            />
          </div>

          <div className="form-group-creation">
            <label>Icon (emoji)</label>
            <input
              type="text"
              placeholder="e.g., "
              maxLength="5"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            />
          </div>

          <div className="form-group-creation">
            <label>Description</label>
            <textarea
              placeholder="Brief description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
            />
          </div>

          <button type="button" className="btn-confirm" onClick={addDomain}>
            Add Domain
          </button>
        </div>
      )}

      {/* Templates Section */}
      {showTemplates && Object.keys(templates).length > 0 && (
        <div className="templates-section-creation">
          <div className="templates-grid-creation">
            {Object.entries(templates).map(([key, template]) => (
              <div key={key} className="template-card-creation">
                <h4>{template.label}</h4>
                <ul>
                  {template.domains.map((d) => (
                    <li key={d.id}>
                      <span className="template-icon">{d.icon}</span>
                      {d.name}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="btn-apply-template-creation"
                  onClick={() => applyTemplate(key)}
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Domains */}
      <div className="selected-domains-creation">
        <h4>Selected Domains ({selectedDomains.length})</h4>

        {selectedDomains.length === 0 ? (
          <p className="empty-state">No domains selected yet</p>
        ) : (
          <div className="domains-preview">
            {selectedDomains.map((domain) => (
              <div key={domain.id} className="domain-chip-creation">
                <span className="chip-icon-creation">{domain.icon}</span>
                <div className="chip-content">
                  <strong>{domain.name}</strong>
                  {domain.description && <small>{domain.description}</small>}
                </div>
                <button
                  type="button"
                  className="btn-remove-chip"
                  onClick={() => removeDomain(domain.id)}
                  title="Remove domain"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="info-box">
        <strong>ℹ️ Info:</strong> Domains can be modified anytime after
        hackathon creation. Participants will see these domains when submitting
        their projects.
      </div>
    </div>
  );
}
