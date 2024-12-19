// @deno-types="npm:@types/react"
import { useCallback, useEffect, useRef } from "react";

const BUFFER_SIZE = 2048;
const POLL_INTERVAL = 100;

export function useMicrophone(onData: (data: Uint8Array) => void) {
  const audioContext = useRef<AudioContext>();
  const mediaStream = useRef<MediaStream>();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    }).then((stream: MediaStream) => {
      mediaStream.current = stream;
      audioContext.current = new AudioContext();
    });
  }, []);

  const startRecording = useCallback(() => {
    if (!audioContext.current || !mediaStream.current) {
      console.error("Audio context or media stream not available");
      return;
    }

    const analyser = audioContext.current.createAnalyser();
    analyser.fftSize = BUFFER_SIZE;
    audioContext.current.createMediaStreamSource(mediaStream.current).connect(analyser);

    const interval = setInterval(() => {
      const buffer = new Uint8Array(BUFFER_SIZE);
      analyser.getByteFrequencyData(buffer);
      const bytesRead = buffer.reduce((acc, val) => acc + Number(val != 0), 0);
      onData(buffer.slice(0, bytesRead));
    }, POLL_INTERVAL);

    return () => {
      analyser.disconnect();
      clearInterval(interval);
    };
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
    }
  }, []);

  return {
    startRecording,
    stopRecording,
  };
}
