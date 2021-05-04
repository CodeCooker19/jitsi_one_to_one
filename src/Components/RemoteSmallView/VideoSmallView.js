import React, { useEffect, useState, Component } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PanToolIcon from '@material-ui/icons/PanTool';
import Avatar from '@material-ui/core/Avatar';
import * as $ from 'jquery';
import './remotesmallview.css';

export default class VideoSmallView extends Component {
    constructor(props) {
        super(props);

        this.state = { track: this.props.track, video_tag_id: this.props.video_tag_id, user_name: this.props.user_name, ishand: this.props.ishand, overView: false };
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleClickSmallVideo = this.handleClickSmallVideo.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ track: nextProps.track });
        this.setState({ ishand: nextProps.ishand });
    }

    handleMouseOver() {
        this.setState({ overView: true });
    }
    handleMouseLeave() {
        this.setState({ overView: false });
    }
    handleClickSmallVideo() {
        if (this.state.track !== undefined) {
            this.state.track.attach($(`#mainVideo`)[0]);
        } else {
            $(`#mainVideo`)[0].srcObject = null;
        }
    }

    componentDidMount() {
        if (this.state.track !== undefined) {
            this.state.track.attach($(`#${this.state.video_tag_id}`)[0]);
        }
    }

    componentWillUnmount() {
        if (this.state.track !== undefined) {
            this.state.track.detach($(`#${this.state.video_tag_id}`)[0]);
        }
    }

    render() {
        return (
            <div style={{ cursor: 'pointer' }} id={'div' + `${this.state.video_tag_id !== undefined ? this.state.video_tag_id : ''}`} className="root" onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave} onClick={this.handleClickSmallVideo}>
                <video className="video" autoPlay='1' id={this.state.video_tag_id !== undefined ? this.state.video_tag_id : ''} playsInline height='150' width='200' />
                <div className="div-avatar">
                    <Avatar className="avatar">{this.state.user_name == undefined ? "" : this.state.user_name.charAt(0).toUpperCase()}</Avatar>
                </div>
                <PanToolIcon className={this.state.ishand ? "hand show" : "hand hide"} />
                <div className={this.state.overView ? "over_div_show" : "over_div_hide"} >
                    <div className="div_text">{this.state.user_name}</div>
                </div>
            </div>
        );
    }
}