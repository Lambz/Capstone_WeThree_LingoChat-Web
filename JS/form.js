  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyCWA-vbYBgHlcfyq124jTHwj-rL_eIy_Tw",
    authDomain: "lingo-chat-69737.firebaseapp.com",
    databaseURL: "https://lingo-chat-69737.firebaseio.com",
    projectId: "lingo-chat-69737",
    storageBucket: "lingo-chat-69737.appspot.com",
    messagingSenderId: "641112902679",
    appId: "1:641112902679:web:d3d88eaba050f9de932052",
    measurementId: "G-EZ5FCCXTVL"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

  const auth = firebase.auth();

  

  function signIn(){

    var email = document.getElementById("login_email").value;
    var password = document.getElementById("login_password").value;

    const promise = auth.signInWithEmailAndPassword(email, password);
      promise.catch(e => alert(e.message));

      alert("Signed In" );
  }

  firebase.auth().onAuthStateChanged(user =>{
    if (user){this.userId=user.uid}

  });
  

  
  // if (user != null) {
  //   // name = user.displayName;
  //   // email = user.email;
  //   // photoUrl = user.photoURL;
  //   // emailVerified = user.emailVerified;
  //   uid = user.uid;  
  //   //console.log(uid);
  // }
  
  

