import { useState } from "react";
import DropZone from "./DropZone";
import SubmitButton from "./SubmitButton";
import Settings from "./Settings";
import NumberFlow from "@number-flow/react";

import { Cog } from "lucide-react";

// each setting has a name and numeric value
type NamedSetting = { name: string; value: number; readableName: string };

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  // sox settings arrays to use map
  const [soxSettings, setSoxSettings] = useState<{
    bass: NamedSetting[];
    reverb: NamedSetting[];
  }>({
    bass: [
      { name: "gain", value: 6, readableName: "Gain" },
      { name: "frequency", value: 100, readableName: "Frequency" },
      { name: "width", value: 0.7, readableName: "Width" },
    ],
    reverb: [
      { name: "wetGain", value: 0, readableName: "Wet Gain" },
      { name: "reverberance", value: 60, readableName: "Reverberance" },
      { name: "hfDamping", value: 60, readableName: "HF Damping" },
      { name: "roomScale", value: 80, readableName: "Room Scale" },
      { name: "stereoDepth", value: 100, readableName: "Stereo Depth" },
      { name: "preDelay", value: 25, readableName: "Pre Delay" },
    ],
  });

  // called when user clicks the dropzone
  function handleDropZoneClick(): void {}

  // called when user drops a file
  function handleDrop(droppedFile: File): void {
    console.log(droppedFile);
    setFile(droppedFile);
  }

  // called when user hits submit
  function handleSubmitClick(): void {
    console.log("submitting audio");
  }

  function handleSettingsClick(): void {
    console.log("settings opened");
    setSettingsOpen(true);
  }

  const dropzoneContentInitial = (
    <div className="flex flex-col gap-0.5 text-[15px] w-40">
      <p>Drop a file here</p>
      <p className="opacity-50 text-sm font-geist-mono">or click to choose</p>
    </div>
  );

  // derive the “file selected” UI directly
  const dropzoneContent = file ? (
    <div>
      <p className="max-w-64">{file.name}</p>
      <p className="opacity-50">{(file.size / 1000).toFixed(1)}KB</p>
    </div>
  ) : (
    dropzoneContentInitial
  );

  // settings UI now maps over both arrays
  const settingsContent = (
    <div className="w-24 flex flex-col gap-2">
      <p className="font-jetbrains-mono text-sm font-medium">BASS</p>
      <div className="text-sm space-y-2 font-geist-mono font-medium">
        {soxSettings.bass.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 w-full justify-evenly"
          >
            <button
              onClick={() => {
                /* decrement logic */
              }}
            >
              –
            </button>
            <div className="w-full grid place-content-center">
              <NumberFlow value={item.value} />
            </div>
            <button
              onClick={() => {
                /* increment logic */
              }}
            >
              +
            </button>
          </div>
        ))}
      </div>

      <p className="font-jetbrains-mono text-sm font-medium mt-3">REVERB</p>
      <div className="text-sm space-y-2 font-geist-mono font-medium">
        {soxSettings.reverb.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 w-full justify-evenly"
          >
            <button
              onClick={() => {
                /* decrement logic */
              }}
            >
              –
            </button>
            <div className="w-full grid place-content-center">
              <NumberFlow value={item.value} />
            </div>
            <button
              onClick={() => {
                /* increment logic */
              }}
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="p-8 flex flex-col gap-6 h-dvh w-screen">
      <p className="font-jetbrains-mono opacity-40 text-base font-medium">
        // AUDIO TOOLS
      </p>

      <DropZone
        onClick={handleDropZoneClick}
        onDropped={handleDrop}
        className="font-jetbrains-mono font-medium px-8 py-6 max-w-72 w-fit"
      >
        {dropzoneContent}
      </DropZone>

      <SubmitButton onClick={handleSubmitClick} enabled={file !== null} />

      <Settings
        onClick={handleSettingsClick}
        className="border border-gray-200 p-3 w-fit group mt-auto"
      >
        {settingsOpen ? (
          settingsContent
        ) : (
          <Cog size={18} className="opacity-50 group-hover:opacity-100" />
        )}
      </Settings>
    </main>
  );
}
