// src/pages/ProfilePage.js
import { Title } from '@mantine/core';
import useAuthStore from '../store/authStore';
import React from 'react';

function ProfilePage() {
    const user = useAuthStore((state) => state.user);

    return (
        <div>
            <Title>Shaxsiy Kabinet</Title>
            <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
    );
}

export default ProfilePage;