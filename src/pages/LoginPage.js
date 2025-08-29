// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Paper, TextInput, Button, Center, Alert, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';
import apiClient from '../api/axios';
import useAuthStore from '../store/authStore';

function LoginPage() {
    const navigate = useNavigate();
    const loginAction = useAuthStore((state) => state.login);
    const fetchUserAction = useAuthStore((state) => state.fetchUser);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const form = useForm({
        initialValues: {
            code: '',
        },
        validate: {
            code: (value) => (value.length === 6 ? null : 'Kod 6 xonali bo\'lishi kerak'),
        },
    });

    const handleSubmit = async (values) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.post('/auth/verify-code/', {
                code: values.code,
            });

            // Backend javobini tahlil qilamiz
            if (response.data.status === 'login_successful') {
                // Variant A: Muvaffaqiyatli kirish
                loginAction({ access: response.data.access, refresh: response.data.refresh });
                await fetchUserAction(); // Foydalanuvchi ma'lumotlarini yuklaymiz
                navigate('/profile'); // Profil sahifasiga o'tkazamiz
            } else if (response.data.status === 'registration_required') {
                // Variant B: Registratsiya talab qilinadi
                navigate('/complete-registration', {
                    state: { registration_token: response.data.registration_token },
                });
            } else {
                 setError('Noma\'lum javob. Backend bilan bog\'laning.');
            }

        } catch (err) {
            setError(err.response?.data?.detail || 'Kod xato yoki eskirgan.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size={420} my={40}>
            <Title align="center">Kirish</Title>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput
                        label="Telegramdan kelgan kod"
                        placeholder="123456"
                        required
                        {...form.getInputProps('code')}
                    />

                    {error && (
                        <Alert title="Xatolik!" color="red" withCloseButton onClose={() => setError(null)} mt="md">
                            {error}
                        </Alert>
                    )}

                    <Button type="submit" fullWidth mt="xl" disabled={loading}>
                        {loading ? <Loader size="sm" /> : "Kirish"}
                    </Button>
                </form>
            </Paper>
            <Center mt="md">
                <p>Telegram botimiz orqali kod oling.</p>
            </Center>
        </Container>
    );
}

export default LoginPage;