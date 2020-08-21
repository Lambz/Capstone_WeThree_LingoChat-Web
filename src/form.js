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
var database = firebase.database();
var selected_file = null;

class User {
// var email, first_name, last_name, image, lang, uid;
    constructor(snapshot, uid) {
        this.email = snapshot.val().email;
        this.first_name = snapshot.val().first_name;
        this.last_name = snapshot.val().last_name;
        this.image = snapshot.val().image;
        this.lang = snapshot.val().lang;
        this.uid = uid;
        console.log(this.email)
    }
}

var currentUser;

const auth = firebase.auth();

function signUp(){
    var name = document.getElementById("name");
    var email = document.getElementById("email");
    var password = document.getElementById("password");

    const promise = auth.createUserWithEmailAndPassword(email.nodeValue, password.nodeValue);
    promise.catch(e => alert(e.message));

    alert("Signed Up");
}

function signIn(){
    var email = document.getElementById("login_email").value;
    var password = document.getElementById("login_password").value;

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;
            firebase.database().ref('/Users/' + uid).once('value').then(function(snapshot) {
                currentUser = new User(snapshot,uid);
                document.getElementById("box").style.display = "none"
                document.getElementById("main").style.display = "flex"
                document.getElementById("name").value = currentUser.first_name + " "+ currentUser.last_name;
                if (currentUser.lang != "")
                {
                    document.getElementById("lang").value = currentUser.lang;
                }
                if(currentUser.image != "")
                {
                    document.getElementById("profile_image").src = currentUser.image
                }
            });
        } else {
            // User is signed out.
            // ...
        }
    });

    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage);
        // ...
    });
}

function signOut(){
    auth.signOut();
    document.getElementById("box").style.display = "block"
    document.getElementById("main").style.display = "none"
}

function loadOldChats()
{
    console.log(firebase.auth().currentUser);
}

function newImage()
{
    var input = document.getElementById('file-input');
    // $('file-input').change(function () {
    //     console.log("hello");
    //     console.log(document.getElementById('file-input').value);
    // });
    input.addEventListener('change', function() {
        console.log("hello");
        if(input.files.length > 0)
        {
            selected_file = input.files[0];
        }
        //   label.textContent = input.files[0].name;
        // else
        //   label.textContent = 'Select a file';
    });
    input.click(); 
}

function save()
{
    var name = document.getElementById("name").value;
    var lang = document.getElementById("lang").value;
    if(name != "" && lang != "")
    {
        let names = name.split(" ");
        let first_name = names[0];
        var last_name = "";
        if(names.length>1)
        {
            last_name = names[1];
        }
        var data = {
            "first_name": names[0],
            "last_name": last_name,
            "lang": lang
        };
        console.log(data);

        if(selected_file != null)
        {
            // console.log(input.files[0]);
            var storage_ref = firebase.storage().ref().child("Profile Images").child(currentUser.uid+".jpg");
            var upload_task = storage_ref.put(input.files[0]);
            // .then(function(snapshot) {
            //     console.log(snapshot);
            //   });
            upload_task.on('state_changed', function(snapshot){
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.log('Upload is paused');
                    break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                    console.log('Upload is running');
                    break;
                }
            }, function(error) {
                // Handle unsuccessful uploads
            }, function() {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                    upload_task.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    console.log('File available at', downloadURL);
                    var data = {
                        "image": downloadURL
                    };
                    firebase.database().ref('/Users/' + currentUser.uid).update(data);
                });
            });
        }
    } 
    
}

