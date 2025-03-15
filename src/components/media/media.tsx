import { getFilesByType, removeFileStore } from "@/hooks/useFileStore.ts";
import { FileOnStore } from "@/types/FileOnStore.ts";
import { FolderOnStore } from "@/types/FolderOnStore.ts";
import { useLoaderData } from "react-router-dom";
import { Box, Flex, Heading, Text, Separator } from "@radix-ui/themes";
import Explorer from "@/components/explorer/explorer.tsx";
import React, { useEffect, useState } from "react";

export async function loader({ params }) {
    return { mediaType: params.type };
}

export default function Media() {
    const [fileList, setFileList] = useState<FileOnStore[]>([]);
    const [folderList, setFolderList] = useState<FolderOnStore[]>([]);
    const { mediaType } = useLoaderData();

    // Fetch files by media type
    const fetchFiles = async () => {
        const list = await getFilesByType(mediaType);
        setFileList(list);
    };

    useEffect(() => {
        fetchFiles();
    }, [mediaType]);

    // File removal function with automatic refresh
    const removeFile = async (fileInfo: FileOnStore) => {
        await removeFileStore(fileInfo);
        fetchFiles();
    };

    return (
        <Box
            className="explorer"
            style={{
                padding: "5px",
                margin: "10px auto",
                background: "#f0fdf4",
                borderRadius: "12px",
                boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)"
            }}
        >
            <Heading size="6" color="green" align="center" style={{ marginTop: "10px", marginBottom: "10px", textShadow: "1px 1px 3px rgba(0, 128, 0, 0.2)" }}>
                📂 Media Explorer
            </Heading>

            <Separator size="4" />

            <Flex direction="column" py="3" gap="3">
                {fileList.length > 0 || folderList.length > 0 ? (
                    <Explorer
                        folders={folderList}
                        files={fileList}
                        removeFolder={() => {}}
                        removeFile={removeFile}
                    />
                ) : (
                    <Flex justify="center" align="center" height="150px">
                        <Text align="center" color="green" size="3">
                            No media files found in <Text weight="bold" color="green">{mediaType}</Text>.
                        </Text>
                    </Flex>
                )}
            </Flex>
        </Box>
    );
}
