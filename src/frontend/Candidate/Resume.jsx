import { useRef, useState } from "react";
import { UploadCloud, FileText, Star, Trash2, Eye, Download, RefreshCcw } from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";
import { useCandidateToast } from "./CandidateToastContext";
import { ConfirmDialog } from "./Modal";

export default function Resume() {
  const { resumes, uploadResume, deleteResume, replaceResume, setPrimaryResume } = useCandidateData();
  const { showToast } = useCandidateToast();
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Ref tracks which resume id the replace file-input is targeting.
  // Using a ref (not state) so the value is available synchronously
  // inside handleReplace's closure regardless of React's async state flush.
  const replaceTargetRef = useRef(null);

  const handleFiles = async (files) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadResume(file);
      showToast(`${file.name} uploaded.`, "success");
    } catch (err) {
      showToast(err.message || "Upload failed. Please try a different file.", "error");
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected next time
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReplace = async (files) => {
    const file = files?.[0];
    const targetId = replaceTargetRef.current;
    if (!file || !targetId) return;
    setUploading(true);
    try {
      await replaceResume(targetId, file);
      showToast(`${file.name} re-uploaded successfully.`, "success");
    } catch (err) {
      showToast(err.message || "Replace failed. Please try again.", "error");
    } finally {
      setUploading(false);
      replaceTargetRef.current = null;
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const openReplace = (id) => {
    replaceTargetRef.current = id;
    requestAnimationFrame(() => replaceInputRef.current?.click());
  };

  const handleView = (resume) => {
    if (resume.dataUrl) {
      const win = window.open();
      if (win) win.document.write(`<iframe src="${resume.dataUrl}" style="border:0;width:100%;height:100vh;"></iframe>`);
    } else {
      showToast("File content unavailable — please re-upload to preview.", "info");
    }
  };

  return (
    <section className="overview-section">
      <div className="co-page-head">
        <div>
          <p className="co-eyebrow">DOCUMENTS</p>
          <h1>Resume</h1>
          <p>Upload, manage, and choose your primary resume for applications.</p>
        </div>
      </div>

      <div
        className="co-upload-zone"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <UploadCloud size={26} />
        <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5 }}>{uploading ? "Uploading…" : "Drag & drop or click to upload your resume"}</p>
        <p style={{ margin: "4px 0 0", fontSize: 12 }}>PDF, DOC or DOCX, up to 5 MB</p>
      </div>
      {/* Add-new upload input */}
      <input ref={fileInputRef} type="file" hidden accept=".pdf,.doc,.docx" onChange={(e) => handleFiles(e.target.files)} />
      {/* Replace-in-place upload input — triggered per-card, calls replaceResume */}
      <input ref={replaceInputRef} type="file" hidden accept=".pdf,.doc,.docx" onChange={(e) => handleReplace(e.target.files)} />

      <div className="co-resume-list" style={{ marginTop: 22 }}>
        {resumes.length === 0 && (
          <div className="co-empty-state">
            <div className="co-empty-icon"><FileText size={22} /></div>
            <h3>No resume uploaded</h3>
            <p>Upload a resume so you can apply to jobs faster.</p>
          </div>
        )}

        {resumes.map((r) => (
          <div className="co-resume-card" key={r.id}>
            <span className="co-file-icon" style={{ width: 44, height: 44 }}><FileText size={20} /></span>
            <div className="co-file-info" style={{ flex: 1, minWidth: 160 }}>
              <strong style={{ fontSize: 14 }}>{r.name}</strong>
              <span>{r.type} · {r.size} · Uploaded {r.uploadedDate}</span>
              {!r.dataUrl && (
                <span
                  title="File content is not available after a page refresh. Click to re-upload without creating a duplicate."
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#b45309",
                    background: "#fef3c7",
                    border: "1px solid #fde68a",
                    borderRadius: 4,
                    padding: "2px 6px",
                    cursor: "pointer",
                  }}
                  onClick={() => openReplace(r.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openReplace(r.id)}
                >
                  <RefreshCcw size={11} />
                  Session only — click to re-upload
                </span>
              )}
            </div>
            {r.isPrimary && <span className="co-resume-primary-badge">Primary</span>}
            <div className="co-file-actions" style={{ gap: 8 }}>
              {!r.isPrimary && (
                <button onClick={() => { setPrimaryResume(r.id); showToast(`${r.name} set as primary resume.`, "success"); }} aria-label="Set as primary">
                  <Star size={15} />
                </button>
              )}
              <button onClick={() => handleView(r)} aria-label="View resume"><Eye size={15} /></button>
              <button
                onClick={() => {
                  if (r.dataUrl) {
                    const a = document.createElement("a");
                    a.href = r.dataUrl;
                    a.download = r.name;
                    a.click();
                  } else {
                    showToast("File content unavailable — re-upload to download.", "info");
                  }
                }}
                aria-label="Download resume"
              >
                <Download size={15} />
              </button>
              {/* Replace button: updates blob in-place, no duplicate */}
              <button onClick={() => openReplace(r.id)} aria-label="Replace resume" title="Replace file content (no duplicate created)">
                <RefreshCcw size={15} />
              </button>
              <button onClick={() => setDeleteTarget(r)} aria-label="Delete resume"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this resume?"
          message={`"${deleteTarget.name}" will be permanently removed.`}
          confirmLabel="Delete"
          tone="danger"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { deleteResume(deleteTarget.id); showToast("Resume deleted.", "info"); setDeleteTarget(null); }}
        />
      )}
    </section>
  );
}
