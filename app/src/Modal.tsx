import React, { type Dispatch } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Stack,
  IconButton,
  Typography,
} from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import PlusOneIcon from "@mui/icons-material/PlusOne";

interface FieldItens {
  label: string;
  parameter: string;
  icon: React.ReactNode;
}

interface MyModalProps {
  open: boolean;
  handleClose: () => void;
  fields: FieldItens[];
  setFields: Dispatch<FieldItens[]>;
  saveConfig: (value) => void;
  loadConfig: () => Promise<void>;
}

const MyModal: React.FC<MyModalProps> = ({
  open,
  handleClose,
  fields,
  setFields,
  saveConfig,
  loadConfig,
}) => {
  const handleAddField = () => {
    setFields([...fields, { label: "", parameter: "", icon: <IconButton /> }]);
  };

  const handleRemoveField = (index: number) => {
    if (fields.length >= 1) {
      const newFields = fields.filter((_, i) => i !== index);
      setFields(newFields);
    }
  };

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const updatedFields = [...fields];
    updatedFields[index][e.target.name as keyof FieldItens] = e.target.value;
    setFields(updatedFields);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ overflow: "auto" }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          p: 2,
          width: 400,
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: "1rem 0 1rem 0",
          }}
        >
          <Typography id="modal-modal-title">Adicionar Campos</Typography>
          <Button onClick={loadConfig}>Load</Button>
          <Button onClick={saveConfig}>save</Button>
          <Button variant="outlined" onClick={handleAddField}>
            <PlusOneIcon />
          </Button>
        </Box>
        <Box sx={{ overflow: "auto", maxHeight: "300px" }}>
          {fields.map((field, index) => (
            <Stack
              direction="row"
              spacing={2}
              key={index}
              alignItems="center"
              sx={{ mb: 2, padding: "0.5rem 0 0 0" }}
            >
              <TextField
                label={`Label ${index + 1}`}
                name="label"
                value={field.label}
                onChange={(e) => handleChange(index, e)}
                fullWidth
                size="small"
              />
              <TextField
                label={`Parâmetro ${index + 1}`}
                name="parameter"
                value={field.parameter}
                onChange={(e) => handleChange(index, e)}
                fullWidth
                size="small"
              />
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveField(index)}
              >
                <RemoveIcon />
              </Button>
            </Stack>
          ))}
        </Box>
      </Box>
    </Modal>
  );
};

export default MyModal;
