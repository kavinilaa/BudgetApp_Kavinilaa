package com.infosys.controller;

import com.infosys.model.ForumPost;
import com.infosys.model.ForumComment;
import com.infosys.model.User;
import com.infosys.repository.ForumPostRepository;
import com.infosys.repository.ForumCommentRepository;
import com.infosys.repository.UserRepository;
import com.infosys.config.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Forum", description = "Community forum endpoints")
public class ForumController {

    @Autowired
    private ForumPostRepository forumPostRepository;

    @Autowired
    private ForumCommentRepository forumCommentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/posts")
    @Operation(summary = "Get all forum posts", description = "Retrieve all forum posts")
    public ResponseEntity<?> getAllPosts() {
        try {
            List<ForumPost> posts = forumPostRepository.findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error fetching posts: " + e.getMessage()));
        }
    }

    @GetMapping("/posts/{id}")
    @Operation(summary = "Get post by ID", description = "Retrieve a specific forum post with comments")
    public ResponseEntity<?> getPostById(@PathVariable Long id) {
        try {
            ForumPost post = forumPostRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            List<ForumComment> comments = forumCommentRepository.findByPostIdOrderByCreatedAtDesc(id);
            return ResponseEntity.ok(Map.of("post", post, "comments", comments));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/posts")
    @Operation(summary = "Create forum post", description = "Create a new forum post")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> createPost(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> request) {
        try {
            System.out.println("Creating forum post...");
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            System.out.println("User email: " + email);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            System.out.println("User found: " + user.getName() + " (ID: " + user.getId() + ")");
            
            ForumPost post = new ForumPost();
            post.setUserId(user.getId());
            post.setUserName(user.getName() != null ? user.getName() : user.getUsername());
            post.setTitle(request.get("title"));
            post.setContent(request.get("content"));
            post.setCategory(request.get("category"));
            post.setCreatedAt(LocalDateTime.now());
            post.setUpdatedAt(LocalDateTime.now());
            post.setLikesCount(0);
            
            System.out.println("Saving post...");
            ForumPost savedPost = forumPostRepository.save(post);
            System.out.println("Post saved successfully with ID: " + savedPost.getId());
            
            return ResponseEntity.ok(savedPost);
        } catch (Exception e) {
            System.err.println("Error creating post: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error creating post: " + e.getMessage()));
        }
    }

    @PostMapping("/posts/{id}/comments")
    @Operation(summary = "Add comment", description = "Add a comment to a forum post")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> addComment(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            ForumPost post = forumPostRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            
            ForumComment comment = new ForumComment();
            comment.setPostId(id);
            comment.setUserId(user.getId());
            comment.setUserName(user.getName() != null ? user.getName() : user.getUsername());
            comment.setContent(request.get("content"));
            comment.setCreatedAt(LocalDateTime.now());
            
            ForumComment savedComment = forumCommentRepository.save(comment);
            
            // Update comments count is handled automatically by database
            
            return ResponseEntity.ok(savedComment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error adding comment: " + e.getMessage()));
        }
    }

    @PostMapping("/posts/{id}/like")
    @Operation(summary = "Like post", description = "Like or unlike a forum post")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> likePost(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            ForumPost post = forumPostRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            
            // Toggle like
            post.setLikesCount(post.getLikesCount() + 1);
            forumPostRepository.save(post);
            
            return ResponseEntity.ok(Map.of("message", "Post liked", "likesCount", post.getLikesCount()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error liking post: " + e.getMessage()));
        }
    }

    @DeleteMapping("/posts/{id}")
    @Operation(summary = "Delete post", description = "Delete a forum post")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> deletePost(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            ForumPost post = forumPostRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            
            if (!post.getUserId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "You can only delete your own posts"));
            }
            
            // Delete all comments first
            forumCommentRepository.deleteByPostId(id);
            forumPostRepository.delete(post);
            
            return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error deleting post: " + e.getMessage()));
        }
    }
    
    @PutMapping("/posts/{id}")
    @Operation(summary = "Update post", description = "Update a forum post")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> updatePost(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            ForumPost post = forumPostRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            
            if (!post.getUserId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "You can only edit your own posts"));
            }
            
            // Update fields
            if (request.containsKey("title")) {
                post.setTitle(request.get("title"));
            }
            if (request.containsKey("content")) {
                post.setContent(request.get("content"));
            }
            if (request.containsKey("category")) {
                post.setCategory(request.get("category"));
            }
            post.setUpdatedAt(LocalDateTime.now());
            
            ForumPost updatedPost = forumPostRepository.save(post);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error updating post: " + e.getMessage()));
        }
    }
}
