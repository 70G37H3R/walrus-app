import { Blockquote, Box, Button, Card, Dialog, Flex, Progress, Spinner, Strong, Text } from "@radix-ui/themes";
import { Form } from "react-router-dom";
import React, { useState } from "react";
import { getSetting } from "@/hooks/useLocalStore.ts";
import { BlobOnWalrus, NewBlobOnWalrus } from "@/types/BlobOnWalrus.ts";
import { FileOnStore } from "@/types/FileOnStore.ts";
import { createFile } from "@/hooks/useFileStore.ts";
import * as Toast from '@radix-ui/react-toast';
import axios from 'axios';
import { motion } from "framer-motion";

import "@/styles/toast.css";

export default function UploadFile({ root, reFetchDir }) {
    const [file, setFile] = useState();
    const [step, setStep] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [openToast, setOpenToast] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isWarning, setIsWarning] = useState(false);
    const [message, setMessage] = useState("");

    const readfile = (file) => {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.readAsArrayBuffer(file);
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const setting = await getSetting();

        setUploadProgress(0);
        setIsWarning(setting.publisher === "https://publisher.walrus-testnet.walrus.space");
        setStep(2);

        const blob = await readfile(file).catch(console.error);
        const plaintextbytes = new Uint8Array(blob);

        const pbkdf2iterations = 10000;
        const passphrasebytes = new TextEncoder("utf-8").encode(setting.walrusHash);
        const pbkdf2salt = new TextEncoder("utf-8").encode(setting.walrusSalt);

        const passphrasekey = await window.crypto.subtle.importKey('raw', passphrasebytes, { name: 'PBKDF2' }, false, ['deriveBits']);
        let pbkdf2bytes = await window.crypto.subtle.deriveBits({
            name: 'PBKDF2',
            salt: pbkdf2salt,
            iterations: pbkdf2iterations,
            hash: 'SHA-256'
        }, passphrasekey, 384);

        pbkdf2bytes = new Uint8Array(pbkdf2bytes);
        let keybytes = pbkdf2bytes.slice(0, 32);
        let ivbytes = pbkdf2bytes.slice(32);

        const key = await window.crypto.subtle.importKey('raw', keybytes, { name: 'AES-CBC', length: 256 }, false, ['encrypt']);
        let cipherbytes = await window.crypto.subtle.encrypt({ name: "AES-CBC", iv: ivbytes }, key, plaintextbytes);
        cipherbytes = new Uint8Array(cipherbytes);

        const resultbytes = new Uint8Array(cipherbytes.length + 16);
        resultbytes.set(new TextEncoder("utf-8").encode('Salted__'));
        resultbytes.set(pbkdf2salt, 8);
        resultbytes.set(cipherbytes, 16);

        const publisherUrl = `${setting.publisher}/v1/blobs?epochs=1`;
        const config = {
            headers: { 'content-type': 'application/octet-stream' },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            }
        };

        axios.put(publisherUrl, resultbytes, config).then(response => {
            setUploadProgress(0);
            let blobId = response.data.alreadyCertified
                ? response.data.alreadyCertified.blobId
                : response.data.newlyCreated?.blobObject.blobId;

            if (!blobId) {
                setMessage("Walrus's response is error.");
                setIsError(true);
                return;
            }

            setMessage(response.data.alreadyCertified ? "This file has already been uploaded" : "Walrus file created successfully");

            const fileInfo: FileOnStore = {
                id: "",
                name: file.name,
                parentId: root.id,
                blobId: blobId,
                mediaType: file.type,
                icon: "",
                size: file.size,
                createAt: 0,
                password: setting.walrusHash,
                salt: setting.walrusSalt,
            };

            createFile(fileInfo).then(() => {
                reFetchDir();
                setStep(0);
                setOpenToast(true);
            });
        }).catch(error => {
            setUploadProgress(0);
            setStep(0);
            setMessage('Please check your network configuration and make sure the Walrus service address is correct.');
            setIsError(true);
        });
    };

    return (
        <>
            <Dialog.Root>
                <Dialog.Trigger>
                    <Button>Upload File</Button>
                </Dialog.Trigger>
                <Dialog.Content maxWidth="650px">
                    <Dialog.Title style={{ color: 'green' }}>Step 1: ENCRYPT file</Dialog.Title>
                    <Form onSubmit={handleSubmit}>
                        <Flex direction="column" gap="3">
                            <Text>Files are encrypted using AES-CBC 256-bit encryption before uploading.</Text>
                            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                        </Flex>
                        <Flex gap="3" mt="4" justify="end">
                            <Dialog.Close><Button variant="soft" color="gray">Cancel</Button></Dialog.Close>
                            <Dialog.Close><Button type="submit">ENCRYPT</Button></Dialog.Close>
                        </Flex>
                    </Form>
                </Dialog.Content>
            </Dialog.Root>

            <Dialog.Root open={step == 2}>
                <Dialog.Content maxWidth="550px">
                    <Dialog.Title style={{ color: 'green' }}>Step 2: Upload encrypted files to Walrus Decentralized Storage</Dialog.Title>
                    <Flex direction="column" gap="3">
                        {isWarning && (
                            <Card>
                                <Text>Walrus publisher limits requests to <Strong>10 MiB</Strong>. Run your own publisher for larger files.</Text>
                            </Card>
                        )}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.5 }}
                        >
                            <Progress value={uploadProgress} size="3" variant="soft" color="green" />
                        </motion.div>
                        {uploadProgress >= 100 && (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                <Spinner loading />
                            </motion.div>
                        )}
                        <Text>Waiting for Walrus response...</Text>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>

            {isError && (
                <motion.div animate={{ x: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                    <Dialog.Root open={isError}>
                        <Dialog.Content maxWidth="450px">
                            <Dialog.Title>Network Error</Dialog.Title>
                            <Text>{message}</Text>
                            <Flex gap="3" mt="4" justify="end">
                                <Dialog.Close><Button onClick={() => setIsError(false)}>Close</Button></Dialog.Close>
                            </Flex>
                        </Dialog.Content>
                    </Dialog.Root>
                </motion.div>
            )}

            <Toast.Provider swipeDirection="right">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                    <Toast.Root className="ToastRoot" open={openToast} onOpenChange={setOpenToast}>
                        <Toast.Title className="ToastTitle">{message}</Toast.Title>
                    </Toast.Root>
                </motion.div>
                <Toast.Viewport className="ToastViewport"/>
            </Toast.Provider>
        </>
    );
}
