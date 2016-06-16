
ionic resources
#ionic hooks add
ionic prepare android
ionic build --release android

"C:\Program Files\Java\jdk1.8.0_92\bin\jarsigner.exe" -tsa http://timestamp.digicert.com -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "C:\apps\LDSFight\.private\LDSFIGHT.keystore" -storepass 41f6nGH258jk9104prp -keypass 41f6nGH258jk9104prp "C:\apps\LDSFight\platforms\android\build\outputs\apk\android-release-unsigned.apk" LDSFight

"C:\Development\adt-bundle\sdk\build-tools\23.0.3\zipalign.exe" -f -v 4 "C:\apps\LDSFight\platforms\android\build\outputs\apk\android-release-unsigned.apk" "C:\apps\LDSFight\platforms\android\build\outputs\apk\LDSFight-1.3.0.apk"

keytool -exportcert -list -v -alias LDSFight -keystore "C:\apps\LDSFight\.private\LDSFIGHT.keystore" -storepass 41f6nGH258jk9104prp -keypass 41f6nGH258jk9104prp
