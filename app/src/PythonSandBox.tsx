import {
  Box,
  Button,
  IconButton,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import TerminalIcon from "@mui/icons-material/Terminal";
import CodeIcon from "@mui/icons-material/Code";
import ReplayIcon from "@mui/icons-material/Replay";

interface Pyodide {
  runPythonAsync: (code: string) => Promise<any>;
  globals: any;
}

declare global {
  interface Window {
    loadPyodide: () => Promise<Pyodide>;
  }
}

interface PythonSandboxProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setResponseData: React.Dispatch<React.SetStateAction<any>>;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
}

const PythonSandbox: React.FC<PythonSandboxProps> = ({
  setLoading,
  setResponseData,
}) => {
  const [pyodide, setPyodide] = useState<Pyodide | null>(null);
  const [script, setScript] = useState("");
  const [output, setOutput] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const loadPyodideModule = async () => {
      if (window.loadPyodide) {
        const pyodideModule: any = await window.loadPyodide();

        await pyodideModule.loadPackage("micropip");
        await pyodideModule.runPythonAsync(`
          import micropip
          await micropip.install('requests')
        `);

        await pyodideModule.runPythonAsync(`
          import sys
          from io import StringIO
          sys.stdout = StringIO()
          sys.stderr = StringIO()
        `);

        setPyodide(pyodideModule);
      } else {
        console.error("Pyodide failed to load.");
      }
    };
    loadPyodideModule();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();

      const textarea = textAreaRef.current;
      if (textarea) {
        const cursorPosition = textarea.selectionStart;
        const beforeText = script.substring(0, cursorPosition);
        const afterText = script.substring(cursorPosition);

        const newText = beforeText + "  " + afterText;

        setScript(newText);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPosition + 2;
        }, 0);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();

      const textarea = textAreaRef.current;
      if (textarea) {
        const cursorPosition = textarea.selectionStart;
        const beforeText = script.substring(0, cursorPosition);
        const lastLine = beforeText.split("\n").pop();

        const indentation = lastLine?.match(/^\s*/)?.[0] || "";

        const afterText = script.substring(cursorPosition);

        const newText = beforeText + "\n" + indentation + afterText;
        setScript(newText);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            cursorPosition + indentation.length + 1;
        }, 0);
      }
    } else if (
      e.key === "(" ||
      e.key === "[" ||
      e.key === "{" ||
      e.key === "'" ||
      e.key === '"'
    ) {
      e.preventDefault();
      const textarea = textAreaRef.current;
      if (textarea) {
        const cursorPosition = textarea.selectionStart;
        const beforeText = script.substring(0, cursorPosition);
        const afterText = script.substring(cursorPosition);

        const closing =
          e.key === "("
            ? ")"
            : e.key === "["
            ? "]"
            : e.key === "{"
            ? "}"
            : e.key === "'"
            ? "'"
            : e.key === '"'
            ? '"'
            : "";

        const newText = beforeText + e.key + closing + afterText;

        setScript(newText);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1;
        }, 0);
      }
    }
  };

  const handleRunScript = async () => {
    if (pyodide) {
      try {
        await pyodide.runPythonAsync(script);

        const capturedOutput = await pyodide.runPythonAsync(`
          sys.stdout.getvalue()
        `);

        const capturedErrors = await pyodide.runPythonAsync(`
          sys.stderr.getvalue()
        `);

        setOutput(capturedOutput + capturedErrors);

        await pyodide.runPythonAsync(
          `sys.stdout.truncate(0); sys.stdout.seek(0)`
        );
        await pyodide.runPythonAsync(
          `sys.stderr.truncate(0); sys.stderr.seek(0)`
        );
      } catch (err) {
        setOutput(`Error: ${err}`);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setScript(reader.result);
        }
      };
      reader.readAsText(file);
    }
  };

  const sendPythonCode = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/execute-python", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: script }),
      });

      if (!response.ok) {
        throw new Error("Failed to execute script");
      }

      const data = await response.json();
      setResponseData(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const handleClick = () => {
    document.getElementById("file-upload-input").click();
  };

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Box
          sx={{
            width: "50%",
            maxHeight: 500,
            overflowY: "auto",
            padding: "1rem",
            overflowX: "hidden",
          }}
        >
          <TextareaAutosize
            ref={textAreaRef}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write Python code here"
            minRows={10}
            style={{
              width: "100%",
              fontFamily: "monospace",
              resize: "none",
            }}
          />
        </Box>
        <Box
          style={{
            margin: "1rem 1rem 1.2rem 0",
            padding: "1rem",
            backgroundColor: "#f4f4f4",
            borderRadius: "5px",
            height: "auto",
            width: "50%",
            overflowY: "auto",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
          }}
        >
          <Typography>{output}</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: { xs: "100%", sm: "100%", md: "75%", lg: "50%" },
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          sx={{
            margin: "0 0 0 1rem",
            gap: "0.1rem",
            fontSize: { xs: "10px", sm: "11px", md: "12px", lg: "14px" },
          }}
          onClick={handleRunScript}
        >
          <CodeIcon />
          Run Python
        </Button>
        <div>
          <input
            id="file-upload-input"
            type="file"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <IconButton onClick={handleClick} aria-label="Upload file">
            <AttachFileIcon />
          </IconButton>
        </div>
        <Button
          variant="outlined"
          onClick={sendPythonCode}
          sx={{
            gap: "0.1rem",
            fontSize: { xs: "10px", sm: "11px", md: "12px", lg: "14px" },
          }}
        >
          <TerminalIcon />
          Run server
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            setResponseData({
              Response: "Response cleaned",
            })
          }
          sx={{
            gap: "0.1rem",
            fontSize: { xs: "10px", sm: "11px", md: "12px", lg: "14px" },
          }}
        >
          <CleaningServicesIcon />
          Response
        </Button>
        <Button
          variant="outlined"
          sx={{
            margin: "0 1.1rem 0 0",
            fontSize: { xs: "10px", sm: "11px", md: "12px", lg: "14px" },
          }}
          onClick={() => setOutput("")}
        >
          <ReplayIcon />
          sandbox
        </Button>
      </Box>
    </Box>
  );
};

export default PythonSandbox;
