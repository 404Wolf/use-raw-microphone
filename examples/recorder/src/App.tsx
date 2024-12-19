import { useMicrophone } from "../../../src/hooks/useMicrophone.ts";
import { useCallback, useState } from "react";

function App() {
  const [rawStreamString, setRawStreamString] = useState<string>("");

  const onData = useCallback((data: Uint8Array) => {
    setRawStreamString(data.join(", "));
  }, []);

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

      <div>
        Example audio stream:
        <p>
          {rawStreamString}
        </p>
      </div>
    </>
  );
}

export default App;
