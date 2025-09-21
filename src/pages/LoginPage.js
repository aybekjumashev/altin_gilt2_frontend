
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Paper, TextInput, Button, Center, Alert, Loader, PinInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import apiClient from '../api/axios';
import useAuthStore from '../store/authStore';

function LoginPage() {
    const navigate = useNavigate();
    const loginAction = useAuthStore((state) => state.login);
    const fetchUserAction = useAuthStore((state) => state.fetchUser);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false); // ✅ yangi state

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
        setSuccess(false);
        try {
            const response = await apiClient.post('/auth/verify-code/', {
                code: values.code,
            });

            if (response.data.status === 'login_successful') {
                setSuccess(true); // ✅ border yashil bo‘lsin
                loginAction({ access: response.data.access, refresh: response.data.refresh });
                await fetchUserAction();
                navigate('/');
            } else if (response.data.status === 'registration_required') {
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
            <Center mt="md">
                <p><a href='tg://resolve?domain=altingilt_loginbot'>@altingilt_loginbot</a> telegram boti orqali kod oling.</p>
            </Center>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <PinInput
                        size="xl"
                        length={6}
                        type="number"
                        required
                        {...form.getInputProps('code')}
                        onComplete={(value) => handleSubmit({ code: value })}
                        error={!!error} // ❌ xato bo‘lsa qizil border
                        styles={{
                            input: {
                                borderColor: success ? 'green' : undefined, // ✅ success bo‘lsa yashil
                            },
                        }}
                    />

                    {error && (
                        <Alert title="Xatolik!" color="red" withCloseButton onClose={() => setError(null)} mt="md">
                            {error}
                        </Alert>
                    )}

                    {loading && (
                        <Center mt="md">
                            <Loader size="sm" />
                        </Center>
                    )}
                </form>
            </Paper>
        </Container>
    );
}


export default LoginPage;