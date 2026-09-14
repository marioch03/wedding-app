import { http, HttpResponse } from 'msw';
import type {
  WeddingPublicResponse,
  WeddingResponse,
  WeddingRequest,
  RsvpInfoResponse,
  EventResponse,
  EventRequest,
  MenuOptionResponse,
  MenuOptionRequest,
  PartyResponse,
  PartyUpsertRequest,
  GuestResponse,
  GuestRequest,
  RsvpStatsResponse,
  CateringReportResponse,
} from '../../types';

export const mockWeddingPublic: WeddingPublicResponse = {
  id: 'wed-1111-2222',
  partner1Name: 'Elena',
  partner2Name: 'Carlos',
  weddingDate: '2026-10-18',
  content: {
    heroSubtitle: 'Nos casamos y queremos celebrarlo contigo',
    coverImageUrl: 'https://images.unsplash.com/photo-example-cover',
    storyTitle: 'Nuestra Historia',
    storyText: 'Nos conocimos en el verano de 2018...',
    storyImageUrl: 'https://images.unsplash.com/photo-example-story',
    galleryImages: ['https://images.unsplash.com/photo-1', 'https://images.unsplash.com/photo-2'],
    dressCode: 'Elegante / Traje y Vestido Cóctel',
    accommodations: 'Hotel Hacienda del Sol',
    transportInfo: 'Autobuses desde Plaza Mayor a las 16:30h',
    faqs: [
      { question: '¿Hay aparcamiento?', answer: 'Sí, gratuito en la finca.' },
      { question: '¿Se admiten niños?', answer: 'Sí, contaremos con animación infantil.' },
    ],
  },
};

export const mockWeddingAdmin: WeddingResponse = {
  ...mockWeddingPublic,
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-01-02T12:00:00Z',
};

export const mockMenuOptionsEv2: MenuOptionResponse[] = [
  {
    id: 'menu-1',
    eventId: 'ev-2',
    name: 'Solomillo Ibérico con Salsa Trufada',
    description: 'Acompañado de milhojas de patata',
    dietType: 'STANDARD',
    displayOrder: 1,
  },
  {
    id: 'menu-2',
    eventId: 'ev-2',
    name: 'Risotto de Setas Silvestres y Espárragos',
    description: 'Con parmesano curado y aceite de trufa blanca',
    dietType: 'VEGETARIAN',
    displayOrder: 2,
  },
  {
    id: 'menu-3',
    eventId: 'ev-2',
    name: 'Menú Infantil Divertido',
    description: 'Pasta casera y pechuga crujiente',
    dietType: 'CHILD',
    displayOrder: 3,
  },
];

export const mockEvents: EventResponse[] = [
  {
    id: 'ev-1',
    weddingId: 'wed-1111-2222',
    name: 'Ceremonia Religiosa',
    eventType: 'CEREMONY',
    description: 'Ceremonia en la capilla de los jardines.',
    startDatetime: '2026-10-18T17:00:00Z',
    endDatetime: '2026-10-18T18:00:00Z',
    venueName: 'Capilla Los Pinos',
    address: 'Camino Viejo de la Sierra, Km 4, Madrid',
    displayOrder: 1,
    isPublic: true,
    menuOptions: [],
  },
  {
    id: 'ev-2',
    weddingId: 'wed-1111-2222',
    name: 'Cóctel y Banquete',
    eventType: 'RECEPTION',
    description: 'Aperitivo en los jardines y cena en el salón principal.',
    startDatetime: '2026-10-18T18:30:00Z',
    endDatetime: '2026-10-18T23:00:00Z',
    venueName: 'Finca Bellavista',
    address: 'Camino Real 12, Madrid',
    displayOrder: 2,
    isPublic: true,
    menuOptions: mockMenuOptionsEv2,
  },
];

export const mockRsvpInfo: RsvpInfoResponse = {
  partyId: 'party-123',
  partyName: 'Familia Gómez Martínez',
  status: 'PENDING',
  guests: [
    {
      id: 'guest-1',
      firstName: 'Marcos',
      lastName: 'Gómez',
      isPlusOne: false,
      dietaryRestrictions: '',
    },
    {
      id: 'guest-2',
      firstName: '',
      lastName: '',
      isPlusOne: true,
      dietaryRestrictions: '',
    },
  ],
  allowedEvents: [
    {
      id: 'ev-1',
      name: 'Ceremonia Religiosa',
      eventType: 'CEREMONY',
      menuOptions: [],
    },
    {
      id: 'ev-2',
      name: 'Cóctel y Banquete',
      eventType: 'RECEPTION',
      menuOptions: mockMenuOptionsEv2.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        dietType: m.dietType,
        displayOrder: m.displayOrder,
      })),
    },
  ],
};

export const mockParties: PartyResponse[] = [
  {
    id: 'party-1',
    displayName: 'Familia Gómez Martínez',
    rsvpToken: 'GOM824',
    languagePreference: 'es',
    internalNotes: 'Mesa presidencial',
    status: 'CONFIRMED',
    eventIds: ['ev-1', 'ev-2'],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'party-2',
    displayName: 'Carlos & Laura',
    rsvpToken: 'CAR456',
    languagePreference: 'es',
    status: 'PENDING',
    eventIds: ['ev-1'],
    createdAt: '2026-01-11T10:00:00Z',
    updatedAt: '2026-01-11T10:00:00Z',
  },
];

export const mockRsvpStats: RsvpStatsResponse = {
  totalParties: 2,
  confirmedParties: 1,
  declinedParties: 0,
  partialParties: 0,
  pendingParties: 1,
  totalGuests: 2,
  confirmedGuests: 2,
  declinedGuests: 0,
  pendingGuests: 0,
  responseRatePercentage: 50,
  eventStats: [
    {
      eventId: 'ev-1',
      eventName: 'Ceremonia Religiosa',
      eventType: 'CEREMONY',
      confirmedCount: 2,
      declinedCount: 0,
      pendingCount: 0,
      totalInvitedCount: 2,
    },
    {
      eventId: 'ev-2',
      eventName: 'Cóctel y Banquete',
      eventType: 'RECEPTION',
      confirmedCount: 1,
      declinedCount: 1,
      pendingCount: 0,
      totalInvitedCount: 2,
    },
  ],
};

export const mockCateringReport: CateringReportResponse = {
  totalConfirmedAttendees: 2,
  attendeesWithDietaryAlertsCount: 1,
  menuCounts: [
    { menuOptionId: 'menu-1', menuOptionName: 'Solomillo Ibérico', dietType: 'STANDARD', count: 1 },
    { menuOptionId: 'menu-2', menuOptionName: 'Risotto de Setas', dietType: 'VEGAN', count: 1 },
  ],
  attendeesWithDietaryAlerts: [
    {
      guestId: 'guest-2',
      guestName: 'Laura Vega',
      partyDisplayName: 'Familia Gómez Martínez',
      eventId: 'ev-2',
      eventName: 'Cóctel y Banquete',
      menuOptionName: 'Risotto de Setas',
      dietType: 'VEGAN',
      dietaryRestrictions: 'Celíaca / Sin Gluten',
      specialNotes: 'Alérgica severa a frutos secos',
    },
  ],
  allSelections: [
    {
      guestId: 'guest-1',
      guestName: 'Marcos Gómez',
      partyDisplayName: 'Familia Gómez Martínez',
      eventId: 'ev-2',
      eventName: 'Cóctel y Banquete',
      menuOptionName: 'Solomillo Ibérico',
      dietType: 'STANDARD',
      dietaryRestrictions: '',
      specialNotes: '',
    },
    {
      guestId: 'guest-2',
      guestName: 'Laura Vega',
      partyDisplayName: 'Familia Gómez Martínez',
      eventId: 'ev-2',
      eventName: 'Cóctel y Banquete',
      menuOptionName: 'Risotto de Setas',
      dietType: 'VEGAN',
      dietaryRestrictions: 'Celíaca / Sin Gluten',
      specialNotes: 'Alérgica severa a frutos secos',
    },
  ],
};

export const handlers = [
  // --- Public Wedding ---
  http.get('*/api/v1/public/wedding', () => {
    return HttpResponse.json(mockWeddingPublic);
  }),
  http.get('*/api/public/wedding', () => {
    return HttpResponse.json(mockWeddingPublic);
  }),

  // --- Public Events ---
  http.get('*/api/v1/public/events', () => {
    const publicEvents = mockEvents.filter((e) => e.isPublic !== false);
    return HttpResponse.json(publicEvents);
  }),
  http.get('*/api/public/events', () => {
    const publicEvents = mockEvents.filter((e) => e.isPublic !== false);
    return HttpResponse.json(publicEvents);
  }),

  // --- Admin Wedding ---
  http.get('*/api/v1/admin/weddings/current', () => {
    return HttpResponse.json(mockWeddingAdmin);
  }),
  http.get('*/api/admin/wedding/current', () => {
    return HttpResponse.json(mockWeddingAdmin);
  }),

  http.put('*/api/v1/admin/weddings/:id', async ({ request }) => {
    const body = (await request.json()) as Partial<WeddingRequest>;
    return HttpResponse.json({
      ...mockWeddingAdmin,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),
  http.put('*/api/admin/wedding/:id', async ({ request }) => {
    const body = (await request.json()) as Partial<WeddingRequest>;
    return HttpResponse.json({
      ...mockWeddingAdmin,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  // --- Public RSVP ---
  http.get('*/api/v1/public/rsvp/:token', ({ params }) => {
    const { token } = params;
    if (token === 'INVALID_TOKEN') {
      return HttpResponse.json(
        {
          status: 404,
          error: 'Not Found',
          message: 'No se encontró la invitación con el token proporcionado.',
        },
        { status: 404 }
      );
    }
    return HttpResponse.json(mockRsvpInfo);
  }),
  http.get('*/api/public/rsvp/:token', ({ params }) => {
    const { token } = params;
    if (token === 'INVALID_TOKEN') {
      return HttpResponse.json(
        {
          status: 404,
          error: 'Not Found',
          message: 'No se encontró la invitación con el token proporcionado.',
        },
        { status: 404 }
      );
    }
    return HttpResponse.json(mockRsvpInfo);
  }),

  http.post('*/api/v1/public/rsvp/:token', async ({ request, params }) => {
    const { token } = params;
    if (token === 'FAIL_SUBMIT') {
      return HttpResponse.json(
        {
          status: 400,
          error: 'Bad Request',
          message: 'Error al procesar la confirmación',
          fieldErrors: {
            'guests[0].firstName': 'El nombre del invitado es requerido',
          },
        },
        { status: 400 }
      );
    }
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      message: 'RSVP guardado correctamente',
      data: body,
    });
  }),
  http.post('*/api/public/rsvp/:token', async ({ request, params }) => {
    const { token } = params;
    if (token === 'FAIL_SUBMIT') {
      return HttpResponse.json(
        {
          status: 400,
          error: 'Bad Request',
          message: 'Error al procesar la confirmación',
          fieldErrors: {
            'guests[0].firstName': 'El nombre del invitado es requerido',
          },
        },
        { status: 400 }
      );
    }
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      message: 'RSVP guardado correctamente',
      data: body,
    });
  }),

  // --- Admin Events ---
  http.get('*/api/v1/admin/events', () => {
    return HttpResponse.json(mockEvents);
  }),
  http.get('*/api/admin/events', () => {
    return HttpResponse.json(mockEvents);
  }),

  http.post('*/api/v1/admin/events', async ({ request }) => {
    const body = (await request.json()) as EventRequest;
    const newEvent: EventResponse = {
      id: `ev-${Date.now()}`,
      weddingId: body.weddingId || 'wed-1111-2222',
      name: body.name,
      eventType: body.eventType,
      description: body.description,
      startDatetime: body.startDatetime,
      endDatetime: body.endDatetime,
      venueName: body.venueName,
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      displayOrder: body.displayOrder || 1,
      isPublic: body.isPublic ?? true,
    };
    return HttpResponse.json(newEvent, { status: 201 });
  }),
  http.post('*/api/admin/events', async ({ request }) => {
    const body = (await request.json()) as EventRequest;
    const newEvent: EventResponse = {
      id: `ev-${Date.now()}`,
      weddingId: body.weddingId || 'wed-1111-2222',
      name: body.name,
      eventType: body.eventType,
      description: body.description,
      startDatetime: body.startDatetime,
      endDatetime: body.endDatetime,
      venueName: body.venueName,
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      displayOrder: body.displayOrder || 1,
      isPublic: body.isPublic ?? true,
    };
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('*/api/v1/admin/events/:id', async ({ request, params }) => {
    const body = (await request.json()) as Partial<EventRequest>;
    const { id } = params;
    return HttpResponse.json({
      ...mockEvents[0],
      ...body,
      id: id as string,
    });
  }),
  http.put('*/api/admin/events/:id', async ({ request, params }) => {
    const body = (await request.json()) as Partial<EventRequest>;
    const { id } = params;
    return HttpResponse.json({
      ...mockEvents[0],
      ...body,
      id: id as string,
    });
  }),

  http.delete('*/api/v1/admin/events/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.delete('*/api/admin/events/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // --- Admin Event Menus ---
  http.get('*/api/v1/admin/events/:id/menu-options', ({ params }) => {
    const { id } = params;
    if (id === 'ev-2') {
      return HttpResponse.json(mockMenuOptionsEv2);
    }
    return HttpResponse.json([]);
  }),
  http.get('*/api/admin/events/:id/menu-options', ({ params }) => {
    const { id } = params;
    if (id === 'ev-2') {
      return HttpResponse.json(mockMenuOptionsEv2);
    }
    return HttpResponse.json([]);
  }),

  http.post('*/api/v1/admin/events/:id/menu-options', async ({ request, params }) => {
    const { id } = params;
    const body = (await request.json()) as MenuOptionRequest;
    const newMenu: MenuOptionResponse = {
      id: `menu-${Date.now()}`,
      eventId: id as string,
      name: body.name,
      description: body.description,
      dietType: body.dietType || 'STANDARD',
      displayOrder: body.displayOrder || 1,
    };
    return HttpResponse.json(newMenu, { status: 201 });
  }),
  http.post('*/api/admin/events/:id/menu-options', async ({ request, params }) => {
    const { id } = params;
    const body = (await request.json()) as MenuOptionRequest;
    const newMenu: MenuOptionResponse = {
      id: `menu-${Date.now()}`,
      eventId: id as string,
      name: body.name,
      description: body.description,
      dietType: body.dietType || 'STANDARD',
      displayOrder: body.displayOrder || 1,
    };
    return HttpResponse.json(newMenu, { status: 201 });
  }),

  http.delete('*/api/v1/admin/events/:eventId/menu-options/:optionId', () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.delete('*/api/admin/events/:eventId/menu-options/:optionId', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // --- Admin Parties ---
  http.get('*/api/v1/admin/parties', () => {
    return HttpResponse.json({
      content: mockParties,
      page: {
        size: 50,
        number: 0,
        totalElements: mockParties.length,
        totalPages: 1,
      },
    });
  }),
  http.get('*/api/admin/parties', () => {
    return HttpResponse.json({
      content: mockParties,
      page: {
        size: 50,
        number: 0,
        totalElements: mockParties.length,
        totalPages: 1,
      },
    });
  }),

  http.get('*/api/v1/admin/parties/:id', ({ params }) => {
    const { id } = params;
    const party = mockParties.find((p) => p.id === id) || mockParties[0];
    return HttpResponse.json(party);
  }),
  http.get('*/api/admin/parties/:id', ({ params }) => {
    const { id } = params;
    const party = mockParties.find((p) => p.id === id) || mockParties[0];
    return HttpResponse.json(party);
  }),

  http.post('*/api/v1/admin/parties', async ({ request }) => {
    const body = (await request.json()) as PartyUpsertRequest;
    const newParty: PartyResponse = {
      id: `party-${Date.now()}`,
      displayName: body.displayName,
      rsvpToken: 'NEW789',
      languagePreference: body.languagePreference || 'es',
      internalNotes: body.internalNotes,
      status: 'PENDING',
      eventIds: body.eventIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newParty, { status: 201 });
  }),

  http.put('*/api/v1/admin/parties/:id', async ({ request, params }) => {
    const { id } = params;
    const body = (await request.json()) as PartyUpsertRequest;
    const existing = mockParties.find((p) => p.id === id) || mockParties[0];
    const updated: PartyResponse = {
      ...existing,
      displayName: body.displayName,
      languagePreference: body.languagePreference || existing.languagePreference,
      internalNotes: body.internalNotes,
      eventIds: body.eventIds || existing.eventIds,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(updated);
  }),

  http.post('*/api/v1/admin/parties/:id/regenerate-token', ({ params }) => {
    const { id } = params;
    const party = mockParties.find((p) => p.id === id) || mockParties[0];
    return HttpResponse.json({
      ...party,
      rsvpToken: 'REG888',
    });
  }),

  http.delete('*/api/v1/admin/parties/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // --- Admin Guests ---
  http.get('*/api/v1/admin/parties/:partyId/guests', ({ params }) => {
    const { partyId } = params;
    const guests: GuestResponse[] = [
      {
        id: 'guest-1',
        partyId: partyId as string,
        firstName: 'Marcos',
        lastName: 'Gómez',
        guestType: 'ADULT',
        isPlusOne: false,
        dietaryRestrictions: '',
        createdAt: '2026-01-10T10:00:00Z',
        updatedAt: '2026-01-10T10:00:00Z',
      },
    ];
    return HttpResponse.json(guests);
  }),

  http.post('*/api/v1/admin/parties/:partyId/guests', async ({ request, params }) => {
    const { partyId } = params;
    const body = (await request.json()) as GuestRequest;
    const newGuest: GuestResponse = {
      id: `guest-${Date.now()}`,
      partyId: partyId as string,
      firstName: body.firstName,
      lastName: body.lastName,
      guestType: body.guestType || 'ADULT',
      isPlusOne: body.isPlusOne ?? false,
      email: body.email,
      phone: body.phone,
      dietaryRestrictions: body.dietaryRestrictions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newGuest, { status: 201 });
  }),

  http.put('*/api/v1/admin/guests/:id', async ({ request, params }) => {
    const { id } = params;
    const body = (await request.json()) as GuestRequest;
    const updatedGuest: GuestResponse = {
      id: id as string,
      partyId: body.partyId || 'party-1',
      firstName: body.firstName,
      lastName: body.lastName,
      guestType: body.guestType || 'ADULT',
      isPlusOne: body.isPlusOne ?? false,
      email: body.email,
      phone: body.phone,
      dietaryRestrictions: body.dietaryRestrictions,
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(updatedGuest);
  }),

  http.delete('*/api/v1/admin/guests/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // --- Admin RSVP & Catering ---
  http.get('*/api/v1/admin/rsvp/stats', () => {
    return HttpResponse.json(mockRsvpStats);
  }),
  http.get('*/api/admin/rsvp/stats', () => {
    return HttpResponse.json(mockRsvpStats);
  }),

  http.get('*/api/v1/admin/guests', () => {
    return HttpResponse.json({
      content: [
        {
          id: 'guest-1',
          partyId: 'party-1',
          firstName: 'Marcos',
          lastName: 'Gómez',
          guestType: 'ADULT',
          isPlusOne: false,
          dietaryRestrictions: '',
          createdAt: '2026-01-10T10:00:00Z',
          updatedAt: '2026-01-10T10:00:00Z',
        },
        {
          id: 'guest-2',
          partyId: 'party-1',
          firstName: 'Laura',
          lastName: 'Vega',
          guestType: 'ADULT',
          isPlusOne: false,
          dietaryRestrictions: 'Celíaca / Sin Gluten',
          createdAt: '2026-01-10T10:00:00Z',
          updatedAt: '2026-01-10T10:00:00Z',
        },
      ],
      page: {
        size: 50,
        number: 0,
        totalElements: 2,
        totalPages: 1,
      },
    });
  }),

  http.get('*/api/v1/admin/guests/:id', ({ params }) => {
    const { id } = params;
    if (id === 'guest-2') {
      return HttpResponse.json({
        id: 'guest-2',
        partyId: 'party-1',
        partyDisplayName: 'Familia Gómez Martínez',
        firstName: 'Laura',
        lastName: 'Vega',
        guestType: 'ADULT',
        isPlusOne: false,
        email: 'laura@example.com',
        phone: '+34611223344',
        dietaryRestrictions: 'Celíaca / Sin Gluten',
        eventAttendances: [
          {
            eventId: 'ev-2',
            eventName: 'Cóctel y Banquete',
            attending: true,
            menuOptionName: 'Risotto de Setas',
            specialNotes: 'Alérgica severa a frutos secos',
          },
        ],
        createdAt: '2026-01-10T10:00:00Z',
        updatedAt: '2026-01-10T10:00:00Z',
      });
    }
    return HttpResponse.json({
      id: 'guest-1',
      partyId: 'party-1',
      partyDisplayName: 'Familia Gómez Martínez',
      firstName: 'Marcos',
      lastName: 'Gómez',
      guestType: 'ADULT',
      isPlusOne: false,
      email: 'marcos@example.com',
      phone: '+34600112233',
      dietaryRestrictions: '',
      eventAttendances: [
        {
          eventId: 'ev-2',
          eventName: 'Cóctel y Banquete',
          attending: true,
          menuOptionName: 'Solomillo Ibérico',
          specialNotes: '',
        },
      ],
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-01-10T10:00:00Z',
    });
  }),

  http.get('*/api/v1/admin/menus/catering-report', () => {
    return HttpResponse.json(mockCateringReport);
  }),
  http.get('*/api/admin/menus/catering-report', () => {
    return HttpResponse.json(mockCateringReport);
  }),

  // Media Upload Mocks
  http.post('*/api/v1/admin/media/upload', () => {
    return HttpResponse.json(
      {
        url: '/media/mock-image.webp',
        fileName: 'mock-image.webp',
        sizeBytes: 1024 * 500,
      },
      { status: 201 }
    );
  }),
  http.post('*/api/v1/admin/media/upload-multiple', () => {
    return HttpResponse.json(
      [
        {
          url: '/media/mock-image-1.webp',
          fileName: 'mock-image-1.webp',
          sizeBytes: 1024 * 500,
        },
        {
          url: '/media/mock-image-2.webp',
          fileName: 'mock-image-2.webp',
          sizeBytes: 1024 * 600,
        },
      ],
      { status: 201 }
    );
  }),
];
