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
  },
];

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
];
