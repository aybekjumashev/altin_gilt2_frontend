// src/pages/ListingDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Grid, Title, Text, Paper, Badge, Group, AspectRatio, Alert, Button, Divider, Stack, Skeleton } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import apiClient from '../api/axios';
import { IconAlertCircle } from '@tabler/icons-react';
import useAuthStore from '../store/authStore';

function ListingDetailPage() {
    const { id } = useParams();
    const { isAuthenticated } = useAuthStore();

    const [listing, setListing] = useState(null);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchListingData = async () => {
            setLoading(true);
            setError(null);
            window.scrollTo(0, 0);

            try {
                const [listingRes, mediaRes] = await Promise.all([
                    apiClient.get(`/listings/${id}/`),
                    apiClient.get(`/listings/${id}/media/`)
                ]);

                setListing(listingRes.data);
                setMedia(mediaRes.data.results);
            } catch (err) {
                setError("E'lonni yuklashda xatolik yuz berdi yoki u mavjud emas.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchListingData();
    }, [id]);

    if (loading) {
        return <ListingDetailSkeleton />;
    }

    if (error) {
        return (
            <Container>
                <Alert icon={<IconAlertCircle size="1rem" />} title="Xatolik!" color="red" mt="lg">
                    {error}
                </Alert>
            </Container>
        );
    }
    
    // YAXSHILANDI: Agar media bo'sh bo'lsa, placeholder'ni to'g'ri ko'rsatamiz
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
            {/* O'ZGARTIRILDI: Grid ustunlari uchun aniqroq span qiymatlari */}
            <Grid gutter="lg" align="flex-start">
                <Grid.Col span={{ base: 12, md: 7, lg: 8 }}>
                    {/* YAXSHILANDI: Karuselga AspectRatio o'rab, bo'yini saqlaymiz */}
                    <AspectRatio ratio={16 / 9}>
                        <Carousel withIndicators loop>
                            {slides}
                        </Carousel>
                    </AspectRatio>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 5, lg: 4 }}  style={{ display: 'flex', flexDirection: 'column' }}>
                    <Paper shadow="sm" p="md" withBorder>
                        {/* O'ZGARTIRILDI: `Stack`dan ham `height` olib tashlandi */}
                        <Stack>
                            {/* Elementlarni guruhlash uchun qo'shimcha `div` */}
                            <div>
                                <Title order={2}>{listing.name}</Title>
                                <Text size="sm" color="dimmed" mt={4}>{listing.address}, {listing.city.name}</Text>
                                <Text weight={700} size={32} mt="md">
                                    ${new Intl.NumberFormat('en-US').format(listing.price)}
                                </Text>
                            </div>
                            
                            {/* Tugma alohida, `mt` (margin-top) bilan ajratilgan */}
                            {isAuthenticated ? (
                                <Button component={Link} to={`/messages/${id}`} fullWidth mt="lg">
                                    Sotuvchi bilan yozishish
                                </Button>
                            ) : (
                                <Button component={Link} to="/login" fullWidth mt="lg">
                                    Xabar yozish uchun kiring
                                </Button>
                            )}
                        </Stack>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={12}>
                    <Paper shadow="sm" p="md" withBorder mt="lg">
                        <Title order={4} mb="sm">Tavsif</Title>
                        <Text style={{ whiteSpace: 'pre-wrap' }}>{listing.description}</Text>
                        
                        <Divider my="lg" />
                        
                        <Title order={4} mb="md">Xususiyatlari</Title>
                        <Group>
                            {listing.features.length > 0 ? listing.features.map(feature => (
                                <Badge key={feature.id} variant="light" size="lg">{feature.name}</Badge>
                            )) : (
                                <Text size="sm" color="dimmed">Qo'shimcha xususiyatlar ko'rsatilmagan.</Text>
                            )}
                        </Group>

                        <Divider my="lg" />

                        <Title order={4} mb="md">Umumiy ma'lumot</Title>
                        {/* YAXSHILANDI: Stack komponenti ma'lumotlarni tartibga soladi */}
                        <Stack gap="xs">
                            <SimpleDetail label="Xonalar soni" value={listing.num_rooms} />
                            <SimpleDetail label="Maydoni" value={listing.area ? `${listing.area} m²` : null} />
                            <SimpleDetail label="Qavati" value={listing.floor} />
                            <SimpleDetail label="Umumiy qavatlar" value={listing.num_floors} />
                            <SimpleDetail label="Qurilgan yili" value={listing.year_built} />
                            <SimpleDetail label="Holati" value={listing.condition} />
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Container>
    );
}

// ... ListingDetailSkeleton komponenti o'zgarishsiz ...
const ListingDetailSkeleton = () => (
    <Container my="md" size="lg">
        <Grid>
            <Grid.Col span={{ base: 12, md: 7, lg: 8 }}>
                <AspectRatio ratio={16 / 9}>
                    <Skeleton height="100%" />
                </AspectRatio>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5, lg: 4 }}>
                <Stack h="100%" justify="space-between">
                    <div>
                        <Skeleton height={25} width="80%" mb="sm" />
                        <Skeleton height={18} width="60%" mb="lg" />
                        <Skeleton height={35} width="50%" />
                    </div>
                    <Skeleton height={40} />
                </Stack>
            </Grid.Col>
            <Grid.Col span={12}>
                <Skeleton height={150} mt="lg" />
            </Grid.Col>
        </Grid>
    </Container>
);


const ImageWithPlaceholder = ({ src, alt = 'E\'lon rasmi' }) => {
    const placeholderUrl = 'https://placehold.co/400x250.png?text=Image';
    
    return (
        <img 
            src={src || placeholderUrl} 
            alt={alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            // Agar rasm yuklanmasa, placeholder'ni ko'rsatish uchun
            onError={(e) => { e.currentTarget.src = placeholderUrl; }}
        />
    );
};

// O'ZGARISHSIZ: SimpleDetail komponenti
const SimpleDetail = ({ label, value }) => {
    if (!value && value !== 0) return null; // 0 qiymatini ham ko'rsatish uchun
    return (
        <Group justify="space-between" my={4} wrap="nowrap" grow>
            <Text size="sm" color="dimmed" style={{ flexShrink: 0 }}>{label}</Text>
            {/* `ta="right"` matnni o'z bloki ichida o'ngga tekislaydi */}
            <Text weight={500} ta="right">{value}</Text>
        </Group>
    );
};

export default ListingDetailPage;