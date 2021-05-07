import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import * as $ from 'jquery';
import ControlArea from '../Components/ControlArea';
import Constants from '../constants/string';

const useStyle = makeStyles(() => ({
    root: {
        display: 'flex',
        width: '100%',
        height: '100%',
        background: 'black',
        flexDirection: 'column',
        borderRadius: '6px'
    },
    main_area: {
        display: 'flex',
        position: 'relative',
        width: '100%',
        height: '85%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    video_area: {
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%'
    },
    black_div: {
        position: 'absolute',
        display: 'flex',
        background: 'black',
        zIndex: '1',
        width: '100%',
        height: '100%',
        borderRadius: '6px',
        visibility: 'collapse'
    },
    main_video_area: {
        width: '30%',
        height: '30%',
        position: 'absolute',
        display: 'flex',
        right: '5px',
        top: '5px',
        zIndex: '5',
    },
    main_video: {
        width: '100%',
        height: '100%'
    },
    control_area: {
        width: '100%',
        bottom: 0,
        position: 'absolute',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'center'
    },
}))

const Conference = (props) => {
    const { history } = props;
    const classes = useStyle();
    const [isHold, setHold] = useState(false);
    const [isMuted, setMuted] = useState(false);
    const [roomJoinded, setRoomJoined] = useState(false);
    const [localVideoTrack, setLocalVideoTrack] = useState([]);
    const [localAudioTrack, setLocalAudioTrack] = useState([]);
    const [userVideoTrack, setUserVideoTrack] = useState(null);
    const [userAudioTrack, setUserAudioTrack] = useState(null);
    const room = React.useRef(null);
    const receptionId = React.useRef(null);
    const receptionName = React.useRef("");
    const isSignalAccept = React.useRef(false);
    const callStatus = React.useRef(false);
    const isLeave = React.useRef(false);
    const offLine = React.useRef(false);
    let listRemouteUsers = [];
    let listRemoteUserData = [];
    let localTracks = [];
    let connection = null;
    let isJoined = false;

    const options = {
        hosts: {
            domain: process.env.REACT_APP_JITSI_DNS_NAME,
            muc: 'conference.' + process.env.REACT_APP_JITSI_DNS_NAME, // FIXME: use XEP-0030
        },
        bosh: 'https://' + process.env.REACT_APP_JITSI_DNS_NAME + '/http-bind', // FIXME: use xep-0156 for that
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

            window.JitsiMeetJS.createLocalTracks({ devices: ['audio'] })
                .then(onLocalTracks)
                .catch(error => {
                    console.log(error)
                });
            window.JitsiMeetJS.createLocalTracks({ devices: ['video'] })
                .then(onLocalTracks)
                .catch(error => {
                    console.log(error)
                });
        }
    }, []);

    const onConnectionSuccess = () => {
        room.current = connection.initJitsiConference(Constants.STR_ROOM_NAME, confOptions);
        room.current.on(window.JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
        room.current.on(window.JitsiMeetJS.events.conference.TRACK_REMOVED, onRemoveTrack);
        room.current.on(window.JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, onChangeName);
        room.current.on(window.JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined);
        room.current.on(window.JitsiMeetJS.events.conference.USER_JOINED, (id, user) => {
            let isFind = false;
            listRemouteUsers.map((cell, index) => {
                if (cell.id === id) {
                    cell.user = user;
                    listRemouteUsers[index] = cell;
                    isFind = true;
                }
            });
            if (isFind) {
                return;
            }
            let new_user = { id: id, user: user };
            listRemouteUsers.push(new_user);
        });
        room.current.on(window.JitsiMeetJS.events.conference.PARTICIPANT_PROPERTY_CHANGED, handleParticipantPropertyChange);
        room.current.on(window.JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
        room.current.on(window.JitsiMeetJS.events.conference.CONFERENCE_LEFT, onConferenceLeft);
        room.current.on(window.JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, track => {
            console.log(`${track.getType()} - ${track.isMuted()}`);
            var participant = track.getParticipantId();
            if (track.getType() == 'video' && track.getParticipantId() == receptionId.current) {
                setMuted(track.isMuted());
            }
        });
        room.current.on(window.JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, (userID, displayName) => console.log(`${userID} - ${displayName}`));
        room.current.on(window.JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED, (userID, audioLevel) => console.log(`${userID} - ${audioLevel}`));
        room.current.on(window.JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED, () => console.log(`${room.current.getPhoneNumber()} - ${room.current.getPhonePin()}`));
        room.current.setDisplayName(props.match.params.userId);

        room.current.join();
    }

    const onConnectionFailed = (error) => {
        console.log(">>>>>>>onConnectionFailed");
    }

    const disconnect = () => {
        connection.removeEventListener(window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
        connection.removeEventListener(window.JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
        connection.removeEventListener(window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);
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
        props.setIsShowCall(false);
    }

    const onLocalTracks = (tracks) => {
        tracks.map((localTrack, index) => {
            localTrack.addEventListener(
                window.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
                audioLevel => console.log(`Audio Level local: ${audioLevel}`));
            localTrack.addEventListener(
                window.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                () => console.log('>>>>>>>>>local track muted'));
            localTrack.addEventListener(
                window.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                () => {
                    console.log('>>>>>>>>local track stoped', (new Date()).getTime());
                    unload();
                });
            localTrack.addEventListener(window.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
                deviceId =>
                    console.log(`track audio output device was changed to ${deviceId}`));
            if (localTrack.getType() === 'video') {
                localTrack.attach($(`#mainVideo`)[0]);
                setLocalVideoTrack(localTrack);
            } else if (localTrack.getType() === 'audio') {
                localTrack.attach($(`#mainAudio`)[0]);
                setLocalAudioTrack(localTrack);
            }

            if (isJoined) {
                room.current.addTrack(localTrack);
            }
            localTracks.push(localTrack);
        });
    }

    const onRemoteTrack = (track) => {
        if (track.isLocal()) {
            // regist video particant id on db
            if (track.getType() === 'video') {

            }
            return;
        }

        //---save all tracks incoming----
        const participant = track.getParticipantId();
        const type = track.getType();
        
        return;
    }

    const onRemoveTrack = (track) => {
        const participant = track.getParticipantId();
        const type = track.getType();
        if (type === "video" && participant === receptionId.current && $(`#userVideo`)[0] !== undefined) {
            track.detach($(`#userVideo`)[0]);
        }

        if (type === "audio" && participant === receptionId.current && $(`#userAudio`)[0] !== undefined) {
            track.detach($(`#userAudio`)[0]);
        }
    }

    const onChangeName = (id, displayName) => {

    }

    function onConferenceJoined() {
        if (isLeave.current === true) {
            unload();
            return;
        }

        isJoined = true;
        setRoomJoined(true);
        localTracks.map((localTrack) => {
            room.current.addTrack(localTrack);
            room.current.setDisplayName(props.match.params.userId);
        });
    }

    function onUserLeft(id, user) {
        let remove = -1;
        listRemouteUsers.map((cell, index) => {
            if (cell.id === id) {
                remove = index;
                if (cell.user.getDisplayName() === receptionName.current) {
                    callEnd();
                }
            }
        });

        if (remove !== -1) {
            listRemouteUsers.splice(remove, 1);
        }
    }

    function onConferenceLeft() {

    }

    const handleParticipantPropertyChange = (participant, propertyName, oldValue, newValue) => {

    }

    function callEnd() {
        receptionName.current = "";
        receptionId.current = null;
        if (userVideoTrack !== null) {
            userVideoTrack.detach($(`#userVideo`)[0]);
            setUserVideoTrack(null);
        }

        if (userAudioTrack !== null) {
            userAudioTrack.detach($(`#userAudio`)[0]);
            setUserAudioTrack(null);
        }
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

    const handleCallEnd = async () => {
        unload();
    }

    useEffect(() => {
        if (localVideoTrack.length === 0)
            return;
        localVideoTrack.addEventListener(
            window.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
            () => console.log('local track muted'));
        localVideoTrack.attach($(`#mainVideo`)[0]);
        if (room.current !== null)
            room.current.addTrack(localVideoTrack);
    }, [localVideoTrack]);

    return (
        <div className={classes.root}>
            <div className={classes.main_video_area}>
                <video className={classes.main_video} autoPlay='1' id='mainVideo' playsInline/>
                <audio autoPlay='1' muted='1' id='mainAudio' />
            </div>
            <div className={classes.video_area}>
                <video className={classes.user_video} autoPlay='1' id='userVideo' playsInline />
                <audio autoPlay='1' id='userAudio' />
                <div className={classes.black_div} style={{ visibility: isMuted == true ? 'visible' : 'collapse' }}></div>
            </div>
            <div className={classes.control_area}>
                <ControlArea onClickCamera={handleClickCamera} onClickMic={handleClickMic} onClickCallEnd={handleCallEnd} />
            </div>
        </div>
    )
}

Conference.prototype = {

}

export default withRouter(Conference);