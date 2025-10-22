import { mockLibraries } from './mockData';

// Define a type for the full library object based on your mock data
export type FullLibrary = typeof mockLibraries[0];

// --- FAKE API FUNCTION 1: Get a list of libraries (with filters) ---
export const getLibraries = (filters: { search: string, status: string, city: string, state: string }): Promise<Partial<FullLibrary>[]> => {
  return new Promise(resolve => {
    setTimeout(() => { // Simulate network delay
      let results = mockLibraries;
      
      // Filtering logic
      if (filters.search) {
        results = results.filter(lib => lib.libraryName.toLowerCase().includes(filters.search.toLowerCase()));
      }
      if (filters.status && filters.status !== 'ALL') {
        results = results.filter(lib => lib.reviewStatus === filters.status);
      }
      if (filters.city) {
        results = results.filter(lib => lib.city.toLowerCase().includes(filters.city.toLowerCase()));
      }
       if (filters.state) {
        results = results.filter(lib => lib.state.toLowerCase().includes(filters.state.toLowerCase()));
      }

      resolve(results);
    }, 300);
  });
};

// const plans = [
//   { id: 'plan-1', planType: 'Monthly', startTime: '08:00', endTime: '22:00', price: 2500, description: 'Full day access' },
//   { id: 'plan-2', planType: 'Daily', startTime: '09:00', endTime: '17:00', price: 200, description: 'Day pass' }
// ];
// const lockers = [
//   { id: 'lock-1', type: 'Small', quantity: 20, charge: 300, notes: 'For personal belongings' }
// ]

export type Locker = {
    id: string;
    type: string;
    quantity: number;
    charge: number;
    notes: string;
}[];

export type Plan = {
  id: string;
  planType: string;
  startTime: string;
  endTime: string;
  price: number;
  description: string;
}[];

// --- FAKE API FUNCTION 2: Get a locker info of library by its ID ---
// export const locker = (id: string): Promise<FullLibrary["lockers"] | undefined> => {
//     return new Promise(resolve => {
//         setTimeout(() => { // Simulate network delay
//             const library = mockLibraries.find(lib => lib.id === id);
//             if(library) {
//               resolve(library.lockers);
//             }
//         }, 300);
//     });
// };

// --- FAKE API FUNCTION 2: Get a single library by its ID ---
export const getLibraryById = (id: string): Promise<FullLibrary | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => { // Simulate network delay
            const library = mockLibraries.find(lib => lib.id === id);
            resolve(library);
        }, 300);
    });
};

// --- FAKE API FUNCTION 2: Get a plan info of library by its ID ---
// export const plan = (id: string): Promise<FullLibrary["plans"] | undefined> => {
//     return new Promise(resolve => {
//         setTimeout(() => { // Simulate network delay
//             const library = mockLibraries.find(lib => lib.id === id);
//             if(library) 
//               resolve(library.plans);
//         }, 300);
//     });
// };
