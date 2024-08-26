'use client'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline,
  Box,
  Button,
  Typography,
  Container,
  AppBar,
  Toolbar,
  Grid,
  ButtonBase,
} from "@mui/material";
import Tooltip from '@mui/material/Tooltip';
import { useState, useEffect } from "react";
import getStripe from '@/utils/get-stripe';
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Head from 'next/head';
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { getSubscriptionStatus } from '@/utils/subscription';


export default function Home() {
  const router = useRouter();
  const {isSignedIn, user} = useUser();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (isSignedIn && user) {
      getSubscriptionStatus(user.id).then(status => setSubscriptionStatus(status));
    }
  }, [isSignedIn, user]);

  const handleSubmit = async (price) => {
    const checkoutSession = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000',
      },
      body: JSON.stringify({ price, userId: user?.id }),
    });

    const checkoutSessionJSON = await checkoutSession.json();

    if (checkoutSession.statusCode === 500) {
      console.log(checkoutSession.message);
      alert("Purchase Failed");
      return;
    }

    const stripe = await getStripe();
    const {error} = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJSON.id,
    });

    if (error) {
      console.warn(error.message);
    }
  }

  const handleGenerateRedirect = () => {
    router.push('/generate');
  };

  const handleFlashcardsRedirect = () => {
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
        <Head>
          <title>Flashcard SaaS</title>
          <meta name='description' content='Create flashcard from your text'/>
        </Head>

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

        <Box sx={{ flexGrow: 1 }}>
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
                  <UserButton/>
                </SignedIn>
              </Box>
            </Toolbar>
          </AppBar>

          <Box
            sx={{
              textAlign: 'center',
              my: 4,
            }}
          >
            <Typography variant='h2'>Welcome to Flashcard SaaS</Typography>
            <Typography variant='h5' gutterBottom>The easiest way to make flashcards from your text.</Typography>
            <Box>
              <Button variant='contained' color='primary' sx={{ mt: 2, mr: 2 }} onClick={handleGenerateRedirect}>Get Started</Button>
              <Tooltip title={!isSignedIn ? "You need to be signed in to view cards" : ""}>
                <span>
                  <Button
                    variant='contained'
                    color='primary'
                    sx={{ mt: 2, ml: 2 }}
                    onClick={handleFlashcardsRedirect}
                    disabled={!isSignedIn}
                  >
                    View your flashcards
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', my: 6 }}>
          <Typography variant='h4' gutterBottom>Features</Typography>
          <Grid container spacing={1} pl={5} pr={5}>
            {/* Common Styles for the Boxes */}
            {[
              { title: 'Easy Text Input', description: 'Simply input your text and let our software do the rest. Creating flashcards has never been easier.' },
              { title: 'Transform Your Notes into Flashcards Instantly', description: 'Simply input your text, and our AI converts it into customized flashcards for efficient learning.' },
              { title: 'Condense Large Texts into Key Points', description: 'Automatically extract essential information from your text to create concise and effective flashcards.' },
              { title: 'Personalized Flashcards to Suit Your Learning Style', description: 'The AI analyzes your input and generates flashcards tailored to enhance your retention and comprehension.' },
            ].map((feature, index) => (
              <Grid item xs={6} md={6} key={index}>
                <Container
                  sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    minHeight: '130px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant='h6' sx={{ fontWeight: 'bold' }}>{feature.title}</Typography>
                  <Typography variant='body1'>{feature.description}</Typography>
                </Container>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Conditionally render the paid plans */}
        {subscriptionStatus !== 'paid' && (
          <Box sx={{ textAlign: 'center', my: 6 }}>
            <Typography variant='h4' gutterBottom>Pricing</Typography>
            <Grid container spacing={1} pl={3} pr={3}>
              {[
                { title: 'Basic', description: 'Access to basic flashcard features and limited storage.', price: '$6.99 / month' },
                { title: 'Premium', description: 'Unlimited flashcards and storage options.', price: '$9.99 / month' },
              ].map((plan, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box sx={{ p: 3, border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
                    <Typography variant='h6' sx={{ fontWeight: 'bold' }}>{plan.title}</Typography>
                    <Typography variant='body1'>{plan.description}</Typography>
                    <Button variant='contained' color='primary' sx={{ mt: 2 }} onClick={() => handleSubmit(plan.price)}>{plan.price}</Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}
