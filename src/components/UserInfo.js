
import { TextInput, Button, Group, Box, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import useAuthStore from '../store/authStore';
import apiClient from '../api/axios';
import { notifications } from '@mantine/notifications'; // <-- SHUNI QO'SHING
import { IconCheck, IconX } from '@tabler/icons-react'; // <-- SHUNI QO'SHING

function UserInfo() {

    const { user, fetchUser } = useAuthStore();

    const form = useForm({

        initialValues: {
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
        },
        validate: {
            first_name: (value) => value.trim().length < 2 ? 'Ism kamida 2 belgidan iborat bo\'lishi kerak' : null,
            last_name: (value) => value.trim().length < 2 ? 'Familiya kamida 2 belgidan iborat bo\'lishi kerak' : null,
        },
    });

    const handleSubmit = async (values) => {
        try {
            await apiClient.patch('/users/me/', values);
            notifications.show({
                title: 'Muvaffaqiyatli!',
                message: 'Ma\'lumotlaringiz yangilandi.',
                color: 'teal',
                icon: <IconCheck />,
            });
            await fetchUser();
        } catch (err) {
            notifications.show({
                title: 'Xatolik!',
                message: 'Ma\'lumotlarni yangilashda xatolik yuz berdi.',
                color: 'red',
                icon: <IconX />,
            });
        }
    };

    if (!user) {
        return <Text>Ma'lumotlar yuklanmoqda...</Text>;
    }

    return (
        <Box maw={400} mt="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput
                    withAsterisk
                    label="Telefon raqami"
                    value={user.phone_number}
                    disabled
                />
                <TextInput
                    withAsterisk
                    label="Ism"
                    placeholder="Ismingizni kiriting"
                    {...form.getInputProps('first_name')}
                    mt="md"
                />
                <TextInput
                    withAsterisk
                    label="Familiya"
                    placeholder="Familiyangizni kiriting"
                    {...form.getInputProps('last_name')}
                    mt="md"
                />

                <Group position="right" mt="md">
                    <Button type="submit" loading={form.isDirty() && form.isValid()}>
                        Saqlash
                    </Button>
                </Group>
            </form>
        </Box>
    );
}

export default UserInfo;