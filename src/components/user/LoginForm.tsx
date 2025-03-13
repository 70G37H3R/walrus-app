import { Box, Button, Card, Flex, Text, TextField } from "@radix-ui/themes";
import { Form as RouterForm, redirect, useActionData } from "react-router-dom";
import { apiAuthProvider } from "@/hooks/useAuthStatus.ts";
import React, { useEffect } from "react";

export async function action({ request }) {
    const formData = await request.formData();
    const { username, password } = Object.fromEntries(formData);
    const errors = {
        message: "Wrong authentication information, the default password is [password]"
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
        <RouterForm method="post">
            <Box className="login-container">
                <Card className="login-form" style={{ background: "var(--gray-a1)", maxWidth: 400 }}>
                    <Flex direction="column" gap="3">
                        <Text as="div" weight="bold" size="3" mb="1" align={'center'}>
                            Walrus Disk Sign In
                        </Text>
                        <label>
                            <Text as="div" size="2" mb="1" weight="bold">Name</Text>
                            <TextField.Root name="username" defaultValue="" placeholder="Enter your name" />
                        </label>
                        <label>
                            <Text as="div" size="2" mb="1" weight="bold">Password</Text>
                            <TextField.Root name="password" type="password" defaultValue="" placeholder="Enter your password" />
                        </label>
                        <Button>Login</Button>
                        <Text size="1" mb="1" color="red">{message}</Text>
                    </Flex>
                </Card>
            </Box>
        </RouterForm>
    );
}
