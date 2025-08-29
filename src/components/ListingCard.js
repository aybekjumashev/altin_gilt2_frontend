// src/components/ListingCard.js
import React from 'react';
import { Card, Image, Text, Badge, Group, Skeleton } from '@mantine/core';
import { Link } from 'react-router-dom';

function ListingCard({ listing, loading }) {
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
    <Card shadow="sm" padding="lg" radius="md" withBorder component={Link} to={`/listings/${listing.id}`}>
      <Card.Section>
        {/* Hozircha rasm yo'q, shuning uchun placeholder */}
        <Image
          src={listing.cover_image || 'https://placehold.co/400x250.png?text=Image'}
          height={160}
          alt={listing.name}
        />
      </Card.Section>

      <Group position="apart" mt="md" mb="xs">
        <Text weight={500}>{listing.name}</Text>
        <Badge color="pink" variant="light">
          {listing.city}
        </Badge>
      </Group>

      <Text size="sm" color="dimmed">
        {listing.address}
      </Text>

      <Text weight={700} size="xl" mt="md">
        ${new Intl.NumberFormat('en-US').format(listing.price)}
      </Text>
    </Card>
  );
}

export default ListingCard;