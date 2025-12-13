# Compressor Monitor HMI

Wizualizacja parametrów kompresora przeznaczona dla Raspberry Pi, instalowana jako kontener Docker.

## 1. Instalacja przez Portainer

1. Upewnij się, że masz zainstalowany Docker i Portainer na Raspberry Pi.
2. Utwórz nowe repozytorium na GitHub i wgraj tam wszystkie pliki tego projektu.
3. W Portainerze przejdź do **Stacks** -> **Add stack**.
4. Wybierz opcję **Repository** (Build from git).
5. Wklej link do swojego repozytorium GitHub.
6. W sekcji **Compose path** wpisz `docker-compose.yml`.
7. Kliknij **Deploy the stack**.

Portainer pobierze kod, zbuduje obraz Dockera i uruchomi aplikację na porcie `8080`.

Dostęp do wizualizacji: `http://<IP_MALINKI>:8080`

## 2. Konfiguracja Raspberry Pi (Tryb Kiosk)

Aby Raspberry Pi uruchamiało przeglądarkę automatycznie w trybie pełnoekranowym:

1. Edytuj plik autostartu:
   ```bash
   sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
   ```

2. Dodaj na końcu pliku (lub zakomentuj istniejące wpisy i dodaj te):
   ```bash
   @xset s off
   @xset -dpms
   @xset s noblank
   @chromium-browser --kiosk --incognito --noerrdialogs --disable-infobars http://localhost:8080
   ```

3. Zrestartuj Raspberry Pi:
   ```bash
   sudo reboot
   ```

## 3. Konfiguracja Node-RED

Wizualizacja oczekuje danych po WebSocket. W Node-RED utwórz węzeł **WebSocket Out**:
- Type: `Listen on`
- Path: `/ws/compressor`
- Send/Receive: `payload`

Wysyłaj obiekt JSON w formacie:
```json
{
  "pressure": 7.5,
  "flow": 5.2,
  "temperature": 85,
  "power": 35,
  "voltage": 400,
  "current": 55,
  "status": "RUNNING",
  "totalHours": 12450
}
```