import React, { Component } from 'react';
import { Switch, Route, HashRouter } from 'react-router-dom';

import {
    Login,
    MainPage
} from './Pages'

class Routes extends Component {
    render() {
        return (
            <HashRouter>
                <Switch>
                    <Route exact path="/" component={Login} />
                    <Route exact path="/mainpage/:userId" component={MainPage} />
                </Switch>
            </HashRouter >
        )
    }
}

export default Routes;