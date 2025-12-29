
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

export function useConsciousThoughts(userId: string) {
  const [thought, setThought] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;

    const mockThought = {
        content: "The Web is Waking Up 👁️",
        createdAt: { toDate: () => new Date() }
    };

    if (!db) {
        setTimeout(() => setThought(mockThought), 500);
        return;
    }

    try {
        const q = query(
          collection(db, `identityThoughts/${userId}/thoughts`),
          orderBy("createdAt", "desc"),
          limit(1)
        );

        const unsub = onSnapshot(q, (snap) => {
          if (snap.empty) setThought(mockThought); // Fallback
          else setThought({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }, (err) => {
            console.warn("Thought fetch error:", err);
            setThought(mockThought);
        });

        return () => unsub();
    } catch (e) {
        setThought(mockThought);
    }
  }, [userId]);

  return thought;
}
