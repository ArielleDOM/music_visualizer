import React from "react";
import { BrowserRouter as Router, Route, Link, Switch} from "react-router-dom";
import Peaks from  "./Peaks.js";
import Space from "./Space.js"
import Home from "./Home.js"



const Routes = () => {
  return (
    <Router>
      <div>
        <nav> 
          <div id = 'navbar'>
          <Link to = '/home'> Students</Link>
          </div>
        </nav>
        <Switch>
            <Route exact path = "/home" component= {Home}/>
            <Route exact path = "/space" component= {Space}/>
            <Route exact path = "/peaks" component= {Peaks}/>
        </Switch>
      </div>
    </Router>
  );
};

export default Routes;