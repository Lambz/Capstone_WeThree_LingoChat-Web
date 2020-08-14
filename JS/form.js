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

  function signUp(){
      var name = document.getElementById("name").value;
      var email = document.getElementById("email").value;
      var password = document.getElementById("password").value;

      const promise = auth.createUserWithEmailAndPassword(email, password);
      promise.catch(e => alert(e.message));

      alert("Signed Up");
  }

  function signIn(){
    var email = document.getElementById("email");
    var password = document.getElementById("password");


  }
