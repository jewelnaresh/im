import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = {}
channels["general"] = [dict(msg="HI", username="asdd", time="12:000pm")]
channellist = ["general"]


@app.route("/")
def index():
    return render_template("index.html", channellist=channellist)

@socketio.on("join channel")
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    send(username + ' has entered the room.', room=room)

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    send(username + ' has left the room.', room=room)


@socketio.on("add channel")
def addchannel(channelname):
    if (channelname in channels):
        error = True
    else:
        error = False

    channellist.append(channelname)
    channels[channelname] = []

    emit("new channel", {"channelname": channelname, "error": error}, broadcast=True)


@socketio.on("show messages")
def showmessages(channelname):
    channelname = channelname[1:]
    emit("channel messages", channels[channelname])


@socketio.on("channel selected")
def channelselected(channelname):
    channelname = channelname[1:]
    channellist = list(channels.keys())    
    emit("channel messages", channels[channelname], room=channellist[channellist.index(channelname)])