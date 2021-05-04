import React, { Component } from 'react';
import { Switch, Redirect, Route, HashRouter } from 'react-router-dom';

import {
    CreateRoom as CreateRoom,
    Conferences as Conferences
} from './Pages'

class Routes extends Component {
    render() {
        return (
            <HashRouter>
                <Switch>
                    <Route exact path="/" component={CreateRoom} />
                    <Route exact path="/conferences/:roomname/:name" component={Conferences} />
                </Switch>
            </HashRouter >
        )
    }
}

export default Routes;