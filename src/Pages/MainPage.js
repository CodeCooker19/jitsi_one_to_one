import React, { useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/styles';
import { withRouter } from 'react-router-dom';
import { Button, Grid, TextField } from '@material-ui/core/';
import Draggable from 'react-draggable';
import './conference.css';
import Conference from './Conference';
import IncomingCall from './IncomingCall';

const useStyles = makeStyles(() => ({
    root: {
        display: 'flex',
    },
    container: {
        width: '100%',
        height: '100vh',
        position: 'fixed',
        backgroundColor: 'gray'
    },
    width_40: {
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex'
    },
    incoming_btn: {
        marginLeft: '20px'
    },
    style_fields: {
        marginTop: '30px',
        width: '40%'
    }
}));

const CssTextField = withStyles({
    root: {
        '& label.Mui-focused': {
            color: 'white',
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: 'white',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'white',
            },
            '&:hover fieldset': {
                borderColor: 'white',
            },
            '&.Mui-focused fieldset': {
                borderColor: 'white',
            },
        },
    },
})(TextField);

const CreateRoom = (props) => {
    const { history } = props;
    const classes = useStyles();
    const [isShowCall, setIsShowCall] = useState(false);
    const [isShowIncoming, setIsShowIncoming] = useState(false);
    const [otherUserId, setOtherUserId] = useState('');
    const [isVideoCall, setIsVideoCall] = useState(false);
    const [isLogout, setIsLogout] = useState(false);

    const changeOtherUserId = (event) => {
        setOtherUserId(event.target.value);
    }

    const clickVideoCall = () => {
        if (otherUserId === '')
            return;

        setIsShowCall(true);
        setIsVideoCall(true);
        setOtherUserId(otherUserId);
    }

    const clickAudioCall = () => {
        if (otherUserId === '')
            return;

        setIsShowCall(true);
        setIsVideoCall(false);
        setOtherUserId(otherUserId);
    }

    const clickLogout = () => {
        if (isShowCall === false) {
            history.push('/');
            return;
        }
        setIsLogout(true);
        setIsShowCall(false);
    }

    const clickIncomingCall = () => {
        if (otherUserId === '')
            return;
        setIsShowIncoming(true);
    }

    return (
        <div className={classes.root}>
            <Draggable>
                <div className={isShowCall ? "box draggable-room-background show" : "box draggable-room-background hide"} style={{ position: 'absolute', top: '20px', right: '20px' }}>
                    <Conference setIsShowCall={setIsShowCall} isShowCall={isShowCall} userId={props.match.params.userId} otherUserId={otherUserId} isVideoCall={isVideoCall} isLogout={isLogout} />
                </div>
            </Draggable>
            <Draggable>
                <div className={isShowIncoming ? "box draggable-incoming-background show" : "box draggable-incoming-background hide"} style={{ position: 'absolute', top: '30vh', right: '40vw' }}>
                    <IncomingCall setIsShowIncoming={setIsShowIncoming} setIsShowCall={setIsShowCall} otherUserId={otherUserId} />
                </div>
            </Draggable>
            <Grid className={classes.container} container direction="column" justify="center" alignItems="center">
                <div className={classes.width_40}>
                    <p style={{ fontSize: '30px' }}>Your Name:&nbsp;</p>
                    <p style={{ fontSize: '30px', color: 'red' }}>{props.match.params.userId}</p>
                </div>
                <div className={classes.width_40}>
                    <CssTextField label="Other User" variant="outlined" onChange={changeOtherUserId} value={otherUserId} InputProps={{ style: { color: '#FFFFFF' }, }} />
                    <Button className={classes.incoming_btn} variant="contained" color="primary" onClick={clickIncomingCall} >Incoming Call</Button>
                </div>
                <Button className={classes.style_fields} variant="contained" color="primary" onClick={clickVideoCall} >Video Call</Button>
                <Button className={classes.style_fields} variant="contained" color="primary" onClick={clickAudioCall} >Audio Call</Button>
                <Button className={classes.style_fields} variant="contained" color="primary" onClick={clickLogout} >Logout</Button>
            </Grid>
        </div>
    );
}

CreateRoom.prototype = {

}

export default withRouter(CreateRoom);