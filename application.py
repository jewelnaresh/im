import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = ["General"]

@app.route("/")
def index():
    return render_template("index.html", channels=channels)

@socketio.on("add channel")
def addchannel(channelname):
    channels.append(channelname)
    emit("new channel", channelname, broadcast=True)
