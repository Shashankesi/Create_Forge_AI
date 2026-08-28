import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { useToast } from '../../context/ToastContext';
import { commentService } from '../../services/commentService';

export const AssetReviewModal = ({ isOpen, onClose, assetType, assetId, assetTitle }) => {
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState({});

  const fetchComments = async () => {
    if (!assetType || !assetId) return;
    try {
      const res = await commentService.getComments(assetType, assetId);
      if (res.success) {
        setComments(res.comments || []);
      }
    } catch {
      showToast('Failed to load comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, assetType, assetId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await commentService.addComment({
        assetType,
        assetId,
        content: newComment.trim(),
      });

      if (res.success && res.comment) {
        setComments([res.comment, ...comments]);
        setNewComment('');
        showToast('Comment added', 'success');
      }
    } catch {
      showToast('Failed to add comment', 'error');
    }
  };

  const handleToggleResolve = async (commentId) => {
    try {
      const res = await commentService.toggleResolve(commentId);
      if (res.success && res.comment) {
        setComments(comments.map((c) => (c._id === commentId ? res.comment : c)));
      }
    } catch {
      showToast('Failed to update comment status', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div>
            <h3 className="text-base font-bold text-slate-100">Asset Review & Comments</h3>
            <p className="text-xs text-slate-400">{assetTitle || `${assetType} review`}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="Add feedback e.g. 'Make this tone more premium'..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button type="submit" size="xs">Post</Button>
          </form>

          {/* Comment List */}
          {comments.map((c) => (
            <div
              key={c._id}
              className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                c.status === 'resolved'
                  ? 'bg-slate-950/40 border-slate-900 opacity-60'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-400">{c.authorName}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleToggleResolve(c._id)}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 font-semibold"
                  >
                    {c.status === 'resolved' ? '✓ Resolved' : '○ Resolve'}
                  </button>
                </div>
              </div>
              <p className="text-slate-200">{c.content}</p>
            </div>
          ))}

          {comments.length === 0 && !loading && (
            <p className="py-8 text-center text-xs text-slate-500">No review comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
