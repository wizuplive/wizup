
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Post } from "../types";

const MOCK_STREAM_POSTS: Post[] = [
  {
    id: 101,
    // Added missing 'id' to author object
    author: { id: "u1", name: "Sarah Jenkins", handle: "@designsarah", avatar: "https://picsum.photos/seed/p1/100/100", role: "Creator" },
    time: "2h ago",
    content: "Just dropped a new module on Design Systems in Figma. The response has been incredible! 🎨✨ The 'Mirror' update is live.",
    image: "https://picsum.photos/seed/feed1/800/500",
    likes: 1240,
    comments: 86,
    shares: 45,
    zaps: 500,
    community: {
       name: "Design Systems Mastery",
       image: "https://picsum.photos/seed/design/100/100",
       members: "12.4k",
       activeNow: 432,
       description: "The ultimate resource for scaling design."
    }
  },
  {
    id: 102,
    // Added missing 'id' to author object
    author: { id: "u1", name: "Sarah Jenkins", handle: "@designsarah", avatar: "https://picsum.photos/seed/p1/100/100", role: "Creator" },
    time: "5h ago",
    content: "Consciousness is the new UX. We are moving from static pages to living identities. 🧬",
    likes: 850,
    comments: 124,
    shares: 32,
    zaps: 120,
  },
  {
    id: 103,
    // Added missing 'id' to author object
    author: { id: "u1", name: "Sarah Jenkins", handle: "@designsarah", avatar: "https://picsum.photos/seed/p1/100/100", role: "Creator" },
    time: "1d ago",
    content: "Sharing my full component library for the new dashboard. Feel free to clone and use for your own projects. #Figma #UI",
    likes: 2100,
    comments: 156,
    shares: 89,
    zaps: 850,
  }
];

export function useUserStream(userId: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // SIMULATION FALLBACK (If DB not connected)
    if (!db) {
        setTimeout(() => {
            setPosts(MOCK_STREAM_POSTS);
            setLoading(false);
        }, 800);
        return;
    }

    try {
        const q = query(
          collection(db, "posts"),
          where("authorId", "==", userId),
          orderBy("createdAt", "desc"),
          limit(10)
        );

        const unsub = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
              const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));
              setPosts(docs);
              setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
          } else {
              setPosts(MOCK_STREAM_POSTS); // Fallback if no real data yet
          }
          setLoading(false);
        }, (err) => {
            console.warn("Firestore Stream Error (using mock):", err);
            setPosts(MOCK_STREAM_POSTS);
            setLoading(false);
        });

        return () => unsub();
    } catch (e) {
        console.warn("Firestore Init Error:", e);
        setPosts(MOCK_STREAM_POSTS);
        setLoading(false);
    }
  }, [userId]);

  const loadMore = async () => {
    if (!db || !lastDoc) return;

    try {
        const q = query(
          collection(db, "posts"),
          where("authorId", "==", userId),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(10)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const morePosts = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          } as any));
          setPosts((prev) => [...prev, ...morePosts]);
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        }
    } catch (e) {
        console.error("Load more error", e);
    }
  };

  return { posts, loading, loadMore };
}
