import React, { useState, useEffect } from "react";
import { Box, TextField, IconButton, List, ListItem, ListItemText, Card } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SendIcon from '@mui/icons-material/Send';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ReplyIcon from '@mui/icons-material/Reply';
function Comment() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [likedMessageIds, setLikedMessageIds] = useState(new Set());

    const [error, setError] = useState(null);
    const mateWords = ['***', 'Любимый преподаватель, вы не увидете слово, которое не прошло валидацию в отчете, но можете угадать)))))', '***'];

    //получаем список сообщений и переводим JSON формат в JS объект
    const fetchMessages = async () => {
        try {
            const response = await fetch('http://localhost:12345');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data || !Array.isArray(data)) {
                console.error('Received invalid data format:', data);
                return;
            }

            setMessages(
                data.map(msg => ({
                    ...msg,
                    isLiked: likedMessageIds.has(msg.id)
                })).sort((a, b) => b.likes - a.likes)
            );
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    //отправка на сообщений на сервер
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            setError('Сообщение не может быть пустым');
            return;
        }
        const containsForbiddenWord = mateWords.some(word =>
            message.toLowerCase().includes(word.toLowerCase())
        );

        if (containsForbiddenWord) {
            setError('Сообщение содержит недопустимые слова');
            return;
        }

        try {

            await fetch('http://localhost:12345', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    initial_likes: Array.from(likedMessageIds).reduce((acc, id) => {
                        acc[id] = true;
                        return acc;
                    }, {})
                })
            });

            setMessage("");
            setError(null);
            await fetchMessages();
        } catch (err) {
            // console.error("Ошибка");
            setError('Ошибка при отправке сообщения');
        }
    };

    //обрабатываем лайки, обновляем состояние и синхронизируем с сервером
    const handleLike = async (messageId) => {
        const newLikedIds = new Set(likedMessageIds);
        const isLiked = newLikedIds.has(messageId);

        setMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? {
                    ...msg,
                    likes: isLiked ? msg.likes - 1 : msg.likes + 1,
                    last_like_time: isLiked ? msg.last_like_time : Date.now()
                }
                : msg
        ).sort((a, b) => b.likes - a.likes));


        isLiked ? newLikedIds.delete(messageId) : newLikedIds.add(messageId);
        setLikedMessageIds(newLikedIds);

        // Отправка на сервер
        try {
            await fetch('http://localhost:12345', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    likes: { [messageId]: !isLiked }
                })
            });
        } catch (error) {
            console.error("Like failed:", error);
            fetchMessages();
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    return (
        <Box sx={{ width: 500, maxWidth: '100%', margin: 'auto' }}>
            <Card sx={{
                backgroundColor: 'rgb(183, 137, 137)',
                borderRadius: '20px',
                marginBottom: '20px',
                padding: 2,
                maxHeight: '70vh',
                overflow: 'hidden',
            }}>
                <List sx={{
                    overflow: 'auto',
                    mb: 2,
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                }}>
                    {messages.map((msg) => (
                        <ListItem
                            key={msg.id}
                        // onMouseEnter={() => setHoveredMessage(index)}
                        // onMouseLeave={() => setHoveredMessage(null)}
                        // sx={{ position: 'relative' }}
                        >
                            <AccountCircleIcon sx={{ fontSize: '40px', marginRight: '20px' }} />
                            <Card sx={{
                                width: '400px',
                                minHeight: '50px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                paddingLeft: '10px',
                                flexGrow: 1,
                            }}>
                                <ListItemText primary={msg.text} />
                                <>
                                    <IconButton>
                                        <ReplyIcon />
                                    </IconButton>
                                    <IconButton

                                        onClick={() => handleLike(msg.id)}
                                        sx={{
                                            position: 'absolute',
                                            right: 10,

                                            color: likedMessageIds.has(msg.id) ? 'red' : '',
                                            marginRight: '40px'
                                        }}
                                    >
                                        {likedMessageIds.has(msg.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                    </IconButton>
                                </>
                            </Card>
                        </ListItem>
                    ))}
                </List>
            </Card>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountCircleIcon sx={{ fontSize: '50px' }} />
                <TextField
                    fullWidth
                    value={message}
                    onChange={(e) => {

                        setMessage(e.target.value);

                        setError(null)
                    }}
                    placeholder="Введите комментарий"
                    variant="outlined"

                    error={!!error}
                    helperText={error}

                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '20px',
                        }
                    }}
                />
                <IconButton onClick={handleSubmit} sx={{ color: 'black' }} disabled={!message.trim() || !!error}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
}

export default Comment;