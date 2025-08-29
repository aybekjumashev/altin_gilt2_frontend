// src/components/ListingFilters.js
import React, { useState, useEffect } from 'react';
import { SimpleGrid, Select, NumberInput, Button, Paper } from '@mantine/core';
import apiClient from '../api/axios';

function ListingFilters({ onFilterChange }) {
  const [cities, setCities] = useState([]);
  const [listingTypes, setListingTypes] = useState([]);

  // Filtrlar uchun state
  const [filters, setFilters] = useState({
    city: '',
    listing_type: '',
    num_rooms: '',
    price__gte: '', // Narx (dan)
    price__lte: '', // Narx (gacha)
  });

  // Komponent birinchi marta render bo'lganda shahar va e'lon turlarini yuklaymiz
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [citiesRes, typesRes] = await Promise.all([
          apiClient.get('/cities/'),
          apiClient.get('/listing-types/'),
        ]);
        
        // API'dan kelgan ma'lumotlarni Select komponentiga mos formatga o'tkazamiz
        setCities(citiesRes.data.results.map(city => ({ value: city.id.toString(), label: city.name })));
        setListingTypes(typesRes.data.results.map(type => ({ value: type.id.toString(), label: type.name })));
      } catch (error) {
        console.error("Filtr ma'lumotlarini yuklashda xatolik:", error);
      }
    };
    fetchFilterData();
  }, []);

  const handleInputChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    // onFilterChange prop'i orqali HomePage komponentiga tanlangan filtrlarni yuboramiz
    onFilterChange(filters);
  };
  
  const handleReset = () => {
    const resetFilters = {
      city: '',
      listing_type: '',
      num_rooms: '',
      price__gte: '',
      price__lte: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters); // Tozalangan filtrlarni ham yuboramiz
  };

  return (
    <Paper shadow="sm" p="md" withBorder mb="lg">
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 6 }} spacing="md">
        <Select
          label="Shahar"
          placeholder="Shaharni tanlang"
          data={cities}
          value={filters.city}
          onChange={(value) => handleInputChange('city', value)}
          clearable
        />
        <Select
          label="E'lon turi"
          placeholder="Turni tanlang"
          data={listingTypes}
          value={filters.listing_type}
          onChange={(value) => handleInputChange('listing_type', value)}
          clearable
        />
        <NumberInput
          label="Xonalar soni"
          placeholder="Masalan, 3"
          value={filters.num_rooms}
          onChange={(value) => handleInputChange('num_rooms', value)}
          min={0}
        />
        <NumberInput
          label="Narx (dan)"
          placeholder="10000"
          value={filters.price__gte}
          onChange={(value) => handleInputChange('price__gte', value)}
          min={0}
        />
        <NumberInput
          label="Narx (gacha)"
          placeholder="50000"
          value={filters.price__lte}
          onChange={(value) => handleInputChange('price__lte', value)}
          min={0}
        />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          <Button onClick={handleSearch} fullWidth>
            Qidirish
          </Button>
          <Button onClick={handleReset} variant="outline" fullWidth>
            Tozalash
          </Button>
        </div>
      </SimpleGrid>
    </Paper>
  );
}

export default ListingFilters;