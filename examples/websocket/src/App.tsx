import { useMicrophone } from "../../../src/hooks/useMicrophone.ts";
// @deno-types="npm:@types/react"
import { useCallback, useEffect, useRef } from "react";

function App() {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    console.log("Setting up websocket connection");
    const ws = new WebSocket("ws://localhost:8080/");

    ws.onopen = () => console.log("WebSocket connection opened");
    ws.onclose = () => console.log("WebSocket connection closed");

    socketRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const onData = useCallback((data: Uint8Array) => {
    // console.log("Data received from microphone", data);
    if (socketRef.current) {
      // console.log("Websocket state is ", socketRef.current.readyState);
      if (socketRef.current.readyState === WebSocket.OPEN) {
        // console.log("Sending data to server");
        console.log(data);
        socketRef.current.send(data);
      }
    }
  }, [socketRef.current]);

  const { startRecording, stopRecording } = useMicrophone(onData);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <button onClick={startRecording}>
          Start!
        </button>
        <button onClick={stopRecording}>
          Stop!
        </button>
      </div>
    </>
  );
}

export default App;
