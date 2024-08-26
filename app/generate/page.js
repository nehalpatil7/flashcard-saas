'use client';
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { collection, doc, getDoc, writeBatch } from "firebase/firestore";
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
    Button,
    Grid,
    Card,
    Paper,
    TextField,
    CardActionArea,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
    ButtonBase,
} from "@mui/material";
import Tooltip from '@mui/material/Tooltip';
import Link from 'next/link';
import { db } from "@/firebase";
import { getSubscriptionStatus } from '@/utils/subscription';


export default function Generate() {
    const [darkMode, setDarkMode] = useState(true);
    const {isSignedIn, user} = useUser();
    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nonLoggedInUsed, setNonLoggedInUsed] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const router = useRouter();

    // On component mount, check subscription status
    useEffect(() => {
        if (isSignedIn) {
            getSubscriptionStatus(user.id).then(status => setSubscriptionStatus(status));
        }
    }, [isSignedIn]);

    // On component mount, check if the user has already used the "Generate" button
    useEffect(() => {
        const usage = localStorage.getItem('nonLoggedInUsed');
        if (usage) {
            setNonLoggedInUsed(true);
        }
    }, []);

    const handleSubmit = async () => {
        if (!isSignedIn && nonLoggedInUsed) {
            alert('Please sign in to generate more flashcards.');
            return;
        }
        console.log(flashcards);
        if (subscriptionStatus === 'free' && flashcards.length >= 5) {
            alert('Upgrade to a paid plan to generate more flashcard collections.');
            return;
        }

        setLoading(true);
        fetch('api/generate', {
            method: 'POST',
            body: text,
        })
        .then((res) => res.json())
        .then((data) => {
            setFlashcards(data);
            setLoading(false);
            if (!isSignedIn) {
                setNonLoggedInUsed(true);
                localStorage.setItem('nonLoggedInUsed', 'true');
            }
        })
        .catch(() => setLoading(false));
    };

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleGenerateKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSaveKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveFlashcards();
        }
    };

    const saveFlashcards = async () => {
        if (!name) {
            alert('Please enter a name');
            return;
        }

        const userDocRef = doc(collection(db, 'users'), user.id);
        const docSnap = await getDoc(userDocRef);
        const collections = docSnap?.data()?.flashcards || [];

        if (subscriptionStatus === 'free' && collections.length >= 1) {
            alert('Upgrade to a paid plan to save more than one flashcard collection.');
            return;
        }

        const batch = writeBatch(db);

        if (collections.find((f) => f.name === name)) {
            alert('A flashcard collection with the specified name already exists.');
            return;
        } else {
            collections.push({ name });
            batch.set(userDocRef, { flashcards: collections }, { merge: true });
        }

        const colRef = collection(userDocRef, name);
        flashcards.forEach((flashcard) => {
            const cardDocRef = doc(colRef);
            batch.set(cardDocRef, flashcard);
        });

        await batch.commit();
        handleClose();
        router.push('/flashcards');
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

                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    mt={4}
                    mb={6}
                    pl={5}
                    pr={5}
                >
                    <Typography variant="h4" sx={{ mb: 3 }}>Generate Flashcards</Typography>
                    <Paper sx={{p: 4, width: "100%"}}>
                        <TextField
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            label="Enter text to create your card"
                            fullWidth
                            multiline
                            rows={5}
                            variant="outlined"
                            onKeyDown={handleGenerateKeyDown}
                            sx={{mb: 2}}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={!text.trim() || loading}
                            fullWidth
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate'}
                        </Button>
                    </Paper>
                </Box>

                {flashcards.length > 0 && (
                    <Box sx={{mt:4, paddingLeft:5, paddingRight:5}}>
                        <Grid container spacing={3}>
                            {flashcards.map((flashcard, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card>
                                        <CardActionArea onClick={() => handleCardClick(index)}>
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

                        <Box sx={{mt: 4, mb: 8, display: 'flex', justifyContent: 'center'}}>
                            <Tooltip title={!isSignedIn ? "You need to sign in to save cards" : ""}>
                                <span>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={handleOpen}
                                        disabled={!isSignedIn}
                                    >
                                        Save Cards
                                    </Button>
                                </span>
                            </Tooltip>
                        </Box>
                    </Box>
                )}

                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Save Flashcard</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Please enter a title for your flashcards collection.</DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Collection Name"
                            type="text"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleSaveKeyDown}
                            variant="outlined"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={saveFlashcards}>Save</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </ThemeProvider>
    )
}