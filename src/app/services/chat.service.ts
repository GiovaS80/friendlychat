import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Storage } from '@angular/fire/storage';
import { DocumentData, DocumentReference, Firestore, addDoc, collection, serverTimestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(
    // private auth: Auth,
    // private router: Router,
    private storage: Storage,
  ) {} // end constructor
  auth: Auth = inject(Auth);
  router: Router = inject(Router);
  firestore: Firestore = inject(Firestore);

  // Observable user
  user$ = user(this.auth);

  private provider = new GoogleAuthProvider();

  // Signs-in Friendly Chat.
  login() {
    signInWithPopup(this.auth, this.provider).then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
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
  loadMessages = () => {
    return null as unknown;
  };

  // Saves a new message to Cloud Firestore.
  saveTextMessage = async (messageText: string) => {
    return null;
  };

  // Saves a new message containing an image in Firebase.
  // This first saves the image in Firebase storage.
  saveImageMessage = async (file: any) => {};

  // Adds a text or image message to Cloud Firestore.
  addMessage = async(textMessage: string | null, imageUrl: string | null): Promise<void | DocumentReference<DocumentData>> => {
    let data: any;
    try {
      this.user$.subscribe(async (user) => 
      { 
        if(textMessage && textMessage.length > 0) {
          data =  await addDoc(collection(this.firestore, 'messages'), {
            name: user?.displayName,
            text: textMessage,
            profilePicUrl: user?.photoURL,
            timestamp: serverTimestamp(),
            uid: user?.uid
          })}
          else if (imageUrl && imageUrl.length > 0) {
            data =  await addDoc(collection(this.firestore, 'messages'), {
              name: user?.displayName,
              imageUrl: imageUrl,
              profilePicUrl: user?.photoURL,
              timestamp: serverTimestamp(),
              uid: user?.uid
            });
          }
          return data;
        }
      );
    }
    catch(error) {
      console.error('Error writing new message to Firebase Database', error);
      return;
    }
}//end addMessage

//empty row
} //end class ChatService
