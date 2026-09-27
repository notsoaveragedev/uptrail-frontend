import { Alert, Button, Upload } from "antd";
import { useState } from "react";
import { LuDownload, LuFileUp, LuSparkles } from "react-icons/lu";
import { checkImportFile, IMPORT_FIELDS, parseImportFile, type ParsedFile } from "@/lib/importMonitors";

const SAMPLE_CSV = "/samples/monitors-sample.csv";
const SAMPLE_JSON = "/samples/monitors-sample.json";

type UploadStepProps = {
  onParsed: (file: ParsedFile) => void;
};

export function UploadStep({ onParsed }: UploadStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);

  async function readFile(name: string, size: number, readText: () => Promise<string>) {
    const fileError = checkImportFile({ name, size });
    if (fileError) {
      setError(fileError);
      return;
    }

    setIsReading(true);
    try {
      onParsed(parseImportFile(name, await readText()));
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "The file couldn't be read.");
    } finally {
      setIsReading(false);
    }
  }

  async function loadSample() {
    const response = await fetch(SAMPLE_CSV);
    const text = await response.text();
    await readFile("monitors-sample.csv", text.length, async () => text);
  }

  return (
    <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="flex flex-col gap-3">
        <Upload.Dragger
          accept=".csv,.json,text/csv,application/json"
          multiple={false}
          showUploadList={false}
          disabled={isReading}
          beforeUpload={(file) => {
            setError(null);
            void readFile(file.name, file.size, () => file.text());
            return false;
          }}
          className="[&_.ant-upload-drag]:border-line-strong [&_.ant-upload-drag]:bg-panel [&_.ant-upload-drag:hover]:border-ink"
        >
          <div className="flex flex-col items-center gap-3 px-6 py-16">
            <span className="flex size-10 items-center justify-center rounded-lg border border-line bg-card text-muted">
              <LuFileUp aria-hidden className="size-5" />
            </span>
            <span className="text-md font-semibold text-ink">Drop a CSV or JSON file here</span>
            <span className="text-muted">
              or <span className="text-accent">browse your files</span> · up to 1 MB
            </span>
          </div>
        </Upload.Dragger>

        {error && <Alert type="error" showIcon title="We couldn't use that file" description={error} />}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <a href={SAMPLE_CSV} download className="flex items-center gap-1.5">
            <LuDownload aria-hidden className="size-3.5" />
            Download sample CSV
          </a>
          <a href={SAMPLE_JSON} download className="flex items-center gap-1.5">
            <LuDownload aria-hidden className="size-3.5" />
            Download sample JSON
          </a>
          <Button size="small" type="text" icon={<LuSparkles />} onClick={loadSample} className="ml-auto text-muted">
            Try with the sample file
          </Button>
        </div>
      </div>

      <section aria-labelledby="import-fields-title" className="rounded-lg border border-line">
        <header className="border-b border-line px-4 py-3">
          <h2 id="import-fields-title" className="text-md font-semibold">
            Expected fields
          </h2>
          <p className="text-xs text-muted">
            One monitor per row (CSV) or object (JSON). Lists use <span className="kbd">;</span> or{" "}
            <span className="kbd">|</span>.
          </p>
        </header>
        <dl className="divide-y divide-line">
          {IMPORT_FIELDS.map((field) => (
            <div key={field.key} className="flex items-center justify-between gap-3 px-4 py-2">
              <dt className="flex items-center gap-1.5 font-mono text-xs text-ink">
                {field.key}
                {field.isRequired && (
                  <span className="font-sans text-caps font-semibold text-muted uppercase">Required</span>
                )}
              </dt>
              <dd className="truncate font-mono text-xs text-subtle">{field.example}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
