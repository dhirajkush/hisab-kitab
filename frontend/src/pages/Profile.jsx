import React, { useRef, useState } from "react";
import { User, Mail, Shield, Lock, Eye, EyeOff, X, AlertCircle, Camera, Loader2 } from "lucide-react";
import { profileStyles as s, modalStyles as m } from "../assets/dummyStyles";
import api from "../utils/api";
import { resizeImageToDataUrl } from "../utils/image";

const Profile = ({ user, onUpdateUser }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [picError, setPicError] = useState("");
  const fileInputRef = useRef(null);

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  const handlePicChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPicError("Please choose an image file");
      return;
    }

    setPicError("");
    setUploadingPic(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      const { data } = await api.put("/user/profile-pic", { profilePic: dataUrl });
      if (data.success) onUpdateUser(data.user);
    } catch (err) {
      setPicError(err.response?.data?.message || "Failed to update picture");
    } finally {
      setUploadingPic(false);
    }
  };

  return (
    <div className={s.container}>
      <div className={s.mainContainer}>
        <div className={s.header}>
          <div className={`${s.avatar} relative group`}>
            {user?.profilePic ? (
              <img src={user.profilePic} alt={user?.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-white">{initial}</span>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPic}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/40 transition-colors"
              title="Change photo"
            >
              {uploadingPic ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePicChange}
              className="hidden"
            />
          </div>
          {picError && <p className="text-sm text-red-100 mt-2">{picError}</p>}
          <h1 className={s.userName}>{user?.name || "User"}</h1>
          <p className={s.userEmail}>{user?.email}</p>
        </div>

        <div className={s.content}>
          <div className={s.grid}>
            <div className={s.card}>
              <h2 className={s.cardTitle}>
                <User className={s.icon} /> Profile Information
              </h2>
              <div className="space-y-3 mb-4">
                <div>
                  <p className={s.label}>Name</p>
                  <p className="text-gray-800 font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className={s.label}>Email</p>
                  <p className="text-gray-800 font-medium">{user?.email}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(true)} className={s.editButton}>
                Edit Profile
              </button>
            </div>

            <div className={s.card}>
              <h2 className={s.cardTitle}>
                <Shield className={s.icon} /> Security
              </h2>
              <div className={s.securityItem}>
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span className={s.securityText}>Password</span>
                </div>
                <button onClick={() => setShowPasswordModal(true)} className={s.changeButton}>
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => {
            onUpdateUser(updated);
            setShowEditModal(false);
          }}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};

const EditProfileModal = ({ user, onClose, onSaved }) => {
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const { data } = await api.put("/user/profile", form);
      if (data.success) onSaved(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={m.overlay} onClick={onClose}>
      <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>Edit Profile</h2>
          <button onClick={onClose} className={m.closeButton}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={s.label}>Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`${s.input} pl-9`}
              />
            </div>
          </div>
          <div>
            <label className={s.label}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`${s.input} pl-9`}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className={s.buttonSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={s.buttonPrimary}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put("/user/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      if (data.success) {
        setSuccess(true);
        setTimeout(onClose, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={m.overlay} onClick={onClose}>
      <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>Change Password</h2>
          <button onClick={onClose} className={m.closeButton}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
        {success && <p className="mb-4 text-sm text-green-600">Password changed successfully.</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "currentPassword", label: "Current Password" },
            { key: "newPassword", label: "New Password" },
            { key: "confirmPassword", label: "Confirm New Password" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className={s.passwordLabel}>{label}</label>
              <div className={s.passwordContainer}>
                <input
                  type={show ? "text" : "password"}
                  required
                  minLength={key === "currentPassword" ? undefined : 8}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={s.input}
                />
                <button
                  type="button"
                  onClick={() => setShow((p) => !p)}
                  className={s.passwordToggle}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className={s.buttonSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={s.buttonPrimary}>
              {saving ? "Saving..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
