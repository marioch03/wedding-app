package com.wedding_app.backend.modules.menu;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.wedding_app.backend.common.exception.GlobalExceptionHandler;
import com.wedding_app.backend.modules.menu.dto.CateringReportResponse;
import com.wedding_app.backend.modules.menu.dto.MenuRequest;
import com.wedding_app.backend.modules.menu.dto.MenuResponse;
import com.wedding_app.backend.modules.menu.dto.PublicMenuEventDto;

@ExtendWith(MockitoExtension.class)
class MenuControllersTest {

  @Mock
  private MenuService menuService;

  @InjectMocks
  private MenuAdminController menuAdminController;

  @InjectMocks
  private MenuPublicController menuPublicController;

  private MockMvc adminMockMvc;
  private MockMvc publicMockMvc;

  private UUID eventId;
  private UUID menuId;
  private MenuResponse menuResponse;

  @BeforeEach
  void setUp() {
    eventId = UUID.randomUUID();
    menuId = UUID.randomUUID();

    adminMockMvc = MockMvcBuilders.standaloneSetup(menuAdminController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();

    publicMockMvc = MockMvcBuilders.standaloneSetup(menuPublicController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();

    menuResponse = new MenuResponse(
        menuId,
        eventId,
        "Banquete",
        "Menú Clásico",
        "Entrante y plato principal",
        DietType.STANDARD,
        1);
  }

  @Test
  void publicGetPublicMenus_returnsOk() throws Exception {
    PublicMenuEventDto publicEvent = new PublicMenuEventDto(eventId, "Banquete", "Cena", List.of(menuResponse));
    when(menuService.getPublicMenus()).thenReturn(List.of(publicEvent));

    publicMockMvc.perform(get("/api/v1/public/menus"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].eventName").value("Banquete"))
        .andExpect(jsonPath("$[0].menuOptions[0].name").value("Menú Clásico"));
  }

  @Test
  void adminList_returnsOk() throws Exception {
    when(menuService.findAll(null)).thenReturn(List.of(menuResponse));

    adminMockMvc.perform(get("/api/v1/admin/menus"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(menuId.toString()))
        .andExpect(jsonPath("$[0].name").value("Menú Clásico"));
  }

  @Test
  void adminCreate_returnsCreated() throws Exception {
    when(menuService.create(any(MenuRequest.class))).thenReturn(menuResponse);

    String json = """
        {
          "eventId": "%s",
          "name": "Menú Clásico",
          "dietType": "STANDARD",
          "displayOrder": 1
        }
        """.formatted(eventId);

    adminMockMvc.perform(post("/api/v1/admin/menus")
        .contentType(MediaType.APPLICATION_JSON)
        .content(json))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(menuId.toString()));
  }

  @Test
  void adminUpdate_returnsOk() throws Exception {
    when(menuService.update(eq(menuId), any(MenuRequest.class))).thenReturn(menuResponse);

    String json = """
        {
          "eventId": "%s",
          "name": "Menú Clásico Renovado",
          "dietType": "STANDARD"
        }
        """.formatted(eventId);

    adminMockMvc.perform(put("/api/v1/admin/menus/{id}", menuId)
        .contentType(MediaType.APPLICATION_JSON)
        .content(json))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(menuId.toString()));
  }

  @Test
  void adminDelete_returnsNoContent() throws Exception {
    doNothing().when(menuService).delete(menuId);

    adminMockMvc.perform(delete("/api/v1/admin/menus/{id}", menuId))
        .andExpect(status().isNoContent());
  }

  @Test
  void adminGetCateringReport_returnsReport() throws Exception {
    CateringReportResponse report = new CateringReportResponse(50, 5, List.of(), List.of(), List.of());
    when(menuService.getCateringReport(null)).thenReturn(report);

    adminMockMvc.perform(get("/api/v1/admin/menus/catering-report"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalConfirmedAttendees").value(50))
        .andExpect(jsonPath("$.attendeesWithDietaryAlertsCount").value(5));
  }

  @Test
  void adminCreate_withMissingName_returnsBadRequest() throws Exception {
    String invalidJson = """
        {
          "eventId": "%s",
          "name": ""
        }
        """.formatted(eventId);

    adminMockMvc.perform(post("/api/v1/admin/menus")
        .contentType(MediaType.APPLICATION_JSON)
        .content(invalidJson))
        .andExpect(status().isBadRequest());
  }
}
