import React, { useEffect, useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/styles';
import { withRouter } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import { Button, Grid, TextField } from '@material-ui/core/';
import LogoImage from '../assets/images/avatar.png';
import BackgroundImage from '../assets/images/background.jpg';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  container: {
    width: '100%',
    height: '100vh',
    position: 'fixed',
    backgroundImage: 'url(' + BackgroundImage + ')',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover'
  },
  width_40: {
    width: '40%'
  },
  style_fields: {
    marginTop: '30px',
    width: '40%'
  },
  div_logo_area: {
    marginTop: '20px',
    marginLeft: '20px'
  },
  div_logo: {
    width: '80px',
    height: '80px',
    backgroundSize: 'cover',
    backgroundImage: 'url(' + LogoImage + ')'
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
  const classes = useStyles();
  const { history } = props;

  const [name, setName] = useState('');
  const [roomname, setRoomName] = useState('');

  const changeName = (event) => {
    setName(event.target.value);
  }

  const changeRoomName = (event) => {
    setRoomName(event.target.value);
  }

  const clickCreateRoom = () => {
    history.push('/conferences/' + roomname + '/' + name);
  }

  return (
    <div className={classes.root} >
      <Grid className={classes.container} container direction="column" justify="center" alignItems="center">
        <CssTextField className={classes.width_40} label="Your Name" variant="outlined" onChange={changeName} value={name} InputProps={{ style: { color: '#FFFFFF' }, }} />
        <CssTextField className={classes.style_fields} label="Room Name" variant="outlined" onChange={changeRoomName} value={roomname} InputProps={{ style: { color: '#FFFFFF' }, }} />
        <Button className={classes.style_fields} variant="contained" color="primary" onClick={clickCreateRoom} >Create Room</Button>
        <div className={classes.style_fields} >
          <Link href="http://192.168.136.164:8080/guacamole/#/" variant="body2">
            <p className={classes.forgot}>guacamole url</p>
          </Link>
        </div>
      </Grid>
    </div>
  );
}

CreateRoom.prototype = {

}

export default withRouter(CreateRoom);