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

firebase.initializeApp(firebaseConfig);
firebase.analytics();
var database = firebase.database();
var selected_file = null;
var contact_messages = [];
var last_ref;
var messages = []
var to_user;
var map;
var ltitle;
var marker;
var message_index = 0;
var selected_message_index = 0;

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
        httpGetAsync(text,message.user.uid+"_last_message");
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
    messages = []
    last_ref = firebase.database().ref('/Messages/'+currentUser.uid+'/'+user.uid);
    last_ref.on('child_added', function(data)
    {
        var message = new Message(data, false);
        addMessage(message);
        messages.push(message);
        // console.log(message);
    });
    message_index = 0;
}

function addMessage(message)
{
    var view = document.getElementById("messages_message");
    var div;
    if(currentUser.uid == message.from)
    {
        div = "<div id='"+message.id+"_div' class='receiver_div'><span id='"+message.id+"_span' class='receiver_span' onclick='messageClicked("+message_index+")'>";
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
        else if(message.type == "video")
        {
            div+="<img src='res/video.png' style='padding:1%' class='message_image'/>"
        }
        else
        {
            div+="<img src='res/location.png' class='message_image'/>"
        }
        div += "</span></div>";
    }
    else
    {
        div = "<div id='"+message.id+"_div' class='sender_div'><span id='"+message.id+"_span' class='sender_span' onclick='messageClicked("+message_index+")'>";
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
    if(message.type == "text")
    {
        // console.log(message);
        httpGetAsyncForMessages(message, callbackForMessages);
    }
    view.innerHTML += div;
    view.scrollTop = view.scrollHeight;
    message_index += 1;
}

function messageClicked(index)
{
    // console.log(messages[index]);
    document.getElementById("optionModal").style.display = "block";
    selected_message_index = index;
    var m = messages[selected_message_index];
    if(m.from == currentUser.uid)
    {
        document.getElementById("delete_for_everyone_btn").style.display = "block";
    }
    else
    {
        document.getElementById("delete_for_everyone_btn").style.display = "none";
    }
    if(m.type == "image")
    {
        document.getElementById("view_image_btn").style.display = "block";
    }
    else
    {
        document.getElementById("view_image_btn").style.display = "none";
    }
    if(m.type == "pdf" || m.type == "docx")
    {
        document.getElementById("view_document_btn").style.display = "block";
    }
    else
    {
        document.getElementById("view_document_btn").style.display = "none";
    }
    if(m.type == "location")
    {
        document.getElementById("view_location_btn").style.display = "block";
    }
    else
    {
        document.getElementById("view_location_btn").style.display = "none";
    }
    if(m.type == "video")
    {
        document.getElementById("view_video_btn").style.display = "block";
    }
    else
    {
        document.getElementById("view_video_btn").style.display = "none";
    }
}

function deleteForMe()
{
    var m = messages[selected_message_index];
    var ref = firebase.database().ref().child("Messages").child(m.from).child(m.to).child(m.id);
    ref.remove();
    messages.splice(selected_message_index,1);
    message_index = 0;
    document.getElementById("messages_message").innerHTML = "";
    messages.forEach(function(m1)
    {
        addMessage(m1);
    });
    hideModal();
}

function deleteForEveryone()
{
    var m = messages[selected_message_index];
    firebase.database().ref().child("Messages").child(m.to).child(m.from).child(m.id).remove();
    deleteForMe();
}

function view()
{
    var m = messages[selected_message_index];
    var win = window.open(m.link, '_blank');
    win.focus();
    hideModal();
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
        var errorCode = error.code;
        var errorMessage = error.message;
    });
}

function getUserOldChats()
{
    firebase.database().ref('/Messages/' + currentUser.uid).on('value',function(snapshot){
        snapshot.forEach(function(childSnapshot) {
            var last_chat = getLastChat(childSnapshot);
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

function newImage()
{
    var input = document.getElementById('file-input');
    var listener = input.addEventListener('change', function() {
        if(input.files.length > 0)
        {
            selected_file = input.files[0];
        }
        input.removeEventListener('change',listener);
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
        else
        {
            firebase.database().ref('/Users/' + currentUser.uid).update(data);
            currentUser.first_name = data["first_name"];
            currentUser.last_name = data["last_name"];
            currentUser.lang = data["lang"];
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
    switch (parseInt(code))
    {
        case 1:
            return "fr";
            break;
        case 2:
            return "de";
            break;
        case 3:
            return "es";
            break;
        case 4:
            return "hi";
            break;
        default:
            return "en";
    }
}

function httpGetAsyncForMessages(message, callback)
{
    var lang_code = getLangCode(currentUser.lang);
    var url = "https://translation.googleapis.com/language/translate/v2?key=AIzaSyCQjWT5txdMwpJXnCJ3H-pzMXuu0f46wzA&target="+lang_code+"&q="+message.text;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText, message);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}

function httpGetAsync(text, id)
{
    var lang_code = getLangCode(currentUser.lang);
    var url = "https://translation.googleapis.com/language/translate/v2?key=AIzaSyCQjWT5txdMwpJXnCJ3H-pzMXuu0f46wzA&target="+lang_code+"&q="+text;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callbackForLastMessage(xmlHttp.responseText, id);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}

function callbackForLastMessage(text, id)
{
    var json = JSON.parse(text);
    try
    {
        document.getElementById(id).innerHTML = json.data.translations[0].translatedText;
    }
    catch(err)
    {

    }
}

function callbackForMessages(text, message)
{
    var json = JSON.parse(text);
    var span = document.getElementById(message.id+"_span")
    span.innerHTML = json.data.translations[0].translatedText;
    console.log(message + " "+ json.data.translations[0].translatedText);
}

function attachmentsClicked()
{
    document.getElementById("myModal").style.display = "block";
}

function hideModal() {
    document.getElementById("myModal").style.display = "none";
    document.getElementById("mapModal").style.display = "none";
    document.getElementById("optionModal").style.display = "none";
  }
  
  // When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == document.getElementById("myModal")) {
        document.getElementById("myModal").style.display = "none";
        document.getElementById("mapModal").style.display = "none";
    }
}

function getImage()
{
    document.getElementById("myModal").style.display = "none";
    var input = document.getElementById('file-input');
    var listener = input.addEventListener('change', function() {
        if(input.files.length > 0)
        {
            var image = input.files[0];
            sendImageMessage(image);
        }
        input.removeEventListener('change',listener);
    });
    input.click(); 
}

function sendImageMessage(image)
{
    var receiver_ref = firebase.database().ref().child("Messages").child(currentUser.uid).child(to_user.uid).push();
    var key = receiver_ref.key;
    var sender_ref = firebase.database().ref().child("Messages").child(to_user.uid).child(currentUser.uid).child(key);
    var storage_ref = firebase.storage().ref().child("Images").child(key+".jpg");
    var upload_task = storage_ref.put(image);
    upload_task.on('state_changed', function(snapshot)
    {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) 
        {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
        }
    }, function(error) 
    {
        // Handle unsuccessful uploads
    }, function() 
    {
            upload_task.snapshot.ref.getDownloadURL().then(function(downloadURL) {
            console.log('File available at', downloadURL);
            // var data = {
            //     "image": downloadURL
            // };
            var data = {
                "from": currentUser.uid,
                "id": key,
                "lang": getLangCode(currentUser.lang),
                "link":downloadURL,
                "text":"",
                "to":to_user.uid,
                "type":"image"
            }
            receiver_ref.set(data);
            sender_ref.set(data);
            // firebase.database().ref('/Users/' + currentUser.uid).update(data);
        });
    });
}

function getPdf()
{
    document.getElementById("myModal").style.display = "none";
    var input = document.getElementById('file_Pdf');
    var listener = input.addEventListener('change', function() {
        if(input.files.length > 0)
        {
            var image = input.files[0];
            sendPdfMessage(image);
        }
        input.removeEventListener('change',listener);
    });
    input.click(); 
}

function sendPdfMessage(image)
{
    var receiver_ref = firebase.database().ref().child("Messages").child(currentUser.uid).child(to_user.uid).push();
    var key = receiver_ref.key;
    var sender_ref = firebase.database().ref().child("Messages").child(to_user.uid).child(currentUser.uid).child(key);
    var storage_ref = firebase.storage().ref().child("Documents").child(key+".pdf");
    var upload_task = storage_ref.put(image);
    upload_task.on('state_changed', function(snapshot)
    {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) 
        {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
        }
    }, function(error) 
    {
        // Handle unsuccessful uploads
    }, function() 
    {
            upload_task.snapshot.ref.getDownloadURL().then(function(downloadURL) {
            console.log('File available at', downloadURL);
            // var data = {
            //     "image": downloadURL
            // };
            var data = {
                "from": currentUser.uid,
                "id": key,
                "lang": getLangCode(currentUser.lang),
                "link":downloadURL,
                "text":"",
                "to":to_user.uid,
                "type":"pdf"
            }
            receiver_ref.set(data);
            sender_ref.set(data);
            // firebase.database().ref('/Users/' + currentUser.uid).update(data);
        });
    });
}

function getMSWord()
{
    document.getElementById("myModal").style.display = "none";
    var input = document.getElementById('file_msword');
    var listener = input.addEventListener('change', function() {
        if(input.files.length > 0)
        {
            var image = input.files[0];
            sendDocxMessage(image);
        }
        input.removeEventListener('change',listener);
    });
    input.click(); 
}

function sendDocxMessage(image)
{
    var receiver_ref = firebase.database().ref().child("Messages").child(currentUser.uid).child(to_user.uid).push();
    var key = receiver_ref.key;
    var sender_ref = firebase.database().ref().child("Messages").child(to_user.uid).child(currentUser.uid).child(key);
    var storage_ref = firebase.storage().ref().child("Documents").child(key+".docx");
    var upload_task = storage_ref.put(image);
    upload_task.on('state_changed', function(snapshot)
    {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) 
        {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
        }
    }, function(error) 
    {
        // Handle unsuccessful uploads
    }, function() 
    {
            upload_task.snapshot.ref.getDownloadURL().then(function(downloadURL) {
            console.log('File available at', downloadURL);
            // var data = {
            //     "image": downloadURL
            // };
            var data = {
                "from": currentUser.uid,
                "id": key,
                "lang": getLangCode(currentUser.lang),
                "link":downloadURL,
                "text":"",
                "to":to_user.uid,
                "type":"docx"
            }
            receiver_ref.set(data);
            sender_ref.set(data);
            // firebase.database().ref('/Users/' + currentUser.uid).update(data);
        });
    });
}

function initMap() {
    var toronto = {lat: 43.6426, lng: -79.3871};
    map = new google.maps.Map(document.getElementById('map'), {zoom: 12, center: toronto});

    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(event.latLng);
     });
}

function getLocation()
{
    document.getElementById("mapModal").style.display = "block";
    document.getElementById("map_send_btn").style.display = "inline-block";
}

function placeMarker(location) {
    // console.log("mLocation");
    // console.log(mLocation[0]);
    marker = new google.maps.Marker({
        position: location, 
        map: map
    });
    // console.log(marker.getPosition().lat());
    geocodeLatLng(location)
}

function geocodeLatLng(location) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
        { location: location },(results, status) => 
        {
            if (status === "OK") {
            if (results[0]) {
                // map.setZoom(11);
                // const marker = new google.maps.Marker({
                // position: latlng,
                // map: map
                // });
                const infowindow = new google.maps.InfoWindow();
                infowindow.setContent(results[0].formatted_address);
                ltitle = results[0].formatted_address;
                infowindow.open(map, marker);
            } else {
                window.alert("No results found");
            }
            } else {
            window.alert("Geocoder failed due to: " + status);
            }
        }
    );
}

function sendLocation()
{
    document.getElementById("myModal").style.display = "none";
    document.getElementById("mapModal").style.display = "none";
    var receiver_ref = firebase.database().ref().child("Messages").child(currentUser.uid).child(to_user.uid).push();
    var key = receiver_ref.key;
    var sender_ref = firebase.database().ref().child("Messages").child(to_user.uid).child(currentUser.uid).child(key);
    if(marker != null)
    {
        if (ltitle == null || ltitle == "")
        {
            ltitle = "Unknown";
        }
        var data = {
            "from": currentUser.uid,
            "id": key,
            "lang": getLangCode(currentUser.lang),
            "link":"",
            "text":"",
            "to":to_user.uid,
            "type":"location",
            "lat":marker.getPosition().lat(),
            "lng":marker.getPosition().lng(),
            "locationtitle": ltitle
        }
        console.log(data);
        receiver_ref.set(data);
        sender_ref.set(data);
        marker = null;
        ltitle = null;
    }
}

function viewLocation()
{
    var m = messages[selected_message_index];
    console.log(m);
    document.getElementById("mapModal").style.display = "block";
    document.getElementById("map_send_btn").style.display = "none";
    document.getElementById("optionModal").style.display = "none";
    var location = new google.maps.LatLng(m.lat, m.lng)
    marker = new google.maps.Marker({
        position: location, 
        map: map
    });
    const infowindow = new google.maps.InfoWindow();
    infowindow.setContent(m.location_title);
    infowindow.open(map,marker);
}

function getVideo()
{
    document.getElementById("myModal").style.display = "none";
    var input = document.getElementById('file_video');
    var listener = input.addEventListener('change', function() {
        if(input.files.length > 0)
        {
            var image = input.files[0];
            sendVideo(image);
        }
        input.removeEventListener('change',listener);
    });
    input.click(); 
}

function sendVideo(image)
{
    var receiver_ref = firebase.database().ref().child("Messages").child(currentUser.uid).child(to_user.uid).push();
    var key = receiver_ref.key;
    var sender_ref = firebase.database().ref().child("Messages").child(to_user.uid).child(currentUser.uid).child(key);
    var storage_ref = firebase.storage().ref().child("Videos").child(key+".mp4");
    var upload_task = storage_ref.put(image);
    upload_task.on('state_changed', function(snapshot)
    {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) 
        {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
        }
    }, function(error) 
    {
        // Handle unsuccessful uploads
    }, function() 
    {
            upload_task.snapshot.ref.getDownloadURL().then(function(downloadURL) {
            console.log('File available at', downloadURL);
            // var data = {
            //     "image": downloadURL
            // };
            var data = {
                "from": currentUser.uid,
                "id": key,
                "lang": getLangCode(currentUser.lang),
                "link":downloadURL,
                "text":"",
                "to":to_user.uid,
                "type":"video"
            }
            receiver_ref.set(data);
            sender_ref.set(data);
            // firebase.database().ref('/Users/' + currentUser.uid).update(data);
        });
    });
}