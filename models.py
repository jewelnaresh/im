from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Messages(db.Model):
    __tablename__ = "messages"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False)
    msg = db.Column(db.String, nullable=False)
    time = db.Column(db.String, nullable=False)
    channel_id = db.Column(db.Integer, db.ForeignKey("channels.id"), nullable=False)

class Channels(db.Model):
    __tablename__ = "channels"
    id = db.Column(db.Integer, primary_key=True)
    channelname = db.Column(db.String, nullable=False)
