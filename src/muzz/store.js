import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_ME, SOCIAL_SEED, PEOPLE } from './data';

const KEY = '@muzz_state_v1';

const MuzzContext = createContext(null);
export const useMuzz = () => useContext(MuzzContext);

const initialState = {
  me: DEFAULT_ME,
  onboarded: false,
  feedback: {},        // { personId: 'liked' | 'passed' }
  matches: [],         // personIds that became matches
  likedYou: ['p2', 'p6', 'p9'], // people who liked you (for Likes tab)
  seen: [],            // butterfly-presented ids
  chats: {},           // { personId: [{id, text, sender, ts, read}] }
  posts: SOCIAL_SEED,
  postLikes: {},       // local like toggles for social posts
  butterflyAuto: true, // auto-match toggle
  superLikes: 3,
  boosts: 1,
  lastPickTs: 0,
};

export function MuzzProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          setState((s) => ({ ...s, ...saved, me: { ...DEFAULT_ME, ...(saved.me || {}) } }));
        }
      } catch {}
      setHydrated(true);
    })();
  }, []);

  const persist = useCallback((next) => {
    setState(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const update = useCallback((patch) => {
    setState((s) => {
      const next = typeof patch === 'function' ? patch(s) : { ...s, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // ── Actions ────────────────────────────────────────────────────────
  const setMe = useCallback((patch) => update((s) => ({ ...s, me: { ...s.me, ...patch } })), [update]);

  const completeOnboarding = useCallback((mePatch) => {
    update((s) => ({ ...s, onboarded: true, me: { ...s.me, ...mePatch, butterflyTrained: true } }));
  }, [update]);

  const likePerson = useCallback((personId, { mutual = true } = {}) => {
    update((s) => {
      const feedback = { ...s.feedback, [personId]: 'liked' };
      const becameMatch = mutual && !s.matches.includes(personId);
      const matches = becameMatch ? [...s.matches, personId] : s.matches;
      const chats = becameMatch && !s.chats[personId]
        ? { ...s.chats, [personId]: [] }
        : s.chats;
      const seen = s.seen.includes(personId) ? s.seen : [...s.seen, personId];
      return { ...s, feedback, matches, chats, seen };
    });
  }, [update]);

  const passPerson = useCallback((personId) => {
    update((s) => ({
      ...s,
      feedback: { ...s.feedback, [personId]: 'passed' },
      seen: s.seen.includes(personId) ? s.seen : [...s.seen, personId],
    }));
  }, [update]);

  const markSeen = useCallback((personId) => {
    update((s) => (s.seen.includes(personId) ? s : { ...s, seen: [...s.seen, personId], lastPickTs: Date.now() }));
  }, [update]);

  const sendMessage = useCallback((personId, text, sender = 'me') => {
    const msg = { id: `m${Date.now()}${Math.random().toString(36).slice(2, 6)}`, text, sender, ts: Date.now(), read: sender === 'me' };
    update((s) => ({
      ...s,
      chats: { ...s.chats, [personId]: [...(s.chats[personId] || []), msg] },
    }));
    return msg;
  }, [update]);

  const togglePostLike = useCallback((postId) => {
    update((s) => {
      const cur = s.postLikes[postId];
      return { ...s, postLikes: { ...s.postLikes, [postId]: cur ? 0 : 1 } };
    });
  }, [update]);

  const addPost = useCallback((post) => {
    update((s) => ({ ...s, posts: [post, ...s.posts] }));
  }, [update]);

  const resetAll = useCallback(() => persist(initialState), [persist]);

  const value = useMemo(() => ({
    ...state, hydrated,
    setMe, completeOnboarding, likePerson, passPerson, markSeen,
    sendMessage, togglePostLike, addPost, update, resetAll,
  }), [state, hydrated, setMe, completeOnboarding, likePerson, passPerson, markSeen, sendMessage, togglePostLike, addPost, update, resetAll]);

  return <MuzzContext.Provider value={value}>{children}</MuzzContext.Provider>;
}

export const getPerson = (id) => PEOPLE.find((p) => p.id === id);
