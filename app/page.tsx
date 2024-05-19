'use client';
import Image from "next/image";
import Logo from '../img/img/myphoto.jpg'
import Messages from "@/components/Messages";
import { Import, SettingsIcon } from "lucide-react";
import Reacorder, { mimeType } from "@/components/Reacorder";
import { useRef,useEffect,useState } from "react";
import { blob } from "stream/consumers"; 
import VoiceSynthesizer from "@/components/VoiceSynthesizer";
import { useFormState } from "react-dom";
import transcripts from "@/actions/transcript";

const initialState = {
  sender: "",
  response: "",
  id: "",
};

export type Message = {
  sender: string;
  response: string;
  id: string;
};

export default function Home() {
  const [state, formAction] = useFormState(transcripts, initialState);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [displaySettings, setDisplaySettings] = useState(false);

  useEffect(() => {
    if (state.response && state.sender) {
      setMessages((messages) => [
        {
          sender: state.sender || "",
          response: state.response || "",
          id: state.id || "",
        },
        ...messages,
      ]);
    }
  }, [state]);

  const uploadAudio = (blob: Blob)=>{
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;

    const file = new File([blob],'audio.webm',{type:blob.type});

    if(fileRef.current){
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileRef.current.files = dataTransfer.files;

      if(submitButtonRef.current){
        submitButtonRef.current.click();
      }
    }
  };

  console.log(messages);
  
  return (
    <main className="bg-black h-screen overflow-y-scroll">
      {/* <h1>Lets build</h1> */}
      <header className="flex justify-between fixed top-0 text-white w-full p-5">
        <Image
          alt="Logo"
          src={Logo}
          width={50}
          height={50}
          
        />

        <SettingsIcon className="p-2 m-2 rounded-full cursor-pointer bg-purple-600 text-black transition-all ease-in-out duration-150 hover:bg-purple-700 hover:text-white"
            onClick={() => setDisplaySettings(!displaySettings)}
            size={40} 
        />
      </header>
      <form action={formAction} className="flex flex-col bg-black">
        <div className="flex-1 bg-gradient-to-b from-purple-500 to-black">
          <Messages messages={messages}/>
        </div>
        <input type="file" name="audio" hidden ref={fileRef}/>
        <button type="submit" hidden ref={submitButtonRef}/>
        <div className="fixed bottom-0 w-full overflow-hidden bg-black rounded-t-3xl">
          <Reacorder uploadAudio={uploadAudio}/>
          <div className="">
            <VoiceSynthesizer state={state} displaySettings={displaySettings} />
          </div>
        </div>
      </form>
    </main>
  );
}
