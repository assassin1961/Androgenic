import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
  Modal, TextInput, FlatList, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS } from '../utils/theme';

const STORAGE_KEY_POSTS = '@forum_user_posts';
const STORAGE_KEY_UPVOTES = '@forum_upvotes';

const CATEGORIES = ['All', 'Mewing', 'Skincare', 'Jawline', 'Hair', 'Nutrition', 'Progress', 'Questions'];

const CATEGORY_COLORS = {
  Mewing: '#7c4dff', Skincare: '#00bfa5', Jawline: '#ff6d00', Hair: '#aa00ff',
  Nutrition: '#00c853', Progress: '#0066ff', Questions: '#ffd600',
};

const AVATAR_COLORS = [
  '#e53935', '#8e24aa', '#3949ab', '#00897b', '#43a047',
  '#ef6c00', '#6d4c41', '#546e7a', '#d81b60', '#1e88e5',
];

const h = 3600000;
const SEED_POSTS = [
  { id: 's1', username: 'JawlineKing', category: 'Progress',
    title: 'Week 4 of mewing - jaw is noticeably sharper',
    body: 'Been hard mewing consistently for the past month. My girlfriend noticed the difference before I did. Jawline is more defined especially from the side profile. Posting comparison pics soon.',
    upvotes: 47, comments: 18, createdAt: Date.now() - h * 2 },
  { id: 's2', username: 'SkinCareMax', category: 'Questions',
    title: 'Best skincare routine for oily skin?',
    body: 'My skin gets super oily by midday no matter what I use. Currently using CeraVe cleanser and a basic moisturizer. Any recommendations for a full routine that actually works?',
    upvotes: 23, comments: 31, createdAt: Date.now() - h * 5 },
  { id: 's3', username: 'MewingPro', category: 'Mewing',
    title: 'Mastic gum vs regular gum for masseter growth',
    body: 'I have been chewing mastic gum for 6 weeks and regular gum before that for 3 months. The difference is night and day. Mastic gum gives way more resistance and I can feel the burn after 20 minutes.',
    upvotes: 65, comments: 42, createdAt: Date.now() - h * 8 },
  { id: 's4', username: 'LooksAscend', category: 'Jawline',
    title: 'Lose buccal fat naturally - what actually worked for me',
    body: 'After months of research and trying everything, here is what reduced my face fat: caloric deficit, cold exposure on face, mewing, and time. No shortcuts. Took about 4 months to see real results.',
    upvotes: 89, comments: 56, createdAt: Date.now() - h * 12 },
  { id: 's5', username: 'GlowUpSZN', category: 'Hair',
    title: 'Minoxidil beard journey - month 3 update',
    body: 'Started with basically no facial hair on my cheeks. Three months of minoxidil 5% applied twice daily. Seeing vellus hairs turning terminal on my cheeks and jawline. Patience is key with this.',
    upvotes: 54, comments: 27, createdAt: Date.now() - h * 18 },
  { id: 's6', username: 'ChadMax99', category: 'Nutrition',
    title: 'Collagen peptides - legit or just placebo?',
    body: 'Been taking collagen peptides for 2 months now. My skin does look better but that could be the improved diet overall. Anyone have actual evidence these supplements do anything for facial aesthetics?',
    upvotes: 37, comments: 44, createdAt: Date.now() - h * 24 },
  { id: 's7', username: 'SymmetryMax', category: 'Mewing',
    title: 'Correct tongue posture guide for beginners',
    body: 'A lot of people mew wrong. The ENTIRE tongue should be on the roof of the mouth, not just the tip. The back third is the most important part. Suction hold is key. Here is my detailed breakdown.',
    upvotes: 112, comments: 63, createdAt: Date.now() - h * 30 },
  { id: 's8', username: 'FaceGod2024', category: 'Progress',
    title: '6 month glow up transformation - unrecognizable',
    body: 'Lost 30lbs, started mewing, fixed posture, got a proper skincare routine, and started lifting heavy. People from high school do not recognize me anymore. Proof that looksmaxxing works if you commit.',
    upvotes: 203, comments: 87, createdAt: Date.now() - h * 48 },
  { id: 's9', username: 'BoneStructure', category: 'Questions',
    title: 'Does sleeping position affect facial symmetry?',
    body: 'I always sleep on my right side and noticed my right side looks slightly flatter. Is there any truth to sleeping position affecting bone structure or is this just genetic asymmetry?',
    upvotes: 41, comments: 29, createdAt: Date.now() - h * 36 },
  { id: 's10', username: 'HunterEyes', category: 'Skincare',
    title: 'Tretinoin is the GOAT - 8 week results',
    body: 'Finally got a prescription for tretinoin 0.025%. The purge phase was rough for the first 3 weeks but now my skin texture is insanely smooth. Pores look smaller and acne scars are fading.',
    upvotes: 76, comments: 38, createdAt: Date.now() - h * 60 },
  { id: 's11', username: 'LeanFace', category: 'Nutrition',
    title: 'Water intake changed my face completely',
    body: 'Went from drinking maybe 2 glasses a day to a gallon. Skin is clearer, face is less puffy in the morning, and my under eyes look way better. Simplest looksmaxxing tip that nobody talks about enough.',
    upvotes: 58, comments: 21, createdAt: Date.now() - h * 72 },
  { id: 's12', username: 'OrthoMax', category: 'Jawline',
    title: 'Jawzrsize review after 2 months - honest take',
    body: 'Bought the Jawzrsize tool expecting miracles. Results? Mild improvement in masseter size but nothing dramatic. Mastic gum gives a better workout for a fraction of the price. Save your money.',
    upvotes: 33, comments: 25, createdAt: Date.now() - h * 96 },
  { id: 's13', username: 'MasculineMax', category: 'Hair',
    title: 'Best hairstyles to enhance facial structure',
    body: 'Your hairstyle can make or break your facial aesthetics. Fade on the sides with volume on top elongates the face. Avoid middle parts if you have a round face. Here are my top picks by face shape.',
    upvotes: 44, comments: 33, createdAt: Date.now() - h * 120 },
];

const getInitials = (name) => name ? name.slice(0, 2).toUpperCase() : '?';

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getTimeAgo = (timestamp) => {
  const mins = Math.floor((Date.now() - timestamp) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

const ForumScreen = ({ navigation }) => {
  const [posts, setPosts] = useState(SEED_POSTS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('hot');
  const [upvotedIds, setUpvotedIds] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState('Mewing');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPersistedData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const loadPersistedData = async () => {
    try {
      const [storedPosts, storedUpvotes] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_POSTS),
        AsyncStorage.getItem(STORAGE_KEY_UPVOTES),
      ]);
      if (storedPosts) {
        const userPosts = JSON.parse(storedPosts);
        setPosts((prev) => [...userPosts, ...prev]);
      }
      if (storedUpvotes) setUpvotedIds(JSON.parse(storedUpvotes));
    } catch (e) { /* silent */ }
  };

  const persistUpvotes = async (data) => {
    try { await AsyncStorage.setItem(STORAGE_KEY_UPVOTES, JSON.stringify(data)); } catch (e) { /* silent */ }
  };

  const persistUserPosts = async (data) => {
    try { await AsyncStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(data)); } catch (e) { /* silent */ }
  };

  const handleUpvote = useCallback((postId) => {
    setUpvotedIds((prev) => {
      const updated = { ...prev };
      if (updated[postId]) delete updated[postId];
      else updated[postId] = true;
      persistUpvotes(updated);
      return updated;
    });
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const wasUpvoted = upvotedIds[postId];
        return { ...p, upvotes: p.upvotes + (wasUpvoted ? -1 : 1) };
      })
    );
  }, [upvotedIds]);

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(modalFade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  };

  const closeModal = () => {
    Animated.timing(modalFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setModalVisible(false);
      setNewTitle('');
      setNewBody('');
      setNewCategory('Mewing');
    });
  };

  const handlePost = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    const newPost = {
      id: `user_${Date.now()}`, username: 'You', category: newCategory,
      title: newTitle.trim(), body: newBody.trim(),
      upvotes: 0, comments: 0, createdAt: Date.now(),
    };
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    await persistUserPosts(updatedPosts.filter((p) => p.id.startsWith('user_')));
    closeModal();
  };

  const getFilteredPosts = () => {
    let filtered = activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory);
    return sortBy === 'hot'
      ? [...filtered].sort((a, b) => b.upvotes - a.upvotes)
      : [...filtered].sort((a, b) => b.createdAt - a.createdAt);
  };

  const renderPost = ({ item }) => {
    const isUpvoted = !!upvotedIds[item.id];
    const avatarColor = getAvatarColor(item.username);
    const catColor = CATEGORY_COLORS[item.category] || COLORS.accent;
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('PostDetail', { post: item })}>
      <Animated.View style={[styles.postCard, { opacity: fadeAnim }]}>
        <View style={styles.postHeader}>
          <View style={[styles.avatar, { backgroundColor: avatarColor + '30', borderColor: avatarColor }]}>
            <Text style={[styles.avatarText, { color: avatarColor }]}>{getInitials(item.username)}</Text>
          </View>
          <View style={styles.postMeta}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
          </View>
          <View style={[styles.categoryTag, { backgroundColor: catColor + '20', borderColor: catColor + '40' }]}>
            <Text style={[styles.categoryTagText, { color: catColor }]}>{item.category}</Text>
          </View>
        </View>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postBody} numberOfLines={2}>{item.body}</Text>
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpvote(item.id)} activeOpacity={0.7}>
            <Ionicons
              name={isUpvoted ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
              size={20} color={isUpvoted ? '#0066ff' : COLORS.textMuted}
            />
            <Text style={[styles.actionText, isUpvoted && styles.actionTextActive]}>{item.upvotes}</Text>
          </TouchableOpacity>
          <View style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.actionText}>{item.comments}</Text>
          </View>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </Animated.View>
      </TouchableOpacity>
    );
  };

  const filteredPosts = getFilteredPosts();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity onPress={openModal} style={styles.newPostBtn}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Sort Toggle */}
      <View style={styles.sortRow}>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'hot' && styles.sortBtnActive]}
          onPress={() => setSortBy('hot')}
        >
          <Ionicons name="flame" size={16} color={sortBy === 'hot' ? '#fff' : COLORS.textMuted} />
          <Text style={[styles.sortText, sortBy === 'hot' && styles.sortTextActive]}>Hot</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'new' && styles.sortBtnActive]}
          onPress={() => setSortBy('new')}
        >
          <Ionicons name="time" size={16} color={sortBy === 'new' ? '#fff' : COLORS.textMuted} />
          <Text style={[styles.sortText, sortBy === 'new' && styles.sortTextActive]}>New</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <Text style={styles.postCount}>{filteredPosts.length} posts</Text>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryPill, activeCategory === cat && styles.categoryPillActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Post List */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to start a conversation</Text>
          </View>
        }
      />

      {/* New Post Modal */}
      <Modal visible={modalVisible} transparent animationType="none">
        <Animated.View style={[styles.modalOverlay, { opacity: modalFade }]}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={26} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>New Post</Text>
                <TouchableOpacity
                  onPress={handlePost}
                  style={[styles.postButton, (!newTitle.trim() || !newBody.trim()) && styles.postButtonDisabled]}
                  disabled={!newTitle.trim() || !newBody.trim()}
                >
                  <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalCatRow}>
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.modalCatPill, newCategory === cat && styles.modalCatPillActive]}
                    onPress={() => setNewCategory(cat)}
                  >
                    <Text style={[styles.modalCatText, newCategory === cat && styles.modalCatTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput
                style={styles.titleInput}
                placeholder="Post title..."
                placeholderTextColor={COLORS.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
                maxLength={120}
              />
              <TextInput
                style={styles.bodyInput}
                placeholder="Share your thoughts, progress, or ask a question..."
                placeholderTextColor={COLORS.textMuted}
                value={newBody}
                onChangeText={setNewBody}
                multiline
                textAlignVertical="top"
                maxLength={2000}
              />
              <Text style={styles.charCount}>{newBody.length}/2000</Text>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCard,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  newPostBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#0066ff',
    justifyContent: 'center', alignItems: 'center',
  },
  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10, gap: 8 },
  sortBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, gap: 5,
  },
  sortBtnActive: { backgroundColor: '#0066ff', borderColor: '#0066ff' },
  sortText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  sortTextActive: { color: '#fff' },
  postCount: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  categoryRow: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  categoryPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
  },
  categoryPillActive: { backgroundColor: '#0066ff', borderColor: '#0066ff' },
  pillText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  pillTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  postCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: 18, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1.5, marginRight: 10,
  },
  avatarText: { fontSize: 13, fontWeight: '800' },
  postMeta: { flex: 1 },
  username: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  timeAgo: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  categoryTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  categoryTagText: { fontSize: 11, fontWeight: '700' },
  postTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6, lineHeight: 22 },
  postBody: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 12 },
  postActions: {
    flexDirection: 'row', alignItems: 'center', gap: 18,
    borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 2 },
  actionText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  actionTextActive: { color: '#0066ff' },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptySubtitle: { fontSize: 14, color: COLORS.textMuted },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalKeyboard: { flex: 1, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 16, maxHeight: '85%', borderWidth: 1, borderBottomWidth: 0, borderColor: COLORS.borderLight,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  postButton: { backgroundColor: '#0066ff', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  postButtonDisabled: { opacity: 0.4 },
  postButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 10 },
  modalCatRow: { gap: 8, marginBottom: 18 },
  modalCatPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18,
    backgroundColor: COLORS.bgSecondary, borderWidth: 1, borderColor: COLORS.border,
  },
  modalCatPillActive: { backgroundColor: '#0066ff', borderColor: '#0066ff' },
  modalCatText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  modalCatTextActive: { color: '#fff' },
  titleInput: {
    backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 14, fontSize: 16,
    fontWeight: '600', color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
  },
  bodyInput: {
    backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 14, fontSize: 14,
    color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, minHeight: 140, maxHeight: 220,
  },
  charCount: { fontSize: 12, color: COLORS.textMuted, textAlign: 'right', marginTop: 6 },
});

export default ForumScreen;
