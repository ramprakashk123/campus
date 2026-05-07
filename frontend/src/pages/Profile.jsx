import { useState, useEffect } from 'react';
import { User, Camera, Lock, Save, Mail, Phone, Building, BookOpen, Hash, Edit3 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import API from '../utils/api';

const Profile = () => {
  const { user, login } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    API.get('/profile').then((r) => { setProfile(r.data); setForm(r.data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      const res = await API.put('/profile', form);
      setProfile(res.data);
      login({ ...user, name: res.data.name, avatar: res.data.avatar });
      setEditing(false);
      setMsg('Profile updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Error updating');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) { setMsg('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { setMsg('Password must be at least 6 characters'); return; }
    setSaving(true); setMsg('');
    try {
      await API.put('/profile/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setMsg('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPw(false);
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Error changing password');
    } finally { setSaving(false); }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, avatar: reader.result });
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;

  const roleGradient = { Admin: 'from-indigo-500 to-purple-600', Faculty: 'from-emerald-500 to-teal-600', Student: 'from-blue-500 to-cyan-600' };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      {msg && <div className={`p-3 rounded-xl text-sm ${msg.includes('Error') || msg.includes('match') || msg.includes('least') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>{msg}</div>}

      {/* Avatar & Info Card */}
      <div className="glass-card p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            {form.avatar ? (
              <img src={form.avatar} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-2 border-white/10" />
            ) : (
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${roleGradient[user?.role]} flex items-center justify-center text-white text-3xl font-bold shadow-xl`}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            {editing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
            <p className="text-sm text-slate-400">{profile?.email}</p>
            <span className={`inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full ${
              user?.role === 'Admin' ? 'bg-indigo-500/15 text-indigo-400' :
              user?.role === 'Faculty' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'
            }`}>{user?.role}</span>
          </div>
          <div className="sm:ml-auto">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-primary btn-sm"><Edit3 size={14} /> Edit Profile</button>
            ) : (
              <button onClick={handleSave} disabled={saving} className="btn-primary btn-sm"><Save size={14} /> {saving ? 'Saving...' : 'Save'}</button>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field icon={User} label="Full Name" value={form.name} editing={editing} onChange={(v) => setForm({ ...form, name: v })} />
          <Field icon={Mail} label="Email" value={form.email} editing={false} />
          <Field icon={Phone} label="Phone" value={form.phone} editing={editing} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field icon={Building} label="Department" value={form.department} editing={editing} onChange={(v) => setForm({ ...form, department: v })} />
          {user?.role === 'Student' && <>
            <Field icon={Hash} label="Register No" value={form.registerNumber} editing={editing} onChange={(v) => setForm({ ...form, registerNumber: v })} />
            <Field icon={BookOpen} label="Year" value={form.year} editing={editing} onChange={(v) => setForm({ ...form, year: v })} type="number" />
          </>}
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Bio</label>
          {editing ? (
            <textarea value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-dark h-20 resize-none" placeholder="Tell us about yourself..." maxLength={500} />
          ) : (
            <p className="text-sm text-slate-300">{form.bio || 'No bio added yet'}</p>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Security</h3>
          <button onClick={() => setShowPw(!showPw)} className="btn-secondary btn-sm"><Lock size={14} /> Change Password</button>
        </div>
        {showPw && (
          <div className="space-y-3 animate-fade-in">
            <input type="password" placeholder="Current Password" className="input-dark" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
            <input type="password" placeholder="New Password" className="input-dark" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
            <input type="password" placeholder="Confirm New Password" className="input-dark" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
            <button onClick={handlePasswordChange} disabled={saving} className="btn-primary btn-sm">{saving ? 'Saving...' : 'Update Password'}</button>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ icon: Icon, label, value, editing, onChange, type = 'text' }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5"><Icon size={12} /> {label}</label>
    {editing && onChange ? (
      <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} className="input-dark" />
    ) : (
      <p className="text-sm text-slate-300 py-2.5 px-4">{value || '—'}</p>
    )}
  </div>
);

export default Profile;
