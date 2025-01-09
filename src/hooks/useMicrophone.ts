// @deno-types="npm:@types/react@19.0.2"
import { useCallback, useEffect, useRef } from "react";

const BUFFER_SIZE = 2048;
const POLL_INTERVAL = 100;
interface UseMicrophoneHook {
  startRecording: () => (() => void) | undefined;
  stopRecording: () => void;
}

export function useMicrophone(onData: (data: Uint8Array) => void): UseMicrophoneHook {
  const audioContext = useRef<AudioContext>(null);
  const mediaStream = useRef<MediaStream>(null);
  const recInterval = useRef<number | null>(null);

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

    recInterval.current = setInterval(() => {
      const buffer = new Uint8Array(BUFFER_SIZE);
      analyser.getByteFrequencyData(buffer);
      console.log("New audio data", buffer);
      onData(new Uint8Array(BUFFER_SIZE));
    }, POLL_INTERVAL);

    return () => {
      console.log("Cleaning up raw microphone recorder");
      analyser.disconnect();
      if (recInterval.current) {
        clearInterval(recInterval.current);
      }
    };
  }, []);

  const stopRecording = () => {
    console.log("Stopping recording");

    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
      if (recInterval.current) {
        clearInterval(recInterval.current);
      }
    }
  };

  return {
    startRecording,
    stopRecording,
  };
}
