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
        <Flex gap="3" px="4" py="4" direction="column" width="650px">
            <Heading>Setting</Heading>

            <Form method="post" onSubmit={() => setShowDialog(true)}>
                <Card>
                    <Flex direction="column" gap="5" px="3" py="5">
                        <Flex align="center" gap="3">
                            <Text size="2" weight="bold" style={{ width: 100 }}>Username</Text>
                            <TextField.Root
                                name="username"
                                defaultValue={setting.username}
                                style={{ width: 600 }}
                            />
                        </Flex>

                        <Flex align="center" gap="3">
                            <Text size="2" weight="bold" style={{ width: 100 }}>Password</Text>
                            <TextField.Root
                                name="password"
                                type="password"
                                defaultValue=""
                                placeholder="Enter new password"
                                style={{ width: 600 }}
                            />
                        </Flex>

                        <Flex align="center" gap="3">
                            <Text size="2" weight="bold" style={{ width: 100 }}>Aggregator</Text>
                            <TextField.Root
                                name="aggregator"
                                defaultValue={setting.aggregator}
                                placeholder="Enter aggregator URL"
                                style={{ width: 600 }}
                            />
                        </Flex>

                        <Flex align="center" gap="3">
                            <Text size="2" weight="bold" style={{ width: 100 }}>Publisher</Text>
                            <TextField.Root
                                name="publisher"
                                defaultValue={setting.publisher}
                                placeholder="Enter publisher URL"
                                style={{ width: 600 }}
                            />
                        </Flex>

                        <Button type="submit">Save Settings</Button>
                    </Flex>
                </Card>
            </Form>

            <Card>
                <Blockquote size="2">
                    <Flex direction="column" gap="3">
                        <Text>
                            The Walrus system provides an interface that can be used for public testing. For your
                            convenience, Walrus provides these at the following hosts:
                        </Text>
                        <Text>
                            <Text weight="bold">Aggregator:</Text> https://aggregator-devnet.walrus.space
                        </Text>
                        <Text>
                            <Text weight="bold">Publisher:</Text> https://publisher-devnet.walrus.space
                        </Text>
                    </Flex>
                </Blockquote>
            </Card>

            {/* Success Popup Dialog */}
            <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
                <Dialog.Content style={{ maxWidth: 400 }}>
                    <Dialog.Title>Success</Dialog.Title>
                    <Dialog.Description>Your settings have been saved successfully.</Dialog.Description>
                    <Flex justify="end">
                        <Button onClick={() => setShowDialog(false)}>OK</Button>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
        </Flex>
    );
}
