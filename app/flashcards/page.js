'use client';
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
    CssBaseline,
    AppBar,
    Box,
    Container,
    Typography,
    Toolbar,
    Grid,
    Card,
    CardActionArea,
    CardContent,
    ButtonBase,
    Button,
} from "@mui/material";
import Link from 'next/link';
import { db } from "@/firebase";


export default function Flashcards() {
    const [darkMode, setDarkMode] = useState(true);
    const { isLoaded, isSignedIn, user } = useUser();
    const [flashcards, setFlashcards] = useState([]);
    const [selectedFlashcards, setSelectedFlashcards] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [flipped, setFlipped] = useState([]);
    const router = useRouter();

    useEffect(() => {
        async function getFlashcards() {
            if (!user) return;

            const docRef = doc(collection(db, 'users'), user.id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const collections = docSnap?.data()?.flashcards || [];
                setFlashcards(collections);
            } else {
                await setDoc(docRef, {flashcards: []});
            }
        }
        getFlashcards()
    }, [user]);

    if (!isLoaded || !isSignedIn) {
        return <></>;
    };

    const handleCardClick = async (collectionName) => {
        setSelectedCollection(collectionName);
        const flashcardsRef = collection(db, 'users', user.id, collectionName);
        const flashcardsSnapshot = await getDocs(flashcardsRef);
        const flashcardsData = flashcardsSnapshot.docs.map(doc => doc.data());
        setSelectedFlashcards(flashcardsData);
        setFlipped([]);
    };

    const handleFlashcardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Create a theme instance based on the darkMode state
    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'dark',
        },
        typography: {
            allVariants: {
                color: '#ffffff',
            },
            poster: {
                fontSize: 64,
                color: 'lightblue',
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
                    textAlign: 'center',
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
                        <ButtonBase component={Link} href="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography variant='h6'>Flashcard SaaS</Typography>
                        </ButtonBase>

                        <Box>
                            <SignedOut>
                                <Button color='inherit' href='sign-in'>Login</Button>
                                <Button color='inherit' href='sign-up'>Sign Up</Button>
                            </SignedOut>

                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Typography variant="poster" pt={5}>Your Flashcards</Typography>
                <Box sx={{ mt: 4, paddingLeft: 5, paddingRight: 5, display: 'flex', flexDirection: 'row' }}>

                    {/* First Grid: Flashcard Collections */}
                    <Box
                        width="100%"
                        padding={1}
                        pr={10}
                        boxShadow={1}
                    >
                        <Grid container spacing={3} sx={{ mt: 4, textAlign: 'center', justifyContent: 'center' }}>
                            {flashcards.map((flashcard, index) => (
                                <Grid item xs={12} key={index}>
                                    <Card
                                        sx={{
                                            boxShadow: flashcard.name === selectedCollection ? '0 0 20px 5px rgba(0, 150, 250, 0.7)' : 'none',
                                            transition: 'box-shadow 0.3s ease-in-out'
                                        }}
                                    >
                                        <CardActionArea onClick={() => handleCardClick(flashcard.name)}>
                                            <CardContent>
                                                <Typography variant="h6" component="div">{flashcard.name}</Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                            <Box sx={{ mt: 4, textAlign: 'center' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => router.push('/generate')}
                                >
                                    Generate New Flashcards
                                </Button>
                            </Box>
                        </Grid>
                    </Box>

                    {/* Second Grid: selected Flashcards */}
                    <Box
                        width="100%"
                        padding={1}
                        boxShadow={1}
                        pb={5}
                    >
                        <Grid container spacing={3}>
                            {selectedFlashcards.map((flashcard, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card>
                                        <CardActionArea onClick={() => handleFlashcardClick(index)}>
                                            <CardContent>
                                                <Box sx={{
                                                    perspective: '1000px',
                                                    '& > div': {
                                                        transition: 'transform 0.6s',
                                                        transformStyle: 'preserve-3d',
                                                        position: 'relative',
                                                        width: '100%',
                                                        height: '200px',
                                                        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                                                        transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                                    },
                                                    '& > div > div': {
                                                        position: 'absolute',
                                                        width: '100%',
                                                        height: '100%',
                                                        backfaceVisibility: 'hidden',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        padding: 2,
                                                        boxSizing: 'border-box',
                                                        userSelect: 'text',
                                                    },
                                                    '& > div > div:nth-of-type(2)': {
                                                        transform: 'rotateY(180deg)'
                                                    }
                                                }}>
                                                    <div>
                                                        <div>
                                                            <Typography
                                                                component="div"
                                                                sx={{
                                                                    fontSize: 'clamp(0.8rem, 1.5vw, 1.2rem)',
                                                                    textAlign: 'center',
                                                                    overflowWrap: 'break-word',
                                                                    wordWrap: 'break-word',
                                                                    hyphens: 'auto',
                                                                }}
                                                            >
                                                                {flashcard.front}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography
                                                                component="div"
                                                                sx={{
                                                                    fontSize: 'clamp(0.8rem, 1.5vw, 1.2rem)',
                                                                    textAlign: 'center',
                                                                    overflowWrap: 'break-word',
                                                                    wordWrap: 'break-word',
                                                                    hyphens: 'auto',
                                                                }}
                                                            >
                                                                {flashcard.back}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </Box>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                </Box>
            </Container>
        </ThemeProvider>
    )
}