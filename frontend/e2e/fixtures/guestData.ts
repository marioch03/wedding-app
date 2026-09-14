export const mockWeddingData = {
  id: 'wedding-test-1',
  partner1Name: 'Elena',
  partner2Name: 'Alejandro',
  weddingDate: '2026-09-20',
  content: {
    heroSubtitle: 'Nos casamos y queremos celebrarlo contigo',
    coverImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552',
    storyTitle: 'Nuestra Historia',
    storyText: 'Nos conocimos hace diez años en Madrid y desde entonces hemos compartido mil aventuras...',
    storyImageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc',
    hotels: [
      {
        id: 'hotel-1',
        name: 'Hotel Rural La Casona',
        description: 'A 5 minutos de la finca con tarifas especiales para invitados.',
        address: 'Calle Mayor 12, Segovia',
      },
    ],
    faqs: [
      {
        question: '¿Hay transporte organizado?',
        answer: 'Sí, habrá autobuses desde el centro de la ciudad.',
      },
    ],
  },
};

export const mockEventsData = [
  {
    id: 'event-1',
    weddingId: 'wedding-test-1',
    name: 'Ceremonia Civil',
    eventType: 'CEREMONY',
    description: 'Enlace en los jardines principales del palacete.',
    startDatetime: '2026-09-20T17:30:00Z',
    endDatetime: '2026-09-20T19:00:00Z',
    venueName: 'Jardines del Palacete',
    address: 'Camino Viejo de Segovia, s/n',
    displayOrder: 1,
    isPublic: true,
    menuOptions: [],
  },
  {
    id: 'event-2',
    weddingId: 'wedding-test-1',
    name: 'Banquete & Fiesta',
    eventType: 'RECEPTION',
    description: 'Cena en el invernadero de cristal seguida de barra libre.',
    startDatetime: '2026-09-20T20:00:00Z',
    endDatetime: '2026-09-21T03:00:00Z',
    venueName: 'Invernadero de Cristal',
    address: 'Camino Viejo de Segovia, s/n',
    displayOrder: 2,
    isPublic: true,
    menuOptions: [
      { id: 'menu-carne', eventId: 'event-2', name: 'Menú Carne (Solomillo)', isVegetarian: false, isVegan: false, isGlutenFree: false, isChildren: false },
      { id: 'menu-pescado', eventId: 'event-2', name: 'Menú Pescado (Lubina)', isVegetarian: false, isVegan: false, isGlutenFree: false, isChildren: false },
      { id: 'menu-vegano', eventId: 'event-2', name: 'Menú Vegano (Risotto)', isVegetarian: true, isVegan: true, isGlutenFree: true, isChildren: false },
    ],
  },
];

export const mockRsvpInitialParty = {
  partyId: 'party-test-1',
  partyName: 'Familia García',
  status: 'PENDING',
  guests: [
    {
      id: 'guest-1',
      firstName: 'Carlos',
      lastName: 'García',
      isPlusOne: false,
      dietaryRestrictions: '',
      eventAttendances: [],
    },
    {
      id: 'guest-2',
      firstName: '',
      lastName: '',
      isPlusOne: true,
      dietaryRestrictions: '',
      eventAttendances: [],
    },
  ],
  allowedEvents: [
    {
      id: 'event-1',
      name: 'Ceremonia Civil',
      eventType: 'CEREMONY',
      menuOptions: [],
    },
    {
      id: 'event-2',
      name: 'Banquete & Fiesta',
      eventType: 'RECEPTION',
      menuOptions: [
        { id: 'menu-carne', name: 'Menú Carne (Solomillo)', description: 'Solomillo', isVegetarian: false, isVegan: false, isGlutenFree: false, isChildren: false },
        { id: 'menu-pescado', name: 'Menú Pescado (Lubina)', description: 'Lubina', isVegetarian: false, isVegan: false, isGlutenFree: false, isChildren: false },
        { id: 'menu-vegano', name: 'Menú Vegano (Risotto)', description: 'Risotto', isVegetarian: true, isVegan: true, isGlutenFree: true, isChildren: false },
      ],
    },
  ],
};
