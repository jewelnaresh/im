import os
import datetime

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = {}
channels["general"] = []


@app.route("/")
def index():
    return render_template("index.html", channellist=list(channels.keys()))

@socketio.on("join channel")
def on_join(data):
    if(data["username"]):
        channelname = data["channelname"][1:]
        join_room(channelname)
        channels[channelname].append(dict(username = data["username"], msg = data["username"] + " entered the chat room", time = datetime.datetime.now().strftime("%d/%m/%y %I:%M")))
        emit("messages", {"channelname": channels[channelname], "channel": True}, room=channelname)
    

@socketio.on('leave channel')
def on_leave(data):
    channelname = data["channelname"][1:]
    leave_room(channelname)
    channels[channelname].append(dict(username = data["username"], msg = data["username"] + " left the chat room", time = datetime.datetime.now().strftime("%d/%m/%y %I:%M")))


@socketio.on("add channel")
def addchannel(channelname):
    if (channelname in channels):
        error = True
    else:
        error = False

    channels[channelname] = []
    emit("new channel", {"channelname": channelname, "error": error}, broadcast=True)

@socketio.on("message sent")
def messagesent(data):
    channelname = data["channelname"][1:]
    channels[channelname].append({"username": data["username"], "msg": data["msg"], "time": data["time"]})
    emit("messages", {"username": data["username"], "msg": data["msg"], "time": data["time"], "channel": False}, room=channelname)