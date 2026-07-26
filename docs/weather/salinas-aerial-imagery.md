# Salinas aerial imagery source

The Overview weather hero uses a real aerial/satellite basemap centered on the installed Salinas system location.

## Facility location

- Address: `3558 E 8th St, Los Angeles, CA 90023`
- Census geocoder match: `3558 E 8TH ST, LOS ANGELES, CA, 90023`
- Latitude: `34.01948668358`
- Longitude: `-118.200198666354`
- Geocoder: United States Census Bureau Geocoding Services API

## Image source

- Service: Esri ArcGIS World Imagery
- Local asset: `public/images/salinas-site-aerial-esri.jpg`
- Export size: `1800 × 760`
- Export bounds: `-118.2030,34.0177,-118.1974,34.0213`
- Service attribution: `Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community`

The required attribution is displayed directly on the weather hero while the image is visible.

## Important distinction

This asset is a geographic reference image, not a live satellite feed. The aerial image stays fixed until deliberately replaced with a newer approved export. The NWS observation and forecast displayed over it continue to update independently.
