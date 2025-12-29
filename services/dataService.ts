import { SyncedCreatorData } from './hybridSyncService';
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, orderBy, query } from "firebase/firestore";
import { ModCase, ModAction, AutopilotEligibility, CaseStatus, SuggestedAction } from "../types/modTypes";
import { AgentMemoryEvent, AgentMemoryState } from "../types/agentMemoryTypes";
import { driftLogService } from './driftLogService';
import { featureFlags } from '../config/featureFlags';
import { ReasoningQualityEvent } from "../types/reasoningQualityTypes";
import { ZapsLedgerEntry } from "../types/walletTypes";
import { Proposal, Vote } from "../types/governanceTypes";

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isInfluencer: boolean;
  influencerData?: SyncedCreatorData;
  walletBalance: number; 
  usdBalance: number;    
  cryptoBalance: number; 
  personalization?: any; 
}

export const DEFAULT_USER: UserProfile = {
  id: 'user_demo_123',
  name: 'Sarah Jenkins (Demo)',
  handle: `@designsarah`,
  avatar: 'https://picsum.photos/seed/p1/200/200',
  isInfluencer: false,
  walletBalance: 2450,
  usdBalance: 120.00,
  cryptoBalance: 62.40
};

class DataService {
  private currentUser: UserProfile | null = null;
  private memoryStore: Record<string, any> = {}; 
  private zapsLedger: ZapsLedgerEntry[] = [];
  public syntheticUsers: UserProfile[] = []; // FOR SIMULATION

  constructor() {
    const saved = localStorage.getItem('wizup_user');
    try {
        this.currentUser = saved ? JSON.parse(saved) : null;
    } catch (e) {
        localStorage.removeItem('wizup_user');
        this.currentUser = null;
    }
    
    try {
      const savedStore = localStorage.getItem('wizup_store');
      if (savedStore) {
        this.memoryStore = JSON.parse(savedStore);
      }
    } catch (e) {}

    try {
        const savedLedger = localStorage.getItem('wizup_zaps_ledger');
        if (savedLedger) {
            this.zapsLedger = JSON.parse(savedLedger);
        } else {
            this.seedZapsLedger();
        }
    } catch (e) {}
  }

  private seedZapsLedger() {
      if (this.currentUser) {
          this.zapsLedger = [
              { id: 'seed_1', userId: this.currentUser.id, type: 'EARN', amount: 500, description: 'Welcome Bonus', createdAt: Date.now() - 86400000 * 5 },
          ];
          this.saveLedgerToLocal();
      }
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  getZapsLedger(userId: string): ZapsLedgerEntry[] {
      return this.zapsLedger.filter(entry => entry.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  }

  async getAllUsers(): Promise<UserProfile[]> {
    if (this.syntheticUsers.length > 0) return this.syntheticUsers;

    if (this.isCloudConnected()) {
      try {
        const snap = await getDocs(collection(db!, "users"));
        return snap.docs.map(d => d.data() as UserProfile);
      } catch (e) {
        console.warn("[DataService] Failed to fetch users from Firestore, using local only.");
      }
    }
    return this.currentUser ? [this.currentUser] : [];
  }

  addZapsEntry(entry: ZapsLedgerEntry) {
      this.zapsLedger.push(entry);
      this.saveLedgerToLocal();
      if (this.currentUser && this.currentUser.id === entry.userId) {
          this.currentUser.walletBalance += entry.amount;
          this.saveToLocal();
      }
  }

  isCloudConnected(): boolean {
    return !!db;
  }

  async getModCases(communityId: string): Promise<ModCase[]> {
    if (featureFlags.READ_FROM_FIRESTORE && this.isCloudConnected()) {
      try {
        const remoteRef = collection(db!, "communities", communityId, "modCases");
        const snap = await getDocs(remoteRef);
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as ModCase);
        }
      } catch (e) {
        console.warn("[DataService] Cloud Read Failed (ModCases). Falling back to local.", e);
      }
    }
    return (await this.get(`modCases:${communityId}`)) || [];
  }

  async getModActions(communityId: string): Promise<ModAction[]> {
    if (featureFlags.READ_FROM_FIRESTORE && this.isCloudConnected()) {
      try {
        const remoteRef = collection(db!, "communities", communityId, "modActions");
        const q = query(remoteRef, orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as ModAction);
        }
      } catch (e) {
        console.warn("[DataService] Cloud Read Failed (ModActions). Falling back to local.");
      }
    }
    return (await this.get(`modActions:${communityId}`)) || [];
  }

  async getAgentMemory(communityId: string): Promise<AgentMemoryEvent[]> {
    if (featureFlags.READ_FROM_FIRESTORE && this.isCloudConnected()) {
      try {
        const remoteRef = collection(db!, "communities", communityId, "agentMemory");
        const snap = await getDocs(remoteRef);
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as AgentMemoryEvent);
        }
      } catch (e) {
        console.warn("[DataService] Cloud Read Failed (AgentMemory). Falling back to local.");
      }
    }
    return []; 
  }

  async getEligibility(communityId: string): Promise<AutopilotEligibility | null> {
    if (featureFlags.READ_FROM_FIRESTORE && this.isCloudConnected()) {
      try {
        const latestRef = doc(db!, "communities", communityId, "eligibility", "latest");
        const snap = await getDoc(latestRef);
        if (snap.exists()) {
          return snap.data() as AutopilotEligibility;
        }
      } catch (e) {
        console.warn("[DataService] Cloud Read Failed (Eligibility). Falling back to local.");
      }
    }
    return await this.get(`autopilot_eligibility:${communityId}`);
  }

  async get(key: string): Promise<any> {
    if (this.memoryStore[key]) {
      return this.memoryStore[key];
    }
    return null;
  }

  async set(key: string, value: any): Promise<void> {
    this.memoryStore[key] = value;
    this.saveStoreToLocal();
  }

  private saveStoreToLocal() {
    localStorage.setItem('wizup_store', JSON.stringify(this.memoryStore));
  }

  private saveLedgerToLocal() {
      localStorage.setItem('wizup_zaps_ledger', JSON.stringify(this.zapsLedger));
  }

  setUser(user: UserProfile) {
    this.currentUser = user;
    this.saveToLocal();
  }

  async loadUserProfile(uid: string): Promise<boolean> {
    if (!db) return false;
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            this.currentUser = {
                ...DEFAULT_USER, 
                ...cloudData,
                id: uid, 
            } as UserProfile;
            this.saveToLocal();
            return true;
        } else {
             return false;
        }
    } catch (e) {
        return false;
    }
  }

  async upgradeToCreator(creatorData: SyncedCreatorData): Promise<void> {
    if (!this.currentUser) return;
    this.currentUser = {
      ...this.currentUser,
      isInfluencer: true,
      influencerData: creatorData,
      avatar: creatorData.profilePicture || this.currentUser.avatar
    };
    this.saveToLocal();
  }

  async savePersonalization(settings: any): Promise<void> {
    if (!this.currentUser) return;
    this.currentUser = {
      ...this.currentUser,
      personalization: settings
    };
    this.saveToLocal();
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('wizup_user');
  }

  async shadowWriteCase(communityId: string, modCase: ModCase) {
    if (!db) return;
    try {
      const ref = doc(db, "communities", communityId, "modCases", modCase.id);
      setDoc(ref, modCase).catch(() => {});
    } catch (e) {}
  }

  async shadowWriteAction(communityId: string, action: ModAction) {
    if (!db) return;
    try {
      const ref = doc(db, "communities", communityId, "modActions", action.id);
      setDoc(ref, action).catch(() => {});
    } catch (e) {}
  }

  shadowWriteProposal(communityId: string, proposal: Proposal) {
    if (!db) return;
    const ref = doc(db, "communities", communityId, "proposals", proposal.id);
    setDoc(ref, proposal).catch(() => {});
  }

  shadowWriteVote(communityId: string, vote: Vote) {
    if (!db) return;
    const ref = doc(db, "communities", communityId, "votes", `${vote.proposalId}_${vote.userId}`);
    setDoc(ref, vote).catch(() => {});
  }

  async shadowWriteMemoryEvent(communityId: string, event: AgentMemoryEvent) {
    if (!db) return;
    try {
      const ref = doc(db, "communities", communityId, "agentMemory", event.id);
      setDoc(ref, event).catch(() => {});
    } catch (e) {}
  }

  async shadowWriteEligibility(communityId: string, eligibility: AutopilotEligibility) {
    if (!db) return;
    try {
      const latestRef = doc(db, "communities", communityId, "eligibility", "latest");
      setDoc(latestRef, eligibility).catch(() => {}); 
    } catch (e) {}
  }

  async shadowWriteReasoningQualityEvent(communityId: string, event: ReasoningQualityEvent) {
    if (!db) return;
    try {
        const ref = doc(db, "communities", communityId, "reasoningQuality", event.id);
        setDoc(ref, event).catch(() => {});
    } catch (e) {}
  }

  async verifyModCases(communityId: string, localCases: ModCase[]) {
    if (!db) return;
  }

  async verifyModActions(communityId: string, localActions: ModAction[]) {
    if (!db) return;
  }

  async verifyAgentMemory(communityId: string, localState: AgentMemoryState) {
    if (!db) return;
  }

  async verifyEligibility(communityId: string, localEligibility: AutopilotEligibility) {
    if (!db) return;
  }

  private saveToLocal() {
    if (this.currentUser) {
        localStorage.setItem('wizup_user', JSON.stringify(this.currentUser));
    } else {
        localStorage.removeItem('wizup_user');
    }
  }
}

export const dataService = new DataService();