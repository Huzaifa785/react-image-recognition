import React from 'react';
import CallCard from './components/CallCard/CallCard'
import Login from './components/Login/Login'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Login} exact={true} />
        <Route path="/call-card" component={CallCard} exact={true} />
      </Switch>
    </Router>
  )
}

export default App