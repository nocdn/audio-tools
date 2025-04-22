import { useState } from "react";
import DropZone from "./DropZone";
import SubmitButton from "./SubmitButton";

export default function App() {
  const [file, setFile] = useState<File | null>(null);

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

  // initial prompt UI
  const dropzoneContentInitial = (
    <div className="flex flex-col gap-0.5 text-[15px]">
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

  return (
    <main className="p-8 flex flex-col gap-6 w-fit">
      <p className="font-jetbrains-mono opacity-40 text-base font-medium">
        // AUDIO TOOLS
      </p>

      <DropZone
        onClick={handleDropZoneClick}
        onDropped={handleDrop}
        className="font-jetbrains-mono font-medium px-8 py-6"
      >
        {dropzoneContent}
      </DropZone>

      <SubmitButton onClick={handleSubmitClick} enabled={file !== null} />
    </main>
  );
}
