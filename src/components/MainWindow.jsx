import React, { useState } from "react";
import "../style.css";
var Buffer = require("buffer/").Buffer;

function MainWindow() {
  const [buttonText, setButtonText] = useState("Select a Video Source");
  const [mediaRecorder, setMediaRecord] = useState({});
  const [startBtn, setStartBtn] = useState({
    text: "Start",
    class: "btn blue-grey",
  });

  const recordedChunks = [];

  const selectSource = async () => {
    window.electronAPI.selectSource();
    await window.electronAPI.sendSource(async (e, arg) => {
      console.log(buttonText);
      setButtonText(arg.name);
      console.log(buttonText);
      const vidConstraints = {
        audio: {
          mandatory: {
            chromeMediaSource: "desktop",
          },
        },
        video: {
          ideal: { width: 1920, height: 1080, frameRate: 60 },
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: arg.id,
            minFrameRate: 24,
            maxFrameRate: 61,
          },
        },
      };
      const videoElem = document.querySelector("video");
      const vidStream = await navigator.mediaDevices.getUserMedia(
        vidConstraints
      );
      videoElem.srcObject = new MediaStream([...vidStream.getVideoTracks()]);
      videoElem.play();

      //media recorder
      const options = {
        mimeType: "video/webm; codecs=avc1",
        videoBitsPerSecond: 30000000,
      };
      setMediaRecord(new MediaRecorder(vidStream, options));
    });
  };
  const handleDataAvailable = (e) => {
    console.log("video data available");
    recordedChunks.push(e.data);
  };
  const handleStop = async (e) => {
    const blob = new Blob(recordedChunks, {
      type: "video/x-matroska; codecs=avc1",
      videoBitsPerSecond: 30000000,
    });
    const buffer = Buffer.from(await blob.arrayBuffer());
    window.electronAPI.selectBuffer(buffer);
  };

  return (
    <>
      <div className="container">
        <div
          style={{
            display: "grid",
            gridAutoFlow: "row",
            alignItems: "center",
            height: "100%",
          }}
        >
          <div className="row">
            <div className="col s12 center" style={{ height: "fit-content" }}>
              <h1
                style={{
                  fontSize: "3rem",
                  height: "2rem",
                  padding: "0",
                  margin: "1rem",
                }}
              >
                NoBS Screen Recorder
              </h1>
            </div>
          </div>
          <div className="row">
            <video></video>
          </div>
          <div className="row">
            <div className="col s12 center">
              <button
                className={startBtn.class}
                id="startBtn"
                style={{ margin: "0 2.5px" }}
                onClick={() => {
                  if (!mediaRecorder.start) return;
                  if (startBtn.text === "Recording") return;
                  mediaRecorder.ondataavailable = handleDataAvailable;
                  mediaRecorder.onstop = handleStop;
                  mediaRecorder.start(); //evenhandlers
                  setStartBtn({ text: "Recording", class: "btn red" });
                }}
              >
                {startBtn.text}
              </button>
              <button
                id="stopBtn"
                className="btn blue-grey"
                style={{ margin: "0 2.5px" }}
                onClick={() => {
                  if (!mediaRecorder.stop) return;
                  if (startBtn.text !== "Recording") return;
                  setStartBtn({ text: "Start", class: "btn blue-grey" });
                  mediaRecorder.stop();
                }}
              >
                Stop
              </button>
            </div>
            <div className="col s12 center" style={{ marginTop: "1rem" }}>
              <button
                id="videoSelect"
                onClick={selectSource}
                className="btn blue-grey"
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer
        className="footer-copyright blue-grey"
        style={{
          height: "50px",
          position: "absolute",
          bottom: "0",
          width: "100%",
        }}
      >
        <div
          className="container white-text"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>© 2022 Copyright</span>
          <a
            href="https://romanaugusto.tk"
            className="grey-text text-lighten-4 right"
            target="_blank"
            rel="noreferrer"
          >
            <em>"This took 5 hours to code wtf i hate js now."</em> <br />-
            Hyouin Kyouma
          </a>
        </div>
      </footer>
    </>
  );
}

export default MainWindow;
