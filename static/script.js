document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

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
        });
    }

    // Activate #general by default
    document.querySelector(".list-group-item").classList.add("active");

    // Activate different channels
    document.querySelectorAll(".list-group-item").forEach(element => {
        element.addEventListener("click", () => {
            document.querySelector(".active").classList.remove("active");
            element.classList.add("active");
            socket.emit("channel selected", document.querySelector(".active").innerHTML);
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

            document.querySelector(".active").classList.remove("active");
            btn.appendChild(document.createTextNode("#" + data["channelname"]));
            btn.classList.add("list-group-item", "list-group-item-action", "active");
            document.querySelector("#channellist").appendChild(btn);
            btn.addEventListener("click", () => {
                document.querySelector(".active").classList.remove("active");
                btn.classList.add("active");
            });
        }
    });

    // show messages
    socket.on("connect", () => {
        socket.emit("join channel", {room: document.querySelector(".active").innerHTML, username: localStorage.getItem(username));
        socket.emit("show messages", document.querySelector(".active").innerHTML);
    });

    socket.on("channel messages", (messages) => {

        for (const data of messages ) {
            let div_outer = document.createElement("div");
            let div_middle = document.createElement("div");
            let div_inner = document.createElement("div");
            let p_username = document.createElement("p");
            let p_msg = document.createElement("p");
            let p_time = document.createElement("p");
    
            div_outer.classList.add("msg-container");
            div_middle.classList.add("msg");
    
            p_username.classList.add("msg-sender");
            p_msg.classList.add("msg-text");
            p_time.classList.add("timestamp");
            
            if (data["username"] === localStorage.getItem(username)) {
                div_middle.classList.add("msg-right");
                div_inner.classList.add("msg-sent");
                p_username.classList.add("msg-sender-self");
                p_time.classList.add("msg-right");
            }
            else {
                div_inner.classList.add("msg-received");
                p_username.classList.add("msg-sender-other");
            }

            p_username.appendChild(document.createTextNode(data["username"]));
            p_msg.appendChild(document.createTextNode(data["msg"]));
            p_time.appendChild(document.createTextNode(data["time"]));

            document.querySelector("#chatbox").appendChild(div_outer);
            div_outer.appendChild(div_middle);
            div_outer.appendChild(p_time);
            div_middle.appendChild(p_username);
            div_middle.appendChild(div_inner);
            div_inner.appendChild(p_msg);
        }
    });

});

