import React from "react";
import { BrowserRouter as Router, Route, Link, Switch} from "react-router-dom";

// Notice that we're exporting the AllCampuses component twice. The named export
// (below) is not connected to Redux, while the default export (at the very
// bottom) is connected to Redux. Our tests should cover _both_ cases.
export class Space extends React.Component {
  componentDidMount(){
  }
  render() {
    
    return (
      <div>
        <Link>
            <img src = "../Images/Peaks.png"/>
        </Link>
        <Link>
            <img src = "../Images/Space.png"/>
        </Link>
      </div>
    )}
}

export default Space ;