import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList,
  TextInput, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/theme';

const AVATAR_COLORS = [
  '#e53935', '#8e24aa', '#3949ab', '#00897b', '#43a047',
  '#ef6c00', '#6d4c41', '#546e7a', '#d81b60', '#1e88e5',
];
const CATEGORY_COLORS = {
  Mewing: '#7c4dff', Skincare: '#00bfa5', Jawline: '#ff6d00', Hair: '#aa00ff',
  Nutrition: '#00c853', Progress: '#0066ff', Questions: '#ffd600',
};

const getInitials = (n) => n ? n.slice(0, 2).toUpperCase() : '?';
const getAvatarColor = (n) => {
  let h = 0;
  for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};
const getTimeAgo = (ts) => {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const hrs = Math.floor(m / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
};

const REPLY_KEY = '@forum_replies_';

const PostDetailScreen = ({ route, navigation }) => {
  const { post } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(post.upvotes || 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const catColor = CATEGORY_COLORS[post.category] || COLORS.accent;
  const avatarColor = getAvatarColor(post.username);

  useEffect(() => {
    loadComments();
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const loadComments = async () => {
    try {
      const stored = await AsyncStorage.getItem(REPLY_KEY + post.id);
      if (stored) setComments(JSON.parse(stored));
    } catch {}
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    const comment = {
      id: `c_${Date.now()}`, username: 'You', body: newComment.trim(), createdAt: Date.now(),
    };
    const updated = [...comments, comment];
    setComments(updated);
    setNewComment('');
    try { await AsyncStorage.setItem(REPLY_KEY + post.id, JSON.stringify(updated)); } catch {}
  };

  const handleUpvote = () => {
    setUpvoted((p) => !p);
    setUpvoteCount((c) => upvoted ? c - 1 : c + 1);
  };

  const renderComment = ({ item }) => {
    const ac = getAvatarColor(item.username);
    return (
      <View style={styles.commentCard}>
        <View style={[styles.commentAvatar, { backgroundColor: ac + '25', borderColor: ac }]}>
          <Text style={[styles.commentAvatarText, { color: ac }]}>{getInitials(item.username)}</Text>
        </View>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUser}>{item.username}</Text>
            <Text style={styles.commentTime}>{getTimeAgo(item.createdAt)}</Text>
          </View>
          <Text style={styles.commentBody}>{item.body}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Post */}
              <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={[styles.avatar, { backgroundColor: avatarColor + '25', borderColor: avatarColor }]}>
                    <Text style={[styles.avatarText, { color: avatarColor }]}>{getInitials(post.username)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.username}>{post.username}</Text>
                    <Text style={styles.timeAgo}>{getTimeAgo(post.createdAt)}</Text>
                  </View>
                  <View style={[styles.catTag, { backgroundColor: catColor + '20', borderColor: catColor + '40' }]}>
                    <Text style={[styles.catTagText, { color: catColor }]}>{post.category}</Text>
                  </View>
                </View>

                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postBody}>{post.body}</Text>

                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={handleUpvote} activeOpacity={0.7}>
                    <Ionicons name={upvoted ? 'arrow-up-circle' : 'arrow-up-circle-outline'} size={22} color={upvoted ? '#0066ff' : COLORS.textMuted} />
                    <Text style={[styles.actionText, upvoted && { color: '#0066ff' }]}>{upvoteCount}</Text>
                  </TouchableOpacity>
                  <View style={styles.actionBtn}>
                    <Ionicons name="chatbubble-outline" size={18} color={COLORS.textMuted} />
                    <Text style={styles.actionText}>{post.comments + comments.length}</Text>
                  </View>
                  <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                    <Ionicons name="share-outline" size={18} color={COLORS.textMuted} />
                    <Text style={styles.actionText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                    <Ionicons name="bookmark-outline" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.commentsTitle}>
                Comments ({post.comments + comments.length})
              </Text>

              {comments.length === 0 && (
                <View style={styles.emptyComments}>
                  <Ionicons name="chatbubble-ellipses-outline" size={32} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>Be the first to comment</Text>
                </View>
              )}
            </Animated.View>
          }
        />

        {/* Comment Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Write a comment..."
            placeholderTextColor={COLORS.textMuted}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !newComment.trim() && styles.sendBtnDisabled]}
            onPress={handleComment}
            disabled={!newComment.trim()}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={18} color={newComment.trim() ? '#fff' : COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  postCard: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, marginRight: 12 },
  avatarText: { fontSize: 14, fontWeight: '800' },
  username: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  timeAgo: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  catTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  catTagText: { fontSize: 11, fontWeight: '700' },
  postTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10, lineHeight: 24 },
  postBody: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 16 },
  postActions: { flexDirection: 'row', alignItems: 'center', gap: 20, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  commentsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  emptyComments: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
  commentCard: { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginRight: 10 },
  commentAvatarText: { fontSize: 11, fontWeight: '800' },
  commentContent: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  commentUser: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', marginRight: 8 },
  commentTime: { color: COLORS.textMuted, fontSize: 11 },
  commentBody: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: '#000' },
  input: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: COLORS.textPrimary, maxHeight: 80, borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0066ff', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendBtnDisabled: { backgroundColor: COLORS.bgCard },
});

export default PostDetailScreen;
