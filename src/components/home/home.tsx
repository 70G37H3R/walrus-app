import { Box, Heading, Card, Blockquote, Flex, Text } from "@radix-ui/themes";
import React from "react";

export default function Home() {
    return (
        <Box
            style={{
                backgroundColor: "#f0fdf4", // Light green background
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "20px",
                padding: "20px"
            }}
        >
            <Heading
                size="9"
                style={{
                    color: "green",
                    fontWeight: "bold",
                    textShadow: "2px 2px 6px rgba(0, 128, 0, 0.3)"
                }}
            >
                🌿 Walrus Decentralized Storage
            </Heading>

            <Card>
                <Blockquote size="2">
                    <Flex direction="column" gap="3">
                        <Text>
                            The Walrus system provides an interface that can be used for public testing. For
                            your convenience, Walrus provides these at the following hosts:
                        </Text>
                        <Text>
                            <Text weight="bold">Aggregator:</Text> https://aggregator.walrus-testnet.walrus.space
                        </Text>
                        <Text>
                            <Text weight="bold">Publisher:</Text> https://publisher.walrus-testnet.walrus.space
                        </Text>
                    </Flex>
                </Blockquote>
            </Card>
        </Box>
    );
}
