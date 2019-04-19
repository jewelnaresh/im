import os
import datetime

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
    channelname = data["channelname"][1:]
    join_room(channelname)
    channels[channelname].append(dict(username = data["username"], msg = data["username"] + " entered the chat room", time = datetime.datetime.now().strftime("%d/%m/%y %I:%M")))
    emit("channel messages", channels[channelname], room=channelname)
    

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

    channellist.append(channelname)
    channels[channelname] = []

    emit("new channel", {"channelname": channelname, "error": error}, broadcast=True)