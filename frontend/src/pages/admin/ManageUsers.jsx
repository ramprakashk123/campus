import { useState, useEffect } from 'react';
import { UserPlus, Search, Trash2, Edit, Users as UsersIcon } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import API from '../../utils/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line
  useEffect(() => { fetchUsers(); }, []);

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await API.post('/auth/faculty', {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        department: formData.get('department'),
        phone: formData.get('phone'),
      });
      toast.success('Faculty created successfully!');
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create faculty');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    try {
      await API.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'All' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Users</h1>
          <p className="text-slate-400 mt-1">{users.length} total users</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary btn-sm">
          <UserPlus size={16} /> Add Faculty
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input-dark pl-11"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Admin', 'Faculty', 'Student'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                filterRole === role
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user._id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                        user.role === 'Admin' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' :
                        user.role === 'Faculty' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                        'bg-gradient-to-br from-blue-500 to-cyan-600'
                      }`}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      user.role === 'Admin' ? 'bg-indigo-500/15 text-indigo-400' :
                      user.role === 'Faculty' ? 'bg-emerald-500/15 text-emerald-400' :
                      'bg-blue-500/15 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-400">{user.department || '—'}</td>
                  <td className="p-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    {user.role !== 'Admin' && (
                      <button onClick={() => handleDelete(user._id, user.name)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Faculty Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Faculty">
        <form onSubmit={handleCreateFaculty} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name *</label>
            <input name="name" required className="input-dark" placeholder="Dr. John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email *</label>
            <input name="email" type="email" required className="input-dark" placeholder="faculty@campus.edu" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password *</label>
            <input name="password" type="password" required className="input-dark" placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Department</label>
              <select name="department" className="input-dark">
                <option value="">Select</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="IT">IT</option>
                <option value="AIDS">AI & DS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
              <input name="phone" className="input-dark" placeholder="+91 ..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Create Faculty</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageUsers;
