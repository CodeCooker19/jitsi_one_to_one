import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { withRouter } from 'react-router-dom';
import { Button } from '@material-ui/core/';

const useStyles = makeStyles(() => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    width_40: {
        width: '100%',
        justifyContent: 'center',
        display: 'flex'

    },
    style_fields: {
        width: '40%',
        margin: '0 10px'
    }
}));

const IncomingCall = (props) => {
    const classes = useStyles();

    const clickAcceptCall = () => {
        props.setIsShowIncoming(false);
        props.setIsShowCall(true)
    }

    const clickRejectCall = () => {
        props.setIsShowIncoming(false);
    }

    return (
        <div className={classes.root} >
            <div className={classes.width_40}>
                <p style={{ fontSize: '30px' }}>Incoming call from&nbsp;</p>
                <p style={{ fontSize: '30px', color: 'red' }}>{props.otherUserId}</p>
            </div>
            <div className={classes.width_40}>
                <Button className={classes.style_fields} variant="contained" color="primary" onClick={clickAcceptCall} >Accept Call</Button>
                <Button className={classes.style_fields} variant="contained" color="primary" onClick={clickRejectCall} >Reject Call</Button>
            </div>
        </div>
    );
}

IncomingCall.prototype = {

}

export default withRouter(IncomingCall);