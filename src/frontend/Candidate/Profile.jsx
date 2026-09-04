import { useRef, useState } from "react";
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Pencil, Plus, Trash2, Camera, Link as LinkIcon, X } from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";
import { useCandidateToast } from "./CandidateToastContext";
import { ConfirmDialog } from "./Modal";
import { PersonalInfoModal, ProfessionalInfoModal, LinksModal, ExperienceModal, EducationModal } from "./ProfileModals";

function formatPeriod(start, end, current) {
  const fmt = (v) => v ? new Date(v + "-01").toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "";
  return `${fmt(start)} — ${current ? "Present" : fmt(end)}`;
}

export default function Profile() {
  const { profile, stats, updateProfile, updateLinks, addSkill, removeSkill, addExperience, updateExperience, deleteExperience, addEducation, updateEducation, deleteEducation } = useCandidateData();
  const { showToast } = useCandidateToast();
  const photoInputRef = useRef(null);

  const [modal, setModal] = useState(null); // 'personal' | 'professional' | 'links'
  const [skillInput, setSkillInput] = useState("");
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [expModal, setExpModal] = useState(null); // { initial } | 'new' | null
  const [eduModal, setEduModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id, label }

  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ photo: reader.result });
      showToast("Profile photo updated.", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleAddSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    addSkill(value);
    setSkillInput("");
    setShowSkillInput(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "experience") deleteExperience(deleteTarget.id);
    if (deleteTarget.type === "education") deleteEducation(deleteTarget.id);
    showToast(`${deleteTarget.label} removed.`, "info");
    setDeleteTarget(null);
  };

  return (
    <section className="overview-section">
      <div className="co-page-head">
        <div>
          <p className="co-eyebrow">YOUR PROFILE</p>
          <h1>Candidate Profile</h1>
          <p>Manage your personal and professional details.</p>
        </div>
      </div>

      <div className="co-profile-header-card">
        <div className="co-profile-photo-wrap">
          <div className="co-profile-photo">
            {profile.photo ? <img src={profile.photo} alt="" /> : initials}
          </div>
          <button className="co-profile-photo-edit" onClick={() => photoInputRef.current?.click()} aria-label="Change photo">
            <Camera size={13} />
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
        </div>
        <div className="co-profile-header-info">
          <h2>{profile.firstName} {profile.lastName}</h2>
          <p className="co-headline">{profile.headline}</p>
          <p className="co-bio">{profile.bio}</p>
        </div>
        <div className="co-profile-completion-mini">
          <strong>{stats.profileCompletion}%</strong>
          <span>Complete</span>
        </div>
        <button className="outline-button" onClick={() => setModal("personal")}>
          <Pencil size={13} style={{ verticalAlign: -2, marginRight: 6 }} />Edit
        </button>
      </div>

      <div className="co-section-card">
        <div className="co-section-card-head">
          <h3><Mail size={15} /> Contact Information</h3>
          <button className="co-icon-add-button" onClick={() => setModal("personal")} aria-label="Edit contact info"><Pencil size={14} /></button>
        </div>
        <div className="co-links-grid">
          <div className="co-link-row"><Mail size={14} /> {profile.email}</div>
          <div className="co-link-row"><Phone size={14} /> {profile.phone}</div>
          <div className="co-link-row"><MapPin size={14} /> {profile.location}</div>
        </div>
      </div>

      <div className="co-section-card">
        <div className="co-section-card-head">
          <h3><Briefcase size={15} /> Professional Information</h3>
          <button className="co-icon-add-button" onClick={() => setModal("professional")} aria-label="Edit professional info"><Pencil size={14} /></button>
        </div>
        <div className="co-review-grid">
          <div>Current Position<strong>{profile.currentPosition || "—"}</strong></div>
          <div>Current Company<strong>{profile.currentCompany || "—"}</strong></div>
          <div>Years of Experience<strong>{profile.yearsExperience || "—"}</strong></div>
        </div>
      </div>

      <div className="co-section-card">
        <div className="co-section-card-head">
          <h3>Skills</h3>
        </div>
        <div className="co-links-grid" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {profile.skills.map((skill) => (
            <span key={skill} className="co-skill-chip">
              {skill}
              <button onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}><X size={11} /></button>
            </span>
          ))}
          {showSkillInput ? (
            <span className="co-skill-add-input">
              <input
                autoFocus
                placeholder="e.g. TypeScript"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
              />
              <button onClick={handleAddSkill}><Plus size={13} /></button>
            </span>
          ) : (
            <button className="co-skill-chip" style={{ background: "var(--co-paper)", color: "var(--co-ink-soft)", cursor: "pointer", border: "none" }} onClick={() => setShowSkillInput(true)}>
              <Plus size={12} /> Add Skill
            </button>
          )}
        </div>
      </div>

      <div className="co-section-card">
        <div className="co-section-card-head">
          <h3><Briefcase size={15} /> Work Experience</h3>
          <button className="co-icon-add-button" onClick={() => setExpModal("new")} aria-label="Add experience"><Plus size={16} /></button>
        </div>
        {profile.experience.length === 0 && <p style={{ color: "var(--co-ink-faint)", fontSize: 13 }}>No experience added yet.</p>}
        {profile.experience.map((exp) => (
          <div className="co-list-item" key={exp.id}>
            <div className="co-list-item-main">
              <strong>{exp.position}</strong>
              <span>{exp.company}</span>
              {exp.description && <p>{exp.description}</p>}
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span className="co-list-item-period">{formatPeriod(exp.start, exp.end, exp.current)}</span>
              <div className="co-list-item-actions">
                <button onClick={() => setExpModal({ initial: exp })} aria-label="Edit"><Pencil size={13} /></button>
                <button onClick={() => setDeleteTarget({ type: "experience", id: exp.id, label: exp.position })} aria-label="Delete"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="co-section-card">
        <div className="co-section-card-head">
          <h3><GraduationCap size={15} /> Education</h3>
          <button className="co-icon-add-button" onClick={() => setEduModal("new")} aria-label="Add education"><Plus size={16} /></button>
        </div>
        {profile.education.length === 0 && <p style={{ color: "var(--co-ink-faint)", fontSize: 13 }}>No education added yet.</p>}
        {profile.education.map((edu) => (
          <div className="co-list-item" key={edu.id}>
            <div className="co-list-item-main">
              <strong>{edu.degree}{edu.field ? `, ${edu.field}` : ""}</strong>
              <span>{edu.institution}</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span className="co-list-item-period">{formatPeriod(edu.start, edu.end, false)}</span>
              <div className="co-list-item-actions">
                <button onClick={() => setEduModal({ initial: edu })} aria-label="Edit"><Pencil size={13} /></button>
                <button onClick={() => setDeleteTarget({ type: "education", id: edu.id, label: edu.degree })} aria-label="Delete"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="co-section-card">
        <div className="co-section-card-head">
          <h3><LinkIcon size={15} /> Links</h3>
          <button className="co-icon-add-button" onClick={() => setModal("links")} aria-label="Edit links"><Pencil size={14} /></button>
        </div>
        <div className="co-links-grid">
          <div className="co-link-row">LinkedIn: {profile.links.linkedin ? <a href={`https://${profile.links.linkedin.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer">{profile.links.linkedin}</a> : "—"}</div>
          <div className="co-link-row">GitHub: {profile.links.github ? <a href={`https://${profile.links.github.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer">{profile.links.github}</a> : "—"}</div>
          <div className="co-link-row">Portfolio: {profile.links.portfolio ? <a href={`https://${profile.links.portfolio.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer">{profile.links.portfolio}</a> : "—"}</div>
          <div className="co-link-row">Website: {profile.links.website ? <a href={`https://${profile.links.website.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer">{profile.links.website}</a> : "—"}</div>
        </div>
      </div>

      {modal === "personal" && <PersonalInfoModal profile={profile} onClose={() => setModal(null)} onSave={(f) => { updateProfile(f); showToast("Personal information updated.", "success"); }} />}
      {modal === "professional" && <ProfessionalInfoModal profile={profile} onClose={() => setModal(null)} onSave={(f) => { updateProfile(f); showToast("Professional information updated.", "success"); }} />}
      {modal === "links" && <LinksModal links={profile.links} onClose={() => setModal(null)} onSave={(f) => { updateLinks(f); showToast("Links updated.", "success"); }} />}

      {expModal && (
        <ExperienceModal
          initial={expModal === "new" ? null : expModal.initial}
          onClose={() => setExpModal(null)}
          onSave={(data) => {
            if (expModal === "new") addExperience(data); else updateExperience(expModal.initial.id, data);
            showToast(expModal === "new" ? "Experience added." : "Experience updated.", "success");
          }}
        />
      )}

      {eduModal && (
        <EducationModal
          initial={eduModal === "new" ? null : eduModal.initial}
          onClose={() => setEduModal(null)}
          onSave={(data) => {
            if (eduModal === "new") addEducation(data); else updateEducation(eduModal.initial.id, data);
            showToast(eduModal === "new" ? "Education added." : "Education updated.", "success");
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={`Remove this ${deleteTarget.type}?`}
          message={`"${deleteTarget.label}" will be removed from your profile.`}
          confirmLabel="Remove"
          tone="danger"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  );
}
