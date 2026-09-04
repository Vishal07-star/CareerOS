import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { X, Plus, Save, Sun, Moon } from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";
import { useCandidateToast } from "./CandidateToastContext";

function ChipInput({ items, onAdd, onRemove, placeholder }) {
  const [value, setValue] = useState("");
  const submit = () => {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
  };
  return (
    <div className="co-chip-input-list">
      {items.map((item) => (
        <span key={item} className="co-skill-chip">
          {item}
          <button onClick={() => onRemove(item)} aria-label={`Remove ${item}`}><X size={11} /></button>
        </span>
      ))}
      <span className="co-skill-add-input">
        <input placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        <button onClick={submit}><Plus size={13} /></button>
      </span>
    </div>
  );
}

export default function Settings() {
  const { preferences, updatePreferences } = useCandidateData();
  const { showToast } = useCandidateToast();
  const { theme, onToggleTheme } = useOutletContext() || {};
  const [form, setForm] = useState(preferences);
  const [dirty, setDirty] = useState(false);

  const set = (partial) => { setForm((f) => ({ ...f, ...partial })); setDirty(true); };

  const save = () => {
    updatePreferences(form);
    setDirty(false);
    showToast("Preferences saved.", "success");
  };

  return (
    <section className="overview-section">
      <div className="co-page-head">
        <div>
          <p className="co-eyebrow">CANDIDATE SETTINGS</p>
          <h1>Preferences</h1>
          <p>Tell us what you're looking for so we can tailor jobs and alerts.</p>
        </div>
        <button className="primary-button" onClick={save} disabled={!dirty}>
          <Save size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Save Changes
        </button>
      </div>

      <div className="co-section-card">
        <div className="co-section-card-head"><h3>Job Preferences</h3></div>

        <div className="co-field">
          <label>Preferred Job Roles</label>
          <ChipInput
            items={form.roles}
            placeholder="Add a role…"
            onAdd={(v) => set({ roles: [...form.roles, v] })}
            onRemove={(v) => set({ roles: form.roles.filter((r) => r !== v) })}
          />
        </div>

        <div className="co-field">
          <label>Preferred Locations</label>
          <ChipInput
            items={form.locations}
            placeholder="Add a location…"
            onAdd={(v) => set({ locations: [...form.locations, v] })}
            onRemove={(v) => set({ locations: form.locations.filter((r) => r !== v) })}
          />
        </div>

        <div className="co-field-row">
          <div className="co-field">
            <label>Remote Preference</label>
            <select value={form.remote} onChange={(e) => set({ remote: e.target.value })}>
              <option>Remote</option><option>Hybrid</option><option>On-site</option><option>Flexible</option>
            </select>
          </div>
          <div className="co-field">
            <label>Employment Type</label>
            <select value={form.employmentType} onChange={(e) => set({ employmentType: e.target.value })}>
              <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
            </select>
          </div>
        </div>

        <div className="co-field-row">
          <div className="co-field">
            <label>Expected Salary</label>
            <input value={form.expectedSalary} onChange={(e) => set({ expectedSalary: e.target.value })} placeholder="e.g. 12-16 LPA" />
          </div>
          <div className="co-field">
            <label>Experience Level</label>
            <select value={form.experienceLevel} onChange={(e) => set({ experienceLevel: e.target.value })}>
              <option>Entry</option><option>Mid</option><option>Senior</option><option>Lead</option>
            </select>
          </div>
        </div>
      </div>

      <div className="co-section-card">
        <div className="co-section-card-head"><h3>Appearance</h3></div>
        <div className="co-pref-row">
          <div className="co-pref-row-text">
            <strong>Dark Mode</strong>
            <span>Switch between light and dark theme across CareerOS.</span>
          </div>
          {onToggleTheme ? (
            <label className="co-switch">
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={onToggleTheme}
                aria-label="Toggle dark mode"
              />
              <span className="co-switch-track" />
            </label>
          ) : (
            theme === "dark" ? <Moon size={16} /> : <Sun size={16} />
          )}
        </div>
      </div>

      <div className="co-section-card">
        <div className="co-section-card-head"><h3>Notifications</h3></div>
        <div className="co-pref-row">
          <div className="co-pref-row-text">
            <strong>Job Alert Emails</strong>
            <span>Get notified when jobs match your alerts.</span>
          </div>
          <label className="co-switch">
            <input type="checkbox" checked={form.jobAlerts} onChange={(e) => set({ jobAlerts: e.target.checked })} />
            <span className="co-switch-track" />
          </label>
        </div>
        <div className="co-pref-row">
          <div className="co-pref-row-text">
            <strong>Email Notifications</strong>
            <span>Application updates and recruiter messages by email.</span>
          </div>
          <label className="co-switch">
            <input type="checkbox" checked={form.emailNotifications} onChange={(e) => set({ emailNotifications: e.target.checked })} />
            <span className="co-switch-track" />
          </label>
        </div>
        <div className="co-pref-row">
          <div className="co-pref-row-text">
            <strong>Interview Notifications</strong>
            <span>Reminders before scheduled interviews.</span>
          </div>
          <label className="co-switch">
            <input type="checkbox" checked={form.interviewNotifications} onChange={(e) => set({ interviewNotifications: e.target.checked })} />
            <span className="co-switch-track" />
          </label>
        </div>
      </div>
    </section>
  );
}
