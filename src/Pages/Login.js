import React, { useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/styles';
import { withRouter } from 'react-router-dom';
import { Button, Grid, TextField } from '@material-ui/core/';

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
    width: '40%'
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
  const classes = useStyles();
  const { history } = props;
  const [userId, setUserId] = useState('');

  const changeUserId = (event) => {
    setUserId(event.target.value);
  }

  const clickLogin = () => {
    if (userId === '')
      return;
    history.push('/mainpage/' + userId);
  }

  return (
    <div className={classes.root} >
      <Grid className={classes.container} container direction="column" justify="center" alignItems="center">
        <CssTextField className={classes.width_40} label="Your Name" variant="outlined" onChange={changeUserId} value={userId} InputProps={{ style: { color: '#FFFFFF' }, }} />
        <Button className={classes.style_fields} variant="contained" color="primary" onClick={clickLogin} >Login</Button>
      </Grid>
    </div>
  );
}

CreateRoom.prototype = {

}

export default withRouter(CreateRoom);