import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" });
  const [editPost, setEditPost] = useState({ title: "", content: "", category: "General" });
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const currentUserId = localStorage.getItem("userId");
  const currentUserEmail = localStorage.getItem("userEmail");

  const categories = ["All", "General", "Budgeting Tips", "Saving Strategies", "Investment", "Debt Management", "Q&A"];

  // Debug logging
  console.log("Current User ID from localStorage:", currentUserId);
  console.log("Current User Email:", currentUserEmail);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:9090/api/forum/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:9090/api/forum/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPost),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewPost({ title: "", content: "", category: "General" });
        fetchPosts();
        alert("✅ Post created successfully!");
      } else {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Unknown error";
        
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          errorMessage = error.message || "Unknown error";
        } else {
          errorMessage = await response.text();
        }
        
        console.error("Failed to create post:", errorMessage);
        alert("❌ Failed to create post: " + errorMessage);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post: " + error.message);
    }
  };

  const handleEditPostSubmit = async () => {
    if (!editPost.title.trim() || !editPost.content.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:9090/api/forum/posts/${editingPost.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editPost),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingPost(null);
        setEditPost({ title: "", content: "", category: "General" });
        fetchPosts();
        alert("Post updated successfully!");
      } else {
        const error = await response.json();
        alert("Failed to update post: " + (error.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Error updating post: " + error.message);
    }
  };

  const handleDeletePost = async (postId, event) => {
    if (event) event.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:9090/api/forum/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPosts();
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(null);
        }
        alert("Post deleted successfully!");
      } else {
        const error = await response.json();
        alert("Failed to delete post: " + (error.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error deleting post: " + error.message);
    }
  };

  const openEditModal = (post, event) => {
    if (event) event.stopPropagation();
    setEditingPost(post);
    setEditPost({
      title: post.title,
      content: post.content,
      category: post.category
    });
    setShowEditModal(true);
  };

  const handleViewPost = async (post) => {
    setSelectedPost(post);
    try {
      const response = await fetch(`http://localhost:9090/api/forum/posts/${post.id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:9090/api/forum/posts/${selectedPost.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: newComment }),
        }
      );

      if (response.ok) {
        setNewComment("");
        handleViewPost(selectedPost);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:9090/api/forum/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const filteredPosts = filterCategory === "All" 
    ? posts 
    : posts.filter(post => post.category === filterCategory);

  return (
    <>
      <Sidebar />
      <div style={{ marginLeft: "280px", minHeight: "100vh", background: "#E8EAF6" }}>
        <Navbar />
        <div style={{ padding: "30px" }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "20px",
            padding: "40px",
            marginBottom: "30px",
            color: "white"
          }}>
            <h1 style={{ margin: "0 0 10px 0", fontSize: "36px" }}>💬 Community Forum</h1>
            <p style={{ margin: "0 0 20px 0", fontSize: "16px", opacity: 0.9 }}>
              Share tips, ask questions, and connect with the budget community
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: "12px 30px",
                background: "white",
                color: "#667eea",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
              }}
              onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
            >
              ✏️ Create New Post
            </button>
          </div>

          {/* Category Filter */}
          <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                style={{
                  padding: "8px 16px",
                  background: filterCategory === cat ? "#667eea" : "white",
                  color: filterCategory === cat ? "white" : "#667eea",
                  border: "2px solid #667eea",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div style={{ display: "grid", gap: "20px" }}>
            {filteredPosts.length === 0 ? (
              <div style={{
                background: "white",
                padding: "60px",
                borderRadius: "15px",
                textAlign: "center",
                color: "#666"
              }}>
                <p style={{ fontSize: "18px", margin: 0 }}>
                  No posts yet. Be the first to start a conversation! 🎉
                </p>
              </div>
            ) : (
              filteredPosts.map(post => (
                <div
                  key={post.id}
                  style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "15px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                  onClick={() => handleViewPost(post)}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                    <div>
                      <span style={{
                        background: "#E8EAF6",
                        color: "#5C6BC0",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        {post.category}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <div style={{ color: "#999", fontSize: "14px" }}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                      {(() => {
                        const isOwner = post.userId === parseInt(currentUserId);
                        console.log(`Post ${post.id}: userId=${post.userId}, currentUserId=${currentUserId}, isOwner=${isOwner}`);
                        return isOwner;
                      })() && (
                        <>
                          <button
                            onClick={(e) => openEditModal(post, e)}
                            style={{
                              background: "#4CAF50",
                              color: "white",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              cursor: "pointer",
                              fontWeight: "600"
                            }}
                            title="Edit post"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={(e) => handleDeletePost(post.id, e)}
                            style={{
                              background: "#f44336",
                              color: "white",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              cursor: "pointer",
                              fontWeight: "600"
                            }}
                            title="Delete post"
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <h3 style={{ margin: "0 0 10px 0", color: "#1A237E", fontSize: "20px" }}>
                    {post.title}
                  </h3>
                  
                  <p style={{ margin: "0 0 15px 0", color: "#666", lineHeight: "1.6" }}>
                    {post.content.substring(0, 150)}{post.content.length > 150 ? "..." : ""}
                  </p>
                  
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <span style={{ color: "#999", fontSize: "14px" }}>
                      👤 {post.userName}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikePost(post.id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#666",
                        fontSize: "14px"
                      }}
                    >
                      ❤️ {post.likesCount || 0}
                    </button>
                    <span style={{ color: "#666", fontSize: "14px" }}>
                      💬 {post.comments?.length || 0} comments
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "20px",
            width: "90%",
            maxWidth: "600px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
          }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#1A237E" }}>✏️ Create New Post</h2>
            
            <label style={{ display: "block", marginBottom: "10px", color: "#666", fontWeight: "600" }}>
              Category
            </label>
            <select
              value={newPost.category}
              onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                border: "2px solid #E8EAF6",
                borderRadius: "10px",
                fontSize: "16px"
              }}
            >
              {categories.filter(c => c !== "All").map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <label style={{ display: "block", marginBottom: "10px", color: "#666", fontWeight: "600" }}>
              Title
            </label>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              placeholder="Enter post title..."
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                border: "2px solid #E8EAF6",
                borderRadius: "10px",
                fontSize: "16px"
              }}
            />

            <label style={{ display: "block", marginBottom: "10px", color: "#666", fontWeight: "600" }}>
              Content
            </label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="Share your thoughts..."
              rows="6"
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                border: "2px solid #E8EAF6",
                borderRadius: "10px",
                fontSize: "16px",
                fontFamily: "inherit",
                resize: "vertical"
              }}
            />

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: "12px 24px",
                  background: "#f5f5f5",
                  color: "#666",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                style={{
                  padding: "12px 24px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "20px",
            width: "90%",
            maxWidth: "600px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
          }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#1A237E" }}>✏️ Edit Post</h2>
            
            <label style={{ display: "block", marginBottom: "10px", color: "#666", fontWeight: "600" }}>
              Category
            </label>
            <select
              value={editPost.category}
              onChange={(e) => setEditPost({ ...editPost, category: e.target.value })}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                border: "2px solid #E8EAF6",
                borderRadius: "10px",
                fontSize: "16px"
              }}
            >
              {categories.filter(c => c !== "All").map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <label style={{ display: "block", marginBottom: "10px", color: "#666", fontWeight: "600" }}>
              Title
            </label>
            <input
              type="text"
              value={editPost.title}
              onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
              placeholder="Enter post title..."
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                border: "2px solid #E8EAF6",
                borderRadius: "10px",
                fontSize: "16px"
              }}
            />

            <label style={{ display: "block", marginBottom: "10px", color: "#666", fontWeight: "600" }}>
              Content
            </label>
            <textarea
              value={editPost.content}
              onChange={(e) => setEditPost({ ...editPost, content: e.target.value })}
              placeholder="Share your thoughts..."
              rows="6"
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                border: "2px solid #E8EAF6",
                borderRadius: "10px",
                fontSize: "16px",
                fontFamily: "inherit",
                resize: "vertical"
              }}
            />

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPost(null);
                }}
                style={{
                  padding: "12px 24px",
                  background: "#f5f5f5",
                  color: "#666",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditPostSubmit}
                style={{
                  padding: "12px 24px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Post Modal */}
      {selectedPost && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          overflow: "auto",
          padding: "20px"
        }}>
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "20px",
            width: "90%",
            maxWidth: "800px",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
              <div>
                <span style={{
                  background: "#E8EAF6",
                  color: "#5C6BC0",
                  padding: "6px 16px",
                  borderRadius: "15px",
                  fontSize: "13px",
                  fontWeight: "600"
                }}>
                  {selectedPost.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999"
                }}
              >
                ✕
              </button>
            </div>

            <h2 style={{ margin: "0 0 15px 0", color: "#1A237E" }}>{selectedPost.title}</h2>
            
            <div style={{ marginBottom: "20px", color: "#999", fontSize: "14px", display: "flex", gap: "20px" }}>
              <span>👤 {selectedPost.userName}</span>
              <span>📅 {new Date(selectedPost.createdAt).toLocaleString()}</span>
            </div>

            <p style={{ margin: "0 0 30px 0", color: "#666", lineHeight: "1.8", fontSize: "16px" }}>
              {selectedPost.content}
            </p>

            <div style={{ display: "flex", gap: "20px", paddingBottom: "30px", borderBottom: "2px solid #E8EAF6" }}>
              <button
                onClick={() => handleLikePost(selectedPost.id)}
                style={{
                  padding: "10px 20px",
                  background: "#FFE8E8",
                  color: "#FF6B6B",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                ❤️ Like ({selectedPost.likesCount || 0})
              </button>
            </div>

            <h3 style={{ margin: "30px 0 20px 0", color: "#1A237E" }}>
              💬 Comments ({comments.length})
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "10px",
                  border: "2px solid #E8EAF6",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "vertical"
                }}
              />
              <button
                onClick={handleAddComment}
                style={{
                  padding: "10px 20px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Post Comment
              </button>
            </div>

            <div style={{ display: "grid", gap: "15px" }}>
              {comments.map(comment => (
                <div
                  key={comment.id}
                  style={{
                    background: "#F8F9FF",
                    padding: "15px",
                    borderRadius: "10px",
                    borderLeft: "4px solid #667eea"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "600", color: "#1A237E", fontSize: "14px" }}>
                      {comment.userName}
                    </span>
                    <span style={{ color: "#999", fontSize: "12px" }}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "#666", lineHeight: "1.6" }}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ForumPage;
