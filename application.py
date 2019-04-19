import os
import datetime

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from models import *


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config['SQLALCHEMY_DATABASE_URI'] = "postgres://vpbryapraazxwu:6c12c37bbd18a584bcd69fc7d8817bb645e5d3af71b346fc001b261132f86632@ec2-54-225-113-7.compute-1.amazonaws.com:5432/dd5ibk70kca0dr"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
socketio = SocketIO(app)
db.app = app
db.init_app(app)


@app.route("/")
def index():
    return render_template("index.html", channellist=Channels.query.all())


@socketio.on("join channel")
def on_join(data):
    if(data["username"]):
        channelname = data["channelname"][1:]
        join_room(channelname)
        channel_id = Channels.query.filter_by(channelname=channelname).first().id
        message = Messages(username=data["username"], msg=data["username"] + " entered the chat room", time=datetime.datetime.now().strftime("%d/%m/%y %I:%M"), channel_id=channel_id)
        db.session.add(message)
        db.session.commit()
        msglist = Messages.query.filter_by(channel_id=channel_id).all()
        msgs = []
        for msg in msglist:
                msgs.append({"username": msg.username, "msg": msg.msg, "time": msg.time})
        emit("messages", {"msgs": msgs, "channel": True}, room=channelname)


@socketio.on('leave channel')
def on_leave(data):
    channelname = data["channelname"][1:]
    leave_room(channelname)
    channel_id = Channels.query.filter_by(channelname=channelname).first().id
    message = Messages(username=data["username"], msg=data["username"] + " left the chat room", time=datetime.datetime.now().strftime("%d/%m/%y %I:%M"), channel_id=channel_id)
    db.session.add(message)
    db.session.commit()


@socketio.on("add channel")
def addchannel(newchannelname):
    channelnames = Channels.query.all()
    for channelname in channelnames:
        if (newchannelname == channelname.channelname):
            error = True
        else:
            error = False

    channel = Channels(channelname=newchannelname)
    db.session.add(channel)
    db.session.commit()
    emit("new channel", {"channelname": newchannelname, "error": error}, broadcast=True)


@socketio.on("message sent")
def messagesent(data):
    channelname = data["channelname"][1:]
    emit("messages", {"username": data["username"], "msg": data["msg"], "time": data["time"], "channel": False}, room=channelname)
    channel_id = Channels.query.filter_by(channelname=channelname).first().id
    message = Messages(username=data["username"], msg=data["msg"], time=data["time"], channel_id=channel_id)
    db.session.add(message)
    db.session.commit()
