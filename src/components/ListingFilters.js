import React, { useState, useEffect } from 'react';
import {
    SimpleGrid, Select, NumberInput, Button, Paper, RangeSlider,
    Text, Group, Box, SegmentedControl, Loader, Skeleton, Grid
} from '@mantine/core';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks'; // Debounce hook'ini import qilamiz
import apiClient from '../api/axios';

function ListingFilters({ onFilterChange }) {
    const [cities, setCities] = useState([]);
    const [agreementTypes, setAgreementTypes] = useState([]);
    const [listingTypes, setListingTypes] = useState([]);

    const [initialLoading, setInitialLoading] = useState(true);
    const [listingTypesLoading, setListingTypesLoading] = useState(false);

    const [filters, setFilters] = useState({
        agreement_type: '',
        listing_type: '',
        city: '',
        num_rooms: '',
        priceRange: [0, 2_000_000_000],
    });

    // --- 1-O'ZGARISH: DEBOUNCED FILTERS STATE'INI YARATAMIZ ---
    // Bu `filters` o'zgargandan 500ms o'tib yangilanadi
    const [debouncedFilters] = useDebouncedValue(filters, 500);

    const isMobile = useMediaQuery('(max-width: 768px)');

    // Boshlang'ich ma'lumotlarni yuklash (o'zgarishsiz)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [citiesRes, agreementRes] = await Promise.all([
                    apiClient.get('/cities/'),
                    apiClient.get('/agreement-types/'),
                ]);

                // Paginatsiyasiz javobni tekshiramiz
                if (Array.isArray(citiesRes.data)) {
                    setCities(citiesRes.data.map(city => ({ value: city.id.toString(), label: city.name })));
                }

                if (Array.isArray(agreementRes.data)) {
                    const agreements = agreementRes.data.map(agr => ({ value: agr.id.toString(), label: agr.name }));
                    setAgreementTypes(agreements);
                    if (agreements.length > 0) {
                        setFilters(prev => ({ ...prev, agreement_type: agreements[0].value }));
                    }
                }
            } catch (error) {
                console.error("Filtrlar uchun boshlang'ich ma'lumotlarni yuklashda xatolik:", error);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Listing turlarini `agreement_type`ga qarab yuklash (o'zgarishsiz)
    useEffect(() => {
        if (!filters.agreement_type) return;
        const fetchListingTypes = async () => {
            setListingTypesLoading(true);
            try {
                const typesRes = await apiClient.get(`/listing-types/?type_agreement=${filters.agreement_type}`);
                if (Array.isArray(typesRes.data)) {
                    setListingTypes(typesRes.data.map(type => ({ value: type.id.toString(), label: type.name })));
                }
            } catch (error) {
                console.error("E'lon turlarini yuklashda xatolik:", error);
                setListingTypes([]);
            } finally {
                setListingTypesLoading(false);
            }
        };
        fetchListingTypes();
    }, [filters.agreement_type]);

    // --- 2-O'ZGARISH: AVTOMATIK QIDIRUV UCHUN YANGI useEffect ---
    // Bu hook `debouncedFilters` o'zgarganda ishga tushadi
    useEffect(() => {
        // Boshlang'ich yuklanish vaqtida API'ga so'rov yubormaslik uchun
        if (initialLoading) return;

        const { priceRange, ...otherFilters } = debouncedFilters;
        const apiFilters = {
            ...otherFilters,
            price__gte: priceRange[0],
            price__lte: priceRange[1],
        };
        onFilterChange(apiFilters);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(debouncedFilters), initialLoading]); // Obyekt o'zgarishini to'g'ri aniqlash uchun stringify qilamiz

    // Bu funksiya filtrlar o'zgarganda darhol `filters` state'ini yangilaydi
    const handleFilterChange = (name, value) => {
        const newFilters = { ...filters, [name]: value };
        if (name === 'agreement_type') {
            newFilters.listing_type = '';
        }
        setFilters(newFilters);
    };

    // "Tozalash" funksiyasi o'zgarishsiz qoladi
    const handleReset = () => {
        const defaultAgreement = agreementTypes.length > 0 ? agreementTypes[0].value : '';
        setFilters({
            agreement_type: defaultAgreement,
            listing_type: '',
            city: '',
            num_rooms: '',
            priceRange: [0, 2_000_000_000],
        });
    };

    if (initialLoading) {
        return (
            <Paper shadow="sm" p="md" withBorder mb="lg">
                <Skeleton height={38} mb="md" />
                <Skeleton height={38} mb="xl" />
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                    <Skeleton height={56} />
                    <Skeleton height={56} />
                    <Skeleton height={100} />
                </SimpleGrid>
            </Paper>
        );
    }

    return (
        <Paper shadow="sm" p="md" withBorder mb="lg">

            {agreementTypes.length > 0 && (
                <Box mb="md" >
                    <SegmentedControl
                        value={filters.agreement_type}
                        onChange={(value) => handleFilterChange('agreement_type', value)}
                        data={agreementTypes}
                        color="blue"
                        size="md"
                        // fullWidth
                        fullWidth={isMobile}
                    />
                </Box>
            )}
            <Box mb="md" style={{ minHeight: '38px' }}>
                {listingTypesLoading ? (
                    <Group justify="center"><Loader size="sm" /></Group>
                ) : (
                    listingTypes.length > 0 && (
                        <Box style={{ overflowX: 'auto', paddingBottom: '10px' }}>
                            <SegmentedControl
                                value={filters.listing_type}
                                onChange={(value) => handleFilterChange('listing_type', value)}
                                data={[{ label: 'Barchasi', value: '' }, ...listingTypes]}
                                color="blue"
                                // variant="light"
                                radius="xl"
                                // withItemsBorders={false}
                            />
                        </Box>
                    )
                )}
            </Box>
            <Grid gutter={isMobile ? 'md' : 'xl'}>
                <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
                    <Select
                        label="Shahar"
                        placeholder="Shaharni tanlang"
                        data={cities}
                        value={filters.city}
                        onChange={(value) => handleFilterChange('city', value)}
                        clearable
                    />
                </Grid.Col>

                <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
                    <NumberInput
                        label="Xonalar soni"
                        placeholder="Masalan, 3"
                        value={filters.num_rooms}
                        onChange={(value) => handleFilterChange('num_rooms', value)}
                        min={0}
                        allowDecimal={false}
                        clearable
                    />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 4, md: 7 }}>
                    <Box>
                        <Text size="sm" fw={500}>Narx Diapazoni</Text>
                        <RangeSlider
                            mb="xl"
                            value={filters.priceRange}
                            onChange={(value) => handleFilterChange('priceRange', value)}
                            min={0}
                            max={2_000_000_000}
                            step={50_000_000}
                            label={(value) => `${new Intl.NumberFormat('en-US').format(value)}`}
                            marks={[
                                { value: 1_000_000, label: '0' },
                                { value: 500_000_000, label: '500 mln' },
                                { value: 1_000_000_000, label: '1 mlrd' },
                                { value: 1_500_000_000, label: '1,5 mlrd' },
                                { value: 2_000_000_000, label: '2 mlrd' },
                            ]}
                        />
                    </Box>
                </Grid.Col>
            </Grid>
            {/* --- 3-O'ZGARISH: "QIDIRISH" TUGMASI OLIB TASHALDI --- */}
            <Group justify="flex-end" mt="md">
                <Button onClick={handleReset} variant="default">Filtrlarni Tozalash</Button>
            </Group>
        </Paper>
    );
}

export default ListingFilters;