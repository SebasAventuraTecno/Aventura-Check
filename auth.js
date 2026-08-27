import { firebaseConfig } from "./firebase-config.js";

const FIREBASE_VERSION = "12.18.0";
const FIREBASE_APP_URL = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`;
const FIREBASE_AUTH_URL = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`;
const FIREBASE_FIRESTORE_URL = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`;

export function hasFirebaseConfig() {
  return ["apiKey", "authDomain", "projectId", "appId"].every((key) => Boolean(firebaseConfig[key]));
}

export async function createGoogleAuth({ onUserChange, onError }) {
  if (!hasFirebaseConfig()) return { configured: false };

  try {
    const [appModule, authModule, firestoreModule] = await Promise.all([
      import(FIREBASE_APP_URL),
      import(FIREBASE_AUTH_URL),
      import(FIREBASE_FIRESTORE_URL),
    ]);
    const firebaseApp = appModule.initializeApp(firebaseConfig);
    const auth = authModule.getAuth(firebaseApp);
    const db = firestoreModule.getFirestore(firebaseApp);
    authModule.useDeviceLanguage(auth);

    const provider = new authModule.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    authModule.onAuthStateChanged(auth, onUserChange, onError);

    return {
      configured: true,
      db,
      firestore: {
        collection: firestoreModule.collection,
        deleteDoc: firestoreModule.deleteDoc,
        doc: firestoreModule.doc,
        onSnapshot: firestoreModule.onSnapshot,
        setDoc: firestoreModule.setDoc,
      },
      signIn: () => authModule.signInWithPopup(auth, provider),
      signOut: () => authModule.signOut(auth),
    };
  } catch (error) {
    onError(error);
    return { configured: false };
  }
}
