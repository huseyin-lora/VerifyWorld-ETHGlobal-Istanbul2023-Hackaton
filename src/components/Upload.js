import React from "react";
import { useNavigate } from "react-router-dom";

import { useDropzone } from 'react-dropzone'
import { Button, Box, Typography, Grid } from "@mui/material";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { MdCloudUpload } from "react-icons/md";

import AffiSnackbar from "../Dialogs/AffiSnackbar";
import { IDKitWidget } from '@worldcoin/idkit'
import { MdCloudDownload } from "react-icons/md";

function MyDropzone({ files, setFiles, gaveError }) {

    const onDrop = React.useCallback(acceptedFiles => {
        if (acceptedFiles.length === 0) return false
        if (acceptedFiles.length > 1) {
            gaveError("Only one file is allowed", 3000)
            return false
        }

        const file = acceptedFiles[0]

        if (file.size > 10000000) {
            gaveError("File size should be less than 10 MB", 3000)
            return false
        }

        setFiles([file])

    }, [gaveError, setFiles])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
        <Box component={"div"} sx={{
            width: "800px",
            border: "2px dashed rgba(255, 255, 255, 0.5)",
            borderRadius: "24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: "1rem",
            padding: "1rem",
            margin: "2rem auto",
            background: isDragActive ? "rgba(255, 255, 255, 0.125)" : "rgba(255, 255, 255, 0.20)",
            backdropFilter: "blur(10px) saturate(180%)",

            // sx içinde hover vermek:
            ":hover": {
                cursor: "pointer",
                backgroundColor: "rgba(255, 255, 255, 0.125)",
            }

        }} {...getRootProps()}>
            <input {...getInputProps()} />
            <Box sx={{
                height: "200px",
                width: "100%",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: "column",
            }}>
                {
                    isDragActive ?
                        <Box component={"div"}>
                            <Typography variant="h3" sx={{
                                fontSize: "1.5rem",
                                display: "flex",
                                flexDirection: 'column',
                                mt: "1rem",
                                alignItems: "center",
                                justifyContent: "center",
                                color: 'white',
                            }}>
                                <MdCloudDownload color="white" size={36} />
                                Drop The File Here
                            </Typography>
                        </Box> :
                        <Box component={"div"} sx={{
                            width: "100%",
                        }}>
                            <Typography variant="h3" sx={{
                                fontSize: "1.5rem",
                                mt: "1rem",
                                display: "flex",
                                flexDirection: 'column',
                                alignItems: "center",
                                justifyContent: "center",
                                color: 'white'
                            }}>
                                <MdCloudUpload color="white" size={36} />
                                Drag & Drop Document</Typography>
                            <Typography variant="body1" sx={{ textAlign: "center", mt: "0.1rem", color: 'white' }}>
                                or click to choose from files
                            </Typography>
                        </Box>

                }
            </Box>

            <Grid container gap={"1.5rem 0.75rem"} >
                {
                    files.map(file => {
                        return <Grid item xs>
                            <Box component={"div"} onClick={(e) => { e.stopPropagation() }} sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "0.5rem 1rem",
                                border: "1px solid #29ffbf",
                                borderRadius: "10px",
                                backdropFilter: 'blur(15px) saturate(180%)',
                                backgroundColor: 'rgba(17, 25, 40, 0.70)',
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                                ":hover": {
                                    cursor: "pointer",
                                    backgroundColor: 'rgba(17, 25, 40, 0.85)',
                                }
                            }}>
                                <RemoveCircleIcon sx={{
                                    cursor: "pointer", transform: "scale(1.2)",
                                    color: '#ee2b2b',
                                    ":hover": {
                                        cursor: "pointer",
                                        color: '#a70000',
                                    }
                                }} onClick={() => {
                                    setFiles(old_files => old_files.filter(old_file => old_file.name !== file.name))
                                }}>

                                </RemoveCircleIcon>

                                <Typography variant="body1" className="">{file.name}</Typography>
                                <Typography variant="body1">({(file.size / 1000000).toFixed(2)} MB)</Typography>

                            </Box>

                        </Grid>
                    })
                }

            </Grid>
        </Box >
    )
}


const Upload = () => {
    const [files, setFiles] = React.useState([])
    const [isIdKitOpen, setIsIdKitOpen] = React.useState(false)
    const [uploadedFileId, setUploadedFileId] = React.useState("")

    const [snackOpen, setSnackOpen] = React.useState({
        open: false,
        text: "",
        is_success: false,
    });
    const navigate = useNavigate()

    const gaveError = (err, timeErrorStays) => {
        setSnackOpen({
            open: true,
            text: err,
            is_success: false,
        });
        setTimeout(() => {
            setSnackOpen({
                open: false,
                text: "",
                is_success: false,
            });
        }
            , timeErrorStays);
    }

    const handleSubmit = async () => {
        if (files.length === 0) {
            gaveError("Please upload a file", 3000)
            return false
        }

        const uploaded_file_id = "this_is_a_placeholder_id" // upload file to ipfs and get the id
        setUploadedFileId(uploaded_file_id)

        setIsIdKitOpen(true)
    }

    return (
        <div>
            <AffiSnackbar snackOpen={snackOpen} setSnackOpen={setSnackOpen} />

            <IDKitWidget
                app_id="app_9c6ee19d87889b2f583957ad6f541f66" // obtained from the Developer Portal
                action="upload-and-sign" // this is your action name from the Developer Portal
                onSuccess={() => {
                    navigate("/sign", { state: { file_id: uploadedFileId, redirect: "/upload" } })
                }} // callback when the modal is closed
                handleVerify={async (data) => {
                    const response_from_backend = await fetch("https://verifyworldcoinid-t2ajiqka5a-uc.a.run.app", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            ...data,
                            file_id: uploadedFileId,
                        }),
                    })

                    const response = await response_from_backend.json()

                    if (response.isVerified) {
                        setSnackOpen({
                            open: true,
                            text: "Your identity is verified",
                            is_success: true,
                        });

                    }
                    else {
                        setSnackOpen({
                            open: true,
                            text: "Your identity is not verified",
                            is_success: false,
                        });

                    }

                    console.log(response)

                    setIsIdKitOpen(false)
                    return true

                }} // optional callback when the proof is received
                credential_types={['orb', 'phone']} // optional, defaults to ['orb']
                enableTelemetry // optional, defaults to false
            >
                {({ open }) => isIdKitOpen && open()}
            </IDKitWidget>

            <MyDropzone files={files} setFiles={setFiles} gaveError={gaveError}></MyDropzone>

            <Box sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                mb: "2rem",
            }}>
                <button onClick={handleSubmit} className="upload-sign-btn p-3 font-bold rounded-[12px] text-black ">
                    Upload & Sign The Document
                </button>
            </Box>


        </div>
    );
};

export default Upload;
