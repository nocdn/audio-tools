import { useState } from "react";
import DropZone from "./DropZone";
import SubmitButton from "./SubmitButton";
import Settings from "./Settings";
import NumberFlow, { continuous } from "@number-flow/react";
import { Cog } from "lucide-react";

// each setting has a name, displayed label, and numeric value
type NamedSetting = { name: string; readableName: string; value: number };

// step size for every parameter
const STEP_SIZES: Record<string, number> = {
  // bass
  gain: 1,
  frequency: 5,
  width: 0.1,
  // reverb
  wetGain: 1,
  reverberance: 5,
  hfDamping: 5,
  roomScale: 5,
  stereoDepth: 5,
  preDelay: 5,
};

// util – turns [{name,value}, …] into { name: value, … }
function listToObject(list: NamedSetting[]): Record<string, number> {
  return list.reduce<Record<string, number>>((acc, s) => {
    acc[s.name] = s.value;
    return acc;
  }, {});
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [soxSettings, setSoxSettings] = useState<{
    bass: NamedSetting[];
    reverb: NamedSetting[];
  }>({
    bass: [
      { name: "gain", readableName: "Gain", value: 6 },
      { name: "frequency", readableName: "Frequency", value: 100 },
      { name: "width", readableName: "Width", value: 0.7 },
    ],
    reverb: [
      { name: "wetGain", readableName: "Wet Gain", value: 0 },
      { name: "reverberance", readableName: "Reverberance", value: 60 },
      { name: "hfDamping", readableName: "HF Damping", value: 60 },
      { name: "roomScale", readableName: "Room Scale", value: 80 },
      { name: "stereoDepth", readableName: "Stereo Depth", value: 100 },
      { name: "preDelay", readableName: "Pre Delay", value: 25 },
    ],
  });

  // mutate chosen parameter by ±step
  function adjustSetting(
    section: "bass" | "reverb",
    settingName: string,
    delta: 1 | -1
  ) {
    setSoxSettings((prev) => ({
      ...prev,
      [section]: prev[section].map((s) =>
        s.name === settingName
          ? {
              ...s,
              value: parseFloat(
                (s.value + STEP_SIZES[settingName] * delta).toFixed(2)
              ),
            }
          : s
      ),
    }));
  }

  async function handleSubmitClick() {
    if (!file || submitting) return;
    setSubmitting(true);

    const form = new FormData();
    form.append("file", file);
    form.append("bass", JSON.stringify(listToObject(soxSettings.bass)));
    form.append("reverb", JSON.stringify(listToObject(soxSettings.reverb)));

    try {
      const res = await fetch("/api/process", { method: "POST", body: form });
      if (!res.ok)
        throw new Error(`server responded ${res.status}: ${res.statusText}`);

      const blob = await res.blob();
      // filename comes from content‑disposition or fallback
      let filename =
        "output_modified" + file.name.substring(file.name.lastIndexOf("."));
      const cd = res.headers.get("content-disposition");
      if (cd && cd.includes("filename=")) {
        filename = cd.split("filename=")[1].replace(/[";]/g, "");
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("error processing audio – see console for details");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDropZoneClick() {
    console.log("opening file picker");
  }

  const dropzoneContentInitial = (
    <div className="flex flex-col gap-0.5 text-[15px] w-40">
      <p>Drop a file here</p>
      <p className="opacity-50 text-sm font-geist-mono">or click to choose</p>
    </div>
  );

  const dropzoneContent = file ? (
    <div>
      <p className="max-w-64">{file.name}</p>
      <p className="opacity-50">{(file.size / 1000).toFixed(1)}KB</p>
    </div>
  ) : (
    dropzoneContentInitial
  );

  const settingsContent = (
    <div className="w-56 flex flex-col gap-2">
      {/* bass */}
      <div className="font-jetbrains-mono text-sm font-medium mb-1 w-full inline-flex justify-between">
        <p>BASS</p>
        <p
          className="ml-auto mr-0.5 text-blue-600/75 hover:text-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            setSettingsOpen(false);
          }}
        >
          DONE
        </p>
      </div>
      <div className="text-sm space-y-2 font-geist-mono font-medium">
        {soxSettings.bass.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 w-full justify-evenly"
          >
            <p className="opacity-60 mr-auto">{item.readableName}</p>
            <button onClick={() => adjustSetting("bass", item.name, -1)}>
              –
            </button>
            <div className="w-12 grid place-content-center">
              <NumberFlow value={item.value} />
            </div>
            <button onClick={() => adjustSetting("bass", item.name, 1)}>
              +
            </button>
          </div>
        ))}
      </div>

      {/* reverb */}
      <p className="font-jetbrains-mono text-sm font-medium mt-3 mb-1">
        REVERB
      </p>
      <div className="text-sm space-y-2 font-geist-mono font-medium">
        {soxSettings.reverb.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 w-full justify-evenly"
          >
            <p className="opacity-60 mr-auto">{item.readableName}</p>
            <button onClick={() => adjustSetting("reverb", item.name, -1)}>
              –
            </button>
            <div className="w-12 grid place-content-center">
              <NumberFlow value={item.value} plugins={[continuous]} />
            </div>
            <button onClick={() => adjustSetting("reverb", item.name, 1)}>
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
        onDropped={(f) => setFile(f)}
        onClick={handleDropZoneClick}
        className="font-jetbrains-mono font-medium px-8 py-6 max-w-72 w-fit"
      >
        {dropzoneContent}
      </DropZone>

      <SubmitButton
        onClick={handleSubmitClick}
        enabled={file !== null && !submitting}
      />

      <Settings
        onClick={() => setSettingsOpen(true)}
        className="border border-gray-200 p-3 w-fit group mt-auto"
      >
        {settingsOpen ? (
          settingsContent
        ) : (
          <Cog size={18} className="opacity-50" />
        )}
      </Settings>
    </main>
  );
}
