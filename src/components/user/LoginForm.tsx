import { Box, Button, Card, Flex, Text, TextField } from "@radix-ui/themes";
import { Form as RouterForm, redirect, useActionData } from "react-router-dom";
import { apiAuthProvider } from "@/hooks/useAuthStatus.ts";
import React, { useEffect } from "react";

export async function action({ request }) {
    const formData = await request.formData();
    const { username, password } = Object.fromEntries(formData);
    const errors = {
        message: "🚨 Wrong authentication information! Default password is [password]"
    };

    if (await apiAuthProvider.signin(username, password)) {
        return redirect('/');
    }

    return errors;
}

export default function LoginForm() {
    const [message, setMessage] = React.useState("");
    const errors = useActionData();

    useEffect(() => {
        if (errors?.message) {
            setMessage(errors.message);
        }
    }, [errors]);

    return (
        <Box
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "linear-gradient(to right, #e3ffe7, #d9e7ff)", // Soft green-blue gradient
            }}
        >
            <RouterForm method="post">
                <Card
                    style={{
                        background: "white",
                        padding: "30px",
                        borderRadius: "12px",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                        maxWidth: "380px",
                    }}
                >
                    <Text
                        weight="bold"
                        size="5"
                        color="green"
                        align="center"
                        style={{ textShadow: "1px 1px 4px rgba(0, 128, 0, 0.2)" }}
                    >
                        🔐 Walrus Decentralized Storage
                    </Text>

                    <Flex direction="column" gap="4" mt="4">
                        <Flex direction="column" gap="2">
                            <Text size="3" weight="bold">Username</Text>
                            <TextField.Root name="username" placeholder="Enter your username" />
                        </Flex>

                        <Flex direction="column" gap="2">
                            <Text size="3" weight="bold">Password</Text>
                            <TextField.Root name="password" type="password" placeholder="Enter your password" />
                        </Flex>

                        <Button
                            style={{
                                background: "green",
                                color: "white",
                                fontWeight: "bold",
                                padding: "10px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                transition: "0.3s",
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = "#0a5a0a"}
                            onMouseOut={(e) => e.currentTarget.style.background = "green"}
                        >
                            Login
                        </Button>

                        {message && (
                            <Text size="2" color="red" style={{ marginTop: "10px", fontWeight: "bold" }}>
                                {message}
                            </Text>
                        )}
                    </Flex>
                </Card>
            </RouterForm>
        </Box>
    );
}
