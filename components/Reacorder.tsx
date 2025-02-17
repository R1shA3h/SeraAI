"use client";
import Image from 'next/image'
import activeAssistantIcon from '../img/img/active.gif'
import notActiveAssistantIcon from '../img/img/notactive.png'
import { access } from 'fs'
import { useEffect, useReducer, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

export const mimeType = "audio/webm";

function Reacorder({uploadAudio}: {uploadAudio:(blob:Blob)=>void}){
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const { pending } = useFormStatus();
    const [permission,setPermission] = useState(false);
    const [stream,setStream]= useState<MediaStream | null>(null);
    const [recordingStatus,setRecordingStatus] = useState("Inactive");
    const [audioChunks,setAudioChunks] = useState<Blob[]>([]);
    const [audio, setAudio] = useState<string | null>(null);
    
    
    useEffect(()=>{
        getMicrophonePermission()
    },[]);

    const getMicrophonePermission = async() =>{
        if ("MediaRecorder" in window){
            try{
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);
            }
            catch (err:any){
                alert(err.message);
            }
        }else{
            alert("Your browser doesn't support the MediaRecorder API");
        }
    };

    const startRecording = async() => {
        if (stream===null || pending || mediaRecorder === null) return;
        setRecordingStatus("recording");
        const media = new MediaRecorder(stream,{mimeType});
        mediaRecorder.current=media;
        mediaRecorder.current.start();

        let localAudioChunks: Blob[] = [];
        mediaRecorder.current.ondataavailable = (event) => {
          if (typeof event.data === "undefined") return;
          if (event.data.size === 0) return;
          localAudioChunks.push(event.data);
        };
        setAudioChunks(localAudioChunks);
    };

    const stopRecording = () => {
        if (mediaRecorder.current === null) return;
    
        if (pending) return;
    
        setRecordingStatus("inactive");
        //stops the recording instance
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
          //creates a blob file from the audiochunks data
          const audioBlob = new Blob(audioChunks, { type: mimeType });
          //creates a playable URL from the blob file.
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudio(audioUrl);
          uploadAudio(audioBlob);
          setAudioChunks([]);
        };
    };
    


    return (
        <div className="flex items-center justify-center">
          {!permission ? (
            <button onClick={getMicrophonePermission} type="button">
              Get Microphone
            </button>
          ) : null}
    
          {pending && (
            <Image
              src={activeAssistantIcon}
              alt="Recording"
              width={350}
              height={350}
              onClick={stopRecording}
              priority={true}
              className="assistant grayscale"
            />
          )}
    
          {permission && recordingStatus === "inactive" && !pending ? (
            <Image
              src={notActiveAssistantIcon}
              alt="Not Recording"
              width={350}
              height={350}
              onClick={startRecording}
              priority={true}
              className="assistant cursor-pointer hover:scale-110 duration-150 transition-all ease-in-out"
            />
          ) : null}
          {recordingStatus === "recording" ? (
            <Image
              src={activeAssistantIcon}
              alt="Recording"
              width={350}
              height={350}
              onClick={stopRecording}
              priority={true}
              className="assistant cursor-pointer hover:scale-110 duration-150 transition-all ease-in-out"
            />
          ) : null}
        </div>
      );
    }
    
export default Reacorder