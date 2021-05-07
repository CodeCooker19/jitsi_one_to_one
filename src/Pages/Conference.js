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
    local_video_area: {
        width: '20%',
        position: 'absolute',
        display: 'flex',
        right: '5px',
        top: '5px',
        zIndex: '5',
        background: 'black',
        border: 'red solid 1px'
    },
    local_video: {
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
    const [localVideoTrack, setLocalVideoTrack] = useState([]);
    const [localAudioTrack, setLocalAudioTrack] = useState([]);
    const [otherVideoTrack, setOtherVideoTrack] = useState(null);
    const [otherAudioTrack, setOtherAudioTrack] = useState(null);
    const otherParticipant = React.useRef(null);
    const [isMuted, setMuted] = useState(false);
    const room = React.useRef(null);
    const isCallEnd = React.useRef(false);
    const isLeave = React.useRef(false);
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
        if (props.isShowCall) {
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

                window.JitsiMeetJS.createLocalTracks({ devices: [Constants.STR_AUDIO, Constants.STR_VIDEO] })
                    .then(onLocalTracks)
                    .catch(error => {
                        console.log(error)
                    });
            }
        }
        else {
            unload();
            if (props.isLogout)
                history.push('/');
        }
    }, [props.isShowCall]);

    const onConnectionSuccess = () => {
        room.current = connection.initJitsiConference(Constants.STR_ROOM_NAME, confOptions);
        room.current.on(window.JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
        room.current.on(window.JitsiMeetJS.events.conference.TRACK_REMOVED, onRemoveTrack);
        room.current.on(window.JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, onChangeName);
        room.current.on(window.JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined);
        room.current.on(window.JitsiMeetJS.events.conference.USER_JOINED, (id, user) => {
            if (user.getDisplayName() === props.otherUserId) {
                otherParticipant.current = id;
            }
        });
        room.current.on(window.JitsiMeetJS.events.conference.PARTICIPANT_PROPERTY_CHANGED, handleParticipantPropertyChange);
        room.current.on(window.JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
        room.current.on(window.JitsiMeetJS.events.conference.CONFERENCE_LEFT, onConferenceLeft);
        room.current.on(window.JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, track => {
            if (track.getType() === Constants.STR_VIDEO && track.getParticipantId() === otherParticipant.current) {
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
            localVideoTrack.detach($(`#localVideo`)[0]);
        }

        if (localAudioTrack.length !== 0) {
            localAudioTrack.detach($(`#localAudio`)[0]);
        }

        for (let i = 0; i < localTracks.length; i++) {
            localTracks[i].dispose();
        }

        if (room.current !== null) {
            room.current.leave();
            room.current = null;
        }
    }

    const onLocalTracks = (tracks) => {
        tracks.map((localTrack) => {
            localTrack.addEventListener(
                window.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
                audioLevel => console.log(`Audio Level local: ${audioLevel}`));
            localTrack.addEventListener(
                window.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                () => console.log('>>>>>>>>>local track muted'));
            localTrack.addEventListener(
                window.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                () => console.log('>>>>>>>>local track stoped'));
            localTrack.addEventListener(window.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
                deviceId =>
                    console.log(`track audio output device was changed to ${deviceId}`));
            if (localTrack.getType() === Constants.STR_VIDEO) {
                localTrack.attach($(`#localVideo`)[0]);
                setLocalVideoTrack(localTrack);
            } else if (localTrack.getType() === Constants.STR_AUDIO) {
                localTrack.attach($(`#localAudio`)[0]);
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
            return;
        }

        //---save all tracks incoming----
        const participant = track.getParticipantId();
        const type = track.getType();
        if (participant === otherParticipant.current) {
            if (type === Constants.STR_VIDEO) {
                track.attach($(`#otherVideo`)[0]);
                setOtherVideoTrack(track);
            } else if (type === Constants.STR_AUDIO) {
                track.attach($(`#otherAudio`)[0]);
                setOtherAudioTrack(track);
            }
        }
    }

    const onRemoveTrack = (track) => {
        const participant = track.getParticipantId();
        const type = track.getType();
        if (type === "video" && participant === otherParticipant.current && $(`#otherVideo`)[0] !== undefined) {
            track.detach($(`#otherVideo`)[0]);
        }

        if (type === "audio" && participant === otherParticipant.current && $(`#otherAudio`)[0] !== undefined) {
            track.detach($(`#otherAudio`)[0]);
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
        localTracks.map((localTrack) => {
            room.current.addTrack(localTrack);
            room.current.setDisplayName(props.match.params.userId);
        });
    }

    const onUserLeft = (id, user) => {
        if (user.getDisplayName() === props.otherUserId) {
            if (otherVideoTrack !== null) {
                otherVideoTrack.detach($(`#otherVideo`)[0]);
                setOtherVideoTrack(null);
            }
            if (otherAudioTrack !== null) {
                otherAudioTrack.detach($(`#otherAudio`)[0]);
                setOtherAudioTrack(null);
            }
            if (!isCallEnd.current)
                props.setIsShowCall(false);
        }
    }

    const onConferenceLeft = () => {

    }

    const handleParticipantPropertyChange = (participant, propertyName, oldValue, newValue) => {

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
        isCallEnd.current = true;
        props.setIsShowCall();
    }

    return (
        <div className={classes.root}>
            <div className={classes.local_video_area}>
                <video className={classes.local_video} autoPlay='1' id='localVideo' playsInline />
                <audio autoPlay='1' muted='1' id='localAudio' />
            </div>
            <div className={classes.video_area}>
                <video className={classes.local_video} autoPlay='1' id='otherVideo' playsInline />
                <audio autoPlay='1' id='otherAudio' />
                <div className={classes.black_div} style={{ visibility: isMuted === true ? 'visible' : 'collapse' }}></div>
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