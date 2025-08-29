// src/components/Layout.js
import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { AppShell, Title, Button, Group } from '@mantine/core'; // <-- 'Header' olib tashlandi
import useAuthStore from '../store/authStore';

const Layout = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppShell
            padding="md"
            header={
                // <Header> o'rniga <AppShell.Header> ishlatamiz
                <AppShell.Header height={60} p="xs"> 
                    <Group position="apart" sx={{ height: '100%' }}>
                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                           <Title order={3}>Altin Gilt</Title>
                        </Link>

                        <Group>
                            {isAuthenticated ? (
                                <>
                                    <span>Salom, {user?.first_name || 'Foydalanuvchi'}!</span>
                                    <Button variant="outline" component={Link} to="/profile">
                                        Shaxsiy Kabinet
                                    </Button>
                                    <Button variant="filled" color="red" onClick={handleLogout}>
                                        Chiqish
                                    </Button>
                                </>
                            ) : (
                                <Button component={Link} to="/login">
                                    Kirish
                                </Button>
                            )}
                        </Group>
                    </Group>
                </AppShell.Header> // Tegni ham yopamiz
            }
        >
            {/* Barcha sahifalar shu yerda ko'rsatiladi */}
            <Outlet />
        </AppShell>
    );
};

export default Layout;