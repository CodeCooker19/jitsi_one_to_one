import React, { Component } from 'react';
import { Switch, Route, HashRouter } from 'react-router-dom';

import {
    Login as Login,
    Conferences as Conferences,
    MainPage as MainPage
} from './Pages'

class Routes extends Component {
    render() {
        return (
            <HashRouter>
                <Switch>
                    <Route exact path="/" component={Login} />
                    <Route exact path="/mainpage/:userId" component={MainPage} />
                    <Route exact path="/conferences/:roomname/:name" component={Conferences} />
                </Switch>
            </HashRouter >
        )
    }
}

export default Routes;