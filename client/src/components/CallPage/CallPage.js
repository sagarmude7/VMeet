import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Container, Paper, Avatar, Button } from "@material-ui/core";
import CallPageFooter from "./CallPageFooter/CallPageFooter";
import JoiningPage from "../JoiningPage/JoiningPage.js"
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { SET_AUDIOTRACK, SET_SOCKETID, SET_STREAM, SET_VIDEOTRACK } from "../../constants/actions";
import People from "./PeopleDrawer/People";
import Chat from "./ChatDrawer/Chat";
import Info from "./InfoDrawer/Info";
import useStyles from "./styles";

const CallPage = () => {
  /*
    States and Varaibles Initializaitons
    */

  const classes = useStyles();
  const dispatch = useDispatch();
  const myStream = useRef();
  const history = useHistory();
  const profile = useSelector((state) => state.profile);
  const user = useSelector((state) => state.user);
  const [isJoined, setIsJoined] = useState(false);
  const server_url = "https://meetv-v1.herokuapp.com/";
  // const server_url = "localhost:5000"; //URL Where room will be created
  var connections = {}; //Stores all the users(connections) joined
// connection = Reducer

  var socket = null; //To initialize socket in the client Side
//File

  var socketId = null; //To store socket's Id ,later used for comparing
//User.sockerId

  var elms = 0; //No. of users Joined the meet
//call.elems
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);



  useEffect(()=>{
    console.log("Hello")
    if(isJoined){
      console.log("adding video")
      myStream.current.srcObject = user.stream
    }
      
  },[isJoined])
  /* 
     * Following Function takes the currStream, 
        Stops previous streams if any and add currstreams all the tracks to all the connections (people) by using for loop 
     *  
     */
  const getUserMediaSuccess = (stream) => {
    try {
      if(window.localStream){
        console.log("devices found")
        window.localStream.getTracks().forEach((track) => track.stop());
      }
        
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream; //store curremt stream to winow.localstream  (?)
    // myStream.current.srcObject = stream;

    console.log(window.localStream);
    for (let id in connections) {
      // if (id === socketId) continue; //If one user is already in connections, then don't add him/her
      console.log(window.localStream);

      window.localStream?.getTracks().forEach((track) => {
        //Add Audio and videoTracks to all the connections
        connections[id].addTrack(track);
        console.log(connections[id]);
      });

      //Creating a Offer/Call and settting description of that offer as the local Descritio.
      //emit my local Information to the socket and eventually to all the users as a SDP (session Description Protocol)

      // Change : Call Back Async Await

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            //Sends every Peer Current user's Description
            socket.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(track => track.onended = () =>{
      console.log("stream ended")
    })
    // stream.getTracks().forEach(track => track.onended = () => {
    //     try {
    //       let tracks = myStream.current.srcObject.getTracks()
    //       tracks.forEach(track => track.stop())
    //     } catch(e) { console.log(e) }

    //     window.localStream = null
    //     myStream.current.srcObject = window.localStream
    //   })
  };
  if(user.stream)
    console.log(user.stream.getAudioTracks())
  /*
     * This function will be called when page refreshed  and when new user joins
        Takes Users Media and set it as curr Stream 
        call getMediaSucccess which sets currStream as localStream i.e window.localStream and creates offer and set its Localdescription
     */

  
  // console.log(window.location.href)
  /*
   * Config required to make Peer Connection
   */
  const peerConnectionConfig = {
    'iceServers': [
      // { 'urls': 'stun:stun.services.mozilla.com' },
      { urls: "stun:stun.l.google.com:19302" },
    ],
  };

  /**
     * This Function Will Execute when one user gets "Message"(means description of other user as SDP) from the socket
       from ID : Whose description
       Message : Description SDP
  */
//Message and FromId = Redux
  const gotMessageFromServer = (fromId, message) => {
    //since we emmitted message as string we parse it and store it in some object
    var signal = JSON.parse(message);

    if (fromId !== socketId) {
      //Doubt about this check

      //If Message's sdp exists then set that Description as Remote Description of of curr user

      if (signal?.sdp) {
        //Setting Remote Description
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            //Checking is if is of type offer
            if (signal.sdp.type === "offer") {
              //If it  is off type offer then create answer
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  //and set that ans as curr users local description
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      //Creating curr users local Description and storing it as local sdp
                      //and emmiting so as to allow other users to store this as their remote description
                      socket.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }
      //
      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };
  /**
   * Main Function to handle socket Events
   */

  const connectToSocketServer = async () => {
    //connects to the socket
    socket = io.connect(server_url, { secure: true });

    //Whenver signal event is emmitted from server fire gotMessageServer with sender's Id and his/her localDescription
    socket.on("signal", (fromId, message) => {
      console.log("GOT SIGNAL");
      gotMessageFromServer(fromId, message);
    });

    
    //Events involved while connecting...

    socket.on("connect", () => {
      // console.log("Connecting... ");

      //emits join call event with the URL
      socket.emit("join-call", window.location.href);
      
      //Store Socket's Id as SocketId
      socketId = socket.id;

      //Events when user is joined
      /**
       * This event is emmited from server when user joins the call
       * which sends id of the user joined and all the people present in the meet
       */
      socket.on("user-joined", async (id, clients) => {
        console.log(id);
        console.log(clients);
        //For every Client/person in the meet make a new RTCPeerConnection
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConnectionConfig
          );
          console.log(connections[socketListId]);
          // Wait for their ice candidate
          /*
           * This happens whenever the local ICE agent needs to deliver a message to the other peer
           *  through the signaling server.
           * Once connection is established between two peers ,they communicate through ice candidates
           */

          connections[socketListId].onicecandidate = async function (event) {
            if (event.candidate != null) {
              console.log(event.candidate)
              await socket.emit(
                "signal",
                socketListId,
                JSON.stringify({ "ice": event.candidate })
              );
            }
          };

          /**
           * Now Showing Video Stream of all the users in on my screen
           */

          connections[socketListId].ontrack = (event) => {
            console.log("event");
            console.log(event.streams[0]);
            var searchVidep = document.querySelector(
              `[data-socket="${socketListId}"]`
            );
            if (searchVidep !== null) {
              // if i don't do this check it make an empyt square
              searchVidep.srcObject = event.streams[0]; //currStream
              console.log(searchVidep);
            } else {
              console.log("creating new video....");
              elms = clients.length;
              let main = document.getElementById("main");
              let video = document.createElement("video");
              video.style.setProperty("width", "400px");
              video.style.setProperty("border", "5px solid #1a73e8");
              video.style.setProperty("border-radius", "20px");
              video.style.setProperty("margin", "1    0px");
              video.setAttribute("data-socket", socketListId);
              //Stream assigned to video
              video.srcObject = event.streams[0];
              console.log(event.stream);
              video.autoplay = true;
              video.playsinline = true;
              main.style.setProperty("display", "grid");
              main.style.setProperty("width", "1000px");
              main.style.setProperty("grid-template-columns", "auto auto auto");
              main.appendChild(video);
              console.log(video);
            }
          };

          console.log(connections);

          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            window.localStream?.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          } else {
            let video = document.getElementsById("my-id");
            video.style.setProperty("background", "black");
            video.style.setProperty("border", "1px solid green");
            window.localStream?.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          }
        });

        /**
         * Above code is to display All user's stream to me
         * Now what every other user will see ?
         * following code does just that
         */
        console.log(socketId)
        console.log(user)
        if (id === socketId) {
          console.log(connections);
          for (let id2 in connections) {
            if (id2 === socketId) continue;

            try {
              window.localStream.getTracks().forEach((track) => {
                connections[id2].addTrack(track, window.localStream);
                console.log(connections[id2]);
              });
            } catch (e) {
              console.log(e.message);
            }

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socket.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
            console.log(connections);
          }
        }
      });
    });
  };

 

  const handleJoin = async () => {
    setIsJoined(true);
    // await initWebRTC();
    getUserMediaSuccess(user.stream);
    connectToSocketServer();
  };

  // useEffect(() => {
  //   if (!user.isAdmin) {
  //     history.push("/join");
  //   }
  // }, []);

  return (
    <div className={classes.root}>
      {!isJoined ?
        (
        <>
          <Button className={classes.btn} onClick={handleJoin}>
            Join Now
          </Button>
          <JoiningPage />
        </>
        )
        :
       (<Container
        className={clsx(classes.content, {
          [classes.contentShift]: peopleOpen || chatOpen || infoOpen,
        })}
      >
        {/* {
                            !user.videoOn?(
                                <Paper className={classes.userPaper}>
                                    <Avatar src={profile?.profilePic} className={clsx(classes.largeAvatar)} alt={profile?.userName}>
                                            {profile?.firstName?.charAt(0)} {profile?.lastName?.charAt(0)}
                                    </Avatar>
                                    <div className={classes.bottomline}>
                                        <Typography variant="body1">
                                            {profile.name}
                                        </Typography>
                                    </div>
                                    
                                </Paper>
                            ):null
                        } */}
        {/* <Paper className={classes.userPaper}> */}
        {/* User 1 */},{/* </Paper> */}
        {!user.videoOn ? (
            <Paper className={classes.userPaper}>
              <Avatar
                src={profile?.profilePic}
                className={clsx(classes.largeAvatar)}
                alt={profile?.userName}
              >
                {profile?.firstName?.charAt(0)} {profile?.lastName?.charAt(0)}
              </Avatar>
            </Paper>
        ) : null}
        <div id="main">
          <video id="my-video" ref={myStream} className={classes.myVid} autoPlay muted></video>
        </div>
        <div className={classes.drawerHeader} />
        <CallPageFooter
          myStream={myStream}
          peopleOpen={peopleOpen}
          infoOpen={infoOpen}
          chatOpen={chatOpen}
          setPeopleOpen={setPeopleOpen}
          setInfoOpen={setInfoOpen}
          setChatOpen={setChatOpen}
        />
      </Container>
       )}
      <Info open={infoOpen} setDrawerOpen={setInfoOpen} />
      <People open={peopleOpen} setDrawerOpen={setPeopleOpen} />
      {/* <Info open={infoOpen} setDrawerOpen={setInfoOpen} /> */}
      <Chat open={chatOpen} setDrawerOpen={setChatOpen} />
     
    </div>

  );
};

export default CallPage;


// const initWebRTC = async () => {
  //   const currStream = await navigator.mediaDevices.getUserMedia({
  //     audio: user.micOn,
  //     video: user.videoOn,
  //   });
  //   getUserMediaSuccess(currStream);
  //   dispatch({ type: SET_STREAM, payload: currStream });
  //   const audioTrack = currStream.getAudioTracks()[0];
  //   const videoTrack = currStream.getVideoTracks()[0];
  //   dispatch({type:SET_VIDEOTRACK,payload:videoTrack})
  //   dispatch({type:SET_AUDIOTRACK,payload:audioTrack})
  // };