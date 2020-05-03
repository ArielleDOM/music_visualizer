import React from "react";

// Notice that we're exporting the AllCampuses component twice. The named export
// (below) is not connected to Redux, while the default export (at the very
// bottom) is connected to Redux. Our tests should cover _both_ cases.
export class Space extends React.Component {
  componentDidMount(){
  }
  render() {
    
    return (
      <div>
          <div id="content">
    
            <label for="thefile" class="file"> Choose an audio file
            <input type="file" id="thefile" accept="audio/*" />
            </label>

            <audio id="audio" controls></audio>
            <div id="out"></div>
            <div id="fileName">Upload an audio file to start the vizualiser</div>

            </div>
            <script src='https://cdnjs.cloudflare.com/ajax/libs/three.js/84/three.min.js'></script>
            <script src='https://cdn.rawgit.com/mrdoob/three.js/master/examples/js/controls/OrbitControls.js'></script>
            <script src='https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.6.3/dat.gui.min.js'></script>
            <script src='https://cdnjs.cloudflare.com/ajax/libs/simplex-noise/2.3.0/simplex-noise.min.js'></script>


            <script  src="../JS/tron.js" type = "module"></script>
            <script  src= "../JS/nightsky.js" type = "module"></script>
      </div>
    )}
}

export default Space ;