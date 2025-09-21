
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Title, Paper, TextInput, Button, Alert, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';
import apiClient from '../api/axios';
import useAuthStore from '../store/authStore';

function CompleteRegistrationPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const loginAction = useAuthStore((state) => state.login);
    const fetchUserAction = useAuthStore((state) => state.fetchUser);


    const registrationToken = location.state?.registration_token;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const form = useForm({
        initialValues: {
            first_name: '',
            last_name: '',
        },
        validate: {
            first_name: (value) => (value.trim().length > 0 ? null : 'Ism kiritilishi shart'),
            last_name: (value) => (value.trim().length > 0 ? null : 'Familiya kiritilishi shart'),
        },
    });
    

    if (!registrationToken) {
        navigate('/login');
        return <Container><Alert color="red">Ro'yxatdan o'tish tokeni topilmadi. Iltimos, qaytadan urinib ko'ring.</Alert></Container>;
    }

    const handleSubmit = async (values) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.post('/auth/complete-registration/', {
                ...values,
                registration_token: registrationToken,
            });

            if (response.data.status === 'registration_successful') {
                loginAction({ access: response.data.access, refresh: response.data.refresh });
                await fetchUserAction();
                navigate('/');
            } else {
                setError('Noma\'lum xatolik yuz berdi.');
            }

        } catch (err) {
            setError(err.response?.data?.detail || 'Ro\'yxatdan o\'tishda xatolik yuz berdi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size={420} my={40}>
            <Title align="center">Ro'yxatdan o'tish</Title>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput label="Ism" placeholder="Ali" required {...form.getInputProps('first_name')} />
                    <TextInput label="Familiya" placeholder="Valiyev" required mt="md" {...form.getInputProps('last_name')} />
                    
                    {error && (
                         <Alert title="Xatolik!" color="red" withCloseButton onClose={() => setError(null)} mt="md">
                            {error}
                        </Alert>
                    )}

                    <Button type="submit" fullWidth mt="xl" disabled={loading}>
                         {loading ? <Loader size="sm" /> : "Saqlash va Kirish"}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}

export default CompleteRegistrationPage;