import React from "react";
import { Editor } from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { Card } from "@/components/ui/card";

interface CodeEditorProps {
  language: string;
  onChange: (value: string) => void;
  value: string;
}

export function CodeEditor({ onChange, language, value }: CodeEditorProps) {
  const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <Card className="w-full overflow-hidden border">
      <Editor
        height="300px"
        language={language.toLowerCase()}
        value={value}
        onChange={(value) => onChange(value || "")}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
        }}
        theme="vs-dark"
      />
    </Card>
  );
}