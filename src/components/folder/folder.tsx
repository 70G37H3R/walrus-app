import React, { useEffect, useState } from "react";
import { Form, Link, useLoaderData } from "react-router-dom";
import { Box, Button, Flex, Text, Dialog, TextField } from "@radix-ui/themes";
import {
    getChildFiles,
    removeFileStore
} from "@/hooks/useFileStore.ts";
import {
    checkFolderIsExist,
    createFolder,
    getChildFolders,
    getCurrentFolder,
    getFolderPWD,
    removeFolderStore
} from "@/hooks/useFolderStore.ts";

import type { FolderOnStore } from "@/types/FolderOnStore.ts";
import type { FileOnStore } from "@/types/FileOnStore.ts";
import UploadFile from "@/components/explorer/uploadFile.tsx";
import Explorer from "@/components/explorer/explorer.tsx";

export async function loader({ params }) {
    const root = await getCurrentFolder(params.id);
    return { root };
}

export async function action({ request }) {
    const formData = await request.formData();
    const newFolder = Object.fromEntries(formData) as FolderOnStore;
    await createFolder(newFolder);
    return {};
}

export default function Folder() {
    const [isNameValid, setIsNameValid] = useState(true);
    const [fileList, setFileList] = useState<FileOnStore[]>([]);
    const [folderList, setFolderList] = useState<FolderOnStore[]>([]);
    const [pwdList, setPWDList] = useState<FolderOnStore[]>([]);
    const { root } = useLoaderData();

    const getParent = async (dir) => {
        const pwd = await getFolderPWD(dir);
        setPWDList(pwd);
    };

    const fetchFolders = async (parentId) => {
        const list = await getChildFolders(parentId);
        setFolderList(list);
    };

    const fetchFiles = async (parentId) => {
        const list = await getChildFiles(parentId);
        setFileList(list);
    };

    const removeFolder = async (folderInfo: FolderOnStore) => {
        await removeFolderStore(folderInfo);
        await fetchFolders(root.id);
    };

    const removeFile = async (fileInfo: FileOnStore) => {
        await removeFileStore(fileInfo);
        await fetchFiles(root.id);
    };

    const fetchData = async () => {
        await getParent(root);
        await fetchFolders(root.id);
        await fetchFiles(root.id);
    };

    useEffect(() => {
        fetchData();
    }, [root]);

    return (
        <Box className="explorer" style={{ backgroundColor: "#f0fdf4", borderRadius: "12px", padding: "15px" }}>
            <Flex px="3" gap="3" align="baseline">
                <Text color="green">/</Text>
                {pwdList.map((item, index) => (
                    <Text key={index} color="green">
                        {item.id === root.id ? (
                            <Text weight="bold">{item.name}</Text>
                        ) : (
                            <Link to={`/folder/${item.id}`} style={{ textDecoration: "none" }}>
                                <Text color="green" weight="bold">{item.name}</Text>
                            </Link>
                        )}
                        <Text color="green"> /</Text>
                    </Text>
                ))}
                <Text color="green"> &gt; </Text>
                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Root>
                        <Dialog.Trigger>
                            <Button color="green">New Folder</Button>
                        </Dialog.Trigger>
                        <Dialog.Content maxWidth="450px">
                            <Dialog.Title>New Folder</Dialog.Title>
                            <Form method="post">
                                <Flex direction="column" gap="3">
                                    <label>
                                        <Text as="div" size="2" mb="1" weight="bold">
                                            Enter folder name
                                        </Text>
                                        <TextField.Root
                                            placeholder="Enter folder name"
                                            aria-label="folder's name"
                                            type="text"
                                            name="name"
                                            defaultValue="New Folder"
                                            onChange={async (e) => {
                                                const newFolder = {
                                                    parentId: root.id,
                                                    name: e.target.value,
                                                };
                                                const isExist = await checkFolderIsExist(newFolder as FolderOnStore);
                                                setIsNameValid(!isExist);
                                            }}
                                        />
                                        <input type="hidden" value={root.id} name="parentId" />
                                    </label>
                                </Flex>
                                <Flex gap="3" mt="4" justify="end">
                                    <Dialog.Close>
                                        <Button variant="soft" color="gray">Cancel</Button>
                                    </Dialog.Close>
                                    <Dialog.Close>
                                        <Button type="submit" color="green" disabled={!isNameValid}>Create</Button>
                                    </Dialog.Close>
                                </Flex>
                            </Form>
                        </Dialog.Content>
                    </Dialog.Root>
                    <UploadFile root={root} reFetchDir={fetchData} />
                </Flex>
            </Flex>
            <Explorer folders={folderList} files={fileList} removeFolder={removeFolder} removeFile={removeFile} />
        </Box>
    );
}
