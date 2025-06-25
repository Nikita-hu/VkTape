import React, { useState } from 'react';
import { Box, Card, CardMedia, IconButton } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TextsmsOutlinedIcon from '@mui/icons-material/TextsmsOutlined';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';

import Comment from './Comment'
import Other from './Other';

function Page() {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isComment, setComment] = useState(false);

    const handleFavoriteClick = () => {
        setIsFavorite(!isFavorite);
    };

    const handleCommite = () => {
        setComment(!isComment);
    }
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            height: '100vh'
        }}>
            <Other />
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                flexGrow: 1,
                padding: 2
            }}>
                <Card sx={{
                    width: '800px',
                    maxWidth: '100%',
                    padding: 3,
                    backgroundColor: '#FADADD',
                    height: 'fit-content',
                    borderRadius: '30px',
                    boxShadow: '0 0 30px rgba(0, 0, 0, 0.1)'
                }}>
                    <CardMedia
                        component="img"
                        height="660px"

                        image="https://avatars.mds.yandex.net/i?id=e7a6469eb6684a299db261cf61c7202ac56de172-9181372-images-thumbs&n=13"
                        alt="Описание изображения"
                        sx={{ objectFit: 'cover', mb: 2, }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0 }}>
                        <IconButton>
                            {isFavorite ?
                                <FavoriteOutlinedIcon sx={{ color: 'red' }} onClick={handleFavoriteClick} />
                                :
                                <FavoriteBorderIcon onClick={handleFavoriteClick} />
                            }
                        </IconButton>
                        <IconButton>
                            <TextsmsOutlinedIcon onClick={handleCommite} />
                        </IconButton>
                        <IconButton>
                            <ShareIcon />
                        </IconButton>
                    </Box>
                    {isComment && <Comment />}
                </Card>
            </Box>
        </Box>
    );
}

export default Page;