
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Title, Text, TextInput, Button, Group, Loader, Alert, Stack, Box, Avatar } from '@mantine/core';
import { useForm } from '@mantine/form';
import apiClient from '../api/axios';
import useAuthStore from '../store/authStore';

function MessagesPage() {
    const { listingId } = useParams();
    const { user } = useAuthStore();
    const [messages, setMessages] = useState([]);
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const viewport = useRef(null); // Chatni pastga avtomatik scroll qilish uchun


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {

                const [listingRes, messagesRes] = await Promise.all([
                    apiClient.get(`/listings/${listingId}/`),
                    apiClient.get(`/listings/${listingId}/messages/`)
                ]);
                setListing(listingRes.data);
                setMessages(messagesRes.data.results);

                setTimeout(() => viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' }), 100);
            } catch (err) {
                setError("Xabarlarni yuklashda xatolik yuz berdi.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [listingId]);

    const form = useForm({
        initialValues: { content: '' },
        validate: { content: (value) => (value.trim().length > 0 ? null : 'Xabar bo\'sh bo\'lishi mumkin emas') },
    });

    const handleSubmit = async (values) => {
        try {
            const response = await apiClient.post(`/listings/${listingId}/messages/`, values);

            setMessages((currentMessages) => [...currentMessages, response.data]);
            form.reset(); // Formani tozalaymiz

            setTimeout(() => viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' }), 100);
        } catch (err) {
            console.error("Xabar yuborishda xatolik:", err);

        }
    };

    if (loading) return <Container><Loader /></Container>;
    if (error) return <Container><Alert color="red">{error}</Alert></Container>;

    return (
        <Container my="md">
            <Paper shadow="sm" p="md" withBorder>
                <Title order={4}>"{listing?.name}" e'loni bo'yicha yozishma</Title>
                <Text size="sm" color="dimmed">Sotuvchi: {listing?.seller.first_name}</Text>
                
                
                <Box ref={viewport} h={400} style={{ overflowY: 'auto' }} my="md" p="md" bg="gray.0">
                    <Stack>
                        {messages.map(msg => {
                            const isMe = msg.sender.id === user.id;
                            return (
                                <Group key={msg.id} position={isMe ? 'right' : 'left'}>
                                    {!isMe && <Avatar color="blue" radius="xl">{msg.sender.first_name.charAt(0)}</Avatar>}
                                    <Paper withBorder shadow="xs" p="sm" radius="lg" bg={isMe ? 'blue' : 'white'} c={isMe ? 'white' : 'black'}>
                                        <Text>{msg.content}</Text>
                                        <Text size="xs" color={isMe ? 'gray.3' : 'gray.6'} align='right' mt={5}>
                                            {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </Text>
                                    </Paper>
                                    {isMe && <Avatar color="cyan" radius="xl">{user.first_name.charAt(0)}</Avatar>}
                                </Group>
                            );
                        })}
                    </Stack>
                </Box>

                
                {listing?.seller.id !== user.id ? (
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Group>
                            <TextInput
                                placeholder="Xabar yozing..."
                                style={{ flex: 1 }}
                                {...form.getInputProps('content')}
                            />
                            <Button type="submit">Yuborish</Button>
                        </Group>
                    </form>
                ) : (
                    <Text align="center" color="dimmed" mt="md">
                        Bu sizning shaxsiy e'loningiz.
                    </Text>
                )}
            </Paper>
        </Container>
    );
}

export default MessagesPage;