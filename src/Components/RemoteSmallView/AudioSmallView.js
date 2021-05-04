import React, {Component} from 'react';
import * as $ from 'jquery';
import './remotesmallview.css';

export default class AudioSmallView extends Component {
    constructor(props) {
        super(props);

        this.state = {track:this.props.track, audio_tag_id: this.props.audio_tag_id};
    }
    componentDidMount() {
        this.state.track.attach($(`#${this.state.audio_tag_id}`)[0]);
    }

    componentWillUnmount() {
        this.state.track.detach($(`#${this.state.audio_tag_id}`)[0]);
    }

    render() {
        return(
            <div id={'div' + this.state.audio_tag_id} className='div_audio'>
                <audio autoPlay='1' id={this.state.audio_tag_id} />
            </div>
        );
    }
}