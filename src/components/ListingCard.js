
import React from 'react';
import { Card, Image, Text, Skeleton, ActionIcon, Box, Flex } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import useAuthStore from '../store/authStore';

function ListingCard({ listing, loading, onFavoriteToggle }) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleFavoriteClick = (e) => {

    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }


    if (onFavoriteToggle) {
      onFavoriteToggle(listing.id, !listing.is_favorite);
    }
  };

  if (loading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Skeleton height={160} />
        </Card.Section>
        <Skeleton height={8} mt="md" />
        <Skeleton height={8} mt="xs" width="70%" />
        <Skeleton height={8} mt="md" width="40%" />
      </Card>
    );
  }

  return (

    <Box
      component={Link}
      to={`/listings/${listing.id}`}
      style={{ textDecoration: 'none' }}
    >
      <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
        <Card.Section>
          <Image
            src={listing.cover_image}
            height={250}
            alt={listing.name}
          />
        </Card.Section>

        <Flex justify="space-between" align="center" mt="md" mb="xs" w="100%">
          <Flex align="center" gap="sm">
            <Text fw={500}>{listing.name}</Text>

          </Flex>

          <ActionIcon
            variant="transparent"
            color="red"
            onClick={handleFavoriteClick}
          >
            {listing.is_favorite ? <IconHeartFilled size={24} /> : <IconHeart size={24} />}
          </ActionIcon>
        </Flex>

        <Flex>
          <Text size="sm" color="dimmed">
            {listing.city}, {listing.address}
          </Text>
        </Flex>

        <Text weight={700} size="xl" mt="md" color='blue'>
          {new Intl.NumberFormat('en-US').format(listing.price)} UZS
        </Text>
      </Card>
    </Box>
  );
}

export default ListingCard;