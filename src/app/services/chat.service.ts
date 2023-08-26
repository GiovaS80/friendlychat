import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Storage } from '@angular/fire/storage';
import {
  DocumentData,
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from '@angular/fire/firestore';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(
    // private auth: Auth,
    // private router: Router,
    private storage: Storage
  ) {} // end constructor
  auth: Auth = inject(Auth);
  router: Router = inject(Router);
  firestore: Firestore = inject(Firestore);
  messaging: Messaging = inject(Messaging);

  // auth = getAuth();
  // Observable user
  user$ = user(this.auth);

  private provider = new GoogleAuthProvider();

  // Signs-in Friendly Chat.
  login() {
    console.log(this.auth);
    console.log(this.provider);

    // this.provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    signInWithPopup(this.auth, this.provider).then((result) => {
      console.log('check');

      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
        const token = credential.accessToken;
        console.log(token);
      }
      const user = result.user;
      console.log(credential);

      this.router.navigate(['/', 'chat']);
      return credential;
    });
  }

  // Logout of Friendly Chat.
  logout() {
    signOut(this.auth)
      .then(() => {
        this.router.navigate(['/', 'login']);
        console.log('signed out');
      })
      .catch((error) => {
        console.log('sign out error: ' + error);
      });
  }

  // Loads chat messages history and listens for upcoming ones.
  // Loads chat message history and listens for upcoming ones.
  loadMessages = () => {
    // Create the query to load the last 12 messages and listen for new ones.
    const recentMessagesQuery = query(
      collection(this.firestore, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(12)
    );
    // Start listening to the query.
    return collectionData(recentMessagesQuery);
  };

  // Saves a new message to Cloud Firestore.
  saveTextMessage = async (messageText: string) => {
    return null;
  };

  // Saves a new message containing an image in Firebase.
  // This first saves the image in Firebase storage.
  saveImageMessage = async (file: any) => {};

  // Adds a text or image message to Cloud Firestore.
  addMessage = async (
    textMessage: string | null,
    imageUrl: string | null
  ): Promise<void | DocumentReference<DocumentData>> => {
    let data: any;
    try {
      this.user$.subscribe(async (user) => {
        if (textMessage && textMessage.length > 0) {
          data = await addDoc(collection(this.firestore, 'messages'), {
            name: user?.displayName,
            text: textMessage,
            profilePicUrl: user?.photoURL,
            timestamp: serverTimestamp(),
            uid: user?.uid,
          });
        } else if (imageUrl && imageUrl.length > 0) {
          data = await addDoc(collection(this.firestore, 'messages'), {
            name: user?.displayName,
            imageUrl: imageUrl,
            profilePicUrl: user?.photoURL,
            timestamp: serverTimestamp(),
            uid: user?.uid,
          });
        }
        return data;
      });
    } catch (error) {
      console.error('Error writing new message to Firebase Database', error);
      return;
    }
  }; //end addMessage

  // Saves the messaging device token to Cloud Firestore.
saveMessagingDeviceToken= async () => {
  try {
    const currentToken = await getToken(this.messaging);
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to Cloud Firestore.
      const tokenRef = doc(this.firestore, 'fcmTokens', currentToken);
      await setDoc(tokenRef, { uid: this.auth.currentUser?.uid });

      // This will fire when a message is received while the app is in the foreground.
      // When the app is in the background, firebase-messaging-sw.js will receive the message instead.
      onMessage(this.messaging, (message) => {
        console.log(
          'New foreground notification from Firebase Messaging!',
          message.notification
        );
      });
    } else {
      // Need to request permissions to show notifications.
      this.requestNotificationsPermissions();
    }
  } catch(error) {
    console.error('Unable to get messaging token.', error);
  };
}//end saveMessagingDeviceToken

// Requests permissions to show notifications.
requestNotificationsPermissions = async () => {
  console.log('Requesting notifications permission...');
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    console.log('Notification permission granted.');
    // Notification permission granted.
    await this.saveMessagingDeviceToken();
  } else {
    console.log('Unable to get permission to notify.');
  }
}

  //empty row
} //end class ChatService
