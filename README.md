VLCTube
=======

Node.js script to act as an interface between berrytube and VLC.  Supports YouTube/Vimeo/Dailymotion/Soundcloud/Sehro.  Supports synchronization.

Confirmed working on Linux.  oobitydoo tried to get it to work on Windows without much success, it seems to be an issue with the node<->VLC interface.

Requires node.js.  If you're on a Debian-based distribution, install this from source (http://nodejs.org).  The Debian package for node is ancient and probably won't work.

Execute npm install to automatically fetch dependencies (currently only socket.io).

You may have to update vlc.js if `vlc` isn't in your `$PATH`.
