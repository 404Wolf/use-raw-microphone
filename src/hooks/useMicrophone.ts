// @deno-types="npm:@types/react"
import { useCallback, useEffect, useRef } from "react";

const BUFFER_SIZE = 2048;
const POLL_INTERVAL = 100;

export function useMicrophone(onData: (data: Uint8Array) => void) {
  const audioContext = useRef<AudioContext>(null);
  const mediaStream = useRef<MediaStream>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
        sampleRate: 16000,
      },
      video: false,
    }).then((stream: MediaStream) => {
      mediaStream.current = stream;
      audioContext.current = new AudioContext();
    });
  }, []);

  const startRecording = useCallback(() => {
    console.log("Starting recording");

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
      console.log("Posted new data");
    }, POLL_INTERVAL);

    return () => {
      console.log("Cleaning up raw microphone recorder");
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
