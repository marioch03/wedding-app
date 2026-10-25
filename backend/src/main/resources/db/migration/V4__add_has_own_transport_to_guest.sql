-- V4: Añadir columna has_own_transport a la tabla guest
ALTER TABLE guest ADD COLUMN has_own_transport BOOLEAN DEFAULT NULL;

COMMENT ON COLUMN guest.has_own_transport IS 'Indica si el invitado dispone de vehículo propio (TRUE) o necesita transporte/autobús (FALSE). NULL indica no respondido.';
