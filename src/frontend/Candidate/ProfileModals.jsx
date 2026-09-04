import { useState } from "react";
import { Modal } from "./Modal";

export function PersonalInfoModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({
    firstName: profile.firstName, lastName: profile.lastName, headline: profile.headline,
    bio: profile.bio, email: profile.email, phone: profile.phone, location: profile.location,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    onSave(form);
    onClose();
  };

  return (
    <Modal
      title="Edit Personal Information"
      onClose={onClose}
      width={520}
      footer={<>
        <button className="outline-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" onClick={save}>Save Changes</button>
      </>}
    >
      <div className="co-field-row">
        <div className="co-field">
          <label>First Name</label>
          <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          {errors.firstName && <small className="co-field-error">{errors.firstName}</small>}
        </div>
        <div className="co-field">
          <label>Last Name</label>
          <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          {errors.lastName && <small className="co-field-error">{errors.lastName}</small>}
        </div>
      </div>
      <div className="co-field"><label>Professional Headline</label><input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></div>
      <div className="co-field"><label>About / Bio</label><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
      <div className="co-field-row">
        <div className="co-field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <small className="co-field-error">{errors.email}</small>}
        </div>
        <div className="co-field"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      </div>
      <div className="co-field"><label>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
    </Modal>
  );
}

export function ProfessionalInfoModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({
    currentPosition: profile.currentPosition, currentCompany: profile.currentCompany, yearsExperience: profile.yearsExperience,
  });
  return (
    <Modal
      title="Edit Professional Information"
      onClose={onClose}
      width={480}
      footer={<>
        <button className="outline-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" onClick={() => { onSave(form); onClose(); }}>Save Changes</button>
      </>}
    >
      <div className="co-field"><label>Current Position</label><input value={form.currentPosition} onChange={(e) => setForm({ ...form, currentPosition: e.target.value })} /></div>
      <div className="co-field"><label>Current Company</label><input value={form.currentCompany} onChange={(e) => setForm({ ...form, currentCompany: e.target.value })} /></div>
      <div className="co-field"><label>Years of Experience</label><input value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })} /></div>
    </Modal>
  );
}

export function LinksModal({ links, onClose, onSave }) {
  const [form, setForm] = useState({ ...links });
  return (
    <Modal
      title="Edit Links"
      onClose={onClose}
      width={480}
      footer={<>
        <button className="outline-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" onClick={() => { onSave(form); onClose(); }}>Save Changes</button>
      </>}
    >
      <div className="co-field"><label>LinkedIn</label><input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} /></div>
      <div className="co-field"><label>GitHub</label><input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} /></div>
      <div className="co-field"><label>Portfolio</label><input value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} /></div>
      <div className="co-field"><label>Personal Website</label><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
    </Modal>
  );
}

export function ExperienceModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || { company: "", position: "", start: "", end: "", current: false, description: "" });
  const valid = form.company.trim() && form.position.trim() && form.start;

  return (
    <Modal
      title={initial ? "Edit Experience" : "Add Experience"}
      onClose={onClose}
      width={520}
      footer={<>
        <button className="outline-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" disabled={!valid} onClick={() => { onSave(form); onClose(); }}>Save</button>
      </>}
    >
      <div className="co-field-row">
        <div className="co-field"><label>Position <span className="required">*</span></label><input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
        <div className="co-field"><label>Company <span className="required">*</span></label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
      </div>
      <div className="co-field-row">
        <div className="co-field"><label>Start Date <span className="required">*</span></label><input type="month" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></div>
        <div className="co-field"><label>End Date</label><input type="month" value={form.end} disabled={form.current} onChange={(e) => setForm({ ...form, end: e.target.value })} /></div>
      </div>
      <label className="co-field-check" style={{ marginBottom: 16 }}>
        <input type="checkbox" checked={form.current} onChange={(e) => setForm({ ...form, current: e.target.checked, end: e.target.checked ? "" : form.end })} />
        I currently work here
      </label>
      <div className="co-field"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
    </Modal>
  );
}

export function EducationModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || { institution: "", degree: "", field: "", start: "", end: "" });
  const valid = form.institution.trim() && form.degree.trim();

  return (
    <Modal
      title={initial ? "Edit Education" : "Add Education"}
      onClose={onClose}
      width={520}
      footer={<>
        <button className="outline-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" disabled={!valid} onClick={() => { onSave(form); onClose(); }}>Save</button>
      </>}
    >
      <div className="co-field"><label>Institution <span className="required">*</span></label><input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} /></div>
      <div className="co-field-row">
        <div className="co-field"><label>Degree <span className="required">*</span></label><input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} /></div>
        <div className="co-field"><label>Field of Study</label><input value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} /></div>
      </div>
      <div className="co-field-row">
        <div className="co-field"><label>Start Date</label><input type="month" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></div>
        <div className="co-field"><label>End Date</label><input type="month" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></div>
      </div>
    </Modal>
  );
}
