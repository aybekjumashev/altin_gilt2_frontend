import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container, Title, Stepper, Button, Group, TextInput, Textarea,
    NumberInput, Select, MultiSelect, Paper, Alert, Text, Loader, Center,
    Image, SimpleGrid, Card, ActionIcon, RingProgress, Radio,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconX, IconUpload, IconPhoto } from '@tabler/icons-react';
import apiClient from '../api/axios';
import useAuthStore from '../store/authStore';
import { notifications } from '@mantine/notifications';

// --- HOOK'LAR ---
const useListingFormData = () => {
    const [data, setData] = useState({ cities: [], types: [], features: [] });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [citiesRes, typesRes, featuresRes] = await Promise.all([
                    apiClient.get('/cities/'),
                    apiClient.get('/listing-types/'),
                    apiClient.get('/listing-features/'),
                ]);
                setData({
                    cities: citiesRes.data.map(c => ({ value: c.id.toString(), label: c.name })),
                    types: typesRes.data.map(t => ({ value: t.id.toString(), label: t.name })),
                    features: featuresRes.data.map(f => ({ value: f.id.toString(), label: f.name })),
                });
            } catch (error) { console.error("Forma ma'lumotlarini yuklashda xatolik:", error); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);
    return { ...data, loading };
};

const usePromotions = () => {
    const [promotions, setPromotions] = useState([]);
    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await apiClient.get('/promotions/');
                setPromotions(response.data);
            } catch (err) { console.error("Reklamalarni yuklashda xatolik:", err); }
        };
        fetchPromotions();
    }, []);
    return promotions;
};

// --- ASOSIY KOMPONENT ---
function ListingFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [active, setActive] = useState(0);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [pageLoading, setPageLoading] = useState(isEditMode);
    const [media, setMedia] = useState([]);
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { cities, types, features, loading: dataLoading } = useListingFormData();
    const promotions = usePromotions();
    const [selectedPromotion, setSelectedPromotion] = useState(null);

    const [agreementTypes, setAgreementTypes] = useState([]);
    const [selectedAgreement, setSelectedAgreement] = useState('');
    const [filteredTypes, setFilteredTypes] = useState([]);
    const [typesLoading, setTypesLoading] = useState(true);

    const form = useForm({
        initialValues: { name: '', description: '', price: '', address: '', city: null, listing_type: null, features: [], area: '', num_rooms: '', floor: '', num_floors: '', year_built: '' },
        validate: (values) => {
            if (active === 0) return { name: values.name.trim().length < 5 ? 'Sarlavha kamida 5 belgidan iborat' : null, price: !values.price || values.price <= 0 ? 'Narx kiritilishi shart' : null, address: values.address.trim().length < 5 ? 'Manzil kamida 5 belgidan iborat' : null, city: !values.city ? 'Shahar tanlanishi kerak' : null, listing_type: !values.listing_type ? 'E\'lon turi tanlanishi kerak' : null, };
            if (active === 1) return { description: values.description.trim().length < 20 ? 'Tavsif kamida 20 belgidan iborat' : null };
            return {};
        },
    });

    useEffect(() => {
        if (isEditMode) {
            setPageLoading(true);
            const fetchInitialData = async () => {
                try {
                    const [listingRes, mediaRes] = await Promise.all([apiClient.get(`/listings/${id}/`), apiClient.get(`/listings/${id}/media/`),]);
                    const listing = listingRes.data;
                    form.setValues({ name: listing.name, description: listing.description, price: listing.price, address: listing.address, city: listing.city.id.toString(), listing_type: listing.listing_type.id.toString(), features: listing.features.map(f => f.id.toString()), area: listing.area || '', num_rooms: listing.num_rooms || '', floor: listing.floor || '', num_floors: listing.num_floors || '', year_built: listing.year_built || '', });
                    setMedia(mediaRes.data);
                } catch (err) { setError("E'lon ma'lumotlarini yuklashda xatolik."); }
                finally { setPageLoading(false); }
            };
            fetchInitialData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEditMode]);



    useEffect(() => {
        const fetchAgreementTypes = async () => {
            try {
                const res = await apiClient.get('/agreement-types/');
                const agreements = res.data.map(agr => ({ value: agr.id.toString(), label: agr.name }));
                setAgreementTypes(agreements);
                // Birinchisini standart tanlov qilib belgilaymiz
                if (agreements.length > 0) {
                    setSelectedAgreement(agreements[0].value);
                }
            } catch (err) {
                console.error("Kelishuv turlarini yuklashda xatolik", err);
            }
        };
        fetchAgreementTypes();
    }, []);


    useEffect(() => {
        if (selectedAgreement && types.length > 0) {
            const fetchAndFilterTypes = async () => {
                setTypesLoading(true);
                try {
                    // Biz bu so'rovni avval ListingFilters'da yozgan edik
                    const res = await apiClient.get(`/listing-types/?type_agreement=${selectedAgreement}`);
                    const filtered = res.data.map(t => ({ value: t.id.toString(), label: t.name }));
                    setFilteredTypes(filtered);

                    // Agar avval tanlangan e'lon turi yangi ro'yxatda bo'lmasa, uni tozalaymiz
                    const isCurrentTypeValid = filtered.some(t => t.value === form.values.listing_type);
                    if (!isCurrentTypeValid) {
                        form.setFieldValue('listing_type', null);
                    }
                } catch (err) {
                    console.error("E'lon turlarini filtrlashda xatolik", err);
                } finally {
                    setTypesLoading(false);
                }
            };
            fetchAndFilterTypes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAgreement, types]); // `types` ham qo'shildi, chunki u yuklangandan keyin ishlashi kerak



    const handleImageDelete = async (mediaId) => {
        const originalMedia = [...media];
        setMedia((current) => current.filter((m) => m.id !== mediaId));
        try { await apiClient.delete(`/listings/${id}/media/${mediaId}/`); }
        catch (err) { setError("Rasmni o'chirishda xatolik."); setMedia(originalMedia); }
    };

    const handleEditImageUpload = async () => {
        if (filesToUpload.length === 0) return;
        setSubmitting(true); setError(null);
        for (const file of filesToUpload) {
            const formData = new FormData();
            formData.append('path', file);
            formData.append('type', file.type);
            try {
                const response = await apiClient.post(`/listings/${id}/media/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                setMedia(current => [...current, response.data]);
            } catch (err) { setError(`'${file.name}' faylini yuklashda xatolik.`); break; }
        }
        setFilesToUpload([]); setSubmitting(false);
    };

    const handlePromote = async () => {
        if (!selectedPromotion) { setError("Iltimos, reklama turini tanlang."); return; }
        setSubmitting(true); setError(null);
        try {
            await apiClient.post(`/listings/${id}/promote/`, { promotion_id: selectedPromotion });
            useAuthStore.getState().fetchUser();
            notifications.show({ title: 'Muvaffaqiyatli!', message: 'E\'lon reklamasi faollashtirildi!', color: 'green' });
            navigate(`/listings/${id}`);
        } catch (err) { setError(err.response?.data?.error || "Reklama qilishda xatolik."); }
        finally { setSubmitting(false); }
    };

    const nextStep = () => setActive((current) => (form.validate().hasErrors ? current : current < 3 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const handleSubmit = async (values) => {
        setSubmitting(true); setError(null);
        if (!isEditMode && filesToUpload.length === 0) {
            setError("Kamida bitta rasm yuklashingiz kerak.");
            setSubmitting(false); setActive(2);
            return;
        }

        const payload = { ...values, price: parseFloat(values.price) || 0, area: values.area ? parseFloat(values.area) : null, num_rooms: values.num_rooms ? parseInt(values.num_rooms, 10) : null, floor: values.floor ? parseInt(values.floor, 10) : null, num_floors: values.num_floors ? parseInt(values.num_floors, 10) : null, year_built: values.year_built ? parseInt(values.year_built, 10) : null, city: parseInt(values.city, 10), listing_type: parseInt(values.listing_type, 10), features: values.features.map(f => parseInt(f, 10)) };

        if (isEditMode) {
            try {
                await apiClient.patch(`/listings/${id}/`, payload);
                notifications.show({ title: 'Muvaffaqiyatli!', message: 'Ma\'lumotlar saqlandi!', color: 'green' });
            } catch (err) { setError('Saqlashda xatolik yuz berdi.'); }
            finally { setSubmitting(false); }
            return;
        }

        try {
            const listingResponse = await apiClient.post('/listings/', payload);
            const newListingId = listingResponse.data?.id;
            if (!newListingId) throw new Error("ID olinmadi.");
            setUploadProgress(0);
            const totalFiles = filesToUpload.length; let uploadedCount = 0;
            for (const file of filesToUpload) {
                const formData = new FormData();
                formData.append('path', file);
                formData.append('type', file.type);
                await apiClient.post(`/listings/${newListingId}/media/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                uploadedCount++;
                setUploadProgress((uploadedCount / totalFiles) * 100);
            }
            notifications.show({ title: 'Muvaffaqiyatli!', message: 'Yangi e\'lon yaratildi!', color: 'green' });
            navigate(`/listings/${newListingId}`);
        } catch (err) { setError('E\'lonni yaratishda kutilmagan xatolik yuz berdi.'); }
        finally { setSubmitting(false); }
    };

    if (pageLoading) return <Center style={{ height: '80vh' }}><Loader size="xl" /></Center>;

    return (
        <Container my="lg">
            <Paper withBorder shadow="md" p="lg" radius="md">
                <Title order={2} mb="lg">{isEditMode ? "E'lonni tahrirlash" : "Yangi e'lon yaratish"}</Title>
                <Stepper active={active} onStepClick={setActive} breakpoint="sm" allowNextStepsSelect={false}>
                    <Stepper.Step label="Asosiy ma'lumotlar">
                        <TextInput label="Sarlavha" withAsterisk placeholder="Masalan, 2 xonali kvartira" {...form.getInputProps('name')} mt="md" />
                        <NumberInput label="Narx ($)" withAsterisk placeholder="50000" {...form.getInputProps('price')} min={0} mt="md" />
                        <TextInput label="Manzil" withAsterisk placeholder="Masalan, Amir Temur ko'chasi, 15-uy" {...form.getInputProps('address')} mt="md" />
                        <Select label="Shahar" withAsterisk data={cities} placeholder="Shaharni tanlang" {...form.getInputProps('city')} mt="md" searchable disabled={dataLoading} />
                        <Radio.Group
                            name="agreementTypeSelector"
                            label="Maqsad"
                            value={selectedAgreement}
                            onChange={setSelectedAgreement}
                            withAsterisk
                            mt={"md"}
                        >
                            <Group mt="xs">
                                {agreementTypes.map(agr => (
                                    <Radio key={agr.value} value={agr.value} label={agr.label} />
                                ))}
                            </Group>
                        </Radio.Group>
                        <Select
                            label="E'lon turi"
                            withAsterisk
                            data={filteredTypes} // Endi `types` o'rniga `filteredTypes`dan foydalanamiz
                            placeholder={typesLoading ? "Yuklanmoqda..." : "E'lon turini tanlang"}
                            {...form.getInputProps('listing_type')}
                            mt="md"
                            disabled={typesLoading || !selectedAgreement} // Maqsad tanlanmaguncha yoki yuklanayotganda o'chiq
                        />
                    </Stepper.Step>
                    <Stepper.Step label="Batafsil ma'lumotlar">
                        <Textarea label="Batafsil tavsif" withAsterisk placeholder="E'lon haqida to'liq ma'lumot yozing..." minRows={5} {...form.getInputProps('description')} mt="md" />
                        <MultiSelect label="Qo'shimcha xususiyatlar" data={features} placeholder="Mavjud xususiyatlarni tanlang" {...form.getInputProps('features')} mt="md" searchable disabled={dataLoading} />
                        <SimpleGrid cols={2} mt="md">
                            <NumberInput label="Maydoni (m²)" placeholder="75.5" decimalScale={2} {...form.getInputProps('area')} min={0} />
                            <NumberInput label="Xonalar soni" placeholder="3" {...form.getInputProps('num_rooms')} min={0} />
                            <NumberInput label="Qavati" placeholder="5" {...form.getInputProps('floor')} />
                            <NumberInput label="Umumiy qavatlar" placeholder="9" {...form.getInputProps('num_floors')} min={0} />
                            <NumberInput label="Qurilgan yili" placeholder="2020" {...form.getInputProps('year_built')} min={1900} max={new Date().getFullYear()} hideControls />
                        </SimpleGrid>
                    </Stepper.Step>
                    <Stepper.Step label="Rasmlar">
                        {isEditMode && (<>
                            <Title order={4} mt="md">Mavjud rasmlar</Title>
                            {media.length > 0 ? (
                                <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} mt="sm">{media.map((item) => (
                                    <Card key={item.id} withBorder padding="sm" radius="md">
                                        <Card.Section><Image src={item.path} height={120} /></Card.Section>
                                        <ActionIcon color="red" variant="filled" onClick={() => handleImageDelete(item.id)}
                                            style={{ position: 'absolute', top: 5, right: 5 }}
                                        ><IconX size={16} /></ActionIcon>
                                    </Card>
                                ))}</SimpleGrid>
                            ) : <Text color="dimmed" size="sm" mt="sm">Hozircha rasmlar yo'q.</Text>}
                        </>)}
                        <Title order={4} mt="xl">Yangi rasmlar yuklash</Title>
                        <Dropzone onDrop={setFilesToUpload} maxSize={5 * 1024 ** 2} accept={IMAGE_MIME_TYPE} mt="sm">
                            <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
                                <Dropzone.Accept><IconUpload size={50} stroke={1.5} /></Dropzone.Accept>
                                <Dropzone.Reject><IconX size={50} stroke={1.5} /></Dropzone.Reject>
                                <Dropzone.Idle><IconPhoto size={50} stroke={1.5} /></Dropzone.Idle>
                                <div>
                                    <Text size="xl" inline>Rasmlarni bu yerga tashlang yoki bosing</Text>
                                    <Text size="sm" color="dimmed" inline mt={7}>Har bir fayl 5MB dan oshmasligi kerak</Text>
                                </div>
                            </Group>
                        </Dropzone>
                        {filesToUpload.length > 0 && (<>
                            <SimpleGrid cols={{ base: 2, sm: 4 }} mt="md">{filesToUpload.map((file, index) => (
                                <Image key={index} src={URL.createObjectURL(file)} onLoad={() => URL.revokeObjectURL(file.name)} />
                            ))}</SimpleGrid>
                            {submitting && !isEditMode && (<Group justify="center" mt="md"><RingProgress size={80} roundCaps thickness={8}
                                sections={[{ value: uploadProgress, color: 'blue' }]}
                                label={<Text color="blue" weight={700} align="center" size="sm">{Math.round(uploadProgress)}%</Text>}
                            /></Group>)}
                            {isEditMode && (
                                <Button onClick={handleEditImageUpload} mt="md" loading={submitting}>{filesToUpload.length} ta rasmni yuklash</Button>
                            )}
                        </>)}
                    </Stepper.Step>
                    <Stepper.Step label="Reklama">
                        {isEditMode ? (<>
                            <Title order={4} mt="md">Reklama xizmatlari</Title>
                            <Radio.Group value={selectedPromotion} onChange={setSelectedPromotion} name="promotion" label="Reklama turini tanlang" mt="md">
                                <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xs">{promotions.map(promo => (
                                    <Card withBorder p="md" key={promo.id}
                                        style={{ cursor: 'pointer', borderColor: selectedPromotion === promo.id.toString() ? 'var(--mantine-color-blue-6)' : undefined }}
                                        onClick={() => setSelectedPromotion(promo.id.toString())}
                                    >
                                        <Radio value={promo.id.toString()} label={promo.name} />
                                        <Text size="sm" color="dimmed" mt="xs">{promo.duration_days} kun davomida</Text>
                                        <Text weight={500} mt="xs">${promo.price}</Text>
                                    </Card>
                                ))}</SimpleGrid>
                            </Radio.Group>
                        </>) : (<Text color="dimmed" size="sm" mt="md">E'lonni reklama qilish uchun avval uni tahrirlash sahifasidan foydalaning.</Text>)}
                    </Stepper.Step>
                </Stepper>

                {error && <Alert color="red" title="Xatolik!" mt="lg" withCloseButton onClose={() => setError(null)}>{error}</Alert>}

                <Group justify="space-between" mt="xl">
                    <Button variant="default" onClick={prevStep} disabled={active === 0}>Orqaga</Button>
                    <Group>
                        {isEditMode && (
                            <Button onClick={form.onSubmit(handleSubmit)} loading={submitting}>Ma'lumotlarni Saqlash</Button>
                        )}
                        {active < 3 && <Button onClick={nextStep}>Oldinga</Button>}
                        {!isEditMode && active === 2 && ( // 3-qadamda (rasmlar), yaratish rejimida
                            <Button onClick={nextStep}>Reklamaga o'tish (ixtiyoriy)</Button>
                        )}
                        {!isEditMode && active === 3 && ( // 4-qadamda (reklama), yaratish rejimida
                            <Button color="green" onClick={form.onSubmit(handleSubmit)} loading={submitting}>E'lonni Yaratish</Button>
                        )}
                        {isEditMode && active === 3 && (
                            <Button color="green" onClick={handlePromote} loading={submitting}>Reklamani Faollashtirish</Button>
                        )}
                    </Group>
                </Group>
            </Paper>
        </Container>
    );
}

export default ListingFormPage;