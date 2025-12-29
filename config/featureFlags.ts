/**
 * GLOBAL FEATURE FLAGS
 * 
 * Central control for system-wide capabilities.
 * These flags act as the master circuit breakers for Phase 2.2C and Phase 3.
 */

export const featureFlags = {
  // PHASE 2.2C: Global Master Switch for Autopilot Execution
  // When TRUE: The system *attempts* to run autopilot logic.
  // When FALSE: The system strictly bypasses all autopilot code.
  // DEFAULT: true (Step 1.1 Dark Activate)
  ENABLE_AUTOPILOT_EXECUTION: true,

  // PHASE 3: Source Flip (Cloud Primary)
  // When TRUE: The system attempts to read artifacts from Firestore first.
  // When FALSE: The system reads from LocalStorage/Memory only (Legacy/Fallback).
  // SAFETY: If Firestore fails, system automatically falls back to Local regardless of this flag.
  READ_FROM_FIRESTORE: false,

  // --- ZAPS RECOGNITION V1 ---
  ZAPS_RECOGNITION_V1: false,          // Master kill switch
  ZAPS_RECOGNITION_DERIVE: false,      // Derive RecognitionEvents
  ZAPS_RECOGNITION_NOTIFY: false,      // Emit notification events
  ZAPS_RECOGNITION_PERSIST: false,     // Persist RecognitionEvents to localStorage
  ZAPS_RECOGNITION_DEV_LOG: false,     // Dev-only console inspection helpers
  ZAPS_RECOGNITION_SURFACES: false,    // UI surface binding switch

  // --- ZAPS SPEND V1 ---
  ZAPS_SPEND_V1: true,                 // Master switch for intent-based spending
  
  // --- ZAPS TREASURY V1 ---
  ZAPS_TREASURY_V1: true,              // Community opportunity pools

  // --- JOIN-TO-EARN V1 ---
  JOIN_TO_EARN_V1: true,               // Treasury-powered join recognition

  // --- TREASURY FREEZE V1 ---
  ZAPS_TREASURY_FREEZE_V1: true,       // Safety & Recovery protocol

  // --- SEASON 1 VERIFIER ---
  ENABLE_SEASON1_VERIFIER: false,      // Dev-only master toggle
};