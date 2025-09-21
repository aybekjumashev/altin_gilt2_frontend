import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Container, Grid, Title, Text, Paper, Badge, Group,
    AspectRatio, Alert, Button, Divider, Stack, Skeleton, ActionIcon,
    Flex
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { notifications } from '@mantine/notifications';
import apiClient from '../api/axios';
import { IconAlertCircle, IconHeart, IconHeartFilled } from '@tabler/icons-react';
import useAuthStore from '../store/authStore';

// --- YORDAMCHI KOMPONENTLARNI FAYLNING YUQORISIGA, ASOSIY KOMPONENTDAN TASHQARIGA CHIQARAMIZ ---

const ListingDetailSkeleton = () => (
    <Container my="md" size="lg">
        <Grid>
            <Grid.Col span={{ base: 12, md: 7 }}>
                <AspectRatio ratio={16 / 9}><Skeleton height="100%" /></AspectRatio>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}>
                <Stack h="100%" justify="space-between">
                    <div>
                        <Skeleton height={25} width="80%" mb="sm" />
                        <Skeleton height={18} width="60%" mb="lg" />
                        <Skeleton height={35} width="50%" />
                    </div>
                    <Skeleton height={40} />
                </Stack>
            </Grid.Col>
            <Grid.Col span={12}><Skeleton height={150} mt="lg" /></Grid.Col>
        </Grid>
    </Container>
);

const ImageWithPlaceholder = ({ src, alt = 'E\'lon rasmi' }) => {
    const placeholderUrl = 'https://images.mantine.dev/placeholders/carousel/placeholder.svg';
    return (
        <img
            src={src || placeholderUrl}
            alt={alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.src = placeholderUrl; }}
        />
    );
};

const SimpleDetail = ({ label, value }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
        <Group justify="space-between" my={4} wrap="nowrap" grow>
            <Text size="sm" color="dimmed" style={{ flexShrink: 0 }}>{label}</Text>
            <Text weight={500} ta="right">{value}</Text>
        </Group>
    );
};

// --- ASOSIY KOMPONENT ---

function ListingDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isAuthenticated, user } = useAuthStore();

    const [listing, setListing] = useState(null);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchListingData = async () => {
            setLoading(true);
            setError(null);
            setListing(null);
            window.scrollTo(0, 0);

            try {
                const [listingRes, mediaRes] = await Promise.all([
                    apiClient.get(`/listings/${id}/`),
                    apiClient.get(`/listings/${id}/media/`)
                ]);
                setListing(listingRes.data);
                setMedia(mediaRes.data);
            } catch (err) {
                setError("E'lonni yuklashda xatolik yuz berdi yoki u mavjud emas.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchListingData();
    }, [id]);

    const handleFavoriteToggle = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        setListing(current => ({ ...current, is_favorite: !current.is_favorite }));
        try {
            await apiClient.post(`/listings/${id}/favorite/`);
        } catch (err) {
            setListing(current => ({ ...current, is_favorite: !current.is_favorite }));
            notifications.show({ title: "Xatolik!", message: "Amalni bajarishda xatolik yuz berdi.", color: 'red' });
        }
    };

    if (loading) {
        return <ListingDetailSkeleton />;
    }

    if (error || !listing) {
        return (
            <Container my="md">
                <Alert icon={<IconAlertCircle size="1rem" />} title="Xatolik!" color="red">
                    {error || "E'lon topilmadi yoki yuklashda muammo yuz berdi."}
                </Alert>
            </Container>
        );
    }

    const slides = media.length > 0 ? media.map((item, index) => (
        <Carousel.Slide key={index}>
            <ImageWithPlaceholder src={item.path} />
        </Carousel.Slide>
    )) : (
        <Carousel.Slide>
            <ImageWithPlaceholder />
        </Carousel.Slide>
    );


    return (
        <Container my="md" size="lg">
            <Grid gutter="xl" align="stretch">
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Paper shadow="sm" withBorder style={{ height: '100%' }}>
                        <AspectRatio ratio={16 / 9} style={{ height: '100%' }}>
                            <Carousel withIndicators loop>{slides}</Carousel>
                        </AspectRatio>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Paper shadow="sm" p="lg" withBorder style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Stack gap="md" justify="space-between" style={{ flexGrow: 1 }}>
                            <div>
                                <Group justify="space-between" align="flex-start" wrap="nowrap">
                                    {/* Har bir murojaatdan oldin `listing` tekshiriladi */}
                                    <Title order={2}>{listing?.name}</Title>
                                    <ActionIcon onClick={handleFavoriteToggle} variant="transparent" color="red" size="lg">
                                        {listing?.is_favorite ? <IconHeartFilled /> : <IconHeart />}
                                    </ActionIcon>
                                </Group>
                                <Divider my="xl" />
                                <Stack>
                                    <SimpleDetail label="Manzil" value={listing?.city?.name + ', ' + listing?.address} />
                                    <SimpleDetail label="Xonalar soni" value={listing?.num_rooms} />
                                    <SimpleDetail label="Maydoni" value={listing?.area ? `${listing.area} m²` : null} />
                                    <SimpleDetail label="Qavati" value={listing?.floor + ' / ' + listing?.num_floors} />
                                    <SimpleDetail label="Qurilgan yili" value={listing?.year_built} />
                                    <SimpleDetail label="Holati" value={listing?.condition} />
                                </Stack>
                            </div>
                        </Stack>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={12}>
                    <Paper shadow="sm" p="lg" withBorder>
                        <Title order={4} mb="sm">Tavsif</Title>
                        <Text style={{ whiteSpace: 'pre-wrap' }}>{listing?.description}</Text>
                        <Divider my="xl" />
                        <Title order={4} mb="md">Xususiyatlari</Title>
                        <Group>
                            {/* ENG MUHIM O'ZGARISH MANA SHU YERDA */}
                            {listing?.features?.length > 0 ? (
                                listing.features.map(feature => (
                                    <Badge key={feature.id} variant="light" size="lg">{feature.name}</Badge>
                                ))
                            ) : (
                                <Text size="sm" color="dimmed">Qo'shimcha xususiyatlar ko'rsatilmagan.</Text>
                            )}
                        </Group>
                        <Divider my="xl" />


                        <Flex justify="space-between" align="center">
                            <Text weight={700} size={32} style={{ lineHeight: 1 }} color='blue'>
                                {new Intl.NumberFormat('en-US').format(listing?.price || 0)} UZS
                            </Text>
                            {isAuthenticated && user?.id === listing?.seller?.id ? (
                                // Agar bu mening e'lonim bo'lsa, "Tahrirlash" tugmasini ko'rsat
                                <Button
                                    component={Link}
                                    to={`/listings/${id}/edit`}
                                    variant="outline"
                                    size="md"
                                >
                                    Tahrirlash
                                </Button>
                            ) : isAuthenticated ? (
                                // Agar meniki bo'lmasa, "Bog'lanish" tugmasini ko'rsat
                                <Button component={Link} to={`/messages/${id}`} size="md">Bog'lanish</Button>
                            ) : (
                                // Agar tizimga kirmagan bo'lsam, "Kirish" tugmasini ko'rsat
                                <Button component={Link} to="/login" size="md">Kirish</Button>
                            )}
                        </Flex>

                    </Paper>
                </Grid.Col>

            </Grid>
        </Container>
    );
}

export default ListingDetailPage;