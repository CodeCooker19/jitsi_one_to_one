import React, { useEffect, useState } from 'react';

// material ui core components
import { makeStyles } from '@material-ui/core/styles';

import InputEmoji from "react-input-emoji";

// images
import UserAvatar from '../../assets/images/useravatar.png';
import MineAvatar from '../../assets/images/mineavatar.png';
import { camelCase } from 'jquery';

const useStyles = makeStyles((theme) => ({
  root: {
    width: 'calc(100% - 20px)',
    height: 'calc(100% - 20px)',
    padding: '10px',
  },
  messageContainer: {
    height: 'calc(100% - 66px)',
    overflowY: 'scroll',
    position: 'relative',
  },
  messageArea: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: '10px',
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '25px',
    marginRight: '10px',
  },
  flexStart: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: 'calc(100% - 60px)',
  },
  username: {
    fontSize: '16px',
    fontWeight: 900,
    lineHeight: '20px',
    marginRight: '10px',
    marginBottom: '8px',
    color: '#333',
  },
  time: {
    display: 'flex',
    alignItems: 'flex-end',
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '16px',
    marginBottom: '8px',
    color: '#333',
  },
  message: {
    maxWidth: 'none',
    width: '100%',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '18px',
    color: '#333',
    marginBottom: '4px',
  },
  emojiTextArea: {
    position: 'absolute',
    bottom: '10px',
    width: 'calc(100% - 20px)',
    border: '1px solid #999999',
    borderRadius: '16px',
    backgroundColor: 'white',
  },
}));

// main function
const ChatView = (props) => {
  const { messages, getMyMessage } = props
  const classes = useStyles();
  const messagesEnd = React.useRef()

  const [text, setText] = useState("");

  function handleOnEnter(text) {
    getMyMessage(text);
  }

  const scrollToBottom = () => {
    messagesEnd.current.scrollIntoView({ behavior: "smooth" });
  }
  
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={classes.root}>
      <div id="chatConversation" className={classes.messageContainer}>
        {messages.map((message, index) => {
          return (
            <div key={index} className={classes.messageArea}>
              <img src={UserAvatar} className={classes.avatar} alt="..." />
              <div className={classes.flexStart}>
                <div className={classes.username}>
                  {message.user}
                </div>
                <div className={classes.time}>
                  {message.ts}
                </div>
                <div className={classes.message}>
                  {message.text}
                </div>
              </div>
            </div>
          )
        })}
        <div className={classes.message} ref={messagesEnd} />
      </div>
      <div className={classes.emojiTextArea}>
        <InputEmoji
          value={text}
          onChange={setText}
          cleanOnEnter
          onEnter={handleOnEnter}
          placeholder="Type a message"
          borderColor="white"
        />
      </div>
    </div>
  )
}

export default ChatView;