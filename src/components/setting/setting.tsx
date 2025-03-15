import {
    Blockquote, Button, Card, Flex, Heading, Text, TextField, Dialog
} from "@radix-ui/themes";
import { Form, redirect, useLoaderData } from "react-router-dom";
import { getSetting, setSettings } from "@/hooks/useLocalStore.ts";
import { SettingOnStore } from "@/types/SettingOnStore.ts";
import React, { useState } from "react";

export async function loader() {
    return await getSetting();
}

export async function action({ request }) {
    const formData = await request.formData();
    const updatedSetting: SettingOnStore = {
        username: formData.get("username"),
        password: formData.get("password"),
        publisher: formData.get("publisher"),
        aggregator: formData.get("aggregator"),
    };

    console.log("Updating settings:", updatedSetting);
    await setSettings(updatedSetting);

    return redirect("/setting"); // Refresh page after saving
}

export default function Setting() {
    const setting = useLoaderData() as SettingOnStore;
    const [showDialog, setShowDialog] = useState(false);

    return (
        <Flex
            style={{
                height: "100vh",
                justifyContent: "center",
                alignItems: "center",
                background: "#f0fdf4",
            }}
        >
            <Card
                style={{
                    padding: "30px",
                    borderRadius: "16px",
                    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                    maxWidth: "500px",
                    width: "100%",
                    background: "white",
                }}
            >
                <Heading size="5" color="green" align="center" style={{ marginBottom: "20px", textShadow: "1px 1px 3px rgba(0, 128, 0, 0.2)" }}>
                    ⚙️ Settings
                </Heading>

                <Form method="post" onSubmit={() => setShowDialog(true)}>
                    <Flex direction="column" gap="4">
                        {["Username", "Password", "Aggregator", "Publisher"].map((field, index) => (
                            <label key={index}>
                                <Text weight="bold" size="3">{field}</Text>
                                <TextField.Root
                                    name={field.toLowerCase()}
                                    type={field === "Password" ? "password" : "text"}
                                    defaultValue={field === "Password" ? "" : setting[field.toLowerCase()]}
                                    placeholder={`Enter ${field.toLowerCase()}`}
                                    style={{
                                        borderRadius: "8px",
                                        padding: "8px",
                                        border: "1px solid #81c784", // Light green border
                                    }}
                                />
                            </label>
                        ))}

                        <Button
                            style={{
                                background: "#2e7d32", // Deep green
                                color: "white",
                                fontWeight: "bold",
                                padding: "12px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                transition: "0.3s",
                                boxShadow: "0px 3px 6px rgba(0, 128, 0, 0.2)",
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = "#1b5e20"}
                            onMouseOut={(e) => e.currentTarget.style.background = "#2e7d32"}
                        >
                            Save Settings
                        </Button>
                    </Flex>
                </Form>

                {/* Public Testing Info */}
                <Card style={{ marginTop: "20px", padding: "12px", background: "#f1f8e9", borderRadius: "8px" }}>
                    <Blockquote size="2">
                        <Flex direction="column" gap="3">
                            <Text>
                                The Walrus system provides an interface that can be used for public testing. For your
                                convenience, Walrus provides these at the following hosts:
                            </Text>
                            <Text>
                                <Text weight="bold" color="green">Aggregator:</Text> https://aggregator.walrus-testnet.walrus.space
                            </Text>
                            <Text>
                                <Text weight="bold" color="green">Publisher:</Text> https://publisher.walrus-testnet.walrus.space
                            </Text>
                        </Flex>
                    </Blockquote>
                </Card>

                {/* Success Popup Dialog */}
                <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
                    <Dialog.Content style={{ maxWidth: 400, borderRadius: "12px", padding: "20px" }}>
                        <Dialog.Title>✅ Success</Dialog.Title>
                        <Dialog.Description>Your settings have been saved successfully.</Dialog.Description>
                        <Flex justify="end">
                            <Button onClick={() => setShowDialog(false)} style={{ background: "#2e7d32", color: "white" }}>OK</Button>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Root>
            </Card>
        </Flex>
    );
}
