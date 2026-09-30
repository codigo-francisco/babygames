; Instalador de BabyGames (Inno Setup 6). Se compila desde tools\build.ps1.
; Instala para el usuario actual (sin permisos de administrador).

#ifndef AppVersion
  #define AppVersion "1.0.0"
#endif
#ifndef SourceDir
  #define SourceDir "..\dist\BabyGames"
#endif
#ifndef OutputDir
  #define OutputDir "..\dist"
#endif

[Setup]
AppId={{8F1B2C8E-6C0B-4D4E-9E43-6D2B6B0F5A11}
AppName=BabyGames
AppVersion={#AppVersion}
AppVerName=BabyGames {#AppVersion}
AppPublisher=BabyGames
DefaultDirName={localappdata}\Programs\BabyGames
DefaultGroupName=BabyGames
DisableDirPage=yes
DisableProgramGroupPage=yes
DisableReadyPage=yes
PrivilegesRequired=lowest
OutputDir={#OutputDir}
OutputBaseFilename=BabyGames-Setup
SetupIconFile=..\src\BabyGames\app.ico
UninstallDisplayIcon={app}\BabyGames.exe
UninstallDisplayName=BabyGames
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
CloseApplications=force
MinVersion=10.0

[Languages]
Name: "es"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[InstallDelete]
; Al actualizar, quitar los juegos de la versión anterior.
Type: filesandordirs; Name: "{app}\app"

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\BabyGames"; Filename: "{app}\BabyGames.exe"
Name: "{autodesktop}\BabyGames"; Filename: "{app}\BabyGames.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\BabyGames.exe"; Description: "{cm:LaunchProgram,BabyGames}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
; Progreso (estrellas, pegatinas) y caché de WebView2.
Type: filesandordirs; Name: "{localappdata}\BabyGames"
