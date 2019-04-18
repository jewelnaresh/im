import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = {}
channels["general"] = []
channellist = ["general"]


@app.route("/")
def index():
    return render_template("index.html", channellist=channellist)


@socketio.on("add channel")
def addchannel(channelname):
    if (channelname in channels):
        error = True
    else:
        error = False

    channellist.append(channelname)
    channels[channelname] = []

    emit("new channel", {"channelname": channelname, "error": error}, broadcast=True)
