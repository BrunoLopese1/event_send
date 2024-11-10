import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import WebhookIcon from "@mui/icons-material/Webhook";
import LinkIcon from "@mui/icons-material/Link";
import KeyIcon from "@mui/icons-material/Key";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import TitleIcon from "@mui/icons-material/Title";
import LowPriorityIcon from "@mui/icons-material/LowPriority";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CellTowerIcon from "@mui/icons-material/CellTower";
import ComputerIcon from "@mui/icons-material/Computer";
import SendIcon from "@mui/icons-material/Send";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FieldModal from "./Modal";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import axios from "axios";
import DataObjectIcon from "@mui/icons-material/DataObject";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PythonSandbox from "./PythonSandBox";

interface FieldItens {
  label: string;
  parameter: string;
  icon: React.ReactNode;
}

const fields: FieldItens[] = [
  { icon: <LanguageIcon />, label: "Origin", parameter: "origin" },
  {
    icon: <DescriptionOutlinedIcon />,
    label: "Description",
    parameter: "long_description",
  },
  {
    icon: <TitleIcon />,
    label: "Short description",
    parameter: "short_description",
  },
];

const selects = [
  {
    icon: <LowPriorityIcon />,
    label: "Priority",
    parameter: "priority",
    itens: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Moderate" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
  },
  {
    icon: <PriorityHighIcon />,
    label: "Impact",
    parameter: "impact",
    itens: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Moderate", parameter: "Impact" },
      { value: "high", label: "High", parameter: "Impact" },
      { value: "critical", label: "Critical", parameter: "Impact" },
    ],
  },
  {
    icon: <HourglassBottomIcon />,
    label: "Urgency",
    parameter: "urgency",
    itens: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Moderate" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
  },
  {
    icon: <AccountTreeIcon />,
    label: "Enviroment",
    parameter: "enviroment",
    itens: [
      { value: "dev", label: "DEV" },
      { value: "prd", label: "PROD" },
      { value: "stage", label: "STAGE" },
      { value: "uat", label: "UAT" },
    ],
  },
  {
    icon: <CellTowerIcon />,
    label: "Tower",
    parameter: "tower",
    itens: [
      { value: "INFRA Host IOWaitA", label: "INFRA-A" },
      { value: "INFRA Host IOWaitB", label: "INFRA-B" },
      { value: "INFRA Host IOWaitC", label: "INFRA-C" },
      { value: "INFRA Host IOWaitD", label: "INFRA-D" },
    ],
  },
  {
    icon: <ComputerIcon />,
    label: "Type",
    parameter: "type",
    itens: [
      { value: "TYPE-A", label: "TYPE-A" },
      { value: "TYPE-B", label: "TYPE-B" },
      { value: "TYPE-C", label: "TYPE-C" },
      { value: "TYPE-D", label: "TYPE-D" },
    ],
  },
];

const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;
const apiOrigin = import.meta.env.VITE_API_ORIGIN;

function App() {
  const [value, setValue] = useState<string[]>(Array(selects.length).fill(""));
  const [param, setParam] = useState<string[]>([
    apiOrigin,
    ...Array(fields.length - 1).fill(""),
  ]);
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [customFields, setCustomFields] = useState<FieldItens[]>([]);
  const [responseData, setResponseData] = useState({
    Response: "the response object will be displayed here",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const [setting, setSetting] = useState({
    url: url,
    key: key,
    customFields: customFields,
    value: value,
    param: param,
  });

  useEffect(() => {
    setSetting({
      url: url,
      key: key,
      customFields: customFields,
      value: value,
      param: param,
    });
  }, [url, key, customFields, value, param]);

  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  const handleReset = () => {
    setValue(Array(selects.length).fill(""));
    setParam([apiOrigin, ...Array(fields.length - 1).fill("")]);
    setUrl("");
    setKey("");
  };

  const handleUrl = () => {
    setUrl(apiUrl);
  };

  const handleKey = () => {
    setKey(apiKey);
  };

  const handleChange = (event: SelectChangeEvent, index: number) => {
    const newValue = [...value];
    newValue[index] = event.target.value as string;
    setValue(newValue);
  };

  const composeRequestBody = () => {
    const requestBody: Record<string, string> = {};

    selects.forEach((select, index) => {
      requestBody[select.parameter] = value[index];
    });

    fields.forEach((field, index) => {
      requestBody[field.parameter] = param[index];
    });

    customFields.forEach((field, index) => {
      requestBody[field.parameter] = param[index + fields.length] || "";
    });

    requestBody["event_time"] = Math.floor(Date.now() / 1000).toString();

    return requestBody;
  };

  const handleSubmit = async () => {
    const body = composeRequestBody();
    axios
      .post("http://127.0.0.1:5000/proxy", body, {
        headers: {
          "x-api-key": key,
          "Content-Type": "application/json",
          url: url,
        },
      })
      .then((response) => {
        console.log("Resposta da API:", response.data);
        setResponseData(response.data);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error("Erro na requisição:", err);
        setError(err);
        setLoading(false);
      });
  };

  const formattedJSON = JSON.stringify(responseData, null, 2);

  const saveConfig = async (data) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/save_config",
        data
      );
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/get_config");

      setUrl(response.data.url);
      setKey(response.data.key);
      setValue(response.data.value);
      setParam(response.data.param);
      setCustomFields(response.data.customFields);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Box>
        <FieldModal
          open={open}
          handleClose={handleClose}
          fields={customFields}
          setFields={setCustomFields}
          saveConfig={() => saveConfig(setting)}
          loadConfig={loadConfig}
        />
      </Box>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem",
          }}
        >
          <TextField
            id="outlined-basic"
            label="Webhook url"
            variant="outlined"
            fullWidth
            onChange={(e) => setUrl(e.target.value)}
            value={url}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WebhookIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="start">
                  <Button onClick={handleUrl}>
                    <LinkIcon fontSize="large" />
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem",
          }}
        >
          <TextField
            id="outlined-basic"
            label="Key"
            variant="outlined"
            type={visible ? "password" : "text"}
            fullWidth
            onChange={(e) => setKey(e.target.value)}
            value={key}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="start">
                  <Button onClick={() => setVisible(!visible)}>
                    {visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </Button>
                  <Button onClick={handleKey}>
                    <LinkIcon fontSize="large" />
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box sx={{ flexGrow: 1, padding: "1rem 1rem 0 1rem" }}>
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
          >
            {selects.map((item, index) => (
              <Grid item xs={2} sm={4} md={4} key={index}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id={`${item.label}-label`}>
                    {item.label}
                  </InputLabel>
                  <Select
                    labelId={`${item.label}-label`}
                    id={`${item.label}-select`}
                    value={value[index]}
                    onChange={(event) => handleChange(event, index)}
                    label={item.label}
                    startAdornment={
                      <InputAdornment position="start">
                        {item.icon}
                      </InputAdornment>
                    }
                  >
                    {item.itens.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}
          </Grid>
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
            sx={{ padding: "1rem 0 1rem 0" }}
          >
            {fields.map((item, index) => (
              <Grid item xs={2} sm={4} md={4} key={index}>
                <Box>
                  <TextField
                    id="outlined-basic"
                    label={item.label}
                    variant="outlined"
                    fullWidth
                    multiline
                    minRows={1}
                    maxRows={3}
                    onChange={(e) => {
                      const newParam = [...param];
                      newParam[index] = e.target.value;
                      setParam(newParam);
                    }}
                    value={param[index]}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {item.icon}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
            sx={{ padding: "1rem 0 1rem 0" }}
          >
            {customFields.map((item, index) => (
              <Grid item xs={2} sm={4} md={4} key={index}>
                <TextField
                  id="outlined-basic"
                  label={item.label}
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={1}
                  maxRows={3}
                  onChange={(e) => {
                    const newParam = [...param];
                    newParam[index + fields.length] = e.target.value;
                    setParam(newParam);
                  }}
                  value={param[index + fields.length] || ""}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DataObjectIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
      <PythonSandbox
        setLoading={setLoading}
        setResponseData={setResponseData}
        setError={setError}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
          padding: "1rem 1rem 0 0",
          gap: "1rem",
        }}
      >
        <Stack direction={"row"} alignItems={"center"}>
          <SettingsSuggestIcon />
          <Button onClick={handleOpen}>
            <Typography>Custom Fields</Typography>
          </Button>
        </Stack>
        <Button
          onClick={handleReset}
          variant="outlined"
          startIcon={<RestartAltIcon />}
        >
          Restart
        </Button>
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleSubmit}
        >
          Send
        </Button>
      </Box>
      <Box sx={{ padding: "20px" }}>
        <Typography gutterBottom>API Response</Typography>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">Erro: {error.message}</Typography>
        ) : (
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography
              component="pre"
              style={{
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                fontFamily: "monospace",
              }}
            >
              {formattedJSON}
            </Typography>
          </Paper>
        )}
      </Box>
    </>
  );
}

export default App;
