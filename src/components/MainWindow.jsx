import React, { useState } from "react";
import { Buffer } from "buffer";
import "../style.css";
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
        audio: false,
        video: {
          ideal: { width: 1920, height: 1080, frameRate: 60 },
          mandatory: {
            chromeMediaSource: "desktop",
          },
        },
      };
      const videoElem = document.querySelector("video");
      const vidStream = await navigator.mediaDevices.getUserMedia(
        vidConstraints
      );
      videoElem.srcObject = vidStream;
      videoElem.play();

      const audioConstraints = {
        audio: {
          mandatory: {
            chromeMediaSource: "desktop",
          },
        },
      };
      const audioStream = await navigator.mediaDevices.getUserMedia(
        audioConstraints
      );

      const stream = new MediaStream([
        ...vidStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      //media recorder
      const options = { mimeType: "video/webm; codecs=vp9" };
      setMediaRecord(new MediaRecorder(stream, options));
    });
  };
  const handleDataAvailable = (e) => {
    console.log("video data available");
    recordedChunks.push(e.data);
  };
  const handleStop = async (e) => {
    const blob = new Blob(recordedChunks, {
      type: "video/webm; codecs=vp9",
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
                Webm Screen Recorder
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
            padding: "10px",
          }}
        >
          © 2022 Copyright
          <a
            href="https://romanaugusto.tk"
            className="grey-text text-lighten-4 right"
            target="_blank"
            rel="noreferrer"
          >
            Hyouin Kyouma
          </a>
        </div>
      </footer>
    </>
  );
}

export default MainWindow;
