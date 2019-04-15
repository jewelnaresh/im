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

    // Add channel
    let button = document.querySelector("#addchannel");
    let input = document.querySelector("#newchannel");

    button.addEventListener("click", () => {
        socket.emit("add channel", input.value)
    });
    
    socket.on("new channel", (channelname) => {
        let li = document.createElement("li");
        
        li.appendChild(document.createTextNode(channelname));
        document.querySelector("#channellist").appendChild(li);
    });

});

