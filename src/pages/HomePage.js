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

  // Pagination va Filtrlash uchun state'lar
  const [activePage, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({});

  // useCallback yordamida funksiyani optimallashtiramiz
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Filtr obyektidan faqat qiymati bor (bo'sh bo'lmagan) parametrlarni olamiz
    const activeFilters = Object.entries(filters)
      .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    // URL parametrlarini yaratamiz
    const params = new URLSearchParams({
      page: activePage,
      ...activeFilters,
    }).toString();

    try {
      const response = await apiClient.get(`/listings/?${params}`);
      setListings(response.data.results);
      
      const count = response.data.count;
      // Backend paginatsiyasida har sahifadagi elementlar sonini bilish kerak.
      // DRF odatda birinchi javobda bu ma'lumotni bermaydi. Biz uni statik belgilaymiz.
      // Agar backend har xil sondagi element qaytarsa, bu joyni moslash kerak bo'ladi.
      const itemsPerPage = 10; 
      setTotalPages(Math.ceil(count / itemsPerPage));

    } catch (err) {
      setError("E'lonlarni yuklashda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activePage, filters]);

  // `fetchListings` funksiyasi o'zgarganda (ya'ni `activePage` yoki `filters` o'zgarganda)
  // uni avtomatik chaqiramiz.
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // ListingFilters komponentidan kelgan yangi filtrlarni qabul qiladigan funksiya
  const handleFilterChange = (newFilters) => {
    setPage(1); // Filtr o'zgarganda har doim birinchi sahifaga qaytamiz
    setFilters(newFilters);
  };

  // Xatolik bo'lsa, maxsus xabar ko'rsatamiz
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
      
      {/* Filtrlar komponenti */}
      <ListingFilters onFilterChange={handleFilterChange} />

      {/* Yuklanish va Natijalar qismi */}
      {loading ? (
        // Yuklanish holatida skeletlarni ko'rsatamiz
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {Array.from({ length: 9 }).map((_, index) => (
            <ListingCard key={index} loading={true} />
          ))}
        </SimpleGrid>
      ) : (
        <>
          {listings.length === 0 ? (
            // Agar natija bo'sh bo'lsa
            <Center style={{ height: '20vh' }}>
                <Title order={4} color="dimmed">Sizning qidiruvingiz bo'yicha hech qanday e'lon topilmadi.</Title>
            </Center>
          ) : (
            // Natijalar mavjud bo'lsa
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </SimpleGrid>
          )}

          {/* Pagination */}
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