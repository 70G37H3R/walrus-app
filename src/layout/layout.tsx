import { Link, Outlet, redirect, useLoaderData } from "react-router-dom";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { apiAuthProvider } from "@/hooks/useAuthStatus.ts";
import { getSetting } from "@/hooks/useLocalStore.ts";

export async function loader() {
    const setting = await getSetting();
    const user = await apiAuthProvider.getUser();
    if (!user) {
        return redirect('/login');
    }

    return {
        username: user.username
    };
}

export default function Layout() {
    const { username } = useLoaderData();

    return (
        <Flex
            style={{
                height: "100vh",
                background: "#f4f4f4", // Soft neutral background
            }}
        >
            {/* Sidebar */}
            <Box
                style={{
                    width: "280px",
                    background: "white",
                    padding: "20px",
                    boxShadow: "2px 0px 10px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: "0 12px 12px 0", // Rounded right edges
                }}
            >
                <Box>
                    <Text as="h1" size="5" weight="bold" color="green" style={{ marginBottom: "20px" }}>
                        <Link to="/" style={{ textDecoration: "none", color: "green" }}>Walrus Decentralized Storage</Link>
                    </Text>

                    <nav style={{ marginTop: "10px" }}>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {[
                                { path: "/", label: "🏠 Home" },
                                { path: "/folder/0", label: "📂 All Files" },
                                { path: "/media/image", label: "🖼️ Pictures" },
                                { path: "/media/video", label: "📹 Videos" },
                                { path: "/media/application", label: "📄 Documents" },
                            ].map(({ path, label }) => (
                                <li key={path} style={{ margin: "8px 0" }}>
                                    <Link
                                        to={path}
                                        style={{
                                            textDecoration: "none",
                                            color: "black",
                                            fontWeight: "500",
                                            padding: "8px 12px",
                                            display: "block",
                                            borderRadius: "6px",
                                            transition: "0.3s",
                                        }}
                                        onMouseOver={(e) => (e.currentTarget.style.background = "#e3ffe7")}
                                        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </Box>

                {/* Bottom Links */}
                <Box>
                    <Text size="3" weight="bold" color="gray">Settings</Text>
                    <nav>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {[
                                { path: "/setting", label: "⚙️ Setting" },
                                { path: "/logout", label: "🚪 Sign out" },
                            ].map(({ path, label }) => (
                                <li key={path} style={{ margin: "8px 0" }}>
                                    <Link
                                        to={path}
                                        style={{
                                            textDecoration: "none",
                                            color: "black",
                                            fontWeight: "500",
                                            padding: "8px 12px",
                                            display: "block",
                                            borderRadius: "6px",
                                            transition: "0.3s",
                                        }}
                                        onMouseOver={(e) => (e.currentTarget.style.background = "#ffe3e3")}
                                        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box
                style={{
                    flex: 1,
                    padding: "20px",
                    overflowY: "auto",
                }}
            >
                <Outlet />
            </Box>
        </Flex>
    );
}
