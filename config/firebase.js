import firebase from 'firebase'
const firebaseConfig = {
  apiKey: "AIzaSyDxVjK9-2EtDRYggPRpE-PjoZSiwdj1wJU",
  authDomain: "we-have-the-square.firebaseapp.com",
  databaseURL: "https://we-have-the-square.firebaseio.com",
  projectId: "we-have-the-square",
  storageBucket: "we-have-the-square.appspot.com",
  messagingSenderId: "953517265619",
  appId: "1:953517265619:web:9fd97ad6af6a72718f3a26"
};
firebase.initializeApp(firebaseConfig);
export default firebase;