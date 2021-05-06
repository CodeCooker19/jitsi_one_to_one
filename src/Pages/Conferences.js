import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Drawer } from '@material-ui/core/';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import * as $ from 'jquery';
import ControlArea from '../Components/ControlArea';
import VideoNormalView from '../Components/VideoNormalView';
import VideoSmallView from '../Components/RemoteSmallView/VideoSmallView';
import ChatView from '../Components/ChatView/ChatView';
import './conference.css';
import Str from '../constants/string';

const useStyle = makeStyles((theme) => ({
    root: {
        minHeight: '100vh',
        display: 'flex',
        background: '#1d1d1d',
        width: '100%',
        height: '100%',

    },
    control_area: {
        width: '100%',
        bottom: 0,
        position: 'absolute',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'center'
    },
    show_chat: {
        width: '400px',
        height: '100%',
        position: 'absolute',
        left: 0,
        visibility: 'visible',
        transition: '0.6s',
        background: '#FFFFFF'
    },
    hide_chat: {
        width: '400px',
        height: '100%',
        position: 'absolute',
        left: '-400px',
        visibility: 'hide',
        transition: '0.6s',
        background: '#FFFFFF'
    },
    video_area: {
        height: '100%',
        width: '100%',
        position: 'absolute',
    }
}));

const Conferences = (props) => {
    const { history } = props;
    const classes = useStyle();
    const [showChat, setShowChat] = useState(false);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [remoteUserData, setRemoteUserData] = useState([]);
    const [localVideoTrack, setLocalVideoTrack] = useState([]);
    const [localAudioTrack, setLocalAudioTrack] = useState([]);
    const [raiseHand, setRaiseHand] = useState(false);
    const isScreenShare = React.useRef(false);
    const isCamera = React.useRef(false);
    const room = React.useRef(null);
    let listRemoteUserData = [];
    let listRemoteUsers = [];
    let localTracks = [];
    let isJoined = false;
    let connection = null;
    let remoteTracks = {};
    let isVideo = false;
    const [messages, setMessages] = React.useState([]);

    const options = {
        hosts: {
            domain: Str.STR_DNS_NAME,
            muc: 'conference.' + Str.STR_DNS_NAME, // FIXME: use XEP-0030
        },
        bosh: 'https://' + Str.STR_DNS_NAME + '/http-bind', // FIXME: use xep-0156 for that
        clientNode: "https://jitsi.org/jitsimeet",
        useStunTurn: true
    };

    const confOptions = {
        openBridgeChannel: true,
    };

    const initOptions = {
        disableAudioLevels: true,
        enableAnalyticsLogging: false
    }

    useEffect(() => {
        if (window.JitsiMeetJS) {
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                console.log("enumerateDevices() not supported.");
                return;
            }

            window.$ = $
            window.jQuery = $
            window.JitsiMeetJS.init(initOptions);
            connection = new window.JitsiMeetJS.JitsiConnection(null, null, options);

            connection.addEventListener(window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
            connection.addEventListener(window.JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
            connection.addEventListener(window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);
            connection.connect();

            window.JitsiMeetJS.createLocalTracks({ devices: ['audio', 'video'] })
                .then(onLocalTracks)
                .catch(error => {
                    console.log(error)
                });
        }
    }, []);

    const onConnectionSuccess = () => {
        room.current = connection.initJitsiConference(props.match.params.roomname, confOptions);
        room.current.on(window.JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
        room.current.on(window.JitsiMeetJS.events.conference.TRACK_REMOVED, onRemoveTrack);
        room.current.on(window.JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, onChangeName);
        room.current.on(window.JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined);
        room.current.on(window.JitsiMeetJS.events.conference.USER_JOINED, (id, user) => {
            let isFind = false;
            listRemoteUsers.map((cell, index) => {
                if (cell.id === id) {
                    cell.user = user;
                    listRemoteUsers[index] = cell;
                    isFind = true;
                }
            });
            if (isFind) {
                return;
            }
            let new_user = { id: id, user: user, isHand: false };
            listRemoteUsers.push(new_user);
            setRemoteUsers(listRemoteUsers);
        });
        room.current.on(window.JitsiMeetJS.events.conference.PARTICIPANT_PROPERTY_CHANGED, handleParticipantPropertyChange);
        room.current.on(window.JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
        room.current.on(window.JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, track => {
            console.log(`${track.getType()} - ${track.isMuted()}`);
        });
        room.current.on(window.JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, (userID, displayName) => console.log(`${userID} - ${displayName}`));
        room.current.on(window.JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED, (userID, audioLevel) => console.log(`${userID} - ${audioLevel}`));
        room.current.on(window.JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED, () => console.log(`${room.current.getPhoneNumber()} - ${room.current.getPhonePin()}`));
        room.current.on(window.JitsiMeetJS.events.conference.MESSAGE_RECEIVED, (id, text, ts) => onMessageReceived(id, text, ts));
        room.current.setDisplayName(props.match.params.name);

        room.current.join();
    }

    /////////////////////////////////////// messages handler ///////////////////////////////////////
    const onMessageReceived = (id, text, ts) => {
        let name;
        name = listRemoteUsers.find(x => x.id === id) === undefined ? props.match.params.name : listRemoteUsers.find(x => x.id === id).user._displayName
        let message = {
            user: name,
            id: id,
            text: text,
            ts: ts,
        }
        setMessages(messages => [...messages, message]);
    }

    React.useEffect(() => {
    }, [messages])

    const handleGetMyMessage = (text) => {
        room.current.sendTextMessage(text);
    }
    /////////////////////////////////////// messages handler ///////////////////////////////////////

    const onConnectionFailed = (error) => {
        console.error('Connection Failed!-' + error);
    }

    const disconnect = () => {
        connection.removeEventListener(window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
        connection.removeEventListener(window.JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
        connection.removeEventListener(window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);
    }

    const onLocalTracks = (tracks) => {
        localTracks = tracks
        localTracks.map((localTrack, index) => {
            localTrack.addEventListener(
                window.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
                audioLevel => console.log(`Audio Level local: ${audioLevel}`));
            localTrack.addEventListener(
                window.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                () => console.log('local track muted'));
            localTrack.addEventListener(
                window.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                () => console.log('local track stoped'));
            localTrack.addEventListener(window.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
                deviceId =>
                    console.log(`track audio output device was changed to ${deviceId}`));
            if (localTrack.getType() === 'video') {
                localTrack.attach($(`#mainVideo`)[0]);
                setLocalVideoTrack(localTrack);
            } else {
                localTrack.attach($(`#mainAudio`)[0]);
                localTrack.attach($(`#localSmallAudio`)[0]);
                setLocalAudioTrack(localTrack);
            }
            if (isJoined) {
                room.current.addTrack(localTrack);
            }
        })
    }

    const onRemoteTrack = (track) => {
        if (track.isLocal()) {
            return;
        }

        let isFind = false;
        const participant = track.getParticipantId();
        const type = track.getType();
        listRemoteUserData.map((remoteUser, index) => {
            if (remoteUser.id === participant) {
                if (type === 'video') {
                    remoteUser.videotrack = track;
                    listRemoteUserData[index] = remoteUser;
                } else if (type === 'audio') {
                    remoteUser.audiotrack = track;
                    listRemoteUserData[index] = remoteUser;
                }
                isFind = true;
            }
        });
        if (isFind === true) {
            setRemoteUserData([]);
            setRemoteUserData(listRemoteUserData);
            return;
        }
        console.log('tarck123-55555555555-' + participant);
        let user_val = { id: participant, user: null, isHand: false, videotrack: [], audiotrack: [] };
        if (type === 'video') {
            user_val.videotrack = track;
        } else if (type === 'audio') {
            user_val.audiotrack = track;
        }
        listRemoteUsers.map((cell, index) => {
            if (cell.id === participant) {
                user_val.user = cell.user;
                user_val.isHand = cell.isHand;
            }
        });
        listRemoteUserData.push(user_val);
        setRemoteUserData([]);
        setRemoteUserData(listRemoteUserData);
        return;
    }

    const onRemoveTrack = (track) => {
        const participant = track.getParticipantId();
        const type = track.getType();
        listRemoteUserData.map((user, index) => {
            if (user.id === participant && type === "video") {
                console.log('remove-5555555555-' + participant);
                listRemoteUserData.splice(index, 1);
                track.detach($(`#${participant}video`)[0]);
                track.detach($(`#${participant}audio`)[0]);
            }
        });
        setRemoteUserData([]);
        setRemoteUserData(listRemoteUserData);
    }

    const onChangeName = (id, displayName) => {
        console.log('changename-5555555555-' + id + '-' + displayName);
    }

    const onUserJoin = () => {

    }

    function onConferenceJoined() {
        isJoined = true;
        localTracks.map((localTrack) => {
            room.current.addTrack(localTrack);
            room.current.setDisplayName(props.match.params.name);
        });
    }

    function onUserLeft(id) {
        console.log('1111111111' + id);
        if (!remoteTracks[id]) {
            return;
        }
        const tracks = remoteTracks[id];

        for (let i = 0; i < tracks.length; i++) {
            tracks[i].detach($(`#${id}${tracks[i].getType()}`));
        }
    }

    const handleParticipantPropertyChange = (participant, propertyName, oldValue, newValue) => {
        if (newValue === Str.STR_NONE) {
            return;
        }

        /* Raise hand message */
        if (propertyName === Str.STR_RAISE_HAND) {
            let flag;
            switch (newValue) {
                case Str.STR_HAND_UP:
                    flag = true;
                    break;
                case Str.STR_HAND_DOWN:
                    flag = false;
                    break;
                default:
                    return;
            }

            listRemoteUsers.map((cell, index) => {
                if (cell.id === participant.getId()) {
                    cell.isHand = flag;
                    return;
                }
            });

            listRemoteUserData.map((remoteUser, index) => {
                if (remoteUser.id === participant.getId()) {
                    listRemoteUserData[index].isHand = flag;
                    return;
                }
            });
            setRemoteUserData([]);
            setRemoteUserData(listRemoteUserData);
        }
    }

    const handleClickChat = () => {
        setShowChat(!showChat);
    }

    const handleClickCamera = () => {
        if (localVideoTrack.length !== 0) {
            if (localVideoTrack.isMuted()) {
                localVideoTrack.unmute();
            } else {
                localVideoTrack.mute();
            }
        }
    }

    const handleClickMic = () => {
        if (localAudioTrack.length !== 0) {
            if (localAudioTrack.isMuted()) {
                localAudioTrack.unmute();
            } else {
                localAudioTrack.mute();
            }
        }
    }

    useEffect(() => {
        if (!isScreenShare.current && !isCamera.current) {
            return;
        }

        localVideoTrack.addEventListener(
            window.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
            () => console.log('local track muted'));
        if (isScreenShare.current) {
            localVideoTrack.addEventListener(window.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, showCamera);
        }
        localVideoTrack.attach($(`#mainVideo`)[0]);
        localVideoTrack.attach($(`#localSmallVideo`)[0]);
        room.current.addTrack(localVideoTrack);
        isScreenShare.current = false;
        isCamera.current = false;
    }, [localVideoTrack]);

    const showCamera = () => {
        isCamera.current = true;
        window.JitsiMeetJS.createLocalTracks({
            devices: ['video']
        })
            .then(async tracks => {
                if (tracks.length > 0) {
                    if (localVideoTrack) {
                        await localVideoTrack.dispose();
                    }
                    setLocalVideoTrack(tracks[0]);
                }
            })
            .catch(error => console.log(error));
    }

    const handleClickScreenShare = () => {
        isScreenShare.current = true;

        window.JitsiMeetJS.createLocalTracks({
            devices: ['desktop']
        })
            .then(async tracks => {
                if (tracks.length > 0) {
                    if (localVideoTrack) {
                        await localVideoTrack.dispose();
                    }
                    setLocalVideoTrack(tracks[0]);
                }
            })
            .catch(error => console.log(error));
    }

    const handleClickHand = () => {
        room.current.setLocalParticipantProperty(Str.STR_RAISE_HAND, Str.STR_NONE);
        if (!raiseHand) {
            room.current.setLocalParticipantProperty(Str.STR_RAISE_HAND, Str.STR_HAND_UP);
        }
        else {
            room.current.setLocalParticipantProperty(Str.STR_RAISE_HAND, Str.STR_HAND_DOWN);
        }
        setRaiseHand(!raiseHand);
    }

    const handleRemoveMainVideo = async () => {
        if (localVideoTrack.length !== 0) {
            localVideoTrack.attach($(`#mainVideo`)[0]);
        } else {

        }
    }

    function unload() {
        if (localVideoTrack.length !== 0) {
            localVideoTrack.detach($(`#mainVideo`)[0]);
        }

        if (localAudioTrack.length !== 0) {
            localAudioTrack.detach($(`#mainAudio`)[0]);
        }

        for (let i = 0; i < localTracks.length; i++) {
            localTracks[i].dispose();
        }

        if (room.current !== null) {
            room.current.leave();
        }
    }

    const handleCallEnd = async () => {
        unload();
        history.push('/');
    }

    return (
        <div className={classes.root}>
            <div className={classes.video_area}>
                <VideoNormalView localVideoTrack={localVideoTrack} remoteUsers={remoteUsers} remoteUsersData={remoteUserData} isLocalHand={raiseHand} name={props.match.params.name} handleRemoveMainVideo={handleRemoveMainVideo} />
            </div>
            <div className={classes.control_area}>
                <ControlArea onClickChat={handleClickChat} onClickCamera={handleClickCamera} onClickMic={handleClickMic} onClickCallEnd={handleCallEnd} onClickScreenShare={handleClickScreenShare} onClickHand={handleClickHand} />
            </div>
            {
                showChat ? <div className={classes.show_chat}><ChatView messages={messages} getMyMessage={handleGetMyMessage} /></div> :
                    <div className={classes.hide_chat}></div>
            }
        </div>
    )
}

Conferences.prototype = {

}

export default withRouter(Conferences);