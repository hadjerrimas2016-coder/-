import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  DocumentData,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying the firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const OWNER_ADMIN_EMAIL = 'hadjerrimas2016@gmail.com';

export function isOwnerAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return user.email.toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase();
}

// Category collection IDs mapping
export const CATEGORY_COLLECTION_IDS: Record<string, string> = {
  languages: 'stories_languages',
  shahrazad: 'stories_shahrazad',
  knowledge: 'stories_knowledge',
  heritage: 'stories_heritage',
  fantasy: 'stories_fantasy',
  sleep: 'stories_sleep',
};

export const ALL_STORY_COLLECTIONS = [
  'stories',
  'stories_languages',
  'stories_shahrazad',
  'stories_knowledge',
  'stories_heritage',
  'stories_fantasy',
  'stories_sleep',
];

// Error handling as required by Firebase integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial boot connection test as mandated by skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is warming up.');
    }
  }
}
testConnection();

// Authentication helpers
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Stories Firestore operations - listens to the unified 'stories' collection AND any category-specific collections
export function subscribeToStories(
  onSuccess: (stories: any[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const storiesCache = new Map<string, Map<string, any>>();
  const unsubs: Unsubscribe[] = [];

  const emitAll = () => {
    const combinedStoriesMap = new Map<string, any>();
    for (const [_, colMap] of storiesCache.entries()) {
      for (const [id, story] of colMap.entries()) {
        combinedStoriesMap.set(id, story);
      }
    }
    onSuccess(Array.from(combinedStoriesMap.values()));
  };

  for (const colName of ALL_STORY_COLLECTIONS) {
    try {
      const colRef = collection(db, colName);
      const unsub = onSnapshot(
        colRef,
        (snapshot) => {
          const colMap = new Map<string, any>();
          snapshot.forEach((docSnap) => {
            colMap.set(docSnap.id, {
              ...docSnap.data(),
              id: docSnap.id,
            });
          });
          storiesCache.set(colName, colMap);
          emitAll();
        },
        (error) => {
          // Log or handle, but do not crash all if one custom collection is uncreated
          console.warn(`Firestore collection subscription on ${colName}:`, error.message);
          if (onError && colName === 'stories') onError(error);
        }
      );
      unsubs.push(unsub);
    } catch (e) {
      console.warn(`Could not listen to ${colName}`, e);
    }
  }

  return () => {
    unsubs.forEach((unsub) => unsub());
  };
}

export async function publishStoryToFirestore(storyData: any, targetCollection: string = 'stories'): Promise<void> {
  const collectionName = targetCollection || 'stories';
  const path = `${collectionName}/${storyData.id}`;
  try {
    const storyDocRef = doc(db, collectionName, storyData.id);
    await setDoc(storyDocRef, storyData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeStoryFromFirestore(storyId: string, targetCollection: string = 'stories'): Promise<void> {
  const path = `${targetCollection}/${storyId}`;
  try {
    const storyDocRef = doc(db, targetCollection, storyId);
    await deleteDoc(storyDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Picture books Firestore operations
export function subscribeToPictureBooks(
  onSuccess: (books: any[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const booksCol = collection(db, 'pictureBooks');
  return onSnapshot(
    booksCol,
    (snapshot) => {
      const books: any[] = [];
      snapshot.forEach((docSnap) => {
        books.push({
          ...docSnap.data(),
          id: docSnap.id,
        });
      });
      onSuccess(books);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'pictureBooks');
    }
  );
}

export async function publishPictureBookToFirestore(bookData: any): Promise<void> {
  const path = `pictureBooks/${bookData.id}`;
  try {
    const bookDocRef = doc(db, 'pictureBooks', bookData.id);
    await setDoc(bookDocRef, bookData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Sunnah Corner Firestore operations (Surahs and Duas)
export function subscribeToSunnah(
  onSuccess: (items: any[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const sunnahCol = collection(db, 'sunnah');
  return onSnapshot(
    sunnahCol,
    (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({
          ...docSnap.data(),
          id: docSnap.id,
        });
      });
      onSuccess(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'sunnah');
    }
  );
}

export async function publishSunnahToFirestore(itemData: any): Promise<void> {
  const path = `sunnah/${itemData.id}`;
  try {
    const docRef = doc(db, 'sunnah', itemData.id);
    await setDoc(docRef, itemData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeSunnahFromFirestore(itemId: string): Promise<void> {
  const path = `sunnah/${itemId}`;
  try {
    const docRef = doc(db, 'sunnah', itemId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Hero Video settings Firestore operations
export function subscribeToHeroVideo(
  onSuccess: (videoSettings: any) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const docRef = doc(db, 'app_settings', 'hero_video');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onSuccess(docSnap.data());
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'app_settings/hero_video');
    }
  );
}

export async function publishHeroVideoToFirestore(videoSettings: any): Promise<void> {
  const path = 'app_settings/hero_video';
  try {
    const docRef = doc(db, 'app_settings', 'hero_video');
    await setDoc(docRef, videoSettings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Reading Club Firestore operations (Public stories and profiles)
export function subscribeToReadingClubStories(
  onSuccess: (stories: any[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const clubCol = collection(db, 'readingClubStories');
  return onSnapshot(
    clubCol,
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({
          ...docSnap.data(),
          id: docSnap.id,
        });
      });
      onSuccess(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'readingClubStories');
    }
  );
}

export async function publishReadingClubStoryToFirestore(storyData: any): Promise<void> {
  const path = `readingClubStories/${storyData.id}`;
  try {
    const docRef = doc(db, 'readingClubStories', storyData.id);
    await setDoc(docRef, storyData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToPublicProfiles(
  onSuccess: (profiles: any[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const profCol = collection(db, 'readingClubProfiles');
  return onSnapshot(
    profCol,
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({
          ...docSnap.data(),
          id: docSnap.id,
        });
      });
      onSuccess(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'readingClubProfiles');
    }
  );
}

export async function savePublicProfileToFirestore(profileData: any): Promise<void> {
  const path = `readingClubProfiles/${profileData.id}`;
  try {
    const docRef = doc(db, 'readingClubProfiles', profileData.id);
    await setDoc(docRef, profileData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

