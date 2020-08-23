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
var contact_messages = [];
var last_ref;
var messages = []
var to_user;

class User 
{
    // var email, first_name, last_name, image, lang, uid;
    constructor(snapshot, uid) 
    {
        this.email = snapshot.val().email;
        this.first_name = snapshot.val().first_name;
        this.last_name = snapshot.val().last_name;
        this.image = snapshot.val().image;
        this.lang = snapshot.val().lang;
        this.uid = uid;
        console.log(this.email)
    }
}

class Message
{
    // String from, lang, text, type, link, to, fileName, id, lat, lng, locationtitle;
    constructor(snapshot, cond = true)
    {
        var val = snapshot.val()
        this.from = val.from;
        this.lang = val.lang;
        this.text = val.text;
        this.type = val.type;
        this.link = val.link;
        this.to = val.to;
        this.file_name = val.fileName;
        this.id = val.id;
        this.lat = val.lat;
        this.lng = val.lng;
        this.location_title = val.locationtitle;
        if(cond)
        {
            var user_uid;
            if(currentUser.uid == this.from)
            {
                user_uid = this.to;
            }
            else
            {
                user_uid = this.from;
            }
            getUserInfo(this, user_uid);
        }
    }
}

function getUserInfo(message, user_id)
{
    firebase.database().ref('/Users/' + user_id).on('value',function(snapshot) {
        user = new User(snapshot,user_id);
        console.log(snapshot.val());
        message.user = user;
        deleteMessageFromContactMessage(message);
        contact_messages.push(message);
        printContactedPersons();
    });
}

function deleteMessageFromContactMessage(message)
{
    // var index = contact_messages.indexOf(message);
    var index = -1;
    var i = 0;
    contact_messages.forEach(function (m)
    {
        if(m.user.uid == message.user.uid)
        {
            index = i;
        }
        i+=1;
    });
    // console.log(index);
    if(index != -1)
    {
        contact_messages.splice(index,1);
    }
}

function printContactedPersons()
{
    var contacts_div = document.getElementById("contacts");
    contacts_div.innerHTML = "";
    var index = 0;
    contact_messages.forEach(function (message)
    {
        var image = "res/placeholder.png";
        if(message.user.image != "" )
        {
            image = message.user.image;
        }
        var text = message.text;
        if(message.type != "text")
        {
            text = message.type;
        }
        var new_div = "<div id='"+message.user.uid+"_contact_div' class='contact_div' onclick='getChats(\""+index+"\")'><span class='contact_image_span'><img src='"+image+"' class='contact_img' /></span><span class='contact_name_last_span'><p class='contact_name_div'>"+message.user.first_name+" "+message.user.last_name+"</p><p id='"+message.user.uid+"_last_message'>"+text+"</p></span></div>";
        contacts_div.innerHTML += new_div;
        index += 1;
    });    
}

var currentUser;

const auth = firebase.auth();

function getChats(index)
{
    to_user = contact_messages[index].user;
    document.getElementById("settings").style.display = "none";
    document.getElementById("messages").style.display = "block";
    document.getElementById("messages_message").innerHTML = "";
    console.log(contact_messages[index]);
    var user = contact_messages[index].user;
    var image = contact_messages[index].user.image;
    if(image != "")
    {
        document.getElementById("message_header_image").src = image;
    }
    document.getElementById("message_header_name").innerHTML = contact_messages[index].user.first_name  +" "+ contact_messages[index].user.last_name;
    try
    {
        last_ref.off('child_added');
    }
    catch (err)
    {
        console.log(err);
    }
    last_ref = firebase.database().ref('/Messages/'+currentUser.uid+'/'+user.uid);
    last_ref.on('child_added', function(data)
    {
        var message = new Message(data, false);
        addMessage(message);
        // // messages.push(messages);
        // console.log(message);
    });
}

function addMessage(message)
{
    var view = document.getElementById("messages_message");
    var div;
    if(currentUser.uid == message.from)
    {
        div = "<div id='"+message.id+"_div' class='receiver_div'><span id='"+message.id+"_span' class='receiver_span'>";
        if(message.type == "text")
        {
            div+=message.text;
        }
        else if(message.type == "image")
        {
            div+="<img src='"+message.link+"' class='message_image'/>"
        }
        else if(message.type == "pdf" || message.type == "docx")
        {
            div+="<img src='res/file.png' class='message_image'/>"
        }
        else
        {
            div+="<img src='res/location.png' class='message_image'/>"
        }
        div += "</span></div>";
    }
    else
    {
        div = "<div id='"+message.id+"_div' class='sender_div'><span id='"+message.id+"_span' class='sender_span'>";
        if(message.type == "text")
        {
            div+=message.text;
        }
        else if(message.type == "image")
        {
            div+="<img src='"+message.link+"' class='message_image'/>"
        }
        else if(message.type == "pdf" || message.type == "docx")
        {
            div+="<img src='res/file.png' class='message_image'/>"
        }
        else
        {
            div+="<img src='res/location.png' class='message_image'/>"
        }
        div += "</span></div>";
    }
    view.innerHTML += div;
    view.scrollTop = view.scrollHeight;
}

function signUp(){
    var name = document.getElementById("name");
    var email = document.getElementById("email");
    var password = document.getElementById("password");

    const promise = auth.createUserWithEmailAndPassword(email.nodeValue, password.nodeValue);
    promise.catch(e => alert(e.message));

    alert("Signed Up");
}

function signIn(){
    // console.log("logging in");
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
                getUserOldChats();
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
        // console.log(errorMessage);
        // ...
    });
}

function getUserOldChats()
{
    firebase.database().ref('/Messages/' + currentUser.uid).on('value',function(snapshot){
        // console.log(snapshot.val())
        snapshot.forEach(function(childSnapshot) {
            // // key will be "ada" the first time and "alan" the second time
            // var key = childSnapshot.key;
            // // childData will be the actual contents of the child
            // var childData = childSnapshot.val();
            var last_chat = getLastChat(childSnapshot);
            // console.log(last_chat);
        });
      });
}

function getLastChat(snapshot)
{
    var last_chat;
    snapshot.forEach(function(childSnapshot)
    {
        last_chat = childSnapshot;
    });
    return new Message(last_chat);
}

function signOut(){
    auth.signOut();
    document.getElementById("box").style.display = "block"
    document.getElementById("main").style.display = "none"
}

function loadOldChats()
{
    // console.log(firebase.auth().currentUser);
}

function newImage()
{
    var input = document.getElementById('file-input');
    // $('file-input').change(function () {
    //     console.log("hello");
    //     console.log(document.getElementById('file-input').value);
    // });
    input.addEventListener('change', function() {
        // console.log("hello");
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

function settingsClicked()
{
    document.getElementById("settings").style.display = "block";
    document.getElementById("messages").style.display = "none";
}

function sendMessage()
{
    var view = document.getElementById("message_text");
    var text = view.value;
    var receiver_ref = firebase.database().ref().child("Messages").child(currentUser.uid).child(to_user.uid).push();
    var key = receiver_ref.key;
    var sender_ref = firebase.database().ref().child("Messages").child(to_user.uid).child(currentUser.uid).child(key);
    if(text != "")
    {
        var data = {
            "from": currentUser.uid,
            "id": key,
            "lang": getLangCode(currentUser.lang),
            "link":"",
            "text":text,
            "to":to_user.uid,
            "type":"text"
        }
        receiver_ref.set(data);
        sender_ref.set(data);
        view.value = "";
    }
}

function getLangCode(code)
{
    switch (code)
    {
        case 1:
                return "fr";
        case 2:
            return "de";
        case 3:
            return "es";
        case 4:
            return "hi";
        default:
            return "en";
    }
}