document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + '5000');

    // Check if username is available, if not get one
    if (!localStorage.getItem(username)) {
        let input = document.querySelector("#username")
        let button = document.querySelector("#setname")

        $('#myModal').modal({ backdrop: 'static', keyboard: false });
        button.disabled = true;
        input.addEventListener("keyup", () => {
            if (input.value.length > 0) {
                button.disabled = false;
            }
            else {
                button.disabled = true;
            }
        });
        button.addEventListener("click", () => {
            localStorage.setItem(username, input.value);
            $('#myModal').modal('hide');
            socket.emit("join channel", { channelname: document.querySelector(".active").innerHTML, username: localStorage.getItem(username), channel: true });
        });
    }

    // Activate #general by default
    document.querySelector(".list-group-item").classList.add("active");

    // Activate different channels
    document.querySelectorAll(".list-group-item").forEach(element => {
        element.addEventListener("click", () => {
            socket.emit("leave channel", { channelname: document.querySelector(".active").innerHTML, username: localStorage.getItem(username) });
            document.querySelector(".active").classList.remove("active");
            element.classList.add("active");
            socket.emit("join channel", { channelname: document.querySelector(".active").innerHTML, username: localStorage.getItem(username) });
        });
    });

    // Add channel
    let button = document.querySelector("#addchannel");
    let input = document.querySelector("#newchannel");

    button.disabled = true;
    input.addEventListener("keyup", () => {
        if (input.value.length > 0) {
            button.disabled = false;
        }
        else {
            button.disabled = true;
        }
    });
    button.addEventListener("click", () => {
        socket.emit("add channel", input.value)
        input.value = "";
    });

    socket.on("new channel", (data) => {

        if (data["error"]) {
            alert("Channel already exists");
        }
        else {
            let btn = document.createElement("button");

            socket.emit("leave channel", { channelname: document.querySelector(".active").innerHTML, username: localStorage.getItem(username) });
            document.querySelector(".active").classList.remove("active");
            btn.appendChild(document.createTextNode("#" + data["channelname"]));
            btn.classList.add("list-group-item", "list-group-item-action", "active");
            document.querySelector("#channellist").appendChild(btn);
            document.querySelector("#chatbox").innerHTML = "";
            socket.emit("join channel", { channelname: document.querySelector(".active").innerHTML, username: localStorage.getItem(username) });
            btn.addEventListener("click", () => {
                document.querySelector(".active").classList.remove("active");
                btn.classList.add("active");
                socket.emit("join channel", { channelname: document.querySelector(".active").innerHTML, username: localStorage.getItem(username) });
            });
        }
    });

    // show messages on starup
    socket.on("connect", () => {
        socket.emit("join channel", { channelname: document.querySelector(".active").innerHTML, username: localStorage.getItem(username), channel: true });
    });

    // show messages when a channel is changed
    socket.on("messages", (data) => {

        if (data["channel"]) {
            document.querySelector("#chatbox").innerHTML = "";

            for (const msg of data["msgs"]) {
                create_message(msg["username"], msg["msg"], msg["time"]);
            }
        }
        else {
            create_message(data["username"], data["msg"], data["time"])
        }
    });

    let send = document.querySelector("#send-button");
    let msg = document.querySelector("#send-input");

    send.disabled = true;
    msg.addEventListener("keyup", () => {
        if (msg.value.length > 0) {
            send.disabled = false;
        }
        else {
            send.disabled = true;
        }
    });

    msg.addEventListener("keydown", event => {
        if (event.keyCode === 13 && msg.value != "") {
            socket.emit("message sent", { channelname: document.querySelector(".active").innerHTML, username: localStorage.getItem(username), time: new Date().toLocaleString(), msg: msg.value });
            msg.value = "";
            msg.focus();
        }
    });

    send.addEventListener("click", () => {
        socket.emit("message sent", { channelname: document.querySelector(".active").innerHTML, username: localStorage.getItem(username), time: new Date().toLocaleString(), msg: msg.value });
        msg.value = "";
        msg.focus();
    });

});

function create_message(usr, msg, time) {

    let div_outer = document.createElement("div");
    let div_middle = document.createElement("div");
    let div_inner = document.createElement("div");
    let p_username = document.createElement("p");
    let p_msg = document.createElement("p");
    let p_time = document.createElement("p");
    let chatbox = document.querySelector("#chatbox");

    div_outer.classList.add("msg-container");
    div_middle.classList.add("msg");

    p_username.classList.add("msg-sender");
    p_msg.classList.add("msg-text");
    p_time.classList.add("timestamp");

    if (usr === localStorage.getItem(username)) {
        div_middle.classList.add("msg-right");
        div_inner.classList.add("msg-sent");
        p_username.classList.add("msg-sender-self");
        p_time.classList.add("msg-right");
    }
    else {
        div_inner.classList.add("msg-received");
        p_username.classList.add("msg-sender-other");
    }

    p_username.appendChild(document.createTextNode(usr));
    p_msg.appendChild(document.createTextNode(msg));
    p_time.appendChild(document.createTextNode(time));

    chatbox.appendChild(div_outer);
    div_outer.appendChild(div_middle);
    div_outer.appendChild(p_time);
    div_middle.appendChild(p_username);
    div_middle.appendChild(div_inner);
    div_inner.appendChild(p_msg);
    chatbox.scrollTop = chatbox.scrollHeight;
}

