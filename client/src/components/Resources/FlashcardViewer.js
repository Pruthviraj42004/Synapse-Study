import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    IconButton,
    Typography,
    LinearProgress
} from '@mui/material';
import {
    NavigateBefore as PrevIcon,
    NavigateNext as NextIcon,
    Flip as FlipIcon
} from '@mui/icons-material';

const FlashcardViewer = ({ flashcards }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    if (!flashcards || flashcards.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                No flashcards available
            </Typography>
        );
    }

    const currentCard = flashcards[currentIndex];
    const progress = ((currentIndex + 1) / flashcards.length) * 100;

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setFlipped(false);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setFlipped(false);
        }
    };

    const handleFlip = () => {
        setFlipped(prev => !prev);
    };

    return (
        <Box>
            {/* Progress */}
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        Card {currentIndex + 1} of {flashcards.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {Math.round(progress)}% Complete
                    </Typography>
                </Box>
                <LinearProgress variant="determinate" value={progress} />
            </Box>

            {/* Flashcard */}
            <Card
                sx={{
                    minHeight: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    perspective: '1000px',
                    position: 'relative',
                    transition: 'transform 0.3s',
                    '&:hover': {
                        transform: 'scale(1.02)'
                    }
                }}
                onClick={handleFlip}
            >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    {!flipped ? (
                        <Box>
                            <Typography variant="overline" color="primary" gutterBottom>
                                Question
                            </Typography>
                            <Typography variant="h5" sx={{ mt: 2 }}>
                                {currentCard.q}
                            </Typography>
                            <Box sx={{ mt: 4 }}>
                                <FlipIcon color="action" />
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Click to reveal answer
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="overline" color="success.main" gutterBottom>
                                Answer
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                {currentCard.a}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                <IconButton
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    color="primary"
                >
                    <PrevIcon />
                </IconButton>
                <IconButton
                    onClick={handleNext}
                    disabled={currentIndex === flashcards.length - 1}
                    color="primary"
                >
                    <NextIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default FlashcardViewer;
