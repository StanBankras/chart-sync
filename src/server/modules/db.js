import dotenv from 'dotenv';
dotenv.config();
import firebase from 'firebase';
import { rooms } from '../server';

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID
});

export const db = firebase.firestore();

// Get rooms from firestore database with all data
// Store them in memory
(async function() {
  const data = await db.collection('rooms').get();
  data.docs.forEach(doc => rooms[doc.id] = doc.data());
})();

export async function saveRoom(documentId, object) {
  const copy = JSON.parse(JSON.stringify(object));
  delete copy.users;
  await db.collection("rooms").doc(documentId).update(copy);
}