const LoadScript = (setScript: (value: string) => void) => {
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
  return (
    <>
      <input type="file" accept=".py" onChange={handleFileUpload} />
    </>
  );
};

export default LoadScript;
