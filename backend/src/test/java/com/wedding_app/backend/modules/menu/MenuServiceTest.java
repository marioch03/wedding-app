package com.wedding_app.backend.modules.menu;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.wedding_app.backend.common.exception.ResourceNotFoundException;
import com.wedding_app.backend.modules.event.Event;
import com.wedding_app.backend.modules.event.EventRepository;
import com.wedding_app.backend.modules.guest.Guest;
import com.wedding_app.backend.modules.guest.GuestEvent;
import com.wedding_app.backend.modules.guest.GuestEventRepository;
import com.wedding_app.backend.modules.menu.dto.CateringReportResponse;
import com.wedding_app.backend.modules.menu.dto.MenuRequest;
import com.wedding_app.backend.modules.menu.dto.MenuResponse;
import com.wedding_app.backend.modules.menu.dto.PublicMenuEventDto;
import com.wedding_app.backend.modules.party.model.Party;

@ExtendWith(MockitoExtension.class)
class MenuServiceTest {

  @Mock
  private MenuOptionRepository menuOptionRepository;

  @Mock
  private EventRepository eventRepository;

  @Mock
  private GuestEventRepository guestEventRepository;

  @InjectMocks
  private MenuService menuService;

  private UUID eventId;
  private UUID menuId;
  private Event event;
  private MenuOption menuOption;

  @BeforeEach
  void setUp() {
    eventId = UUID.randomUUID();
    menuId = UUID.randomUUID();

    event = new Event();
    event.setId(eventId);
    event.setName("Banquete");
    event.setIsPublic(true);

    menuOption = new MenuOption();
    menuOption.setId(menuId);
    menuOption.setEvent(event);
    menuOption.setName("Solomillo Ibérico");
    menuOption.setDescription("Con salsa de trufa");
    menuOption.setDietType(DietType.STANDARD);
    menuOption.setDisplayOrder(1);
  }

  @Test
  void findAll_withEventId_success() {
    when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
    when(menuOptionRepository.findByEventIdWithEventOrderByDisplayOrder(eventId)).thenReturn(List.of(menuOption));

    List<MenuResponse> result = menuService.findAll(eventId);

    assertThat(result).hasSize(1);
    assertThat(result.get(0).name()).isEqualTo("Solomillo Ibérico");
    assertThat(result.get(0).eventName()).isEqualTo("Banquete");
  }

  @Test
  void create_success() {
    MenuRequest request = new MenuRequest(eventId, "Risotto de Boletus", "Vegetariano", DietType.VEGETARIAN, 2);

    when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
    when(menuOptionRepository.save(any(MenuOption.class))).thenAnswer(invocation -> {
      MenuOption m = invocation.getArgument(0);
      m.setId(UUID.randomUUID());
      return m;
    });

    MenuResponse response = menuService.create(request);

    assertThat(response).isNotNull();
    assertThat(response.name()).isEqualTo("Risotto de Boletus");
    assertThat(response.dietType()).isEqualTo(DietType.VEGETARIAN);
    assertThat(response.displayOrder()).isEqualTo(2);
  }

  @Test
  void update_success() {
    MenuRequest request = new MenuRequest(eventId, "Solomillo de Ternera", "Punto medio", DietType.STANDARD, 1);

    when(menuOptionRepository.findById(menuId)).thenReturn(Optional.of(menuOption));

    MenuResponse response = menuService.update(menuId, request);

    assertThat(response.name()).isEqualTo("Solomillo de Ternera");
    assertThat(response.description()).isEqualTo("Punto medio");
  }

  @Test
  void delete_success() {
    when(menuOptionRepository.findById(menuId)).thenReturn(Optional.of(menuOption));

    menuService.delete(menuId);

    verify(menuOptionRepository).delete(menuOption);
  }

  @Test
  void getPublicMenus_returnsOnlyPublicEventsWithSortedMenus() {
    event.getMenuOptions().add(menuOption);

    Event privateEvent = new Event();
    privateEvent.setId(UUID.randomUUID());
    privateEvent.setName("Cena Secreta");
    privateEvent.setIsPublic(false);

    when(eventRepository.findAllWithMenuOptionsOrderByDisplayOrder()).thenReturn(List.of(event, privateEvent));

    List<PublicMenuEventDto> publicMenus = menuService.getPublicMenus();

    assertThat(publicMenus).hasSize(1);
    assertThat(publicMenus.get(0).eventName()).isEqualTo("Banquete");
    assertThat(publicMenus.get(0).menuOptions()).hasSize(1);
  }

  @Test
  void getCateringReport_calculatesCountsAndAlertsCorrectly() {
    Party party = new Party();
    party.setId(UUID.randomUUID());
    party.setDisplayName("Familia Pérez");

    Guest guest1 = new Guest();
    guest1.setId(UUID.randomUUID());
    guest1.setFirstName("Juan");
    guest1.setLastName("Pérez");
    guest1.setParty(party);
    guest1.setDietaryRestrictions("Celíaco");

    Guest guest2 = new Guest();
    guest2.setId(UUID.randomUUID());
    guest2.setFirstName("María");
    guest2.setLastName("Gómez");
    guest2.setParty(party);

    GuestEvent ge1 = new GuestEvent();
    ge1.setId(UUID.randomUUID());
    ge1.setGuest(guest1);
    ge1.setEvent(event);
    ge1.setAttending(true);
    ge1.setMenuOption(menuOption);

    GuestEvent ge2 = new GuestEvent();
    ge2.setId(UUID.randomUUID());
    ge2.setGuest(guest2);
    ge2.setEvent(event);
    ge2.setAttending(true);
    ge2.setMenuOption(menuOption);

    when(guestEventRepository.findConfirmedAttendeesByEventWithDetails(eventId)).thenReturn(List.of(ge1, ge2));

    CateringReportResponse report = menuService.getCateringReport(eventId);

    assertThat(report).isNotNull();
    assertThat(report.totalConfirmedAttendees()).isEqualTo(2);
    assertThat(report.attendeesWithDietaryAlertsCount()).isEqualTo(1);
    assertThat(report.menuCounts()).hasSize(1);
    assertThat(report.menuCounts().get(0).count()).isEqualTo(2);
    assertThat(report.attendeesWithDietaryAlerts()).hasSize(1);
    assertThat(report.attendeesWithDietaryAlerts().get(0).dietaryRestrictions()).isEqualTo("Celíaco");
  }

  @Test
  void getEntityById_throwsNotFound_whenDoesNotExist() {
    when(menuOptionRepository.findById(menuId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> menuService.getEntityById(menuId))
        .isInstanceOf(ResourceNotFoundException.class);
  }
}
