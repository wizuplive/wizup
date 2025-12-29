import { featureFlags } from "../../config/featureFlags";
import { zapsRecognitionService } from "./zapsRecognitionService";
import { recognitionStore } from "./recognitionStore";
import { notificationStore } from "./notificationStore";

/**
 * Installs recognition tools into window.wizup for dev inspection.
 */
export function installZapsRecognitionDevTools() {
  if (!featureFlags.ZAPS_RECOGNITION_DEV_LOG) return;

  const w = window as any;
  w.wizup = w.wizup || {};
  
  w.wizup.recognition = {
    runPass: zapsRecognitionService.runRecognitionPass.bind(zapsRecognitionService),
    list: recognitionStore.listRecognitionEvents.bind(recognitionStore),
    listNotifications: notificationStore.listNotificationEvents.bind(notificationStore),
    help: () => {
      console.log("%c--- ZAPS Recognition Dev Tools ---", "color: #8b5cf6; font-weight: bold;");
      console.log("wizup.recognition.runPass({ communityId: '2' })");
      console.log("wizup.recognition.list('2')");
      console.log("wizup.recognition.listNotifications('user_id')");
    }
  };

  w.wizup.recognition.help();
}
