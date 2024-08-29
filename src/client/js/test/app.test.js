import { addDestination, getTripInfo, destinations, getLastAddedCity } from '../app';

describe('addDestination', () => {
    test('should add a new destination and update lastAddedCity', () => {
        const city = 'Paris';
        const date = '2024-09-10';
        addDestination(city, date);

        expect(destinations.length).toBe(1);
        expect(destinations[0].city).toBe(city);
        expect(getLastAddedCity()).toBe(city);
    });


});

  // Mocking the global fetch function
  global.fetch = jest.fn();

  // Mocking the DOM elements
  beforeEach(() => {
      document.body.innerHTML = `
          <div id="trip-list"></div>
          <div id="trip-info"></div>
      `;
      destinations.length = 0; // Reset destinations array before each test
      jest.clearAllMocks(); // Clear any previous mocks
  });
  
  
  describe('getTripInfo', () => {
      test('should fetch trip info successfully', async () => {
          // Mock API responses
          global.fetch
              .mockResolvedValueOnce({
                  json: () => Promise.resolve({
                      geonames: [{ countryName: 'France', lat: 48.8566, lng: 2.3522 }],
                  }),
              })
              .mockResolvedValueOnce({
                  json: () => Promise.resolve({ datetime: '2024-09-10T14:00:00Z', timezone: 'Europe/Paris' }),
              })
              .mockResolvedValueOnce({
                  json: () => Promise.resolve([{ region: 'Europe' }]),
              })
              .mockResolvedValueOnce({
                  json: () => Promise.resolve({ data: [{ weather: { description: 'Clear' }, temp: 25 }] }),
              })
              .mockResolvedValueOnce({
                  json: () => Promise.resolve({ hits: [{ webformatURL: 'https://example.com/paris.jpg' }] }),
              });
  
          const city = 'Paris';
          await getTripInfo(city);
  
          expect(global.fetch).toHaveBeenCalledTimes(5);
          expect(document.getElementById('trip-info').innerHTML).toContain('France');
      });
  
      test('should handle errors gracefully', async () => {
          global.fetch.mockRejectedValue(new Error('API Error'));
  
          const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
          await getTripInfo('InvalidCity');
  
          expect(consoleSpy).toHaveBeenCalledWith('Error fetching trip info:', expect.any(Error));
          consoleSpy.mockRestore();
      });
  });

