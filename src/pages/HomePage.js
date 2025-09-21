import React, { useState, useEffect, useCallback } from 'react';
import { Container, SimpleGrid, Pagination, Title, Center, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react'; // Xatolik ikonkasini import qilamiz
import apiClient from '../api/axios';
import ListingCard from '../components/ListingCard';
import ListingFilters from '../components/ListingFilters'; // Filtrlar komponentini import qilamiz

function HomePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [activePage, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({});

  const handleFavoriteToggle = async (listingId, newFavoriteStatus) => {

    setListings(currentListings =>
      currentListings.map(l =>
        l.id === listingId ? { ...l, is_favorite: newFavoriteStatus } : l
      )
    );

    try {
      await apiClient.post(`/listings/${listingId}/favorite/`);
    } catch (err) {
      console.error("Sevimlilarni o'zgartirishda xatolik:", err);

      setListings(currentListings =>
        currentListings.map(l =>
          l.id === listingId ? { ...l, is_favorite: !newFavoriteStatus } : l
        )
      );
    }
  };


  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);


    const activeFilters = Object.entries(filters)
      .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});


    const params = new URLSearchParams({
      page: activePage,
      ...activeFilters,
    }).toString();

    try {
      const response = await apiClient.get(`/listings/?${params}`);
      setListings(response.data.results);

      const count = response.data.count;



      const itemsPerPage = 10;
      setTotalPages(Math.ceil(count / itemsPerPage));

    } catch (err) {
      setError("E'lonlarni yuklashda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activePage, filters]);



  useEffect(() => {
    fetchListings();
  }, [fetchListings]);


  const handleFilterChange = (newFilters) => {
    setPage(1); // Filtr o'zgarganda har doim birinchi sahifaga qaytamiz
    setFilters(newFilters);
  };


  if (error && !loading) {
    return (
      <Container>
        <Center style={{ height: '50vh', flexDirection: 'column' }}>
          <Alert icon={<IconAlertCircle size="1rem" />} title="Xatolik!" color="red">
            {error}
          </Alert>
        </Center>
      </Container>
    );
  }

  return (
    <Container my="md" size="xl">
      <Title order={2} mb="lg">
        E'lonlar
      </Title>

      
      <ListingFilters onFilterChange={handleFilterChange} />

      
      {loading ? (

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {Array.from({ length: 9 }).map((_, index) => (
            <ListingCard key={index} loading={true} />
          ))}
        </SimpleGrid>
      ) : (
        <>
          {listings.length === 0 ? (

            <Center style={{ height: '20vh' }}>
              <Title order={4} color="dimmed">Sizning qidiruvingiz bo'yicha hech qanday e'lon topilmadi.</Title>
            </Center>
          ) : (

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onFavoriteToggle={handleFavoriteToggle} />
              ))}
            </SimpleGrid>
          )}

          
          <Center mt="xl">
            {totalPages > 1 && (
              <Pagination
                value={activePage}
                onChange={setPage}
                total={totalPages}
              />
            )}
          </Center>
        </>
      )}
    </Container>
  );
}

export default HomePage;