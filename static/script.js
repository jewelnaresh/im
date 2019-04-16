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
        input.value="";
    });

    socket.on("new channel", (channelname) => {
        let btn = document.createElement("button");

        document.querySelector(".active").classList.remove("active");
        btn.appendChild(document.createTextNode("#" + channelname));
        btn.classList.add("list-group-item", "list-group-item-action", "active");
        document.querySelector("#channellist").appendChild(btn);
        btn.addEventListener("click", () => {
            document.querySelector(".active").classList.remove("active");
            btn.classList.add("active");
        }); 
    });

});

