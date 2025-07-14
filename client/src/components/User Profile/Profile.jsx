import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../../api";
import "../../styles/User profile css/Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  /* ---------------- state ---------------- */
  const [user, setUser] = useState(null); // fetched user
  const [busy, setBusy] = useState(false); // global spinner
  const [toast, setToast] = useState({ msg: "", variant: "" });

  const [form, setForm] = useState({
    name: "",
    age: "",
    profession: "",
  });

  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [deletePwd, setDeletePwd] = useState("");

  /* ---------------- fetch on mount ---------------- */
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const data = await getProfile();
        setUser(data);
        setForm({
          name: data.name || "",
          age: data.age || "",
          profession: data.profession || "",
        });
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      }
    })();
  }, [navigate]);

  /* ---------------- helpers ---------------- */
  const pop = (msg, variant = "error") =>
    setToast({ msg, variant }) ||
    setTimeout(() => setToast({ msg: "", variant: "" }), 4000);

  const handleField = (e, setter) =>
    setter((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ---------------- submit handlers ---------------- */
  const saveProfile = async (e) => {
    e.preventDefault();
    const { name, age, profession } = form;
    if (!name || !age || !profession) return pop("Please fill in all fields");
    setBusy(true);
    try {
      await updateProfile(form);
      setUser((u) => ({ ...u, ...form }));
      pop("Profile updated", "success");
    } catch {
      pop("Update failed");
    } finally {
      setBusy(false);
    }
  };

  const changePwd = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword } = pwd;
    if (!currentPassword || !newPassword) return pop("Fill both passwords");
    setBusy(true);
    try {
      await changePassword(pwd);
      pop("Password changed", "success");
      setPwd({ currentPassword: "", newPassword: "" });
    } catch {
      pop("Change failed");
    } finally {
      setBusy(false);
    }
  };

  const removeAccount = async (e) => {
    e.preventDefault();
    if (!deletePwd) return pop("Enter password");
    if (!window.confirm("This action is irreversible. Continue?")) return;
    setBusy(true);
    try {
      await deleteAccount({ password: deletePwd });
      localStorage.clear();
      navigate("/login");
    } catch {
      pop("Deletion failed");
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user)
    return (
      <div className="profile__loading">
        <div className="profile__spinner" />
      </div>
    );

  /* ---------------- JSX ---------------- */
  return (
    <div className="profile">
      {/* floating gradient rings (same as login/register) */}
      <div className="profile__ring profile__ring--one" />
      <div className="profile__ring profile__ring--two" />

      {/* glass card */}
      <div className="profile__card">
        <div className="profile__card-left">
          <h2
            className="profile__title"
            data-initials={user.name ? user.name[0].toUpperCase() : "U"}
          >
            Hi, {user.name}
          </h2>
          <p className="profile__subtitle">{user.email}</p>

          <button className="profile__logout" onClick={logout}>
            Logout
          </button>

          {toast.msg && (
            <p className={`profile__toast profile__toast--${toast.variant}`}>
              {toast.msg}
            </p>
          )}

          {/* ---- Delete Account (moved here) ---- */}
          {!user.isGoogleAccount && (
            <form
              onSubmit={removeAccount}
              className="profile__form"
              style={{ marginTop: 24 }}
            >
              <h3>Delete Account</h3>
              <input
                className="profile__input"
                placeholder="Confirm Password"
                type="password"
                value={deletePwd}
                onChange={(e) => setDeletePwd(e.target.value)}
                disabled={busy}
              />
              <button
                className="profile__btn profile__btn--danger"
                disabled={busy}
              >
                {busy ? "Deleting…" : "Delete"}
              </button>
            </form>
          )}
        </div>

        <div className="profile__card-right">
          {/* ---- Update ---- */}
          <form onSubmit={saveProfile} className="profile__form">
            <h3>Update Profile</h3>
            <input
              className="profile__input"
              placeholder="Full Name"
              name="name"
              value={form.name}
              onChange={(e) => handleField(e, setForm)}
              disabled={busy}
            />
            <div className="profile__age-wrap">
              <input
                className="profile__input profile__input--age"
                type="number"
                name="age"
                min="18"
                value={form.age}
                onChange={(e) => handleField(e, setForm)}
                disabled={busy}
              />
              <button
                type="button"
                className="age-btn age-btn--dec"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    age: Math.max(18, +p.age - 1 || 18),
                  }))
                }
                disabled={busy}
              >
                –
              </button>
              <button
                type="button"
                className="age-btn age-btn--inc"
                onClick={() =>
                  setForm((p) => ({ ...p, age: +p.age + 1 || 18 }))
                }
                disabled={busy}
              >
                +
              </button>
            </div>
            <input
              className="profile__input"
              placeholder="Profession"
              name="profession"
              value={form.profession}
              onChange={(e) => handleField(e, setForm)}
              disabled={busy}
            />
            <button className="profile__btn" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
          </form>

          {/* ---- Password ---- */}
          {!user.isGoogleAccount && (
            <form onSubmit={changePwd} className="profile__form">
              <h3>Change Password</h3>
              <input
                className="profile__input"
                placeholder="Current Password"
                type="password"
                name="currentPassword"
                value={pwd.currentPassword}
                onChange={(e) => handleField(e, setPwd)}
                disabled={busy}
              />
              <input
                className="profile__input"
                placeholder="New Password"
                type="password"
                name="newPassword"
                value={pwd.newPassword}
                onChange={(e) => handleField(e, setPwd)}
                disabled={busy}
              />
              <button className="profile__btn" disabled={busy}>
                {busy ? "Changing…" : "Change"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
