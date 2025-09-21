// src/components/Layout.js
import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { AppShell, Title, Button, Group, Menu, UnstyledButton, Avatar, Text, Box } from '@mantine/core';
import { IconChevronDown, IconLogout, IconUserCircle, IconPlus } from '@tabler/icons-react';
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
            header={{ height: 60 }}
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Title order={3}>123</Title>
                    </Link>

                    <Group>
                        {/* --- BU TUGMA FAQAT KATTA EKRANLARDA KO'RINADI --- */}
                        <Button
                            component={Link}
                            to="/listings/new"
                            variant="light"
                            leftSection={<IconPlus size={14} />}
                            visibleFrom="sm" // `sm` (small) breakpointidan boshlab ko'rinadi
                        >
                            E'lon qo'shish
                        </Button>
                        {isAuthenticated ? (
                            <>

                                {/* --- Dropdown Menu --- */}
                                <Menu shadow="md" width={200}>
                                    <Menu.Target>
                                        <UnstyledButton>
                                            <Group>
                                                <Avatar color="blue" radius="xl">
                                                    {user?.first_name?.charAt(0)}
                                                    {user?.last_name?.charAt(0)}
                                                </Avatar>
                                                {/* Ism faqat katta ekranlarda ko'rinadi */}
                                                <Box>
                                                    <Text size="sm" fw={500}>{user?.first_name || 'Foydalanuvchi'}</Text>
                                                </Box>
                                                <IconChevronDown size={14} />
                                            </Group>
                                        </UnstyledButton>
                                    </Menu.Target>

                                    <Menu.Dropdown>

                                        {/* --- BU BAND FAQAT KICHIK EKRANLARDA KO'RINADI --- */}
                                        <Menu.Item
                                            icon={<IconPlus size={14} />}
                                            component={Link}
                                            to="/listings/new"
                                            hiddenFrom="sm" // `sm` (small) breakpointidan boshlab yashiriladi
                                        >
                                            E'lon qo'shish
                                        </Menu.Item>

                                        <Menu.Item
                                            icon={<IconUserCircle size={14} />}
                                            component={Link}
                                            to="/profile"
                                        >
                                            Shaxsiy Kabinet
                                        </Menu.Item>

                                        <Menu.Divider />

                                        <Menu.Item
                                            color="red"
                                            icon={<IconLogout size={14} />}
                                            onClick={handleLogout}
                                        >
                                            Chiqish
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </>
                        ) : (
                            <Button component={Link} to="/login">
                                Kirish
                            </Button>
                        )}
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
};

export default Layout;