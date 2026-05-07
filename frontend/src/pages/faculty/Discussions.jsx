import { useState, useEffect } from 'react';
import { MessageSquare, Send, Heart, Pin, Trash2 } from 'lucide-react';
import API from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';

const Discussions = () => {
  const { user } = useAuthStore();
  const [discussions, setDiscussions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [form, setForm] = useState({ title: '', body: '' });
  const [replyText, setReplyText] = useState({});
  const [showReply, setShowReply] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = user?.role === 'Faculty' ? '/courses/mine' : '/courses/enrolled';
    API.get(endpoint).then((r) => { setCourses(r.data); if (r.data.length > 0) setSelectedCourse(r.data[0]._id); }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (selectedCourse) API.get(`/discussions?course=${selectedCourse}`).then((r) => setDiscussions(r.data)).catch(() => {});
  }, [selectedCourse]);

  const handlePost = async () => {
    if (!form.title || !form.body) return;
    try {
      const res = await API.post('/discussions', { course: selectedCourse, title: form.title, body: form.body });
      setDiscussions([res.data, ...discussions]);
      setForm({ title: '', body: '' });
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleReply = async (id) => {
    if (!replyText[id]) return;
    try {
      const res = await API.post(`/discussions/${id}/reply`, { body: replyText[id] });
      setDiscussions(discussions.map((d) => d._id === id ? res.data : d));
      setReplyText({ ...replyText, [id]: '' });
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleLike = async (id) => {
    try {
      await API.put(`/discussions/${id}/like`);
      const res = await API.get(`/discussions?course=${selectedCourse}`);
      setDiscussions(res.data);
    } catch (e) {}
  };

  const handlePin = async (id) => {
    try {
      await API.put(`/discussions/${id}/pin`);
      const res = await API.get(`/discussions?course=${selectedCourse}`);
      setDiscussions(res.data);
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this discussion?')) return;
    await API.delete(`/discussions/${id}`);
    setDiscussions(discussions.filter((d) => d._id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-white">Discussion Forum</h1><p className="text-slate-400 mt-1">Engage in course discussions</p></div>

      <div className="flex gap-2 flex-wrap">
        {courses.map((c) => (
          <button key={c._id} onClick={() => setSelectedCourse(c._id)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${selectedCourse === c._id ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>{c.code}</button>
        ))}
      </div>

      {/* New Post */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Start a Discussion</h3>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-dark mb-3" placeholder="Discussion title..." />
        <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="input-dark h-20 resize-none mb-3" placeholder="What's on your mind?" />
        <button onClick={handlePost} className="btn-primary btn-sm"><Send size={14} /> Post</button>
      </div>

      {/* Threads */}
      <div className="space-y-4">
        {discussions.length === 0 ? <p className="text-sm text-slate-500 text-center py-12">No discussions yet. Start one!</p> : (
          discussions.map((d) => (
            <div key={d._id} className={`glass-card p-5 ${d.isPinned ? 'border-indigo-500/30' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{d.author?.name?.charAt(0)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      {d.isPinned && <Pin size={12} className="text-indigo-400" />}
                      <h3 className="text-sm font-semibold text-white">{d.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500">{d.author?.name} • {d.author?.role} • {new Date(d.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-300 mt-2">{d.body}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleLike(d._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1">
                    <Heart size={14} fill={d.likes?.includes(user?._id) ? 'currentColor' : 'none'} /> <span className="text-[10px]">{d.likes?.length || 0}</span>
                  </button>
                  {(user?.role === 'Faculty' || user?.role === 'Admin') && (
                    <button onClick={() => handlePin(d._id)} className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-400 transition-colors"><Pin size={14} /></button>
                  )}
                  {(d.author?._id === user?._id || user?.role === 'Faculty' || user?.role === 'Admin') && (
                    <button onClick={() => handleDelete(d._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>

              {/* Replies */}
              {d.replies?.length > 0 && (
                <div className="mt-4 ml-11 space-y-3 border-l-2 border-white/5 pl-4">
                  {d.replies.map((r, i) => (
                    <div key={r._id || i} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-[10px] text-slate-400 font-bold flex-shrink-0">{r.author?.name?.charAt(0)}</div>
                      <div>
                        <p className="text-xs text-slate-500">{r.author?.name} • {new Date(r.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm text-slate-300">{r.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              <div className="mt-3 ml-11">
                <button onClick={() => setShowReply({ ...showReply, [d._id]: !showReply[d._id] })} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  <MessageSquare size={12} className="inline mr-1" /> Reply ({d.replies?.length || 0})
                </button>
                {showReply[d._id] && (
                  <div className="flex gap-2 mt-2 animate-fade-in">
                    <input value={replyText[d._id] || ''} onChange={(e) => setReplyText({ ...replyText, [d._id]: e.target.value })} className="input-dark flex-1 text-xs" placeholder="Write a reply..." onKeyDown={(e) => e.key === 'Enter' && handleReply(d._id)} />
                    <button onClick={() => handleReply(d._id)} className="btn-primary btn-sm"><Send size={12} /></button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Discussions;
