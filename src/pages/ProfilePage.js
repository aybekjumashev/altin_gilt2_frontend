import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Tabs,
    Container,
    Title,
    Paper,
    SimpleGrid,
    Center,
    Loader,
    Alert,
    Text,
    Button,
    Stack,
    Group,
    Badge,
    Table,
    ScrollArea,
} from '@mantine/core';
import {
    IconUserCircle,
    IconHeart,
    IconListDetails,
    IconWallet,
} from '@tabler/icons-react';
import useAuthStore from '../store/authStore';
import apiClient from '../api/axios';
import ListingCard from '../components/ListingCard';
import UserInfo from '../components/UserInfo';
function ProfilePage() {
    const user = useAuthStore((state) => state.user);

    return (
        <Container my="md">
            <Group justify="space-between" mb="lg">
                <Title order={2}>Shaxsiy Kabinet</Title>
                {user && (
                    <Paper withBorder p="xs" radius="md">
                        <Group>
                            <IconWallet size={24} stroke={1.5} />
                            <Text fz="sm" fw={500}>Balans:</Text>
                            <Text fz="lg" fw={700} c="teal">
                                ${new Intl.NumberFormat('en-US').format(user.balance || 0)}
                            </Text>
                        </Group>
                    </Paper>
                )}
            </Group>
            <Paper withBorder shadow="sm" radius="md">
                <Tabs defaultValue="info" p="md">
                    <Tabs.List>
                        <Tabs.Tab value="info" leftSection={<IconUserCircle size={18} />}>
                            Shaxsiy ma'lumotlar
                        </Tabs.Tab>
                        <Tabs.Tab value="my-listings" leftSection={<IconListDetails size={18} />}>
                            Mening e'lonlarim
                        </Tabs.Tab>
                        <Tabs.Tab value="favorites" leftSection={<IconHeart size={18} />}>
                            Sevimlilar
                        </Tabs.Tab>
                        <Tabs.Tab value="transactions" leftSection={<IconWallet size={18} />}>
                            Tranzaksiyalar
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="info" pt="xs">
                        <UserInfo />
                    </Tabs.Panel>

                    <Tabs.Panel value="my-listings" pt="xs">
                        <UserListings />
                    </Tabs.Panel>

                    <Tabs.Panel value="favorites" pt="xs">
                        <UserFavorites />
                    </Tabs.Panel>

                    <Tabs.Panel value="transactions" pt="xs">
                        <UserTransactions />
                    </Tabs.Panel>
                </Tabs>
            </Paper>
        </Container>
    );
}
// "Mening e'lonlarim" tabining kontenti
function UserListings() {
    const user = useAuthStore((state) => state.user);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || !user.id) {
            if (!user) setLoading(true);
            return;
        }

        const fetchListings = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/listings/?seller=${user.id}`);
                setListings(response.data.results);
            } catch (err) {
                setError("Sizning e'lonlaringizni yuklashda xatolik yuz berdi.");
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [user]);

    if (loading) return <Center><Loader my="xl" /></Center>;
    if (error) return <Alert color="red" mt="md">{error}</Alert>;

    return (
        <div>
            {listings.length > 0 ? (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 2 }} mt="md" verticalSpacing="lg">
                    {listings.map(listing => (
                        // Endi ortiqcha Paper'ga ehtiyoj yo'q
                        <ListingCard listing={listing} key={listing.id} />
                    ))}
                </SimpleGrid>
            ) : (
                <Center mt="xl" mb="xl">
                    <Stack align="center">
                        <IconListDetails size={60} stroke={1.5} color="gray" />
                        <Title order={4} color="dimmed">Siz hali e'lon joylamagansiz</Title>
                        <Text color="dimmed" size="sm">Yangi e'lon yaratib, sotishni boshlang!</Text>
                        <Button component={Link} to="/listings/new" mt="md">
                            Birinchi e'lonni yaratish
                        </Button>
                    </Stack>
                </Center>
            )}
        </div>
    );
}

// "Sevimlilar" tabining kontenti
function UserFavorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await apiClient.get('/users/me/favorites/');
                setFavorites(response.data.results);
            } catch (err) {
                setError("Sevimlilarni yuklashda xatolik yuz berdi.");
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    const handleFavoriteToggle = async (listingId) => {
        const originalFavorites = [...favorites];
        setFavorites(current => current.filter(fav => fav.listing.id !== listingId));

        try {
            await apiClient.post(`/listings/${listingId}/favorite/`);
        } catch (err) {
            setFavorites(originalFavorites);
        }
    };

    if (loading) return <Center><Loader my="xl" /></Center>;
    if (error) return <Alert color="red" mt="md">{error}</Alert>;

    return (
        <div>
            {favorites.length > 0 ? (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 2 }} mt="md">
                    {favorites.map(fav => (
                        <ListingCard
                            key={fav.id}
                            listing={{ ...fav.listing, is_favorite: true }}
                            onFavoriteToggle={() => handleFavoriteToggle(fav.listing.id)}
                        />
                    ))}
                </SimpleGrid>
            ) : (
                <Text mt="md" align="center" color="dimmed">Sizda sevimlilarga qo'shilgan e'lonlar mavjud emas.</Text>
            )}
        </div>
    );
}

// "Tranzaksiyalar" tabining kontenti
function UserTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await apiClient.get('/users/me/transactions/');
                setTransactions(response.data.results);
            } catch (err) {
                setError("Tranzaksiyalarni yuklashda xatolik yuz berdi.");
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    if (loading) return <Center><Loader my="xl" /></Center>;
    if (error) return <Alert color="red" mt="md">{error}</Alert>;

    const rows = transactions.map((item) => (
        <Table.Tr key={item.id}>
            <Table.Td>{new Date(item.created_at).toLocaleDateString()}</Table.Td>
            <Table.Td>{item.name}</Table.Td>
            <Table.Td>{item.type}</Table.Td>
            <Table.Td>
                <Text c={item.amount > 0 ? 'teal' : 'red'} fw={500}>
                    ${new Intl.NumberFormat('en-US').format(item.amount)}
                </Text>
            </Table.Td>
            <Table.Td>
                <Badge color={item.status === 'SUCCESS' ? 'green' : 'orange'} variant="light">
                    {item.status}
                </Badge>
            </Table.Td>
        </Table.Tr>
    ));

    return transactions.length > 0 ? (
        <ScrollArea>
            <Table miw={600} verticalSpacing="sm" striped highlightOnHover mt="md">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Sana</Table.Th>
                        <Table.Th>Tavsif</Table.Th>
                        <Table.Th>Turi</Table.Th>
                        <Table.Th>Summa</Table.Th>
                        <Table.Th>Status</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </ScrollArea>
    ) : (
        <Text mt="md" align="center" color="dimmed">Sizda hali tranzaksiyalar mavjud emas.</Text>
    );
}

export default ProfilePage;