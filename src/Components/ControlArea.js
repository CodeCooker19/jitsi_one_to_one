import React, { useEffect, useState } from 'react';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import PanToolIcon from '@material-ui/icons/PanTool';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import CallIcon from '@material-ui/icons/Call';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import AppsIcon from '@material-ui/icons/Apps';
import { makeArray } from 'jquery';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    style_chat: {
        fontSize: '40px',
        color: '#FFFFFF',
        '&:hover': {
            color: '#d1dbe8'
        },
        marginRight: '20px'
    },
    style_hand: {
        fontSize: '35px',
        color: '#FFFFFF',
        '&:hover': {
            color: '#d1dbe8'
        },
        marginRight: '40px'
    },
    style_screenshare: {
        fontSize: '50px',
        color: '#FFFFFF',
        '&:hover': {
            color: '#d1dbe8'
        },
        marginLeft: '20px'
    },
    style_multiview: {
        fontSize: '45px',
        color: '#FFFFFF',
        '&:hover': {
            color: '#d1dbe8'
        },
        marginLeft: '20px'
    },
    white_circle: {
        width: '50px',
        height: '50px',
        background: '#FFFFFF',
        '&:hover': {
            background: '#d1dbe8'
        },
        marginRight: '20px',
        borderRadius: '25px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    red_circle: {
        width: '50px',
        height: '50px',
        background: '#bf2117',
        marginRight: '20px',
        borderRadius: '25px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    styles_icon_device: {
        fontSize: '30px',
    },
    styles_phone_icon: {
        fontSize: '30px',
        color: '#FFFFFF',
        '&:hover': {
            color: '#d1dbe8'
        },
    }
}));

const ControlArea = (props) => {
    const classes = useStyles();
    const [mic, setMic] = useState(true);
    const [cam, setCam] = useState(true);

    const onClickMic = () => {
        sessionStorage.setItem('mic', !mic);
        setMic(!mic);
        props.onClickMic();
    }

    const onClickCam = () => {
        sessionStorage.setItem('camera', !cam);
        setCam(!cam);
        props.onClickCamera();
    }

    return (
        <div className={classes.root}>
            <div className={classes.white_circle} onClick={onClickMic} >
                {mic ? <MicOffIcon className={classes.styles_icon_device} /> : <MicIcon className={classes.styles_icon_device} />}
            </div>
            <div className={classes.red_circle} onClick={() => props.onClickCallEnd()}>
                <CallIcon className={classes.styles_phone_icon} />
            </div>
            <div className={classes.white_circle} onClick={onClickCam} >
                {cam ? <VideocamOffIcon className={classes.styles_icon_device} /> : <VideocamIcon className={classes.styles_icon_device} />}
            </div>
        </div>
    )
}

ControlArea.prototype = {

}

export default ControlArea;