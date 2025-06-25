import { Box, Button, Card } from "@mui/material"
import React from "react"
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
function Other() {

    return (
        <Card
            sx={{
                width: '150px', backgroundColor: '#FFC0CB', height: '220px'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 1,
                    marginTop: '5px',

                }}
            >
                <Button sx={{ color: 'black' }}>
                    <AccountCircleIcon sx={{ marginRight: '5px' }} />
                    Профиль
                </Button>
                <Button sx={{ color: 'black' }}>
                    <HomeOutlinedIcon sx={{ marginRight: '5px' }} />
                    Лента
                </Button>
                <Button sx={{ color: 'black' }}>
                    <MailOutlineIcon sx={{ marginRight: '5px' }} />
                    Мессенджер
                </Button>
                <Button sx={{ color: 'black' }}>
                    <PeopleAltOutlinedIcon sx={{ marginRight: '5px' }} />
                    Друзья
                </Button>
                <Button sx={{ color: 'black' }}>
                    <ForumOutlinedIcon sx={{ marginRight: '5px' }} />
                    Сообщества
                </Button>
            </Box>
        </Card>

    )
}
export default Other