import React, { useState, useEffect } from 'react';
import { createComment, getPollComments, deleteComment } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaTrash, FaReply } from 'react-icons/fa';
import './CommentSection.css';

const CommentSection = ({ pollId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [pollId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await getPollComments(pollId);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const commentData = {
        pollId,
        content: newComment,
        parentCommentId: replyTo
      };
      
      const comment = await createComment(commentData);
      
      if (replyTo) {
        // Add reply to existing comment
        setComments(prevComments => 
          prevComments.map(c => 
            c._id === replyTo 
              ? { ...c, replies: [...(c.replies || []), comment] }
              : c
          )
        );
      } else {
        // Add new top-level comment
        setComments(prevComments => [comment, ...prevComments]);
      }
      
      setNewComment('');
      setReplyTo(null);
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId);
      setComments(prevComments => 
        prevComments.filter(c => c._id !== commentId)
      );
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInMinutes = Math.floor((now - commentDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const CommentItem = ({ comment, isReply = false }) => (
    <div className={`comment-item ${isReply ? 'reply' : ''}`}>
      <div className="comment-header">
        <img 
          src={comment.author?.profilePicture || `https://ui-avatars.com/api/?name=${comment.author?.username}&background=random&size=40`}
          alt={comment.author?.username}
          className="comment-avatar"
        />
        <div className="comment-meta">
          <span className="comment-author">{comment.author?.username}</span>
          <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
        </div>
        <div className="comment-actions">
          {!isReply && (
            <button 
              className="reply-btn"
              onClick={() => setReplyTo(comment._id)}
            >
              <FaReply />
            </button>
          )}
          {comment.author?._id === user._id && (
            <button 
              className="delete-btn"
              onClick={() => handleDeleteComment(comment._id)}
            >
              <FaTrash />
            </button>
          )}
        </div>
      </div>
      <div className="comment-content">
        {comment.content}
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map(reply => (
            <CommentItem key={reply._id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="comment-section">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="comment-section">
      <div className="comment-header">
        <h3>Comments ({comments.length})</h3>
      </div>
      
      <form className="comment-form" onSubmit={handleSubmitComment}>
        <div className="comment-input-container">
          <img 
            src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName}&background=random&size=40`}
            alt={user.username}
            className="comment-avatar"
          />
          <div className="comment-input-wrapper">
            {replyTo && (
              <div className="reply-indicator">
                <span>Replying to comment</span>
                <button 
                  type="button" 
                  onClick={() => setReplyTo(null)}
                  className="cancel-reply"
                >
                  Cancel
                </button>
              </div>
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
              maxLength={500}
              disabled={submitting}
            />
            <button 
              type="submit" 
              disabled={!newComment.trim() || submitting}
              className="submit-comment-btn"
            >
              {submitting ? <div className="spinner"></div> : <FaPaperPlane />}
            </button>
          </div>
        </div>
      </form>

      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment._id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;