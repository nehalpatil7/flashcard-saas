'use client'
import { useState } from "react";
import { SignUp } from "@clerk/nextjs";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Box, Container, Typography, Toolbar, Button, } from "@mui/material";
import {
    Brightness4 as Brightness4Icon,
    Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';


export default function signUpPage() {
    const [darkMode, setDarkMode] = useState(true);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Create a theme instance based on the darkMode state
    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
        typography: {
            allVariants: {
                color: '#ffffff',
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
        <CssBaseline />
            <Container
                maxWidth={false}
                disableGutters
                sx={{
                    position: 'relative',
                    minHeight: '100vh',
                    overflow: 'hidden',
                }}
            >
                {/* Video Background */}
                <video
                    autoPlay
                    loop
                    muted
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: -1,
                    }}
                >
                    <source src="/landing.webm" type="video/webm" />
                </video>

                <AppBar position='static'>
                    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='h6'>Flashcard SaaS</Typography>

                        <Box>
                            <Button color='inherit' href="/sign-in">LOGIN</Button>
                            <Button color='inherit' href="/sign-up">SIGN UP</Button>

                            <IconButton onClick={toggleDarkMode}>
                                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    mt={8}
                >
                    <SignUp />
                </Box>
            </Container>
        </ThemeProvider>
    )
}